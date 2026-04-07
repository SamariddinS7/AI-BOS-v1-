import React, { useState, useEffect } from 'react';
import { TrendingDown, Calculator, DollarSign, ArrowUpRight, Clock, Filter, Download, Plus, Search, FileText, AlertCircle, CreditCard, PieChart as PieChartIcon, Calendar, ArrowDownLeft, TrendingUp, Wallet } from 'lucide-react';
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
import { calculateTax } from '../lib/utils';

const T = {
  accent: "var(--color-brand-500)",
  violet: "var(--color-violet-500)",
  teal: "var(--color-enterprise-teal)",
  amber: "var(--color-amber-500)",
  green: "var(--color-emerald-500)",
  sky: "var(--color-brand-400)",
  red: "var(--color-rose-500)",
};

export default function Finance() {
  const { success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'accounting' | 'taxes'>('overview');
  const { formatCurrency } = useCurrencyFormatter();
  const [analytics, setAnalytics] = useState<{isOpen: boolean, title: string, metric: string}>({isOpen: false, title: '', metric: ''});
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  
  // Data states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netProfit: 0, ebitda: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  // Forms
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    account_id: '',
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    counterparty: '',
    description: ''
  });
  const [newAccount, setNewAccount] = useState({ name: '', currency: 'UZS', balance: '' });

  // Tax calculation states
  const [taxRate, setTaxRate] = useState(12); // Default 12%
  const [customIncome, setCustomIncome] = useState<number>(0);

  const sparklineData = [{ value: 500 }, { value: 600 }, { value: 450 }, { value: 700 }, { value: 550 }, { value: 800 }, { value: 750 }];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [txRes, accRes, catRes, sumRes] = await Promise.all([
        fetch('/api/finance/transactions'),
        fetch('/api/finance/accounts'),
        fetch('/api/finance/categories'),
        fetch('/api/finance/summary')
      ]);
      
      if (txRes.ok) setTransactions(await txRes.json());
      if (accRes.ok) setAccounts(await accRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (sumRes.ok) setSummary(await sumRes.json());
    } catch (e) {
      console.error('Failed to fetch finance data', e);
      error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTransaction,
          amount: Number(newTransaction.amount)
        })
      });
      if (res.ok) {
        success("Tranzaksiya qo'shildi");
        setShowAddTransaction(false);
        setNewTransaction({ type: 'expense', amount: '', account_id: '', category_id: '', transaction_date: new Date().toISOString().split('T')[0], counterparty: '', description: '' });
        fetchData();
      } else {
        error("Xatolik yuz berdi");
      }
    } catch (e) {
      error("Tarmoq xatosi");
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAccount,
          balance: Number(newAccount.balance)
        })
      });
      if (res.ok) {
        success("Hisob raqam qo'shildi");
        setShowAddAccount(false);
        setNewAccount({ name: '', currency: 'UZS', balance: '' });
        fetchData();
      } else {
        error("Xatolik yuz berdi");
      }
    } catch (e) {
      error("Tarmoq xatosi");
    }
  };

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      const cat = curr.category_name || 'Boshqa';
      acc[cat] = (acc[cat] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const expData = Object.keys(expensesByCategory).map((key, index) => ({
    name: key,
    val: expensesByCategory[key],
    color: Object.values(T)[index % Object.values(T).length]
  }));

  return (
    <div className="flex-1 p-4 lg:p-8 font-sans transition-all duration-500 space-y-4 lg:space-y-8 animate-slide-in">
      <DrillDownModal 
        isOpen={analytics.isOpen} 
        onClose={() => setAnalytics({...analytics, isOpen: false})} 
        title={analytics.title}
        metric={analytics.metric}
        module="finance"
        initialLevel="month"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 lg:gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-text-primary">Moliya va Buxgalteriya</h2>
          <p className="text-xs lg:text-base text-text-muted">Moliyaviy oqimlar, xarajatlar va buxgalteriya hisobotlari</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowAddAccount(true)} className="px-3 py-2 bg-surface-card border border-border-dark text-text-primary rounded-lg flex items-center text-sm font-medium hover:bg-surface-hover transition-colors">
            <Wallet className="w-4 h-4 mr-2" />
            Yangi Hisob
          </button>
          <button onClick={() => setShowAddTransaction(true)} className="px-3 py-2 bg-brand-500 text-white rounded-lg flex items-center text-sm font-medium hover:bg-brand-600 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Yangi Tranzaksiya
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-3 lg:gap-4 border-b border-border-dark overflow-x-auto no-scrollbar">
        {['overview', 'expenses', 'accounting', 'taxes'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 lg:pb-4 text-xs lg:text-base font-bold transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-brand-400' : 'text-text-muted hover:text-text-primary'}`}
          >
            {tab === 'overview' ? "Umumiy Ko'rinish" : tab === 'expenses' ? "Xarajatlar" : tab === 'accounting' ? "Buxgalteriya" : "Soliqlar"}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <KPICard title="Daromad" value={formatCurrency(summary.totalIncome)} change="+15.2%" trend="up" icon={DollarSign} data={sparklineData} onClick={() => setAnalytics({isOpen: true, title: 'Daromad Tahlili', metric: 'revenue'})} />
            <KPICard title="Xarajat" value={formatCurrency(summary.totalExpense)} change="+8.4%" trend="up" icon={TrendingDown} data={sparklineData} onClick={() => setAnalytics({isOpen: true, title: 'Xarajat Tahlili', metric: 'expenses'})} />
            <KPICard title="Sof Foyda" value={formatCurrency(summary.netProfit)} change="+22.1%" trend="up" icon={CreditCard} data={sparklineData} onClick={() => setAnalytics({isOpen: true, title: 'Sof Foyda Tahlili', metric: 'net_profit'})} />
            <KPICard title="EBITDA" value={`${summary.ebitda}%`} change="+2.4%" trend="up" icon={FileText} data={sparklineData} onClick={() => setAnalytics({isOpen: true, title: 'EBITDA Tahlili', metric: 'ebitda'})} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Hisob raqamlar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts.map(acc => (
                  <div key={acc.id} className="p-4 bg-surface-layer/30 border border-border-dark rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-sm text-text-muted font-medium">{acc.name}</p>
                      <p className="text-xl font-bold text-text-primary mt-1">{formatCurrency(acc.balance)}</p>
                    </div>
                    <Wallet className="w-8 h-8 text-brand-500 opacity-50" />
                  </div>
                ))}
                {accounts.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-text-muted">Hisob raqamlar mavjud emas</div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Xarajatlar tarkibi</h3>
              {expData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={expData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="val">
                        {expData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-dark)', color: 'var(--color-text-primary)' }}
                      />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-text-muted">Ma'lumot yo'q</div>
              )}
            </Card>
          </div>
        </div>
      )}
      
      {activeTab === 'expenses' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-primary">Xarajatlar Ro'yxati</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-card/50 text-text-muted uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3">Kategoriya</th>
                  <th className="px-4 py-3">Kontragent</th>
                  <th className="px-4 py-3">Hisob</th>
                  <th className="px-4 py-3 text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {transactions.filter(t => t.type === 'expense').map((payment) => (
                  <tr key={payment.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-4 py-3 text-text-muted">{new Date(payment.transaction_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{payment.category_name || 'Boshqa'}</td>
                    <td className="px-4 py-3 text-text-primary">{payment.counterparty || payment.description || '-'}</td>
                    <td className="px-4 py-3 text-text-muted">{payment.account_name}</td>
                    <td className="px-4 py-3 font-bold text-right text-rose-500">-{formatCurrency(payment.amount)}</td>
                  </tr>
                ))}
                {transactions.filter(t => t.type === 'expense').length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-text-muted">Xarajatlar mavjud emas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'accounting' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border-dark flex justify-between items-center">
            <h3 className="font-bold text-text-primary flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-brand-500" />
              Barcha Tranzaksiyalar
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-card/50 text-text-muted uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3">Turi</th>
                  <th className="px-4 py-3">Kategoriya</th>
                  <th className="px-4 py-3">Kontragent/Tavsif</th>
                  <th className="px-4 py-3">Hisob</th>
                  <th className="px-4 py-3 text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {transactions.map((payment) => (
                  <tr key={payment.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-4 py-3 text-text-muted">{new Date(payment.transaction_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {payment.type === 'income' ? 'Kirim' : 'Chiqim'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">{payment.category_name || '-'}</td>
                    <td className="px-4 py-3 text-text-primary">{payment.counterparty || payment.description || '-'}</td>
                    <td className="px-4 py-3 text-text-muted">{payment.account_name}</td>
                    <td className={`px-4 py-3 font-bold text-right ${payment.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-muted">Tranzaksiyalar mavjud emas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'taxes' && (
        <div className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <Card className="p-4 lg:p-6 enterprise-card">
              <h3 className="text-sm lg:text-lg font-bold text-white mb-3 lg:mb-4 flex items-center gap-2">
                <Calculator size={16} className="text-brand-500 lg:w-5 lg:h-5" />
                Soliq Sozlamalari
              </h3>
              <div className="space-y-3 lg:space-y-4">
                <div>
                  <label className="block text-xs lg:text-base text-text-muted mb-1.5 lg:mb-2 font-bold">Standart Soliq Stavkasi (%)</label>
                  <div className="flex items-center gap-2 lg:gap-3">
                    <input 
                      type="number" 
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="flex-1 p-2 lg:p-3 bg-surface-layer/30 border border-border-dark rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-white font-bold text-xs lg:text-base"
                    />
                    <span className="text-sm lg:text-xl font-bold text-brand-500">%</span>
                  </div>
                </div>
                <p className="text-[10px] lg:text-base text-text-muted italic font-bold">
                  * Ushbu stavka barcha avtomatik hisob-kitoblar uchun qo'llaniladi.
                </p>
              </div>
            </Card>

            <Card className="p-4 lg:p-6 enterprise-card">
              <h3 className="text-sm lg:text-lg font-bold text-white mb-3 lg:mb-4 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-500 lg:w-5 lg:h-5" />
                Tezkor Hisoblagich
              </h3>
              <div className="space-y-3 lg:space-y-4">
                <div>
                  <label className="block text-xs lg:text-base text-text-muted mb-1.5 lg:mb-2 font-bold">Daromad Miqdori</label>
                  <input 
                    type="number" 
                    value={customIncome || ''}
                    onChange={(e) => setCustomIncome(Number(e.target.value))}
                    placeholder="Summani kiriting..."
                    className="w-full p-2 lg:p-3 bg-surface-layer/30 border border-border-dark rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-white font-bold text-xs lg:text-base"
                  />
                </div>
                <div className="p-3 lg:p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="text-xs lg:text-base text-emerald-400 font-bold mb-0.5 lg:mb-1">Hisoblangan Soliq ({taxRate}%):</div>
                  <div className="text-lg lg:text-2xl font-black text-white">
                    {formatCurrency(calculateTax(customIncome, taxRate / 100))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden enterprise-card">
            <div className="p-3 lg:p-4 border-b border-border-dark bg-surface-layer/30">
              <h3 className="text-sm lg:font-bold text-white flex items-center gap-2">
                <FileText size={16} className="text-brand-500 lg:w-5 lg:h-5" />
                Soliq Majburiyatlari (Joriy Oy)
              </h3>
            </div>
            <table className="w-full text-left text-xs lg:text-base">
              <thead className="bg-surface-card/50 text-text-muted uppercase tracking-wider text-[10px] lg:text-base font-black">
                <tr>
                  <th className="px-3 py-3 lg:px-6 lg:py-4">Daromad</th>
                  <th className="px-3 py-3 lg:px-6 lg:py-4">Foyda</th>
                  <th className="px-3 py-3 lg:px-6 lg:py-4">Soliq ({taxRate}%)</th>
                  <th className="px-3 py-3 lg:px-6 lg:py-4">Sof Foyda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                <tr>
                  <td className="px-3 py-3 lg:px-6 lg:py-4 font-bold text-white">{formatCurrency(summary.totalIncome)}</td>
                  <td className="px-3 py-3 lg:px-6 lg:py-4 font-bold text-emerald-400">{formatCurrency(summary.netProfit)}</td>
                  <td className="px-3 py-3 lg:px-6 lg:py-4 font-bold text-rose-400">{formatCurrency(calculateTax(summary.netProfit > 0 ? summary.netProfit : 0, taxRate / 100))}</td>
                  <td className="px-3 py-3 lg:px-6 lg:py-4 font-black text-white">{formatCurrency(summary.netProfit - calculateTax(summary.netProfit > 0 ? summary.netProfit : 0, taxRate / 100))}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Modals */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-text-primary mb-4">Yangi Tranzaksiya</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Turi</label>
                  <select 
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                    className="w-full p-2 bg-surface-layer border border-border-dark rounded-lg text-text-primary outline-none focus:border-brand-500"
                    required
                  >
                    <option value="expense">Chiqim (Xarajat)</option>
                    <option value="income">Kirim (Daromad)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Sana</label>
                  <input 
                    type="date" 
                    value={newTransaction.transaction_date}
                    onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
                    className="w-full p-2 bg-surface-layer border border-border-dark rounded-lg text-text-primary outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Summa</label>
                <input 
                  type="number" 
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className="w-full p-2 bg-surface-layer border border-border-dark rounded-lg text-text-primary outline-none focus:border-brand-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Hisob raqam</label>
                <select 
                  value={newTransaction.account_id}
                  onChange={(e) => setNewTransaction({...newTransaction, account_id: e.target.value})}
                  className="w-full p-2 bg-surface-layer border border-border-dark rounded-lg text-text-primary outline-none focus:border-brand-500"
                  required
                >
                  <option value="">Tanlang...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Kategoriya</label>
                <select 
                  value={newTransaction.category_id}
                  onChange={(e) => setNewTransaction({...newTransaction, category_id: e.target.value})}
                  className="w-full p-2 bg-surface-layer border border-border-dark rounded-lg text-text-primary outline-none focus:border-brand-500"
                >
                  <option value="">Tanlang... (Ixtiyoriy)</option>
                  {categories.filter(c => c.type === newTransaction.type).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Kontragent (Kimga/Kimdan)</label>
                <input 
                  type="text" 
                  value={newTransaction.counterparty}
                  onChange={(e) => setNewTransaction({...newTransaction, counterparty: e.target.value})}
                  className="w-full p-2 bg-surface-layer border border-border-dark rounded-lg text-text-primary outline-none focus:border-brand-500"
                  placeholder="Mijoz yoki yetkazib beruvchi nomi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Tavsif</label>
                <input 
                  type="text" 
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full p-2 bg-surface-layer border border-border-dark rounded-lg text-text-primary outline-none focus:border-brand-500"
                  placeholder="Nima uchun?"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddTransaction(false)} className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                  Saqlash
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showAddAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-text-primary mb-4">Yangi Hisob Raqam</h3>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Nomi</label>
                <input 
                  type="text" 
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  className="w-full p-2 bg-surface-layer border border-border-dark rounded-lg text-text-primary outline-none focus:border-brand-500"
                  placeholder="Masalan: Asosiy Kassa, Ipoteka Bank"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Boshlang'ich qoldiq</label>
                <input 
                  type="number" 
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                  className="w-full p-2 bg-surface-layer border border-border-dark rounded-lg text-text-primary outline-none focus:border-brand-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddAccount(false)} className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                  Saqlash
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
