import React, { useState } from 'react';
import { TrendingDown, Calculator, DollarSign, ArrowUpRight, Clock, Filter, Download, Plus, Search, FileText, AlertCircle, CreditCard, PieChart as PieChartIcon, Calendar, ArrowDownLeft, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart as RePieChart, Pie, Legend, ComposedChart, Area 
} from 'recharts';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import KPICard from '../components/dashboard/KPICard';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import DrillDownModal from '../components/analytics/DrillDownModal';
import ExpandedChartModal from '../components/dashboard/ExpandedChartModal';
import { useToast } from '../hooks/useToast';

const T = {
  accent: "#3b82f6",
  violet: "#8b5cf6",
  teal: "#0d9488",
  amber: "#f59e0b",
  green: "#10b981",
  sky: "#0ea5e9",
  red: "#ef4444",
};

const FIN_DATA = [
  {name:"Yan", rev:4200, exp:3100, profit:1100},
  {name:"Feb", rev:4800, exp:3400, profit:1400},
  {name:"Mar", rev:5100, exp:3800, profit:1300},
  {name:"Apr", rev:5900, exp:4100, profit:1800},
  {name:"May", rev:6400, exp:4400, profit:2000},
  {name:"Iyun",rev:7200, exp:4800, profit:2400},
];

const EXP_STRUCT = [
  {name:"Marketing", val:35, color:T.accent},
  {name:"Oyliklar",  val:40, color:T.violet},
  {name:"Ijara",     val:10, color:T.amber},
  {name:"Texnika",   val:8,  color:T.teal},
  {name:"Boshqa",    val:7,  color:T.sky},
];

const mockPayments = [
  { id: '#PAY1', counterparty: 'Mijoz A', type: 'Kiruvchi', date: '2023-10-21', amount: 500000, status: 'Muvaffaqiyatli' },
  { id: '#PAY2', counterparty: 'Yetkazib beruvchi B', type: 'Chiquvchi', date: '2023-10-22', amount: -1200000, status: 'Jarayonda' },
  { id: '#PAY3', counterparty: 'Mijoz C', type: 'Kiruvchi', date: '2023-10-23', amount: 1500000, status: 'Bekor qilindi' },
];

export default function Finance() {
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'accounting' | 'taxes'>('overview');
  const { formatCurrency } = useCurrencyFormatter();
  const [analytics, setAnalytics] = useState<{isOpen: boolean, title: string, metric: string}>({isOpen: false, title: '', metric: ''});
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  const sparklineData = [{ value: 500 }, { value: 600 }, { value: 450 }, { value: 700 }, { value: 550 }, { value: 800 }, { value: 750 }];

  return (
    <div className="flex-1 p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <DrillDownModal 
        isOpen={analytics.isOpen} 
        onClose={() => setAnalytics({...analytics, isOpen: false})} 
        title={analytics.title}
        metric={analytics.metric}
        module="finance"
        initialLevel="month"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Moliya va Buxgalteriya</h2>
          <p className="text-text-muted">Moliyaviy oqimlar, xarajatlar va buxgalteriya hisobotlari</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-border-dark overflow-x-auto no-scrollbar">
        {['overview', 'expenses', 'accounting', 'taxes'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-base font-bold transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
          >
            {tab === 'overview' ? "Umumiy Ko'rinish" : tab === 'expenses' ? "Xarajatlar" : tab === 'accounting' ? "Buxgalteriya" : "Soliqlar"}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Daromad" value={formatCurrency(7200000)} change="+15.2%" trend="up" icon={DollarSign} data={sparklineData} onClick={() => setAnalytics({isOpen: true, title: 'Daromad Tahlili', metric: 'revenue'})} />
          <KPICard title="Xarajat" value={formatCurrency(4800000)} change="+8.4%" trend="up" icon={TrendingDown} data={sparklineData} onClick={() => setAnalytics({isOpen: true, title: 'Xarajat Tahlili', metric: 'expenses'})} />
          <KPICard title="Sof Foyda" value={formatCurrency(2400000)} change="+22.1%" trend="up" icon={CreditCard} data={sparklineData} onClick={() => setAnalytics({isOpen: true, title: 'Sof Foyda Tahlili', metric: 'net_profit'})} />
          <KPICard title="EBITDA" value="33.3%" change="+2.4%" trend="up" icon={FileText} data={sparklineData} onClick={() => setAnalytics({isOpen: true, title: 'EBITDA Tahlili', metric: 'ebitda'})} />
        </div>
      )}
      
      {activeTab === 'expenses' && <div className="text-text-muted">Xarajatlar bo'limi ma'lumotlari...</div>}
      {activeTab === 'accounting' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border-dark">
            <h3 className="font-bold text-text-primary flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-brand-500" />
              To'lovlar ro'yxati
            </h3>
          </div>
          <table className="w-full text-left text-base">
            <thead className="bg-surface-card/50 text-text-muted uppercase tracking-wider text-base font-black">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Kontragent</th>
                <th className="px-6 py-4">Summa</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {mockPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 text-text-muted font-mono">{payment.id}</td>
                  <td className="px-6 py-4 font-bold text-text-primary">{payment.counterparty}</td>
                  <td className="px-6 py-4 font-black">{formatCurrency(Math.abs(payment.amount))}</td>
                  <td className="px-6 py-4">{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {activeTab === 'taxes' && <div className="text-text-muted">Soliqlar bo'limi ma'lumotlari...</div>}
    </div>
  );
}
