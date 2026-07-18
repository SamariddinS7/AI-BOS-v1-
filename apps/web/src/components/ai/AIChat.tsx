import React, { useState, useEffect, useRef, memo } from 'react';
import { Mic, X, Volume2, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const VoiceWave = memo(({ active }: { active: boolean }) => (
  <div className="flex items-center gap-1 h-6">
    {[1,2,3,4,5].map(i=>(
      <div key={i} 
        className={`w-1 rounded-full bg-brand-500 transition-all duration-100 ${active ? 'animate-pulse' : ''}`}
        style={{
          height: active ? 10+Math.random()*14 : 4,
          animationDelay: `${i * 0.1}s`
        }}
      />
    ))}
  </div>
));

class SentenceQueue {
  queue: string[] = [];
  isPlaying = false;
  onStart: (text: string) => void;
  onEnd: () => void;
  onComplete: () => void;

  constructor(onStart: (text: string) => void, onEnd: () => void, onComplete: () => void) {
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.onComplete = onComplete;
  }

  add(sentence: string) {
    if(!sentence.trim()) return;
    this.queue.push(sentence);
    this.playNext();
  }

  playNext() {
    if(this.isPlaying || this.queue.length === 0) {
      if(!this.isPlaying && this.queue.length === 0) this.onComplete();
      return;
    }
    this.isPlaying = true;
    const text = this.queue.shift()!;
    this.onStart(text);

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "uz-UZ";
    u.rate = 1.05;
    u.pitch = 1.0;
    
    // Try to find a good voice
    const voices = speechSynthesis.getVoices();
    const uzVoice = voices.find(v => v.lang.includes('uz')) || voices.find(v => v.lang.includes('tr')) || voices.find(v => v.lang.includes('ru'));
    if (uzVoice) u.voice = uzVoice;

    u.onend = () => {
      this.isPlaying = false;
      this.onEnd();
      this.playNext();
    };
    u.onerror = (e) => {
      console.error("TTS Error:", e);
      this.isPlaying = false;
      this.onEnd();
      this.playNext();
    };
    speechSynthesis.speak(u);
  }

  stop() {
    speechSynthesis.cancel();
    this.queue = [];
    this.isPlaying = false;
    this.onEnd();
    this.onComplete();
  }
}

import { geminiService } from '../../services/geminiService';

async function callAIStream(messages: any[], system: string, onChunk: (chunk: string) => void) {
  await geminiService.generateStream(messages, system, onChunk);
}

function useVoiceAgent() {
  const [state, setState] = useState<"idle"|"listening"|"thinking"|"speaking">("idle");
  const [transcript, setTranscript] = useState("");
  const [aiText, setAiText] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  
  const recogRef = useRef<any>(null);
  const queueRef = useRef<SentenceQueue | null>(null);
  const bufferRef = useRef("");

  useEffect(() => {
    queueRef.current = new SentenceQueue(
      () => setState("speaking"),
      () => {},
      () => {
        if(state === "speaking") {
          setState("idle");
          startListening(); // Auto-resume listening after speaking
        }
      }
    );
    
    // Initialize Speech Recognition
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if(SR) {
      recogRef.current = new SR();
      recogRef.current.lang = "uz-UZ";
      recogRef.current.continuous = false;
      recogRef.current.interimResults = true;
      
      recogRef.current.onresult = (e: any) => {
        let final = "";
        let interim = "";
        for(let i=e.resultIndex; i<e.results.length; ++i) {
          if(e.results[i].isFinal) final += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        if(final) {
          setTranscript(final);
          handleUserSpeech(final);
        } else {
          setTranscript(interim);
        }
      };
      
      recogRef.current.onerror = (e: any) => {
        if(e.error !== "no-speech") {
          console.error("SR Error:", e.error);
          setState("idle");
        }
      };
      
      recogRef.current.onend = () => {
        if(state === "listening") {
          // Restart if still in listening state but recognition ended
          try { recogRef.current.start(); } catch(e) {}
        }
      };
    }

    return () => {
      if(recogRef.current) recogRef.current.stop();
      if(queueRef.current) queueRef.current.stop();
    };
  }, []);

  const handleUserSpeech = async (text: string) => {
    if(!text.trim()) return;
    
    setState("thinking");
    if(recogRef.current) recogRef.current.stop();
    if(queueRef.current) queueRef.current.stop();
    
    const newHist = [...history, {role:"user", content:text}];
    setHistory(newHist);
    setAiText("");
    bufferRef.current = "";
    
    let fullResponse = "";
    
    await callAIStream(newHist, "Siz AI-BOS ovozli yordamchisisiz. Qisqa, aniq va suhbatdoshdek javob bering. Raqamlarni so'z bilan yozing (masalan, 1000 ni 'ming' deb).", (chunk) => {
      fullResponse += chunk;
      setAiText(fullResponse);
      bufferRef.current += chunk;
      
      // Split by sentence boundaries
      const match = bufferRef.current.match(/([^.?!]+[.?!]+)/);
      if(match) {
        const sentence = match[1];
        bufferRef.current = bufferRef.current.slice(sentence.length);
        queueRef.current?.add(sentence);
      }
    });
    
    // Flush remaining buffer
    if(bufferRef.current.trim()) {
      queueRef.current?.add(bufferRef.current);
      bufferRef.current = "";
    }
    
    setHistory([...newHist, {role:"assistant", content:fullResponse}]);
  };

  const startListening = () => {
    if(queueRef.current) queueRef.current.stop();
    setTranscript("");
    setAiText("");
    setState("listening");
    try { recogRef.current?.start(); } catch(e) {}
  };

  const stopAll = () => {
    if(recogRef.current) recogRef.current.stop();
    if(queueRef.current) queueRef.current.stop();
    setState("idle");
  };

  return { state, transcript, aiText, startListening, stopAll };
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, transcript, aiText, startListening, stopAll } = useVoiceAgent();

  const toggleOpen = () => {
    if(isOpen) {
      stopAll();
      setIsOpen(false);
    } else {
      setIsOpen(true);
      startListening();
    }
  };

  return (
    <>
      <button
        onClick={toggleOpen}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 relative flex items-center justify-center ${
          isOpen 
            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30' 
            : 'bg-brand-600 hover:bg-brand-500 hover:scale-110 text-white shadow-brand-500/30'
        }`}
      >
        {isOpen ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 rounded-2xl shadow-2xl z-40 overflow-hidden glass-panel border border-border-dark flex flex-col"
          >
            <div className="px-5 py-4 bg-surface-card/80 border-b border-border-dark flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 border border-brand-500/20">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base font-bold text-text-primary">AI-BOS Voice</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      state === "listening" ? "bg-emerald-500 shadow-[0_0_5px_#10b981]" :
                      state === "thinking" ? "bg-brand-500 shadow-[0_0_5px_var(--color-brand-500)]" :
                      state === "speaking" ? "bg-brand-500 shadow-[0_0_5px_var(--color-brand-500)]" : "bg-text-muted"
                    }`} />
                    <span className={`text-base ${
                      state === "listening" ? "text-emerald-500" :
                      state === "thinking" ? "text-brand-500" :
                      state === "speaking" ? "text-brand-500" : "text-text-muted"
                    }`}>
                      {state === "listening" ? "Eshitmoqda..." : 
                       state === "thinking" ? "O'ylamoqda..." : 
                       state === "speaking" ? "Gapirmoqda..." : "Kutmoqda"}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={toggleOpen} className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-surface-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 min-h-[180px] flex flex-col justify-end gap-4 bg-surface-dark/30">
              {transcript && (
                <div className="self-end bg-surface-card px-4 py-2.5 rounded-2xl rounded-tr-sm border border-border-dark max-w-[85%] shadow-sm">
                  <div className="text-base text-text-primary leading-relaxed">{transcript}</div>
                </div>
              )}
              
              {(aiText || state === "thinking") && (
                <div className="self-start bg-brand-500/10 px-4 py-2.5 rounded-2xl rounded-tl-sm border border-brand-500/20 max-w-[85%] shadow-sm">
                  {state === "thinking" && !aiText ? (
                    <div className="flex items-center gap-2 text-brand-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-base font-mono">Tahlil qilinmoqda...</span>
                    </div>
                  ) : (
                    <div className="text-base text-text-primary leading-relaxed">{aiText}</div>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 py-4 bg-surface-card/80 border-t border-border-dark flex justify-center backdrop-blur-md">
              <VoiceWave active={state === "listening" || state === "speaking"} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
