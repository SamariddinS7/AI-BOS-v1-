import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, Bot, Trash2, RefreshCw, CheckCircle, AlertTriangle, Info, Copy, Eye, EyeOff, Code } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useToast } from '../../hooks/useToast';
import { GoogleGenAI } from "@google/genai";

async function callAI(prompt: string, system: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { systemInstruction: system }
    });
    return response.text || "Tahlil mavjud emas.";
  } catch (e: any) {
    return "Xatolik yuz berdi: " + e.message;
  }
}

async function tgFetch(token: string, method: string, body: any = null) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000); // 30s timeout
  
  try {
    const res = await fetch('/api/telegram/proxy', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, method, body }),
      signal: ctrl.signal,
    });
    
    const data = await res.json();
    clearTimeout(timer);
    return data;
  } catch (e: any) {
    console.error(`Telegram API [${method}] error:`, e);
    clearTimeout(timer);
    return { ok: false, description: e.message || "Proxy or network error" };
  }
}

function tgGetMe(token: string) {
  return tgFetch(token, "getMe");
}
function tgGetUpdates(token: string, offset: number) {
  return tgFetch(token, "getUpdates", { offset: offset || 0, limit: 100, timeout: 0 });
}
function tgSendPlain(token: string, chatId: number, text: string) {
  const trimmed = (text || "").slice(0, 4000);
  return tgFetch(token, "sendMessage", { chat_id: chatId, text: trimmed });
}
function tgSendReply(token: string, chatId: number, text: string, replyToId: number) {
  const trimmed = (text || "").slice(0, 4000);
  return tgFetch(token, "sendMessage", {
    chat_id: chatId,
    text: trimmed,
    ...(replyToId ? { reply_to_message_id: replyToId } : {}),
  });
}
function tgDeleteWebhook(token: string) {
  return tgFetch(token, "deleteWebhook", { drop_pending_updates: false });
}

