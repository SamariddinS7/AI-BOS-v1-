import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart as RePieChart, Pie, Legend, ComposedChart, Area 
} from 'recharts';
import { TrendingDown, Plus, Filter, Download, Calendar, FileText, AlertCircle, DollarSign, PieChart as PieChartIcon, CreditCard } from 'lucide-react';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import KPICard from '../components/dashboard/KPICard';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import ExpandedChartModal from '../components/dashboard/ExpandedChartModal';
import DrillDownModal from '../components/analytics/DrillDownModal';
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

export default function Expenses() {
  const { success, info } = useToast();
  const [timeRange, setTimeRange] = useState('thisMonth');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'expenses' | 'taxes' | 'overview'>('overview');
  const [analytics, setAnalytics] = useState<{isOpen: boolean, title: string, metric: string}>({isOpen: false, title: '', metric: ''});
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const { formatCurrency } = useCurrencyFormatter();

  // Mock data for sparklines
  const sparklineData = [
    { value: 500 }, { value: 600 }, { value: 450 }, { value: 700 },
    { value: 550 }, { value: 800 }, { value: 750 }
  ];

  const expenses = [
    { id: 1, category: 'Ofis Ijarasi', description: 'Oylik To\'lov', date: '2023-10-21', amount: 500000, status: 'Tasdiqlangan' },
    { id: 2, category: 'Marketing', description: 'Google Ads', date: '2023-10-22', amount: 300000, status: 'Tasdiqlangan' },
    { id: 3, category: 'Ofis Ijarasi', description: 'Internet', date: '2023-10-23', amount: 100000, status: 'Kutilmoqda' },
    { id: 4, category: 'HR', description: 'Xodimlar oyligi', date: '2023-10-24', amount: 1500000, status: 'Tasdiqlangan' },
    { id: 5, category: 'Marketing', description: 'SMM', date: '2023-10-25', amount: 200000, status: 'Tasdiqlangan' },
  ];

  const filteredExpenses = expenses.filter(exp => 
    (categoryFilter === 'all' || exp.category === categoryFilter)
  );

  return (
    <div className="flex-1 p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in">
      <DrillDownModal 
        isOpen={analytics.isOpen} 
        onClose={() => setAnalytics({...analytics, isOpen: false})} 
        title={analytics.title}
        metric={analytics.metric}
        module="expenses"
        initialLevel="month"
      />

      <ExpandedChartModal
        isOpen={expandedChart === 'financial_flow'}
        onClose={() => setExpandedChart(null)}
        title="Moliyaviy Oqim (Daromad vs Xarajat)"
      >
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={FIN_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8B9EC4', fontSize: 16}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#8B9EC4', fontSize: 16}} />
              <Tooltip 
                contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px'}}
                itemStyle={{color: '#F0F4FF'}}
              />
              <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
              <Bar dataKey="rev" name="Daromad ($)" fill={T.accent} radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="exp" name="Xarajat ($)" fill={T.red} radius={[4, 4, 0, 0]} barSize={40} />
              <Area type="monotone" dataKey="profit" name="Foyda ($)" fill="rgba(16, 185, 129, 0.1)" stroke={T.green} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ExpandedChartModal>

      <ExpandedChartModal
        isOpen={expandedChart === 'expense_structure'}
        onClose={() => setExpandedChart(null)}
        title="Xarajatlar Strukturasi"
      >
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={EXP_STRUCT}
                innerRadius={100}
                outerRadius={140}
                paddingAngle={5}
                dataKey="val"
              >
                {EXP_STRUCT.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px'}}
                itemStyle={{color: '#F0F4FF'}}
                formatter={(val: any) => [`${val}%`, 'Ulush']}
              />
              <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{fontSize: '12px', paddingLeft: '20px'}} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </ExpandedChartModal>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Moliya va Xarajatlar</h2>
          <p className="text-text-muted">Moliyaviy oqimlar, xarajatlar va soliq hisobotlari</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'expenses' ? (
            <button 
              onClick={() => info('Yangi xarajat oynasi ochilmoqda...')}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 font-bold text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Yangi Xarajat
            </button>
          ) : activeTab === 'taxes' ? (
            <button 
              onClick={() => success('Soliq deklaratsiyasi yuklab olindi')}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 font-bold text-base whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Deklaratsiya Yuklash
            </button>
          ) : null}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-border-dark overflow-x-auto no-scrollbar">
        <button 
          onClick={() => {
            setActiveTab('overview');
          }}
          className={`pb-4 text-base font-bold transition-all relative whitespace-nowrap ${activeTab === 'overview' ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
        >
          Umumiy Ko'rinish
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></div>}
        </button>
        <button 
          onClick={() => {
            setActiveTab('expenses');
          }}
          className={`pb-4 text-base font-bold transition-all relative whitespace-nowrap ${activeTab === 'expenses' ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
        >
          Xarajatlar
          {activeTab === 'expenses' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></div>}
        </button>
        <button 
          onClick={() => {
            setActiveTab('taxes');
          }}
          className={`pb-4 text-base font-bold transition-all relative whitespace-nowrap ${activeTab === 'taxes' ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
        >
          Soliqlar
          {activeTab === 'taxes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></div>}
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              title="Daromad" 
              value={formatCurrency(7200000)} 
              change="+15.2%" 
              trend="up" 
              icon={DollarSign} 
              data={sparklineData}
              onClick={() => setAnalytics({isOpen: true, title: 'Daromad Tahlili', metric: 'revenue'})}
            />
            <KPICard 
              title="Xarajat" 
              value={formatCurrency(4800000)} 
              change="+8.4%" 
              trend="up" 
              icon={TrendingDown} 
              data={sparklineData}
              onClick={() => setAnalytics({isOpen: true, title: 'Xarajat Tahlili', metric: 'expenses'})}
            />
            <KPICard 
              title="Sof Foyda" 
              value={formatCurrency(2400000)} 
              change="+22.1%" 
              trend="up" 
              icon={CreditCard} 
              data={sparklineData}
              onClick={() => setAnalytics({isOpen: true, title: 'Sof Foyda Tahlili', metric: 'net_profit'})}
            />
            <KPICard 
              title="EBITDA" 
              value="33.3%" 
              change="+2.4%" 
              trend="up" 
              icon={FileText} 
              data={sparklineData}
              onClick={() => setAnalytics({isOpen: true, title: 'EBITDA Tahlili', metric: 'ebitda'})}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-6 cursor-pointer hover:border-accent transition-colors" onClick={() => setExpandedChart('financial_flow')}>
              <h3 className="text-lg font-bold text-text-primary mb-6">Moliyaviy Oqim (Daromad vs Xarajat)</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={FIN_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8B9EC4', fontSize: 16}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#8B9EC4', fontSize: 16}} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px'}}
                      itemStyle={{color: '#F0F4FF'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '20px'}} />
                    <Bar dataKey="rev" name="Daromad ($)" fill={T.accent} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="exp" name="Xarajat ($)" fill={T.red} radius={[4, 4, 0, 0]} barSize={20} />
                    <Area type="monotone" dataKey="profit" name="Foyda ($)" fill="rgba(16, 185, 129, 0.1)" stroke={T.green} strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 cursor-pointer hover:border-accent transition-colors" onClick={() => setExpandedChart('expense_structure')}>
              <h3 className="text-lg font-bold text-text-primary mb-6">Xarajatlar Strukturasi</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={EXP_STRUCT}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="val"
                    >
                      {EXP_STRUCT.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px'}}
                      itemStyle={{color: '#F0F4FF'}}
                      formatter={(val: any) => [`${val}%`, 'Ulush']}
                    />
                    <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{fontSize: '10px', paddingLeft: '20px'}} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-surface-ground rounded-xl border border-border-dark">
                <div className="text-base text-text-muted uppercase tracking-widest mb-1">Eng katta xarajat</div>
                <div className="text-base font-bold text-text-primary">Xodimlar oyligi (40%)</div>
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'expenses' && (
        <>
          <AIInsightCard 
            title="Xarajatlar Tahlili"
            description="Joriy oyda ofis xarajatlari o'tgan oyga nisbatan 12% ga oshdi. Bu asosan kommunal to'lovlar hisobiga to'g'ri kelmoqda."
            impact="-8% Xarajat"
            confidence={85}
            action="Optimallashtirish rejasi"
            type="optimization"
            onAction={() => info('Optimallashtirish rejasi tayyorlanmoqda...')}
          />

          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border-dark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <button 
                  onClick={() => info('Filtrlash paneli ochilmoqda...')}
                  className="flex items-center gap-2 px-4 py-2 text-base font-bold text-text-secondary bg-surface-card rounded-xl hover:bg-surface-dark transition-all border border-border-dark"
                >
                  <Filter className="w-4 h-4" />
                  Filtrlash
                </button>
                <button 
                  onClick={() => success('Ma\'lumotlar eksport qilindi')}
                  className="flex items-center gap-2 px-4 py-2 text-base font-bold text-text-secondary bg-surface-card rounded-xl hover:bg-surface-dark transition-all border border-border-dark"
                >
                  <Download className="w-4 h-4" />
                  Eksport
                </button>
              </div>
              <div className="flex items-center gap-2 bg-surface-card px-4 py-2 rounded-xl border border-border-dark shadow-sm w-full sm:w-auto">
                <Filter className="w-4 h-4 text-text-muted" />
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-base text-text-primary outline-none cursor-pointer w-full font-bold"
                >
                  <option value="all" className="bg-surface-card text-text-primary">Barcha kategoriyalar</option>
                  <option value="Ofis Ijarasi" className="bg-surface-card text-text-primary">Ofis Ijarasi</option>
                  <option value="Marketing" className="bg-surface-card text-text-primary">Marketing</option>
                  <option value="HR" className="bg-surface-card text-text-primary">HR</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-surface-card px-4 py-2 rounded-xl border border-border-dark shadow-sm w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-text-muted" />
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-base text-text-primary outline-none cursor-pointer w-full font-bold"
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
                <thead className="bg-surface-card/50 text-text-muted uppercase tracking-wider text-base font-black">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Kategoriya</th>
                    <th className="px-6 py-4">Tavsif</th>
                    <th className="px-6 py-4">Sana</th>
                    <th className="px-6 py-4">Summa</th>
                    <th className="px-6 py-4">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {filteredExpenses.map((exp) => (
                    <tr 
                      key={`exp-${exp.id}`} 
                      onClick={() => info(`${exp.category} xarajati tafsilotlari`)}
                      className="hover:bg-surface-card/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 text-text-muted font-mono text-base">#{exp.id}</td>
                      <td className="px-6 py-4 font-bold text-text-primary">{exp.category}</td>
                      <td className="px-6 py-4 text-text-secondary">{exp.description}</td>
                      <td className="px-6 py-4 text-text-muted">{exp.date}</td>
                      <td className="px-6 py-4 font-black text-rose-400">-{formatCurrency(exp.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-base font-black uppercase tracking-wider rounded-full border ${exp.status === 'Tasdiqlangan' ? 'text-emerald-400 bg-emerald-900/30 border-emerald-900/50' : 'text-yellow-400 bg-yellow-900/30 border-yellow-900/50'}`}>
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'taxes' && (
        <div className="space-y-8">
          <AIInsightCard 
            title="Soliq Tahlili"
            description="Joriy chorakda soliq yuki 14% ni tashkil etmoqda. QQS bo'yicha hisobga olinadigan summa o'tgan oyga nisbatan kamaygan."
            impact="Soliq yuki 14%"
            confidence={90}
            action="Hisobotni ko'rish"
            type="risk"
            onAction={() => info('Soliq hisoboti yuklanmoqda...')}
          />

          <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-xl">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
              <p className="text-base font-bold text-yellow-200">
                Diqqat: QQS hisoboti topshirish muddati 2 kundan keyin tugaydi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                Joriy oy uchun soliqlar
              </h3>
              <ul className="space-y-4">
                {[
                  { label: 'QQS (12%)', value: formatCurrency(12500000) },
                  { label: 'Foyda Solig\'i', value: formatCurrency(5400000) },
                  { label: 'Jismoniy Shaxslar Daromad Solig\'i', value: formatCurrency(3200000) },
                ].map((tax, i) => (
                  <li key={`tax-${i}`} className="flex justify-between items-center border-b border-border-dark pb-3">
                    <span className="text-base font-bold text-text-secondary">{tax.label}</span>
                    <span className="font-black text-text-primary">{tax.value}</span>
                  </li>
                ))}
              </ul>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                To'lovlar Tarixi
              </h3>
              <ul className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <li key={`history-${i}`} className="flex justify-between items-center border-b border-border-dark pb-3">
                    <div>
                      <p className="font-bold text-text-primary">Sentyabr 2023</p>
                      <p className="text-base text-text-muted uppercase font-bold mt-0.5">To'langan Sana: 15.10.2023</p>
                    </div>
                    <span className="px-2.5 py-1 text-base font-black uppercase tracking-wider text-emerald-400 bg-emerald-900/30 rounded-full border border-emerald-900/50">
                      To'langan
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
