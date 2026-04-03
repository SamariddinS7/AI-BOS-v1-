import React, { useState } from 'react';
import { Calculator, FileText, Download, ArrowUpRight, ArrowDownLeft, Clock, Calendar, DollarSign, TrendingUp, TrendingDown, Search, Filter, Plus } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import DrillDownModal from '../components/analytics/DrillDownModal';
import { useToast } from '../hooks/useToast';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: 'Muvaffaqiyatli' | 'Jarayonda' | 'Bekor Qilindi';
  type: 'income' | 'expense';
}
// ... (rest of the mock data)
const mockPendingTransactions: Transaction[] = [
  { id: 'PEN-001', date: '2023-10-28', description: 'Soliq To\'lovi (QQS)', category: 'Soliq', amount: -12500000, status: 'Jarayonda', type: 'expense' },
  { id: 'PEN-002', date: '2023-10-30', description: 'Xodimlar Maoshi', category: 'Ish Haqi', amount: -45000000, status: 'Jarayonda', type: 'expense' },
  { id: 'PEN-003', date: '2023-11-01', description: 'Mijoz D dan Kutilayotgan Tushum', category: 'Savdo', amount: 18000000, status: 'Jarayonda', type: 'income' },
];

const mockPayments = [
  { id: '#PAY1', counterparty: 'Mijoz A', type: 'Kiruvchi', date: '2023-10-21', amount: 500000, status: 'Muvaffaqiyatli' },
  { id: '#PAY2', counterparty: 'Yetkazib beruvchi B', type: 'Chiquvchi', date: '2023-10-22', amount: -1200000, status: 'Jarayonda' },
  { id: '#PAY3', counterparty: 'Mijoz C', type: 'Kiruvchi', date: '2023-10-23', amount: 1500000, status: 'Bekor qilindi' },
  { id: '#PAY4', counterparty: 'Xizmat ko\'rsatuvchi D', type: 'Chiquvchi', date: '2023-10-24', amount: -200000, status: 'Muvaffaqiyatli' },
  { id: '#PAY5', counterparty: 'Mijoz E', type: 'Kiruvchi', date: '2023-10-25', amount: 2500000, status: 'Kutilmoqda' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Muvaffaqiyatli':
      return 'text-emerald-400 bg-emerald-900/30 border border-emerald-900/50';
    case 'Jarayonda':
      return 'text-blue-400 bg-blue-900/30 border border-blue-900/50';
    case 'Bekor qilindi':
      return 'text-rose-400 bg-rose-900/30 border border-rose-900/50';
    case 'Kutilmoqda':
      return 'text-yellow-400 bg-yellow-900/30 border border-yellow-900/50';
    default:
      return 'text-text-muted bg-surface-ground border border-border-dark';
  }
};

