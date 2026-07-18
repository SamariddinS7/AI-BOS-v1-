import React, { useState, useEffect, memo } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, 
  CheckCircle, Zap, Shield, BarChart2, PieChart, ArrowUpRight, 
  ArrowDownRight, Target, Users, Sparkles, Calendar, Clock, Bot
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { motion } from 'motion/react';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';
import ExpandedChartModal from './ExpandedChartModal';
import DeptPerformanceChart from './DeptPerformanceChart';
import AIRecommendations from './AIRecommendations';
import ProactiveGrowthSuggestions from './ProactiveGrowthSuggestions';
import LiveChat from '../ai/LiveChat';
import CountUp from '../ui/CountUp';
import KPICard from './KPICard';
import AIInsightCard from './AIInsightCard';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ComposedChart, Area, ReferenceLine, Legend
} from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

const T = {
  accent: "var(--color-brand-500)",
  violet: "#8b5cf6",
  teal: "var(--color-enterprise-teal)",
  amber: "#f59e0b",
  green: "#10b981",
  sky: "#0ea5e9",
  red: "#ef4444",
};

// No mock data constant

interface CEOModeProps {
  realTimeUpdates?: any[];
}

const CEOMode = memo(({ realTimeUpdates = [] }: CEOModeProps) => {
  const { info } = useToast();
  const { t } = useLanguage();
  const { formatCurrency } = useCurrencyFormatter();
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [liveChatOpen, setLiveChatOpen] = useState(false);
  
  const [revenueData, setRevenueData] = useState<any>(null);
  const [expensesData, setExpensesData] = useState<any>(null);
  const [marketingData, setMarketingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  const deptData = [
    { name: 'Sales', score: 92, status: 'bg-emerald-500' },
    { name: 'Marketing', score: 88, status: 'bg-emerald-500' },
    { name: 'Product', score: 74, status: 'bg-amber-500' },
    { name: 'Engineering', score: 95, status: 'bg-emerald-500' },
    { name: 'HR', score: 65, status: 'bg-rose-500' },
    { name: 'Finance', score: 82, status: 'bg-emerald-500' },
  ];

  useEffect(() => {
    // Check for anomalies and analytics updates in real-time updates
    if (realTimeUpdates.length > 0) {
      const latest = realTimeUpdates[0];
      
      if (latest.type === 'anomaly_detected') {
        setAnomalies(prev => [{
          type: 'risk',
          title: latest.data.message,
          impact: latest.data.impact
        }, ...prev].slice(0, 5));
      } else if (latest.type === 'analytics_update') {
        // Update local state based on module
        const newValue = latest.data.value;
        
        if (latest.module === 'revenue') {
          setRevenueData((prev: any) => {
            if (!prev) return prev;
            const updatedSummary = { ...prev.summary, total: prev.summary.total + newValue };
            // Also update the last data point in the chart for visual effect
            const updatedData = [...prev.data];
            if (updatedData.length > 0) {
              updatedData[updatedData.length - 1] = { 
                ...updatedData[updatedData.length - 1], 
                value: updatedData[updatedData.length - 1].value + newValue 
              };
            }
            return { ...prev, summary: updatedSummary, data: updatedData };
          });
        } else if (latest.module === 'expenses') {
          setExpensesData((prev: any) => {
            if (!prev) return prev;
            const updatedSummary = { ...prev.summary, total: prev.summary.total + newValue };
            const updatedData = [...prev.data];
            if (updatedData.length > 0) {
              updatedData[updatedData.length - 1] = { 
                ...updatedData[updatedData.length - 1], 
                value: updatedData[updatedData.length - 1].value + newValue 
              };
            }
            return { ...prev, summary: updatedSummary, data: updatedData };
          });
        } else if (latest.module === 'marketing') {
          setMarketingData((prev: any) => {
            if (!prev) return prev;
            // Update the first channel's ROI/ROAS slightly
            const updatedData = [...prev.data];
            if (updatedData.length > 0) {
              updatedData[0] = { 
                ...updatedData[0], 
                roi: updatedData[0].roi + (newValue % 10),
                roas: updatedData[0].roas + (newValue / 1000)
              };
            }
            return { ...prev, data: updatedData };
          });
        }
      }
    }
  }, [realTimeUpdates]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revRes, expRes, mktRes] = await Promise.all([
          fetch('/api/analytics/revenue/amount/drilldown/month'),
          fetch('/api/analytics/expenses/amount/drilldown/month'),
          fetch('/api/analytics/marketing/roi/drilldown/campaign')
        ]);
        
        if (!revRes.ok) {
          const text = await revRes.text();
          console.error('Revenue API Error:', text);
          throw new Error(`Failed to fetch revenue data: ${revRes.status}`);
        }
        if (!expRes.ok) {
          const text = await expRes.text();
          console.error('Expenses API Error:', text);
          throw new Error(`Failed to fetch expenses data: ${expRes.status}`);
        }
        if (!mktRes.ok) {
          const text = await mktRes.text();
          console.error('Marketing API Error:', text);
          throw new Error(`Failed to fetch marketing data: ${mktRes.status}`);
        }
        
        const rev = await revRes.json();
        const exp = await expRes.json();
        const mkt = await mktRes.json();
        
        console.log('API Response:', { rev, exp, mkt });
        
        setRevenueData(rev);
        setExpensesData(exp);
        setMarketingData(mkt);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const totalRevenue = (revenueData?.summary?.total) 
    ? revenueData.summary.total 
    : (Array.isArray(revenueData) ? revenueData.reduce((acc, d) => acc + (d.value || 0), 0) : 0);
  const totalExpenses = (expensesData?.summary?.total) 
    ? expensesData.summary.total 
    : (Array.isArray(expensesData) ? expensesData.reduce((acc, d) => acc + (d.value || 0), 0) : 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Prepare chart data for Recharts
  const data = Array.isArray(revenueData) ? revenueData : (revenueData?.data || []);
  const chartData = data.length > 0 
    ? data.map((d: any) => ({
        name: d.name,
        value: d.value,
      }))
    : [];

  const expData = Array.isArray(expensesData) ? expensesData : (expensesData?.data || []);
  const expensesChartData = expData.length > 0
    ? expData.map((d: any) => ({
        name: d.name,
        value: d.value,
      }))
    : [];

  const netProfitChartData = chartData.map((d: any, index: number) => ({
    name: d.name,
    value: d.value - (expensesChartData[index]?.value || 0),
  }));

  // Map marketing data to MKT_CHANNELS format
  const dynamicMktChannels = (marketingData?.data || []).map((d: any, index: number) => {
    const colors = [T.accent, T.violet, T.amber, T.teal, T.sky, T.green];
    return {
      name: d.name,
      spend: d.spend || 0,
      rev: d.rev || 0,
      roi: d.roi || 0,
      roas: d.roas || 0,
      cac: d.cac || 0,
      color: colors[index % colors.length]
    };
  });
  
  const mktDataToUse = dynamicMktChannels;

  // No mock data constant

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6 font-sans min-h-full text-white">
      <ExpandedChartModal
        isOpen={expandedChart === 'revenue_forecast'}
        onClose={() => setExpandedChart(null)}
        title={t('revenue_forecast')}
      >
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={16} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={16} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip 
                cursor={{ stroke: 'var(--color-brand-500)', strokeWidth: 2 }}
                contentStyle={{ backgroundColor: 'var(--color-surface-layer)', borderColor: 'var(--color-border-dark)', color: '#fff', fontSize: '16px', borderRadius: '0.5rem' }}
                itemStyle={{ color: 'var(--color-brand-400)' }}
                formatter={(value: number) => [formatCurrency(value), t('revenue')]}
              />
              <Line type="monotone" dataKey="value" stroke="var(--color-brand-500)" strokeWidth={4} dot={{ fill: 'var(--color-brand-500)', r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ExpandedChartModal>

      <ExpandedChartModal
        isOpen={expandedChart === 'roas_cac'}
        onClose={() => setExpandedChart(null)}
        title={t('channel_efficiency')}
      >
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mktDataToUse}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" horizontal={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} />
              <Tooltip 
                contentStyle={{backgroundColor: 'var(--color-surface-layer)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', fontSize: '16px', color: '#fff'}}
                itemStyle={{color: '#fff'}}
              />
              <Legend iconType="circle" wrapperStyle={{fontSize: '16px', paddingTop: '20px'}} />
              <Bar yAxisId="left" dataKey="roas" name="ROAS (x)" radius={[4, 4, 0, 0]} barSize={40}>
                {mktDataToUse.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Area yAxisId="right" type="monotone" dataKey="cac" name="CAC" fill="rgba(239, 68, 68, 0.1)" stroke={T.red} strokeWidth={3} />
              <ReferenceLine yAxisId="left" y={3} label={{value: 'Target ROAS', position: 'insideBottomRight', fill: '#10b981', fontSize: 16}} stroke="#10b981" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ExpandedChartModal>

      <ExpandedChartModal
        isOpen={expandedChart === 'roi_comparison'}
        onClose={() => setExpandedChart(null)}
        title={t('channel_roi_comparison')}
      >
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mktDataToUse} layout="vertical" margin={{left: 20, right: 20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} width={120} />
              <Tooltip 
                contentStyle={{backgroundColor: 'var(--color-surface-layer)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', fontSize: '16px', color: '#fff'}}
                itemStyle={{color: '#fff'}}
                formatter={(val: any) => [`${val}%`, 'ROI']}
              />
              <Bar dataKey="roi" radius={[0, 4, 4, 0]} barSize={30}>
                {mktDataToUse.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ExpandedChartModal>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-1 lg:mb-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            {t('executive_dashboard')}
          </h1>
          <p className="text-xs lg:text-base text-text-muted flex items-center gap-1.5 mt-0.5 lg:mt-1 font-bold">
            <Calendar size={14} className="lg:w-4 lg:h-4" /> {currentDate}
          </p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span className="text-xs lg:text-base font-bold text-emerald-500">{t('system_operational')}</span>
          </div>
        </div>
      </div>

      <LiveChat isOpen={liveChatOpen} onClose={() => setLiveChatOpen(false)} />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        <KPICard 
          title={t('total_revenue')} 
          value={formatCurrency(totalRevenue)} 
          change="+15%" 
          trend="up" 
          icon={TrendingUp} 
          data={chartData.slice(-7)}
        />
        <KPICard 
          title={t('total_expenses')} 
          value={formatCurrency(totalExpenses)} 
          change="-5%" 
          trend="down" 
          icon={TrendingDown} 
          data={expensesChartData.slice(-7)}
        />
        <KPICard 
          title={t('net_profit')} 
          value={formatCurrency(netProfit)} 
          change="+22%" 
          trend="up" 
          icon={DollarSign} 
          data={netProfitChartData.slice(-7)}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        
        {/* Revenue Forecast Chart */}
        <div 
          className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border-dark enterprise-card p-4 lg:p-5 cursor-pointer hover:border-brand-500/30 transition-all shadow-sm group"
          onClick={() => setExpandedChart('revenue_forecast')}
        >
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <div>
              <h3 className="text-sm lg:text-base font-bold text-white flex items-center gap-2">
                <BarChart2 size={16} className="text-brand-500 lg:w-[18px] lg:h-[18px]" />
                {t('revenue_forecast')}
              </h3>
              <p className="text-xs lg:text-base text-text-muted mt-0.5 lg:mt-1">{t('ai_projection')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="flex items-center gap-1 px-2 py-1 lg:px-2.5 lg:py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 text-xs lg:text-base font-bold rounded-lg border border-brand-500/20 transition-colors"
              >
                <Sparkles size={14} className="lg:w-4 lg:h-4" />
                {t('ai_analysis')}
              </button>
            </div>
          </div>
          
          <div className="h-64 w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-text-muted">{t('loading_chart_data')}</div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-text-muted">{t('no_data_available') || 'No data available'}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-text-muted)" 
                    fontSize={16} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--color-text-muted)" 
                    fontSize={16} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'var(--color-brand-500)', strokeWidth: 2 }}
                    contentStyle={{ backgroundColor: 'var(--color-surface-layer)', borderColor: 'var(--color-border-dark)', color: '#fff', fontSize: '16px', borderRadius: '0.5rem' }}
                    itemStyle={{ color: 'var(--color-brand-400)' }}
                    formatter={(value: number) => [formatCurrency(value), t('revenue')]}
                  />
                  <Line type="monotone" dataKey="value" stroke="var(--color-brand-500)" strokeWidth={3} dot={{ fill: 'var(--color-brand-500)', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Department Performance & System Status */}
        <div className="space-y-3 lg:space-y-4">
          {/* Dept Performance */}
          <div 
            className="rounded-2xl border border-border-dark enterprise-card p-4 lg:p-5 cursor-pointer hover:border-brand-500/30 transition-all shadow-sm"
            onClick={() => setExpandedChart('dept_performance')}
          >
            <div className="flex justify-between items-center mb-3 lg:mb-4">
              <h3 className="text-sm lg:text-base font-bold text-white flex items-center gap-2">
                <Activity size={16} className="text-brand-500 lg:w-[18px] lg:h-[18px]" />
                {t('performance')}
              </h3>
            </div>
            <DeptPerformanceChart data={deptData} />
          </div>

          {/* System Status Widget */}
          <div className="rounded-2xl border border-border-dark enterprise-card p-4 lg:p-5 shadow-sm">
            <h3 className="text-xs lg:text-base font-bold text-text-muted uppercase tracking-wider mb-3 lg:mb-4">{t('system_health')}</h3>
            <div className="space-y-2 lg:space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 bg-brand-500/10 rounded-xl text-brand-500">
                    <Zap size={14} className="lg:w-4 lg:h-4" />
                  </div>
                  <span className="text-xs lg:text-base font-bold text-text-muted">{t('api_latency')}</span>
                </div>
                <span className="text-xs lg:text-base font-mono font-bold text-emerald-500">45ms</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 bg-brand-500/10 rounded-xl text-brand-500">
                    <Shield size={14} className="lg:w-4 lg:h-4" />
                  </div>
                  <span className="text-xs lg:text-base font-bold text-text-muted">{t('security')}</span>
                </div>
                <span className="text-xs lg:text-base font-mono font-bold text-emerald-500">{t('secure')}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 bg-brand-500/10 rounded-xl text-brand-500">
                    <AlertTriangle size={14} className="lg:w-4 lg:h-4" />
                  </div>
                  <span className="text-xs lg:text-base font-bold text-text-muted">{t('anomalies')}</span>
                </div>
                <span className="text-xs lg:text-base font-mono font-bold text-amber-500">{anomalies.length} {t('detected')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* New Charts from User Code */}
        <div className="lg:col-span-2 rounded-2xl border border-border-dark enterprise-card p-4 lg:p-6 cursor-pointer hover:border-brand-500/30 transition-all shadow-sm" onClick={() => setExpandedChart('roas_cac')}>
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <div>
              <h3 className="text-sm lg:text-lg font-bold text-white">{t('channel_efficiency')}</h3>
              <p className="text-xs lg:text-base text-text-muted mt-0.5 lg:mt-1">{t('cost_efficiency_ratio')}</p>
            </div>
          </div>
          <div className="h-[200px] lg:h-[300px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-text-muted">{t('loading_chart_data')}</div>
            ) : mktDataToUse.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-text-muted">{t('no_data_available') || 'No data available'}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mktDataToUse}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: 'var(--color-surface-layer)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', fontSize: '16px', color: '#fff'}}
                    itemStyle={{color: '#fff'}}
                  />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '16px', paddingTop: '20px'}} />
                  <Bar yAxisId="left" dataKey="roas" name="ROAS (x)" radius={[4, 4, 0, 0]} barSize={20}>
                    {mktDataToUse.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Area yAxisId="right" type="monotone" dataKey="cac" name="CAC" fill="rgba(239, 68, 68, 0.1)" stroke={T.red} strokeWidth={2} />
                  <ReferenceLine yAxisId="left" y={3} label={{value: 'Target ROAS', position: 'insideBottomRight', fill: '#10b981', fontSize: 16}} stroke="#10b981" strokeDasharray="3 3" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border-dark enterprise-card p-4 lg:p-6 cursor-pointer hover:border-brand-500/30 transition-all shadow-sm" onClick={() => setExpandedChart('roi_comparison')}>
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <div>
              <h3 className="text-sm lg:text-lg font-bold text-white">{t('channel_roi_comparison')}</h3>
              <p className="text-xs lg:text-base text-text-muted mt-0.5 lg:mt-1">{t('return_on_investment')}</p>
            </div>
          </div>
          <div className="h-[200px] lg:h-[300px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-text-muted">{t('loading_chart_data')}</div>
            ) : mktDataToUse.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-text-muted">{t('no_data_available') || 'No data available'}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mktDataToUse} layout="vertical" margin={{left: -20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} width={80} />
                  <Tooltip 
                    contentStyle={{backgroundColor: 'var(--color-surface-layer)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', fontSize: '16px', color: '#fff'}}
                    itemStyle={{color: '#fff'}}
                    formatter={(val: any) => [`${val}%`, 'ROI']}
                  />
                  <Bar dataKey="roi" radius={[0, 4, 4, 0]} barSize={12}>
                    {mktDataToUse.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        {/* Proactive Growth Opportunities */}
        <div className="lg:col-span-3">
          <ProactiveGrowthSuggestions />
        </div>
      </div>

      {/* AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        {anomalies.length > 0 ? (
          anomalies.map((anomaly, idx) => (
            <AIInsightCard 
              key={`anomaly-${anomaly.title}-${idx}`}
              type="risk" 
              title={anomaly.title} 
              description={t('anomaly_detected_metrics')}
              impact={anomaly.impact} 
              confidence={95}
              action={t('investigate')}
              onAction={() => info(`${t('investigate')} ${t('process_started')}`)}
            />
          ))
        ) : (
          <AIInsightCard 
            type="risk" 
            title={t('supply_chain_disruption')} 
            description={t('supply_chain_desc')}
            impact={`-5.00% ${t('revenue')}`}
            confidence={89}
            action={t('view_alternatives')}
            onAction={() => info(`${t('view_alternatives')} ${t('process_started')}`)}
          />
        )}
        <AIInsightCard 
          type="opportunity" 
          title={t('new_market_segment')} 
          description={t('new_market_desc')}
          impact={`+12.00% ${t('growth')}`}
          confidence={92}
          action={t('launch_campaign')}
          onAction={() => info(`${t('launch_campaign')} ${t('process_started')}`)}
        />
        <AIInsightCard 
          type="optimization" 
          title={t('redundant_licenses')} 
          description={t('redundant_licenses_desc')}
          impact={`${formatCurrency(45000)} ${t('savings')}`} 
          confidence={98}
          action={t('optimize_licenses')}
          onAction={() => info(`${t('optimize_licenses')} ${t('process_started')}`)}
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        <div className="rounded-2xl border border-border-dark enterprise-card p-4 lg:p-5 shadow-sm">
          <h4 className="text-sm lg:text-base font-bold text-rose-500 mb-3 lg:mb-4 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={14} className="lg:w-4 lg:h-4" />
            {t('critical_issues')}
          </h4>
          <ul className="space-y-2 lg:space-y-3">
            <li className="flex items-center justify-between text-xs lg:text-base group cursor-pointer">
              <span className="text-text-muted font-bold group-hover:text-white transition-colors">{t('high_churn_rate')}</span>
              <span className="text-rose-500 font-mono font-bold bg-rose-500/10 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-lg">-2.40%</span>
            </li>
            <li className="flex items-center justify-between text-xs lg:text-base group cursor-pointer">
              <span className="text-text-muted font-bold group-hover:text-white transition-colors">{t('server_latency_spike')}</span>
              <span className="text-rose-500 font-mono font-bold bg-rose-500/10 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-lg">+120ms</span>
            </li>
            <li className="flex items-center justify-between text-xs lg:text-base group cursor-pointer">
              <span className="text-text-muted font-bold group-hover:text-white transition-colors">{t('budget_overrun')}</span>
              <span className="text-rose-500 font-mono font-bold bg-rose-500/10 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-lg">{formatCurrency(12000)}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border-dark enterprise-card p-4 lg:p-5 shadow-sm">
          <h4 className="text-sm lg:text-base font-bold text-emerald-500 mb-3 lg:mb-4 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle size={14} className="lg:w-4 lg:h-4" />
            {t('quick_wins')}
          </h4>
          <ul className="space-y-2 lg:space-y-3">
            <li className="flex items-center justify-between text-xs lg:text-base group cursor-pointer">
              <span className="text-text-muted font-bold group-hover:text-white transition-colors">{t('automate_invoice')}</span>
              <span className="text-emerald-500 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-lg">+15h/wk</span>
            </li>
            <li className="flex items-center justify-between text-xs lg:text-base group cursor-pointer">
              <span className="text-text-muted font-bold group-hover:text-white transition-colors">{t('reactivate_users')}</span>
              <span className="text-emerald-500 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-lg">{formatCurrency(5000)}</span>
            </li>
            <li className="flex items-center justify-between text-xs lg:text-base group cursor-pointer">
              <span className="text-text-muted font-bold group-hover:text-white transition-colors">{t('switch_cloud_provider')}</span>
              <span className="text-emerald-500 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-lg">{t('save_percent')}</span>
            </li>
          </ul>
        </div>

        {/* AI Recommendations */}
        <AIRecommendations />
      </div>
    </div>
  );
});

CEOMode.displayName = 'CEOMode';

export default CEOMode;
