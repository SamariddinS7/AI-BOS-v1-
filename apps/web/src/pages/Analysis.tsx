import React, { useState } from 'react';
import UniversalChart from '../components/analytics/UniversalChart';
import { TrendingUp, Package, Megaphone, Activity, Cloud, Terminal } from 'lucide-react';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import Card from '../components/ui/Card';

export default function Analysis() {
  const [cloudInsight, setCloudInsight] = useState<{status: string; trends: string; action: string} | null>(null);

  const fetchCloudAnalytics = () => {
    // Mocking the Cloud Analyst AI Prompt response based on user prompt
    setCloudInsight({
      status: "Tizim barqaror (Uptime: 99.9%)",
      trends: "Cloud Storage load ↑ 12%, DB latency ↓ 4ms",
      action: "Cache strategiyasini joriy qilish va CDN-ni faollashtirish tavsiya etiladi."
    });
  };

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

      {/* Cloud & AI Prompt Integration */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-bold text-text-primary">Cloud Integratsiyasi & Tahlil Agenti</h2>
        </div>
        <Card className="p-6 bg-surface-ground">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
             <div>
               <h3 className="text-base font-bold text-text-primary mb-1">Cloud-Based AI Business Analyst</h3>
               <p className="text-sm text-text-secondary">Cloudda saqlanadigan KPI loglar, savdo va CRM ma'lumotlarini tahlil qilish moduli.</p>
             </div>
             <button 
               onClick={fetchCloudAnalytics}
               className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
             >
               <Terminal className="w-4 h-4" />
               Agent tahlilini ishga tushirish
             </button>
          </div>

          {cloudInsight && (
            <div className="p-4 bg-surface-card border border-border-dark rounded-xl space-y-3 animate-fade-in relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Cloud className="w-24 h-24" />
               </div>
               <div className="flex items-center gap-2 text-text-primary">
                 <span className="text-lg">📊</span>
                 <span className="font-bold">Status:</span>
                 <span className="text-emerald-400">{cloudInsight.status}</span>
               </div>
               <div className="flex items-center gap-2 text-text-primary">
                 <span className="text-lg">📈</span>
                 <span className="font-bold">Trendlar:</span>
                 <span>{cloudInsight.trends}</span>
               </div>
               <div className="flex items-center gap-2 text-text-primary">
                 <span className="text-lg">✅</span>
                 <span className="font-bold">Tavsiya qilinadigan harakat:</span>
                 <span className="text-brand-400">{cloudInsight.action}</span>
               </div>
               

            </div>
          )}
        </Card>
      </section>

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