export default function TelegramBotSettings() {
  const { success, error, info, loading } = useToast();
  const [token, setToken] = useState(localStorage.getItem('tg_bot_token') || '');
  const [autoReply, setAutoReply] = useState(localStorage.getItem('tg_bot_autoReply') === 'true');
  const [sysPrompt, setSysPrompt] = useState(localStorage.getItem('tg_bot_system') || "Sen AI-BOS yordamchisan. O'zbek tilida qisqa va foydali javob ber.");
  const DEFAULT_BOT_CODE = `// AI-BOS Telegram Bot Kripti
// Mavjud o'zgaruvchilar:
// - msg: { text, chatId, from, username, ts }
// - sysPrompt: Tizim xabari (System Prompt)
// - callAI(prompt, systemInstruction): AI ga so'rov yuborish funksiyasi

try {
  const text = msg.text || "";

  // 1. Asosiy buyruqlar
  if (text === '/start') {
    return \`Assalomu alaykum, \${msg.from}! 👋\\n\\nMen AI-BOS biznes boshqaruv tizimining intellektual yordamchisiman. Sizga qanday yordam bera olaman?\`;
  }

  if (text === '/help') {
    return "🤖 *AI-BOS Bot Qo'llanmasi*\\n\\nSiz menga har qanday savol berishingiz yoki biznesingiz bo'yicha tahlil so'rashingiz mumkin. Men AI orqali sizga javob beraman.";
  }

  if (text === '/ping') {
    return "PONG! 🏓 Bot faol holatda ishlamoqda.";
  }

  // 2. AI orqali aqlli javob qaytarish
  const aiResponse = await callAI(text, sysPrompt);
  return aiResponse;

} catch (error) {
  return "Kechirasiz, xatolik yuz berdi: " + error.message;
}`;

  const [useCustomCode, setUseCustomCode] = useState(localStorage.getItem('tg_bot_useCustomCode') === 'true');
  
  const savedCode = localStorage.getItem('tg_bot_code');
  const isOldDefault = savedCode && savedCode.includes("if (msg.text === '/start') {") && savedCode.includes("return \"Assalomu alaykum! Men AI-BOS botiman.\";");
  const [botCode, setBotCode] = useState((!savedCode || isOldDefault) ? DEFAULT_BOT_CODE : savedCode);
  
  const [botInfo, setBotInfo] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [manualText, setManualText] = useState<Record<number, string>>({});
  const [polling, setPolling] = useState(false);
  const [connError, setConnError] = useState("");
  const [showToken, setShowToken] = useState(false);

  const pollRef = useRef<any>(null);
  const offsetRef = useRef(0);
  const tokenRef = useRef("");
  const connectedRef = useRef(false);
  const seenIds = useRef(new Set());

  useEffect(() => {
    localStorage.setItem('tg_bot_token', token);
  }, [token]);

  useEffect(() => {
    localStorage.setItem('tg_bot_autoReply', String(autoReply));
  }, [autoReply]);

  useEffect(() => {
    localStorage.setItem('tg_bot_system', sysPrompt);
  }, [sysPrompt]);

  useEffect(() => {
    localStorage.setItem('tg_bot_useCustomCode', String(useCustomCode));
  }, [useCustomCode]);

  useEffect(() => {
    localStorage.setItem('tg_bot_code', botCode);
  }, [botCode]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearTimeout(pollRef.current); pollRef.current = null; }
    connectedRef.current = false;
    setPolling(false);
  }, []);

  const handleAutoReply = useCallback(async (msg: any, tok: string) => {
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, replying: true } : m));
    try {
      let aiReply = "";
      
      if (useCustomCode) {
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const userFunc = new AsyncFunction('msg', 'sysPrompt', 'callAI', botCode);
        aiReply = await userFunc(msg, sysPrompt, callAI);
      } else {
        aiReply = await callAI(msg.text, sysPrompt);
      }
      
      const sendRes = await tgSendReply(tok, msg.chatId, aiReply, msg.id);
      if (!sendRes.ok) throw new Error(sendRes.description || "Xabar yuborishda xato");
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, reply: aiReply, replying: false } : m));
    } catch (e: any) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, replying: false, replyError: e.message } : m));
    }
  }, [sysPrompt, botCode, useCustomCode]);

  const autoReplyRef = useRef(handleAutoReply);
  useEffect(() => { autoReplyRef.current = handleAutoReply; }, [handleAutoReply]);

  const startPolling = useCallback((tok: string) => {
    if (pollRef.current) clearTimeout(pollRef.current);
    connectedRef.current = true;
    offsetRef.current = 0;
    seenIds.current.clear();
    setPolling(true);

    const poll = async () => {
      if (!connectedRef.current) return;
      try {
        const data = await tgGetUpdates(tok, offsetRef.current);
        if (!connectedRef.current) return;

        if (!data.ok) {
          console.warn("Telegram getUpdates error:", data.description);
        } else if (data.result?.length) {
          const newMsgs: any[] = [];
          for (const update of data.result) {
            if (seenIds.current.has(update.update_id)) continue;
            seenIds.current.add(update.update_id);
            offsetRef.current = update.update_id + 1;

            const msg = update.message || update.edited_message;
            if (!msg?.text) continue;
            const newMsg = {
              id: msg.message_id,
              updateId: update.update_id,
              chatId: msg.chat.id,
              chatName: msg.chat.username ? `@${msg.chat.username}` : (msg.chat.first_name || msg.chat.title || String(msg.chat.id)),
              from: msg.from?.first_name || msg.from?.username || "Noma'lum",
              username: msg.from?.username || "",
              text: msg.text,
              ts: msg.date * 1000,
              reply: null,
              replying: false,
            };
            newMsgs.push(newMsg);

            if (autoReply && autoReplyRef.current) {
              autoReplyRef.current(newMsg, tok);
            }
          }
          if (newMsgs.length) setMessages(prev => [...prev, ...newMsgs]);
        }
      } catch (e: any) {
        if (e.name !== "AbortError") console.warn("Poll error:", e.message);
      }
      if (connectedRef.current) {
        pollRef.current = setTimeout(poll, 2500);
      }
    };
    pollRef.current = setTimeout(poll, 300);
  }, [autoReply]);

  const connectBot = useCallback(async () => {
    const t = token.trim();
    if (!t) { 
      setConnError("Bot token kiritilmagan!"); 
      error("Bot token kiritilmagan!");
      return; 
    }
    if (!/^\d{6,12}:[A-Za-z0-9_-]{35,}$/.test(t)) {
      setConnError("Token formati noto'g'ri. Format: 123456789:ABCdef...");
      error("Token formati noto'g'ri!");
      return;
    }

    setConnecting(true);
    setConnError("");
    const toastId = loading("Botga ulanmoqda...");

    try {
      const data = await tgGetMe(t);
      if (!data.ok) {
        throw new Error(data.description || "Ulanishda xato");
      }
      setBotInfo(data.result);
      tokenRef.current = t;
      setConnected(true);
      setConnecting(false);
      success(`Botga ulandi: @${data.result.username}`, { id: toastId });
      startPolling(t);
    } catch (e: any) {
      setConnError(e.message || "Xato");
      setConnecting(false);
      error(`Ulanishda xato: ${e.message || "Noma'lum"}`, { id: toastId });
    }
  }, [token, sysPrompt, startPolling, success, error, loading]);

  const disconnectBot = useCallback(() => {
    stopPolling();
    setConnected(false);
    setBotInfo(null);
    info("Bot o'chirildi");
  }, [stopPolling, info]);

  const sendManual = useCallback(async (chatId: number, text: string) => {
    const t = (text || "").trim();
    if (!t) return;
    const res = await tgSendPlain(token, chatId, t);
    if (res.ok) {
      setManualText(prev => ({ ...prev, [chatId]: "" }));
      success("Xabar yuborildi");
    } else {
      error("Yuborishda xato: " + (res.description || "Noma'lum"));
    }
  }, [token]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const byChat = useMemo(() => {
    const map: Record<number, { chatName: string, chatId: number, msgs: any[] }> = {};
    for (const m of messages) {
      if (!map[m.chatId]) map[m.chatId] = { chatName: m.chatName, chatId: m.chatId, msgs: [] };
      map[m.chatId].msgs.push(m);
    }
    return Object.values(map);
  }, [messages]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Telegram Bot Integratsiyasi</h3>
          <p className="text-base text-text-muted">Bot API token orqali ulash va AI avtomatik javob berish</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${connected ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-brand-500/20 text-brand-500 border border-brand-500/30'}`}>
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-lg">
                {connected && botInfo ? `@${botInfo.username}` : "Telegram Bot"}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-text-muted'}`} />
                <span className={`text-base font-medium ${connected ? 'text-green-500' : 'text-text-muted'}`}>
                  {connected ? (polling ? "Polling ishlayapti" : "Ulangan") : "Ulanmagan"}
                </span>
              </div>
            </div>
          </div>
          <div>
            {!connected ? (
              <button 
                onClick={connectBot} 
                disabled={connecting || !token.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 font-bold shadow-lg shadow-brand-500/20"
              >
                {connecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Ulash
              </button>
            ) : (
              <button 
                onClick={disconnectBot}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-600/20 text-rose-500 border border-rose-500/30 rounded-lg hover:bg-rose-600/30 transition-colors font-bold"
              >
                O'chirish
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-base font-bold text-text-primary mb-2">Bot API Token</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  disabled={connected}
                  placeholder="1234567890:ABCDefGhIJKlmNoPQRstuVWXyz"
                  className="w-full pl-4 pr-10 py-2.5 bg-surface-ground border border-border-dark rounded-lg text-base text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-mono disabled:opacity-50"
                />
                <button 
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {connError && (
              <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3 text-rose-500 text-base">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{connError}</span>
              </div>
            )}
            {!token && !connError && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3 text-amber-500 text-base">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Token olish uchun Telegram'da <strong>@BotFather</strong> ga kirib, <code>/newbot</code> buyrug'ini yuboring.</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border-dark">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-bold text-text-primary">AI Avtomatik Javob</label>
              <button 
                onClick={() => setAutoReply(!autoReply)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoReply ? 'bg-brand-600' : 'bg-surface-ground border border-border-dark'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoReply ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-base text-text-muted mb-6">Har bir xabarga AI avtomatik javob beradi.</p>
            
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-bold text-text-primary flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-500" />
                Maxsus Kod Ishlatish
              </label>
              <button 
                onClick={() => setUseCustomCode(!useCustomCode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useCustomCode ? 'bg-brand-600' : 'bg-surface-ground border border-border-dark'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useCustomCode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-base text-text-muted">Bot mantiqini o'zingiz yozgan kod orqali boshqaring.</p>
          </div>
          <div>
            {!useCustomCode ? (
              <>
                <label className="block text-base font-bold text-text-primary mb-2">AI Tizim Xabari (System Prompt)</label>
                <textarea 
                  value={sysPrompt}
                  onChange={e => setSysPrompt(e.target.value)}
                  rows={6}
                  className="w-full p-3 bg-surface-ground border border-border-dark rounded-lg text-base text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                  placeholder="Bot xarakter va uslubini tasvirlab bering..."
                />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-base font-bold text-text-primary">Bot Kripti (JavaScript)</label>
                  <button 
                    onClick={() => setBotCode(DEFAULT_BOT_CODE)}
                    className="text-sm text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Standart kod
                  </button>
                </div>
                <textarea 
                  value={botCode}
                  onChange={e => setBotCode(e.target.value)}
                  rows={15}
                  className="w-full p-3 bg-surface-ground border border-border-dark rounded-lg text-sm text-text-primary focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y font-mono"
                  placeholder="JavaScript kodini kiriting..."
                />
              </>
            )}
          </div>
        </div>
      </Card>

      {connected && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              Kelgan Xabarlar
              {polling && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>}
            </h3>
            {messages.length > 0 && (
              <button onClick={() => { setMessages([]); seenIds.current.clear(); }} className="text-base text-rose-500 hover:text-rose-400 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Tozalash
              </button>
            )}
          </div>

          {messages.length === 0 ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 bg-transparent">
              <Bot className="w-12 h-12 text-text-muted mb-4 opacity-50" />
              <h4 className="text-text-primary font-bold mb-2">Hali xabar yo'q</h4>
              <p className="text-base text-text-muted">Bot ulangan. Telegram'da botingizga xabar yozing.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {byChat.map(chat => (
                <Card key={chat.chatId} className="flex flex-col h-[400px]">
                  <div className="p-4 border-b border-border-dark flex justify-between items-center bg-surface-ground/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center font-bold text-base">
                        {chat.chatName.replace("@", "").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-text-primary text-base">{chat.chatName}</div>
                        <div className="text-base text-text-muted font-mono">ID: {chat.chatId}</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-brand-500/10 text-brand-500 rounded text-base font-bold">
                      {chat.msgs.length} xabar
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {chat.msgs.map(m => (
                      <div key={m.id} className="space-y-2">
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-surface-ground border border-border-dark flex items-center justify-center text-base font-bold text-text-secondary flex-shrink-0">
                            {m.from.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-base font-bold text-text-primary">{m.from}</span>
                              <span className="text-base text-text-muted">{new Date(m.ts).toLocaleTimeString()}</span>
                            </div>
                            <div className="px-3 py-2 bg-surface-ground border border-border-dark rounded-r-xl rounded-bl-xl text-base text-text-primary">
                              {m.text}
                            </div>
                          </div>
                        </div>

                        {m.replying && (
                          <div className="flex justify-end">
                            <div className="px-3 py-2 bg-brand-500/10 border border-brand-500/20 rounded-l-xl rounded-br-xl text-base text-brand-500 flex items-center gap-2">
                              <RefreshCw className="w-3 h-3 animate-spin" /> AI yozmoqda...
                            </div>
                          </div>
                        )}
 
                        {m.reply && !m.replying && (
                          <div className="flex justify-end gap-3">
                            <div className="max-w-[85%]">
                              <div className="px-3 py-2 bg-brand-600 text-white rounded-l-xl rounded-br-xl text-base">
                                {m.reply}
                              </div>
                              <div className="text-base text-text-muted text-right mt-1 flex items-center justify-end gap-1">
                                <Bot className="w-3 h-3" /> AI Javob
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 border-t border-border-dark bg-surface-ground/30 flex gap-2">
                    <input 
                      value={manualText[chat.chatId] || ""}
                      onChange={e => setManualText(t => ({ ...t, [chat.chatId]: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendManual(chat.chatId, manualText[chat.chatId]); } }}
                      placeholder="Xabar yozing..."
                      className="flex-1 px-3 py-2 bg-surface-card border border-border-dark rounded-lg text-base text-text-primary focus:outline-none focus:border-brand-500"
                    />
                    <button 
                      onClick={() => sendManual(chat.chatId, manualText[chat.chatId])}
                      disabled={!(manualText[chat.chatId] || "").trim()}
                      className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
