import React from 'react';
import { FileBarChart, Download, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';

export default function Reports() {
  const { info } = useToast();
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Hisobotlar</h2>
          <p className="text-text-muted text-base">Barcha turdagi biznes hisobotlari</p>
        </div>
        <button 
          onClick={() => info("Barchasini yuklash jarayoni boshlandi...")}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 font-bold text-base"
        >
          <Download className="w-5 h-5" />
          Barchasini Yuklash
        </button>
      </div>

      <AIInsightCard 
        title="Hisobotlar Tahlili"
        description="Barcha hisobotlar bo'yicha ma'lumotlar to'liq va yangilangan. 'Foyda va zarar' hisobotida kutilmagan 5% lik farq aniqlandi."
        impact="5% nomutanosiblik"
        confidence={88}
        action="Xarajatlarni qayta tekshirish"
        type="warning"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Savdo Hisoboti', desc: 'Oylik va yillik savdo statistikasi', icon: '' },
          { title: 'Xarajatlar Hisoboti', desc: 'Kategoriyalar bo\'yicha xarajatlar', icon: '' },
          { title: 'Foyda va Zarar', desc: 'P&L (Foyda va Zarar) hisoboti', icon: '' },
          { title: 'Ombor Qoldig\'i', desc: 'Mahsulotlar harakati va qoldiq', icon: '' },
          { title: 'Xodimlar Samaradorligi', desc: 'KPI va ish haqi hisoboti', icon: '' },
          { title: 'Mijozlar Tahlili', desc: 'Mijozlar faolligi va sodiqligi', icon: '' },
        ].map((report) => (
          <Card 
            key={report.title} 
            onClick={() => info(`${report.title} hisoboti tafsilotlari`)}
            className="p-6 hover:shadow-md transition-all hover:border-brand-500/30 group cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-surface-dark rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner shadow-black/20">
                {report.icon}
              </div>
              <div>
                <h3 className="font-bold text-text-primary group-hover:text-brand-400 transition-colors text-base">{report.title}</h3>
                <p className="text-base text-text-muted">{report.desc}</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border-dark">
              <span className="text-base text-text-muted flex items-center gap-1.5 font-medium">
                <Calendar className="w-5 h-5" /> So'nggi yangilanish: Bugun
              </span>
              <button 
                onClick={() => info(`${report.title} hisoboti yuklanmoqda...`)}
                className="text-brand-400 text-base font-bold hover:text-brand-300 flex items-center gap-1 group/btn"
              >
                Ko'rish
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
