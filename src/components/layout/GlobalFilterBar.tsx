import React from 'react';
import { Search, Filter, Calendar, ChevronDown } from 'lucide-react';

export default function GlobalFilterBar() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 glass-panel rounded-2xl mb-6 shadow-sm">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Qidirish (mahsulot, mijoz, xodim)..." 
            className="w-full pl-9 pr-4 py-2.5 bg-surface-card border border-border-dark rounded-xl text-base focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-text-primary transition-all placeholder:text-text-muted/70 shadow-sm"
          />
        </div>
        <button className="p-2.5 bg-surface-card border border-border-dark rounded-xl text-text-muted hover:text-brand-500 hover:border-brand-500/50 transition-all shadow-sm">
          <Filter className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button className="flex items-center justify-between gap-3 px-4 py-2.5 bg-surface-card border border-border-dark rounded-xl text-base text-text-secondary hover:text-text-primary hover:border-border-glow transition-all min-w-[160px] shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-500" />
            <span className="font-medium">Oxirgi 30 kun</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </button>
      </div>
    </div>
  );
}