export default function Accounting() {
  const { success, info } = useToast();
  const [analytics, setAnalytics] = useState<{isOpen: boolean, title: string, metric: string}>({isOpen: false, title: '', metric: ''});
  const { formatCurrency } = useCurrencyFormatter();

  // Mock data for sparklines
  const sparklineData = [
    { value: 100 }, { value: 120 }, { value: 110 }, { value: 130 },
    { value: 125 }, { value: 140 }, { value: 135 }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <DrillDownModal 
        isOpen={analytics.isOpen} 
        onClose={() => setAnalytics({...analytics, isOpen: false})} 
        title={analytics.title}
        metric={analytics.metric}
        module="accounting"
        initialLevel="month"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Buxgalteriya</h2>
          <p className="text-text-muted text-base">Moliyaviy hisobotlar va balans</p>
        </div>
        <button 
          onClick={() => {
            success("Moliyaviy hisobot yuklanmoqda...");
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 font-bold text-base"
        >
          <Plus className="w-5 h-5" />
          Hisobot Yuklash
        </button>
      </div>

      <AIInsightCard 
        title="Moliyaviy Tahlil"
        description="Joriy likvidlik koeffitsienti 1.8 ni tashkil etmoqda, bu me'yordan yuqori. Biroq, debitor qarzdorlikning o'rtacha muddati 45 kunga cho'zildi."
        impact="Likvidlik 1.8"
        confidence={95}
        action="Debitorlar bilan ishlash"
        type="optimization"
        onAction={() => {
          info("Debitorlar bilan ishlash jarayoni boshlandi...");
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard 
          title="Joriy Balans" 
          value={formatCurrency(1250000000)} 
          change="+8.00%" 
          trend="up" 
          icon={DollarSign} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: 'Joriy Balans Tahlili', metric: 'current_balance'})}
        />
        <KPICard 
          title="Kutilayotgan Tushum" 
          value={formatCurrency(150000000)} 
          change="+15.00%" 
          trend="up" 
          icon={TrendingUp} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: 'Kutilayotgan Tushum Tahlili', metric: 'expected_income'})}
        />
        <KPICard 
          title="To'lanishi Kerak" 
          value={formatCurrency(45000000)} 
          change="-5.00%" 
          trend="down" 
          icon={TrendingDown} 
          data={sparklineData}
          onClick={() => setAnalytics({isOpen: true, title: "To'lanishi Kerak Tahlili", metric: 'accounts_payable'})}
        />
      </div>

      {/* Payments Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border-dark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-brand-500" />
            To'lovlar ro'yxati
          </h3>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input 
                type="text" 
                placeholder="To'lov qidirish..." 
                onChange={() => info("Qidiruv natijalari yangilanmoqda...", { id: 'search-accounting' })}
                className="w-full pl-10 pr-4 py-2 bg-surface-card border border-border-dark rounded-xl text-base text-text-primary placeholder-text-muted focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => info("Filtrlash oynasi ochilmoqda...")}
              className="flex items-center gap-2 px-4 py-2 text-base font-bold text-text-secondary bg-surface-card rounded-xl hover:bg-surface-dark transition-all border border-border-dark"
            >
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="bg-surface-card/50 text-text-muted uppercase tracking-wider text-base font-black">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Kontragent</th>
                <th className="px-6 py-4">Turi</th>
                <th className="px-6 py-4">Sana</th>
                <th className="px-6 py-4">Summa</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {mockPayments.map((payment) => (
                <tr 
                  key={payment.id} 
                  onClick={() => info(`${payment.id} to'lovi tafsilotlari`)}
                  className="hover:bg-surface-card/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 text-text-muted font-mono text-base">{payment.id}</td>
                  <td className="px-6 py-4 font-bold text-text-primary">{payment.counterparty}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-base font-black uppercase tracking-wider ${
                      payment.type === 'Kiruvchi' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'
                    }`}>
                      {payment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-muted">{payment.date}</td>
                  <td className={`px-6 py-4 font-black ${payment.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {payment.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(payment.amount))}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-base font-black uppercase tracking-wider rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pending Transactions Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border-dark flex justify-between items-center">
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Kutilayotgan To'lovlar
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="bg-surface-card/50 text-text-muted uppercase tracking-wider text-base font-black">
              <tr>
                <th className="px-6 py-4">Sana</th>
                <th className="px-6 py-4">Tavsif</th>
                <th className="px-6 py-4">Kategoriya</th>
                <th className="px-6 py-4">Summa</th>
                <th className="px-6 py-4">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {mockPendingTransactions.map((trx) => (
                <tr 
                  key={trx.id} 
                  onClick={() => info(`${trx.id} kutilayotgan to'lovi tafsilotlari`)}
                  className="hover:bg-surface-card/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 text-text-muted">{trx.date}</td>
                  <td className="px-6 py-4 font-bold text-text-primary">{trx.description}</td>
                  <td className="px-6 py-4 text-text-secondary">
                    <span className="px-2.5 py-1 bg-surface-card rounded-lg text-base font-bold border border-border-dark">
                      {trx.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-black ${trx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trx.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(trx.amount))}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-base font-black uppercase tracking-wider text-yellow-400 bg-yellow-900/30 rounded-full border border-yellow-900/50">
                      {trx.status}
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
