import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Trash2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: language === 'uz' 
            ? "Siz AI-BOS tizimining aqlli yordamchisisiz. Biznes, moliya va boshqaruv bo'yicha mutaxassis sifatida javob bering."
            : "You are the intelligent assistant of the AI-BOS system. Respond as an expert in business, finance, and management.",
        },
      });

      // Convert history to Gemini format
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const response = await chat.sendMessage({ message: input });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || (language === 'uz' ? "Kechirasiz, javob olishda xatolik yuz berdi." : "Sorry, an error occurred while getting the response."),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: language === 'uz' ? "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring." : "An error occurred. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] text-[#F0F4FF] font-sans">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#2A3655] bg-[#111827]/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00D4FF] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)]">
            <Bot className="w-6 h-6 text-[#0B0F19]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">AI-BOS Chat</h1>
            <p className="text-base text-[#8B9EC4] flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Gemini 3.1 Pro Online
            </p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-white/5 rounded-lg text-[#4D618A] hover:text-rose-400 transition-colors"
          title={language === 'uz' ? "Chatni tozalash" : "Clear Chat"}
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 opacity-60">
            <div className="w-20 h-20 bg-[#1A2236] rounded-3xl flex items-center justify-center border border-[#2A3655]">
              <MessageSquare size={40} className="text-[#00D4FF]" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">
                {language === 'uz' ? "Qanday yordam bera olaman?" : "How can I help you today?"}
              </h2>
              <p className="text-base text-[#8B9EC4]">
                {language === 'uz' 
                  ? "Biznes tahlili, moliya, marketing yoki tizimdan foydalanish bo'yicha savollaringizni bering." 
                  : "Ask questions about business analysis, finance, marketing, or using the system."}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {[
                language === 'uz' ? "Bugungi tushumni tahlil qil" : "Analyze today's revenue",
                language === 'uz' ? "Xarajatlarni kamaytirish yo'llari" : "Ways to reduce expenses",
                language === 'uz' ? "Marketing strategiyasini tuzish" : "Create a marketing strategy"
              ].map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="p-3 bg-[#1A2236] hover:bg-[#1E2840] border border-[#2A3655] rounded-xl text-base text-left transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-[#3D4F78]' : 'bg-[#00D4FF]/20 text-[#00D4FF]'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-[#00D4FF] text-[#0B0F19] rounded-tr-none' 
                    : 'bg-[#1A2236] border border-[#2A3655] text-[#F0F4FF] rounded-tl-none'
                }`}>
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-base mt-2 block opacity-50 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/20 text-[#00D4FF] flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-[#1A2236] border border-[#2A3655] rounded-tl-none flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-[#00D4FF]" />
                <span className="text-base text-[#8B9EC4]">{language === 'uz' ? "O'ylamoqda..." : "Thinking..."}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-[#2A3655] bg-[#111827]/50">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={language === 'uz' ? "Savolingizni yozing..." : "Type your message..."}
            className="w-full bg-[#1A2236] border border-[#2A3655] rounded-2xl px-4 py-4 pr-14 text-base focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-all resize-none custom-scrollbar"
            rows={1}
            style={{ minHeight: '56px', maxHeight: '200px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
              input.trim() && !isLoading 
                ? 'bg-[#00D4FF] text-[#0B0F19] shadow-[0_0_15px_rgba(0,212,255,0.4)]' 
                : 'bg-[#2A3655] text-[#4D618A] cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-base text-center text-[#4D618A] mt-3">
          AI-BOS Chat Gemini 3.1 Pro modeli asosida ishlaydi.
        </p>
      </div>
    </div>
  );
};

export default Chat;
