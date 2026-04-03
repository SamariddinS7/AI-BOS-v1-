import React, { useState, useEffect, memo } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  pages: { id: string; icon: any; label: string; }[];
  setPage: (id: string) => void;
}

export const CommandPalette = memo(({ isOpen, onClose, pages, setPage }: CommandPaletteProps) => {
  const [search, setSearch] = useState("");
  
  useEffect(() => {
    if (isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = pages.filter(p => p.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl glass-panel border border-border-dark rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-border-dark">
              <Search className="w-5 h-5 text-text-muted mr-3" />
              <input 
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Sahifani yoki buyruqni qidirish..."
                className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted/70 text-base"
              />
              <button 
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-surface-dark text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {filtered.length > 0 ? (
                <div className="space-y-1">
                  {filtered.map(p => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id} 
                        onClick={() => { setPage(p.id); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-dark text-left transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-surface-dark group-hover:bg-brand-500/10 text-text-muted group-hover:text-brand-500 transition-colors">
                          {typeof Icon === 'string' ? (
                            <span className="text-lg">{Icon}</span>
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-base font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-text-muted">
                  <p className="text-base">Hech narsa topilmadi</p>
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 border-t border-border-dark bg-surface-dark/50 flex items-center justify-between text-base text-text-muted">
              <div className="flex items-center gap-2">
                <span>Harakatlanish uchun</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-dark font-mono">Up</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-dark font-mono">Down</kbd>
              </div>
              <div className="flex items-center gap-2">
                <span>Tanlash uchun</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-dark font-mono">Enter</kbd>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

CommandPalette.displayName = 'CommandPalette';
