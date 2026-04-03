import React, { useState } from 'react';
import { ShoppingCart, Plus, Filter, Download, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import KPICard from '../components/dashboard/KPICard';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import DrillDownModal from '../components/analytics/DrillDownModal';
import { useToast } from '../hooks/useToast';

export default function Sales() {
  const { success, info } = useToast();
  const [timeRange, setTimeRange] = useState('thisMonth');
  const [analytics, setAnalytics] = useState<{isOpen: boolean, title: string, metric: string}>({isOpen: false, title: '', metric: ''});
  const { formatCurrency } = useCurrencyFormatter();

  // Mock data for sparklines
  const sparklineData = [
    { value: 120 }, { value: 132 }, { value: 101 }, { value: 134 },
    { value: 90 }, { value: 230 }, { value: 210 }
  ];

  return (
    <div className="flex-1 p-6 md:p-8 font-sans space-y-8 animate-slide-in">
      <DrillDownModal 
        isOpen={analytics.isOpen} 
        onClose={() => setAnalytics({...analytics, isOpen: false})} 
        title={analytics.title}
        metric={analytics.metric}
        module="sales"
        initialLevel="month"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Savdo</h2>
          <p className="text-text-muted text-base">Barcha savdo operatsiyalari tarixi</p>
        </div>
        <button 
          onClick={() => info('Yangi savdo oynasi ochilmoqda...')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap shadow-lg shadow-brand-500/20 font-bold text-base"
        >
          <Plus className="w-5 h-5" />
          Yangi Savdo
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard 
          title="Jami Savdo" 
          value={formatCurrency(12500000)} 
          change="+15%" 
          trend="up" 
          icon={DollarSign} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: 'Jami Savdo Tahlili', metric: 'total_sales'})}
        />
        <KPICard 
          title="Buyurtmalar" 
          value="1,240" 
          change="+8%" 
          trend="up" 
          icon={ShoppingCart} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: 'Buyurtmalar Tahlili', metric: 'orders'})}
        />
        <KPICard 
          title="O'rtacha Chek" 
          value={formatCurrency(10500)} 
          change="-2%" 
          trend="down" 
          icon={TrendingUp} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: "O'rtacha Chek Tahlili", metric: 'avg_check'})}
        />
      </div>

      {/* AI Insight Section */}
      <AIInsightCard 
        title="Savdo Tahlili"
        description="So'nggi haftada savdo hajmi 15% ga oshdi, lekin mijozlar qaytishi 5% ga kamaydi. Asosiy o'sish 'Mahsulot A' hisobiga to'g'ri kelmoqda."
        impact="+15% Savdo"
        confidence={92}
        action="Sodiqlik dasturini ko'rish"
        type="opportunity"
        onAction={() => info('Sodiqlik dasturi tahlil qilinmoqda...')}
      />

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border-dark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4">
            <button 
              onClick={() => info('Filtrlash paneli ochilmoqda...')}
              className="flex items-center gap-2 px-3 py-1.5 text-base font-medium text-text-secondary bg-surface-card rounded-lg hover:bg-surface-dark transition-colors border border-border-dark"
            >
              <Filter className="w-5 h-5" />
              Filtrlash
            </button>
            <button 
              onClick={() => success('Ma\'lumotlar eksport qilindi (Excel)')}
              className="flex items-center gap-2 px-3 py-1.5 text-base font-medium text-text-secondary bg-surface-card rounded-lg hover:bg-surface-dark transition-colors border border-border-dark"
            >
              <Download className="w-5 h-5" />
              Eksport
            </button>
          </div>
          <div className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg border border-border-dark shadow-sm w-full sm:w-auto">
            <Calendar className="w-5 h-5 text-text-muted" />
            <select 
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                info(`Vaqt oralig'i o'zgartirildi: ${e.target.options[e.target.selectedIndex].text}`);
              }}
              className="bg-transparent text-base text-text-primary outline-none cursor-pointer w-full"
            >
              <option value="7days" className="bg-surface-card text-text-primary">Oxirgi 7 kun</option>
              <option value="30days" className="bg-surface-card text-text-primary">Oxirgi 30 kun</option>
              <option value="thisMonth" className="bg-surface-card text-text-primary">Joriy oy</option>
              <option value="lastMonth" className="bg-surface-card text-text-primary">O'tgan oy</option>
              <option value="thisYear" className="bg-surface-card text-text-primary">Joriy yil</option>
              <option value="allTime" className="bg-surface-card text-text-primary">Barcha vaqt</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="bg-surface-card/50 text-text-muted">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Mijoz</th>
                <th className="px-6 py-3 font-medium">Mahsulot</th>
                <th className="px-6 py-3 font-medium">Sana</th>
                <th className="px-6 py-3 font-medium">Summa</th>
                <th className="px-6 py-3 font-medium">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr 
                  key={`sale-${i}`} 
                  onClick={() => info(`#100${i} buyurtma tafsilotlari`)}
                  className="hover:bg-surface-card/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-text-primary">#100{i}</td>
                  <td className="px-6 py-4 text-text-primary">Mijoz {i}</td>
                  <td className="px-6 py-4 text-text-secondary">Mahsulot A, Mahsulot B</td>
                  <td className="px-6 py-4 text-text-secondary">2023-10-2{i}</td>
                  <td className="px-6 py-4 font-medium text-text-primary">{formatCurrency(1200000)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-base font-medium text-green-400 bg-green-900/30 rounded-full border border-green-900/50">
                      To'langan
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
