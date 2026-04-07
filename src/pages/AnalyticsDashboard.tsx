import React, { useState } from 'react';
import { LayoutDashboard, Bot, Search, Zap, Activity, PieChart, DollarSign, ArrowRight, BarChart2 } from 'lucide-react';
import ExpandedChartModal from '../components/dashboard/ExpandedChartModal';

export default function AnalyticsDashboard() {
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-surface-ground text-white font-sans overflow-hidden">
      <ExpandedChartModal
        isOpen={expandedChart === 'main_chart'}
        onClose={() => setExpandedChart(null)}
        title="Daromad va Xarajatlar"
      >
        <div className="h-96 enterprise-card flex items-center justify-center text-text-muted border border-border-dark">
          <div className="text-center">
            <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-50 text-brand-500" />
            <p className="text-xl font-bold text-white">Batafsil tahlil (Kengaytirilgan)</p>
            <p className="text-base mt-2 text-text-muted font-bold">Bu yerda to'liq grafik va qo'shimcha ma'lumotlar bo'ladi.</p>
          </div>
        </div>
      </ExpandedChartModal>

      {/* Sidebar */}
      <nav className="w-16 bg-surface-layer/30 border-r border-border-dark flex flex-col items-center py-6 gap-6">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-black font-bold shadow-lg shadow-brand-500/20"></div>
        <div className="flex flex-col gap-4">
          <button className="p-2 text-brand-500 bg-brand-500/10 rounded-lg border border-brand-500/20"><LayoutDashboard size={20} /></button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border-dark flex items-center justify-between px-6 bg-surface-layer/30 backdrop-blur-xl">
          <h1 className="text-lg font-bold tracking-tight text-white">AI Command Center</h1>
          <div className="flex items-center gap-4">
            <span className="text-base text-text-muted font-bold font-mono">role: admin</span>
            <button className="px-4 py-1.5 bg-brand-500/10 text-brand-500 border border-brand-500/20 rounded-lg text-base font-bold hover:bg-brand-500/20 transition-colors">
              AI Panel
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-slide-in">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="enterprise-card p-5 border-border-dark">
                  <div className="text-base text-text-muted font-bold font-mono mb-2">YILLIK DAROMAD</div>
                  <div className="text-2xl font-bold font-mono text-white">1.2G so'm</div>
                </div>
                <div className="enterprise-card p-5 border-border-dark">
                  <div className="text-base text-text-muted font-bold font-mono mb-2">SOF FOYDA</div>
                  <div className="text-2xl font-bold font-mono text-emerald-500">450M so'm</div>
                </div>
                <div className="enterprise-card p-5 border-border-dark">
                  <div className="text-base text-text-muted font-bold font-mono mb-2">FOYDA MARJASI</div>
                  <div className="text-2xl font-bold font-mono text-brand-500">21.4%</div>
                </div>
              </div>

              {/* Main Chart */}
              <div 
                className="enterprise-card p-6 border-border-dark cursor-pointer hover:ring-2 hover:ring-brand-500/50 transition-all"
                onClick={() => setExpandedChart('main_chart')}
              >
                <h2 className="text-lg font-bold mb-4 text-white">Daromad va Xarajatlar</h2>
                <div className="h-64 bg-surface-layer/20 rounded-lg flex items-center justify-center text-text-muted border border-border-dark font-bold">
                  [Chartlar shu yerda bo'ladi]
                </div>
              </div>
            </div>
            
            {/* AI Chat Panel */}
            <div className="enterprise-card border-border-dark flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border-dark font-bold flex items-center gap-2 text-white">
                <Bot className="text-brand-500" size={18} /> AI Yordamchi
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xl">
                <div className="p-3 bg-surface-layer/50 rounded-lg text-text-muted font-bold">
                  Salom! Qanday yordam bera olaman?
                </div>
              </div>
              <div className="p-4 border-t border-border-dark">
                <input 
                  type="text" 
                  placeholder="Savol yozing..." 
                  className="w-full p-2 bg-surface-layer/30 border border-border-dark rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-base text-white placeholder:text-text-muted"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
