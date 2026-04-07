import React from 'react';
import UniversalChart from '../components/analytics/UniversalChart';
import { TrendingUp, Package, Megaphone, Activity } from 'lucide-react';
import AIInsightCard from '../components/dashboard/AIInsightCard';

export default function Analysis() {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tahlil Markazi</h1>
          <p className="text-text-muted">Real vaqt rejimida tahlillar va prognozlar.</p>
        </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-base font-bold text-emerald-400 uppercase tracking-wider">Tizim Onlayn</span>
          </div>
      </div>

      <AIInsightCard 
        title="Tizim Tahlili"
        description="Marketing ROI ko'rsatkichi o'tgan oyga nisbatan 12% ga oshdi. 'Yozgi Aksiya' kampaniyasi eng yuqori natijani ko'rsatmoqda."
        impact="ROI +12%"
        confidence={94}
        action="Kampaniya byudjetini oshirish"
        type="opportunity"
      />

      {/* Financial Overview */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-bold text-text-primary">Moliyaviy Ko'rsatkichlar</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UniversalChart 
            module="revenue" 
            metric="amount" 
            title="Umumiy Daromad" 
            color="var(--color-emerald-500)" 
          />
          <UniversalChart 
            module="sales" 
            metric="count" 
            title="Savdo Hajmi" 
            color="var(--color-brand-500)" 
          />
        </div>
      </section>

      {/* Marketing & Growth */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-violet-500" />
          <h2 className="text-lg font-bold text-text-primary">Marketing va O'sish</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UniversalChart 
            module="marketing" 
            metric="roi" 
            title="Marketing ROI" 
            color="var(--color-violet-500)" 
          />
          <UniversalChart 
            module="marketing" 
            metric="leads" 
            title="Lidlar Generatsiyasi" 
            color="var(--color-brand-400)" 
          />
        </div>
      </section>

      {/* Operational Efficiency */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-text-primary">Operatsion Samaradorlik</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UniversalChart 
            module="inventory" 
            metric="stock" 
            title="Ombor Qoldig'i" 
            color="var(--color-amber-500)" 
          />
          <UniversalChart 
            module="hr" 
            metric="performance" 
            title="Xodimlar Samaradorligi" 
            color="var(--color-rose-500)" 
          />
        </div>
      </section>
    </div>
  );
}
