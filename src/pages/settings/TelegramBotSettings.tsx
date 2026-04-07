import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Trash2, RefreshCw, CheckCircle, AlertTriangle, Info, Copy, Eye, EyeOff, Code } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useToast } from '../../hooks/useToast';

export default function TelegramBotSettings() {
  const { success, error, info } = useToast();
  
  const [settings, setSettings] = useState({
    bot_token: '',
    system_prompt: "Sen AI-BOS yordamchisan. O'zbek tilida qisqa va foydali javob ber.",
    custom_code: `// AI-BOS Telegram Bot Kripti\n// Mavjud o'zgaruvchilar:\n// - msg: { text, chatId, from, username, ts }\n// - sysPrompt: Tizim xabari (System Prompt)\n// - callAI(prompt, systemInstruction): AI ga so'rov yuborish funksiyasi\n\ntry {\n  const text = msg.text || "";\n\n  if (text === '/start') {\n    return \`Assalomu alaykum, \${msg.from.first_name || 'foydalanuvchi'}! 👋\\n\\nMen AI-BOS biznes boshqaruv tizimining intellektual yordamchisiman.\`;\n  }\n\n  const aiResponse = await callAI(text, sysPrompt);\n  return aiResponse;\n} catch (error) {\n  return "Kechirasiz, xatolik yuz berdi: " + error.message;\n}`,
    auto_reply: false,
    use_custom_code: false,
    is_active: false
  });
  
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [manualMessage, setManualMessage] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(() => {
      fetchStatus();
      if (isConnected) fetchMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/telegram/settings');
      const data = await res.json();
      if (data.bot_token) {
        setSettings({
          bot_token: data.bot_token || '',
          system_prompt: data.system_prompt || settings.system_prompt,
          custom_code: data.custom_code || settings.custom_code,
          auto_reply: Boolean(data.auto_reply),
          use_custom_code: Boolean(data.use_custom_code),
          is_active: Boolean(data.is_active)
        });
        setIsConnected(Boolean(data.is_active));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      const data = await res.json();
      setIsConnected(data.isPolling);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/telegram/messages');
      const data = await res.json();
      setMessages(data);
      if (data.length > 0 && !selectedChatId) {
        setSelectedChatId(data[data.length - 1].chat_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettings = async (newSettings: any = settings) => {
    try {
      const res = await fetch('/api/telegram/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        success("Sozlamalar saqlandi");
      } else {
        error("Sozlamalarni saqlashda xatolik");
      }
    } catch (e) {
      error("Tarmoq xatosi");
    }
  };

  const toggleConnection = async () => {
    if (!settings.bot_token) {
      error("Iltimos, bot tokenini kiriting");
      return;
    }
    
    setIsLoading(true);
    try {
      if (isConnected) {
        await fetch('/api/telegram/stop', { method: 'POST' });
        setIsConnected(false);
        setSettings({ ...settings, is_active: false });
        info("Bot to'xtatildi");
      } else {
        // Save settings first
        const newSettings = { ...settings, is_active: true };
        await saveSettings(newSettings);
        
        const res = await fetch('/api/telegram/start', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setIsConnected(true);
          setSettings(newSettings);
          success("Bot muvaffaqiyatli ulandi");
          fetchMessages();
        } else {
          error("Botga ulanishda xatolik. Tokenni tekshiring.");
          setSettings({ ...settings, is_active: false });
        }
      }
    } catch (e) {
      error("Tarmoq xatosi");
    } finally {
      setIsLoading(false);
    }
  };

  const sendManualMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMessage.trim() || !selectedChatId) return;

    try {
      const res = await fetch('/api/telegram/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: selectedChatId, text: manualMessage })
      });
      
      if (res.ok) {
        setManualMessage('');
        fetchMessages();
      } else {
        error("Xabar yuborishda xatolik");
      }
    } catch (e) {
      error("Tarmoq xatosi");
    }
  };

  const clearMessages = async () => {
    if (!window.confirm("Barcha xabarlarni o'chirmoqchimisiz?")) return;
    try {
      await fetch('/api/telegram/messages', { method: 'DELETE' });
      setMessages([]);
      success("Xabarlar tozalandi");
    } catch (e) {
      error("Xabarlarni tozalashda xatolik");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Telegram Bot Integratsiyasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            BotFather orqali olingan tokenni kiriting va AI yordamchisini sozlang
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chap ustun: Sozlamalar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Bot className="w-5 h-5 mr-2 text-blue-500" />
              Asosiy Sozlamalar
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bot Token
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={settings.bot_token}
                    onChange={(e) => setSettings({ ...settings, bot_token: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    disabled={isConnected}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  >
                    {showToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  @BotFather orqali yangi bot yarating va tokenni bu yerga kiriting.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {isConnected ? 'Ulangan va faol' : 'Uzilgan'}
                  </span>
                </div>
                <button
                  onClick={toggleConnection}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${
                    isConnected 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {isLoading ? 'Kuting...' : isConnected ? 'Uzish' : 'Ulanish'}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    AI Avtomatik Javob
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.auto_reply}
                      onChange={(e) => {
                        const newSettings = { ...settings, auto_reply: e.target.checked };
                        setSettings(newSettings);
                        saveSettings(newSettings);
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Yoqilgan bo'lsa, bot barcha xabarlarga AI orqali avtomatik javob qaytaradi. AI sizning CRM, Ombor va Buxgalteriya ma'lumotlaringizga kirish huquqiga ega.
                </p>
              </div>

              {settings.auto_reply && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      <Code className="w-4 h-4 mr-1" />
                      Maxsus Kod Ishlatish
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings.use_custom_code}
                        onChange={(e) => {
                          const newSettings = { ...settings, use_custom_code: e.target.checked };
                          setSettings(newSettings);
                          saveSettings(newSettings);
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {!settings.use_custom_code ? (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        AI Tizim Xabari (System Prompt)
                      </label>
                      <textarea
                        value={settings.system_prompt}
                        onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
                        onBlur={() => saveSettings()}
                        rows={4}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Bot qanday ishlashi kerakligini tushuntiring..."
                      />
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bot Kripti (JavaScript)
                        </label>
                        <button 
                          onClick={() => {
                            const newSettings = { ...settings, custom_code: `// AI-BOS Telegram Bot Kripti\n// Mavjud o'zgaruvchilar:\n// - msg: { text, chatId, from, username, ts }\n// - sysPrompt: Tizim xabari (System Prompt)\n// - callAI(prompt, systemInstruction): AI ga so'rov yuborish funksiyasi\n\ntry {\n  const text = msg.text || "";\n\n  if (text === '/start') {\n    return \`Assalomu alaykum, \${msg.from.first_name || 'foydalanuvchi'}! 👋\\n\\nMen AI-BOS biznes boshqaruv tizimining intellektual yordamchisiman.\`;\n  }\n\n  const aiResponse = await callAI(text, sysPrompt);\n  return aiResponse;\n} catch (error) {\n  return "Kechirasiz, xatolik yuz berdi: " + error.message;\n}` };
                            setSettings(newSettings);
                            saveSettings(newSettings);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          Asliga qaytarish
                        </button>
                      </div>
                      <textarea
                        value={settings.custom_code}
                        onChange={(e) => setSettings({ ...settings, custom_code: e.target.value })}
                        onBlur={() => saveSettings()}
                        rows={10}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-900 text-green-400 font-mono text-xs"
                        spellCheck="false"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* O'ng ustun: Xabarlar */}
        <div className="lg:col-span-2 flex flex-col h-[600px]">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Send className="w-5 h-5 mr-2 text-blue-500" />
                Jonli Xabarlar
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={fetchMessages}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  title="Yangilash"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={clearMessages}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  title="Tozalash"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {!isConnected && messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <AlertTriangle className="w-12 h-12 mb-2 text-yellow-500" />
                  <p>Bot ulanmagan. Xabarlarni ko'rish uchun botni ulang.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <Info className="w-12 h-12 mb-2 text-blue-500" />
                  <p>Hozircha xabarlar yo'q. Botga xabar yuboring.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div 
                    key={msg.id || idx} 
                    className={`flex ${msg.is_bot ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 cursor-pointer ${
                        msg.is_bot 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-tl-none'
                      }`}
                      onClick={() => !msg.is_bot && setSelectedChatId(msg.chat_id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${msg.is_bot ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                          {msg.is_bot ? 'AI-BOS Bot' : msg.username || 'Foydalanuvchi'}
                        </span>
                        <span className={`text-[10px] ml-3 ${msg.is_bot ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Xabar yuborish formasi */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <form onSubmit={sendManualMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  placeholder={selectedChatId ? "Xabar yozing..." : "Xabar yuborish uchun foydalanuvchi xabarini bosing"}
                  disabled={!isConnected || !selectedChatId}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !selectedChatId || !manualMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              {selectedChatId && (
                <p className="text-xs text-gray-500 mt-2">
                  Joriy chat: <span className="font-mono">{selectedChatId}</span>
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
