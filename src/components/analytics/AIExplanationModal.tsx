import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Loader2, Sparkles } from 'lucide-react';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  chartData: any;
}

export default function AIExplanationModal({ isOpen, onClose, title, chartData }: AIExplanationModalProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      generateExplanation();
    } else {
      document.body.style.overflow = 'unset';
      setExplanation(null);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, title, chartData]);

  const generateExplanation = async () => {
    setLoading(true);
    // Simulate AI generation delay
    setTimeout(() => {
      setExplanation(`Ushbu "${title}" diagrammasi bo'yicha AI tahlili:\n\n1. Asosiy tendentsiyalar: Ma'lumotlar shuni ko'rsatadiki, so'nggi davrda barqaror o'sish kuzatilmoqda. Eng yuqori ko'rsatkichlar odatda davr o'rtalariga to'g'ri keladi.\n\n2. Anomaliyalar: Ayrim nuqtalarda kutilmagan pasayishlar mavjud, bu tashqi omillar yoki mavsumiylik bilan bog'liq bo'lishi mumkin.\n\n3. Tavsiyalar: O'sish sur'atini saqlab qolish uchun marketing harajatlarini maqbullashtirish va eng yaxshi natija ko'rsatayotgan kanallarga e'tiborni qaratish tavsiya etiladi.`);
      setLoading(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-surface-dark border border-border-dark rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-dark bg-surface-card/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-xl border border-brand-500/30">
                <Brain className="w-6 h-6 text-brand-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  AI Tahlil <Sparkles className="w-4 h-4 text-yellow-500" />
                </h2>
                <p className="text-base text-text-secondary">{title}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface-dark rounded-xl text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
                <p className="text-text-secondary animate-pulse">AI ma'lumotlarni tahlil qilmoqda...</p>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="bg-surface-card border border-border-dark rounded-xl p-6 leading-relaxed text-2xl text-text-secondary whitespace-pre-wrap">
                  {explanation}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-border-dark bg-surface-card/50 flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-surface-dark hover:bg-surface-card border border-border-dark text-text-primary rounded-lg transition-colors text-base font-medium"
            >
              Yopish
            </button>
          </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
