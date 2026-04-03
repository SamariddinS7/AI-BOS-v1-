import React, { useState, useRef, useEffect, memo } from 'react';
import { Bot, Send, X, Sparkles, ShieldCheck, Activity, Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { executeAICommand } from '../lib/aiExecutionEngine';
import { VoicePipeline } from '../lib/voice-agent/VoicePipeline';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  time: string;
  isThinking?: boolean;
  report?: any;
  structuredData?: any;
  status?: 'success' | 'failed' | 'blocked' | 'info';
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
}

const AIAssistant = memo(({ isOpen, onClose, activePage }: AIAssistantProps) => {
  const { t, language } = useLanguage();
  
  const getPageContext = (page: string) => {
    const contexts: Record<string, { title: string, actions: string[] }> = {
      dashboard: { title: t('dashboard'), actions: [t('total_revenue'), t('net_profit'), t('active_users')] },
      sales: { title: t('sales'), actions: ["Sotuv prognozi", "Eng yaxshi mijozlar", "Sotilmayotgan tovarlar"] },
      expenses: { title: t('expenses'), actions: ["Xarajatlarni kamaytirish", "Katta to'lovlar", "Byudjetdan oshish"] },
      warehouse: { title: t('warehouse'), actions: ["Qoldiqlar tahlili", "Tugayotgan tovarlar", "ABC tahlil"] },
      hr: { title: t('hr'), actions: ["KPI tahlili", "Samaradorlik", "Ish haqi fondi"] },
      crm: { title: t('crm'), actions: ["Mijozlar oqimi", "Yo'qotilgan mijozlar", "LTV hisobi"] },
      accounting: { title: t('accounting'), actions: ["Balans hisoboti", "P&L tahlili", "Cash Flow"] },
      projects: { title: t('projects'), actions: ["Loyiha rentabelligi", "Muddati o'tgan ishlar", "Resurslar"] },
      reports: { title: t('reports'), actions: ["Haftalik hisobot", "Oylik tahlil", "Yillik prognoz"] },
      analysis: { title: t('analysis'), actions: ["Trendlar", "Mavsumiylik", "Benchmarking"] },
      ai: { title: t('ai_recommendations'), actions: ["Strategik reja", "Xatarlarni baholash", "Yangi imkoniyatlar"] },
      payments: { title: t('payments'), actions: ["Qarzdorlik", "To'lovlar taqvimi", "Valyuta xatarlari"] },
      settings: { title: t('settings'), actions: ["Tizim holati", "Xavfsizlik", "Integratsiyalar"] },
    };
    return contexts[page] || { title: t('ai_assistant'), actions: [] };
  };

  const currentContext = getPageContext(activePage);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voicePipelineRef = useRef<VoicePipeline | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  // Initialize Voice Pipeline
  useEffect(() => {
    if (isOpen) {
      voicePipelineRef.current = new VoicePipeline(process.env.GEMINI_API_KEY || '');
    }
    return () => {
      // Optional cleanup if needed
    };
  }, [isOpen]);

  // Update context message when page changes (Removed to prevent automatic messages)
  useEffect(() => {
    // Intentionally left empty to prevent automatic context messages
  }, [activePage, isOpen, language]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now() + Math.random(),
      text: text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await executeAICommand(text, { current_page: currentContext.title }, language);
      
      let aiResponseText = '';
      let report = undefined;
      let structuredData = undefined;
      let status: Message['status'] = 'info';
      
      if (data.status === 'blocked') {
        aiResponseText = `${t('error')}: ${data.reason}\n\nRejalashtirilgan harakat: ${data.intent?.action_type} (${data.intent?.module})`;
        status = 'blocked';
      } else if (data.status === 'failed') {
        aiResponseText = `${t('error')}: ${data.reason}`;
        status = 'failed';
      } else if (data.status === 'success') {
        status = 'success';
        if (data.intent?.action_type?.toUpperCase() === 'READ' || data.intent?.action_type?.toUpperCase() === 'PROPOSE') {
           // For simple reads/proposals, we format the data nicely
           const info = data.result?.data?.info || data.result?.data?.proposal || data.result?.data;
           aiResponseText = `${t('analysis')}:`;
           structuredData = info;
        } else if (data.report) {
           // For actual executions, we show the post-execution report
           aiResponseText = `${t('success')}.`;
           report = data.report;
        } else {
           aiResponseText = t('success');
        }
      } else {
        aiResponseText = t('error');
        status = 'failed';
      }

      const aiMsg: Message = {
        id: Date.now() + Math.random(),
        text: aiResponseText,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        report,
        structuredData,
        status
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      const aiMsg: Message = {
        id: Date.now() + 1,
        text: `${t('error')}: ${error.message}`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'failed'
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceCommand(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Mikrofonni ishlatish uchun ruxsat bering.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceCommand = async (audioBlob: Blob) => {
    if (!voicePipelineRef.current) return;

    setIsProcessingVoice(true);
    setIsTyping(true);

    try {
      const { result, audioResponse, transcript } = await voicePipelineRef.current.processAudio(audioBlob);

      // 1. Show User Transcript
      if (transcript) {
        setInput(transcript);
        const userMsg: Message = {
          id: Date.now(),
          text: transcript,
          sender: 'user',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
      }
      
      // 2. Show AI Response
      const aiMsg: Message = {
        id: Date.now() + 1,
        text: result.message,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: result.success ? 'success' : 'failed',
        structuredData: result.data
      };
      setMessages(prev => [...prev, aiMsg]);

      // 3. Play Audio Response
      if (audioResponse && audioResponse.size > 0) {
        console.log('[AIAssistant] Audio Blob size:', audioResponse.size, 'type:', audioResponse.type);
        const audioUrl = URL.createObjectURL(audioResponse);
        console.log('[AIAssistant] Audio URL:', audioUrl);
        const audio = new Audio(audioUrl);
        
        audio.onloadedmetadata = () => console.log('[AIAssistant] Audio loaded metadata');
        audio.onerror = (e) => console.error('[AIAssistant] Audio error:', e);
        
        audio.play().catch(e => console.error("Audio playback failed:", e));
      } else {
        console.warn('[AIAssistant] No audio data to play');
      }

    } catch (error) {
      console.error('Voice processing failed:', error);
      const errorMsg: Message = {
        id: Date.now(),
        text: t('error'),
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'failed'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessingVoice(false);
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 glass-panel shadow-2xl z-50 flex flex-col border-l border-border-dark transform transition-transform duration-300 ease-in-out font-sans">
      {/* Header */}
      <div className="p-4 border-b border-border-dark flex justify-between items-center bg-surface-card/50 backdrop-blur-md text-text-primary transition-colors">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-surface-dark"></div>
          </div>
          <div>
            <h3 className="font-bold text-base tracking-wide">AI-BOS</h3>
            <div className="flex items-center gap-1">
              <span className="text-base text-text-muted uppercase tracking-wider">Enterprise Intelligence</span>
              <span className="bg-brand-900/30 text-brand-200 text-base px-1.5 py-0.5 rounded border border-brand-700 ml-1">
                {currentContext.title}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-surface-card rounded-lg transition-colors text-text-secondary hover:text-text-primary">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Capabilities Banner */}
      <div className="bg-brand-900/20 p-3 border-b border-brand-900/30 flex justify-around text-base text-brand-300 font-medium">
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3" /> {t('accounting')}
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> {t('security')}
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> {t('analysis')}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-dark/50 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-3xl shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-brand-600 text-white rounded-br-sm shadow-lg shadow-brand-500/20' 
                : 'glass-card text-text-primary border border-border-dark rounded-bl-sm'
            }`}>
              <p className={`${msg.sender === 'user' ? 'text-base' : 'text-2xl'} whitespace-pre-wrap leading-relaxed`}>{msg.text}</p>
              
              {msg.report && (
                <div className="mt-3 bg-surface-card rounded-xl border border-border-dark p-3 shadow-sm">
                  <h4 className="text-base font-bold text-text-primary mb-2 pb-2 border-b border-border-dark">
                    {t('reports')}
                  </h4>
                  <p className="text-base text-text-secondary mb-3">{msg.report.action_performed}</p>
                  <div className="grid grid-cols-2 gap-2 text-base">
                    <div className="bg-surface-dark p-2 rounded-lg">
                      <span className="text-text-muted block mb-1">KPI</span>
                      <span className="font-semibold text-green-400">{msg.report.kpi_change}</span>
                    </div>
                    <div className="bg-surface-dark p-2 rounded-lg">
                      <span className="text-text-muted block mb-1">Impact</span>
                      <span className="font-semibold text-brand-400">{msg.report.financial_impact}</span>
                    </div>
                    <div className="bg-surface-dark p-2 rounded-lg">
                      <span className="text-text-muted block mb-1">Risk</span>
                      <span className="font-semibold text-yellow-400">{msg.report.risk_impact}</span>
                    </div>
                    <div className="bg-surface-dark p-2 rounded-lg">
                      <span className="text-text-muted block mb-1">Confidence</span>
                      <span className="font-semibold text-purple-400">{msg.report.confidence_level}</span>
                    </div>
                  </div>
                </div>
              )}

              {msg.structuredData && (
                <div className="mt-3 bg-surface-card rounded-xl border border-border-dark p-3 overflow-x-auto custom-scrollbar">
                  {typeof msg.structuredData === 'string' ? (
                    <p className="text-base text-text-secondary whitespace-pre-wrap">{msg.structuredData}</p>
                  ) : (
                    <pre className="text-base text-text-secondary font-mono">
                      {JSON.stringify(msg.structuredData, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              <span className={`text-base block mt-2 ${msg.sender === 'user' ? 'text-brand-100' : 'text-text-muted'} text-right`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass-card p-4 rounded-3xl rounded-bl-sm flex items-center gap-3">
              <div className="relative flex items-center justify-center w-6 h-6">
                <motion.div 
                  className="absolute inset-0 border-2 border-brand-500 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="w-2 h-2 bg-brand-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <span className="text-base text-brand-400 font-medium tracking-wide">{t('ai_thinking')}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-surface-card border-t border-border-dark">
        <div className="relative flex items-center bg-surface-dark rounded-2xl px-4 py-3 border border-border-dark focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-900/30 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('ai_chat_placeholder')}
            className="flex-1 bg-transparent outline-none text-base text-text-primary placeholder-text-muted pr-24"
            disabled={isRecording || isProcessingVoice}
          />
          
          <div className="absolute right-2 flex items-center gap-1">
            {/* Voice Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessingVoice}
              className={`p-2 rounded-full transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                  : 'text-text-muted hover:bg-surface-card hover:text-text-primary'
              }`}
              title={isRecording ? "Yozishni to'xtatish" : "Ovozli buyruq"}
            >
              {isProcessingVoice ? (
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              ) : isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isRecording || isProcessingVoice}
              className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-base text-center text-text-muted mt-2">
          {isRecording ? (
            <span className="text-red-500 font-medium animate-pulse">Ovoz yozilmoqda...</span>
          ) : isProcessingVoice ? (
            <span className="text-brand-500 font-medium">Ovoz qayta ishlanmoqda...</span>
          ) : (
            "AI-BOS maxfiy ma'lumotlarni himoya qiladi va faqat tasdiqlangan manbalardan foydalanadi."
          )}
        </p>
      </div>
    </div>
  );
});

AIAssistant.displayName = 'AIAssistant';

export default AIAssistant;
