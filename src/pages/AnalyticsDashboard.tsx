import React, { useState } from 'react';
import { LayoutDashboard, Bot, Search, Zap, Activity, PieChart, DollarSign, ArrowRight, BarChart2 } from 'lucide-react';
import Card from '../components/ui/Card';
import ExpandedChartModal from '../components/dashboard/ExpandedChartModal';

export default function AnalyticsDashboard() {
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <ExpandedChartModal
        isOpen={expandedChart === 'main_chart'}
        onClose={() => setExpandedChart(null)}
        title="Daromad va Xarajatlar"
      >
        <div className="h-96 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 border border-slate-800">
          <div className="text-center">
            <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-medium">Batafsil tahlil (Kengaytirilgan)</p>
            <p className="text-base mt-2">Bu yerda to'liq grafik va qo'shimcha ma'lumotlar bo'ladi.</p>
          </div>
        </div>
      </ExpandedChartModal>

      {/* Sidebar */}
      <nav className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20"></div>
        <div className="flex flex-col gap-4">
          <button className="p-2 text-blue-500 bg-blue-500/10 rounded-lg"><LayoutDashboard size={20} /></button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900">
          <h1 className="text-lg font-bold tracking-tight">AI Command Center</h1>
          <div className="flex items-center gap-4">
            <span className="text-base text-slate-500 font-mono">role: admin</span>
            <button className="px-4 py-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-base font-bold hover:bg-blue-500/20 transition-colors">
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
                <Card className="p-5 bg-slate-900 border-slate-800">
                  <div className="text-base text-slate-400 font-mono mb-2">YILLIK DAROMAD</div>
                  <div className="text-2xl font-bold font-mono">1.2G so'm</div>
                </Card>
                <Card className="p-5 bg-slate-900 border-slate-800">
                  <div className="text-base text-slate-400 font-mono mb-2">SOF FOYDA</div>
                  <div className="text-2xl font-bold font-mono text-emerald-500">450M so'm</div>
                </Card>
                <Card className="p-5 bg-slate-900 border-slate-800">
                  <div className="text-base text-slate-400 font-mono mb-2">FOYDA MARJASI</div>
                  <div className="text-2xl font-bold font-mono text-cyan-500">21.4%</div>
                </Card>
              </div>

              {/* Main Chart */}
              <Card 
                className="p-6 bg-slate-900 border-slate-800 cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all"
                onClick={() => setExpandedChart('main_chart')}
              >
                <h2 className="text-lg font-bold mb-4">Daromad va Xarajatlar</h2>
                <div className="h-64 bg-slate-950 rounded-lg flex items-center justify-center text-slate-600 border border-slate-800">
                  [Chartlar shu yerda bo'ladi]
                </div>
              </Card>
            </div>
            
            {/* AI Chat Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 font-bold flex items-center gap-2">
                <Bot className="text-blue-500" size={18} /> AI Yordamchi
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-2xl">
                <div className="p-3 bg-slate-800 rounded-lg">
                  Salom! Qanday yordam bera olaman?
                </div>
              </div>
              <div className="p-4 border-t border-slate-800">
                <input 
                  type="text" 
                  placeholder="Savol yozing..." 
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
