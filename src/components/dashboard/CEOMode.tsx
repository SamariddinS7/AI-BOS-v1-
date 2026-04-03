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
import LiveChat from '../LiveChat';
import CountUp from '../CountUp';
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

const MKT_CHANNELS = [
  {name:"Google Ads", spend:4200 * 12800, rev:18500 * 12800, roi:340, roas:4.4, cac:12.5 * 12800, color:T.accent},
  {name:"Meta Ads",   spend:3800 * 12800, rev:14200 * 12800, roi:273, roas:3.7, cac:14.2 * 12800, color:T.violet},
  {name:"TV / Media", spend:8500 * 12800, rev:22000 * 12800, roi:158, roas:2.6, cac:45.0 * 12800, color:T.amber},
  {name:"Influencer", spend:2200 * 12800, rev:9800 * 12800,  roi:345, roas:4.5, cac:8.8 * 12800,  color:T.teal},
  {name:"Outdoor",    spend:3000 * 12800, rev:5500 * 12800,  roi:83,  roas:1.8, cac:62.5 * 12800, color:T.sky},
  {name:"Radio",      spend:1200 * 12800, rev:2100 * 12800,  roi:75,  roas:1.7, cac:38.2 * 12800, color:T.violet},
];

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
    // Check for anomalies in real-time updates
    const newAnomalies = realTimeUpdates.filter(u => u.type === 'anomaly_detected');
    if (newAnomalies.length > 0) {
      setAnomalies(prev => [...newAnomalies.map(a => ({
        type: 'risk',
        title: a.data.message,
        impact: a.data.impact
      })), ...prev]);
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

  const totalRevenue = revenueData?.summary?.total || 0;
  const totalExpenses = expensesData?.summary?.total || 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Prepare chart data for Recharts
  const chartData = (revenueData?.data || []).map((d: any) => ({
    name: d.name,
    value: d.value,
  }));

  const expensesChartData = (expensesData?.data || []).map((d: any) => ({
    name: d.name,
    value: d.value,
  }));

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
  
  const mktDataToUse = dynamicMktChannels.length > 0 ? dynamicMktChannels : MKT_CHANNELS;

  // Mock data for sparklines
  const sparklineData = [
    { value: 4000 }, { value: 3000 }, { value: 2000 }, { value: 2780 },
    { value: 1890 }, { value: 2390 }, { value: 3490 }
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 p-6 font-sans bg-app-bg min-h-full text-text-primary">
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
                contentStyle={{ backgroundColor: 'var(--color-surface-dark)', borderColor: 'var(--color-border-dark)', color: 'var(--color-text-primary)', fontSize: '16px', borderRadius: '0.5rem' }}
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
                contentStyle={{backgroundColor: 'var(--color-surface-dark)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', fontSize: '16px'}}
                itemStyle={{color: 'var(--color-text-primary)'}}
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
                contentStyle={{backgroundColor: 'var(--color-surface-dark)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', fontSize: '16px'}}
                itemStyle={{color: 'var(--color-text-primary)'}}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {t('executive_dashboard')}
          </h1>
          <p className="text-base text-text-muted flex items-center gap-2 mt-1 font-medium">
            <Calendar size={16} /> {currentDate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span className="text-base font-semibold text-emerald-500">{t('system_operational')}</span>
          </div>
        </div>
      </div>

      <LiveChat isOpen={liveChatOpen} onClose={() => setLiveChatOpen(false)} />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Revenue Forecast Chart */}
        <div 
          className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border-dark glass-panel p-5 cursor-pointer hover:border-brand-500/30 transition-all shadow-sm group"
          onClick={() => setExpandedChart('revenue_forecast')}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <BarChart2 size={18} className="text-brand-500" />
                {t('revenue_forecast')}
              </h3>
              <p className="text-base text-text-muted mt-1">{t('ai_projection')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 text-base font-semibold rounded-lg border border-brand-500/20 transition-colors"
              >
                <Sparkles size={16} />
                {t('ai_analysis')}
              </button>
            </div>
          </div>
          
          <div className="h-64 w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-text-muted">{t('loading_chart_data')}</div>
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
                    contentStyle={{ backgroundColor: 'var(--color-surface-dark)', borderColor: 'var(--color-border-dark)', color: 'var(--color-text-primary)', fontSize: '16px', borderRadius: '0.5rem' }}
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
        <div className="space-y-4">
          {/* Dept Performance */}
          <div 
            className="rounded-2xl border border-border-dark glass-panel p-5 cursor-pointer hover:border-brand-500/30 transition-all shadow-sm"
            onClick={() => setExpandedChart('dept_performance')}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <Activity size={18} className="text-purple-500" />
                {t('performance')}
              </h3>
            </div>
            <DeptPerformanceChart data={deptData} />
          </div>

          {/* System Status Widget */}
          <div className="rounded-2xl border border-border-dark glass-panel p-5 shadow-sm">
            <h3 className="text-base font-bold text-text-muted uppercase tracking-wider mb-4">{t('system_health')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                    <Zap size={16} />
                  </div>
                  <span className="text-base font-medium text-text-secondary">{t('api_latency')}</span>
                </div>
                <span className="text-base font-mono font-semibold text-emerald-500">45ms</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                    <Shield size={16} />
                  </div>
                  <span className="text-base font-medium text-text-secondary">{t('security')}</span>
                </div>
                <span className="text-base font-mono font-semibold text-emerald-500">{t('secure')}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                    <AlertTriangle size={16} />
                  </div>
                  <span className="text-base font-medium text-text-secondary">{t('anomalies')}</span>
                </div>
                <span className="text-base font-mono font-semibold text-amber-500">{anomalies.length} {t('detected')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* New Charts from User Code */}
        <div className="lg:col-span-2 rounded-2xl border border-border-dark glass-panel p-6 cursor-pointer hover:border-brand-500/30 transition-all shadow-sm" onClick={() => setExpandedChart('roas_cac')}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary">{t('channel_efficiency')}</h3>
              <p className="text-base text-text-muted mt-1">{t('cost_efficiency_ratio')}</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mktDataToUse}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} />
                <Tooltip 
                  contentStyle={{backgroundColor: 'var(--color-surface-dark)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', fontSize: '16px'}}
                  itemStyle={{color: 'var(--color-text-primary)'}}
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
          </div>
        </div>

        <div className="rounded-2xl border border-border-dark glass-panel p-6 cursor-pointer hover:border-brand-500/30 transition-all shadow-sm" onClick={() => setExpandedChart('roi_comparison')}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary">{t('channel_roi_comparison')}</h3>
              <p className="text-base text-text-muted mt-1">{t('return_on_investment')}</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mktDataToUse} layout="vertical" margin={{left: -20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-muted)', fontSize: 16}} width={80} />
                <Tooltip 
                  contentStyle={{backgroundColor: 'var(--color-surface-dark)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', fontSize: '16px'}}
                  itemStyle={{color: 'var(--color-text-primary)'}}
                  formatter={(val: any) => [`${val}%`, 'ROI']}
                />
                <Bar dataKey="roi" radius={[0, 4, 4, 0]} barSize={12}>
                  {mktDataToUse.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Proactive Growth Opportunities */}
        <div className="lg:col-span-3">
          <ProactiveGrowthSuggestions />
        </div>
      </div>

      {/* AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border-dark glass-panel p-5 shadow-sm">
          <h4 className="text-base font-bold text-rose-500 mb-4 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={16} />
            {t('critical_issues')}
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center justify-between text-base group cursor-pointer">
              <span className="text-text-secondary font-medium group-hover:text-text-primary transition-colors">{t('high_churn_rate')}</span>
              <span className="text-rose-500 font-mono font-semibold bg-rose-500/10 px-2 py-1 rounded-lg">-2.40%</span>
            </li>
            <li className="flex items-center justify-between text-base group cursor-pointer">
              <span className="text-text-secondary font-medium group-hover:text-text-primary transition-colors">{t('server_latency_spike')}</span>
              <span className="text-rose-500 font-mono font-semibold bg-rose-500/10 px-2 py-1 rounded-lg">+120ms</span>
            </li>
            <li className="flex items-center justify-between text-base group cursor-pointer">
              <span className="text-text-secondary font-medium group-hover:text-text-primary transition-colors">{t('budget_overrun')}</span>
              <span className="text-rose-500 font-mono font-semibold bg-rose-500/10 px-2 py-1 rounded-lg">{formatCurrency(12000)}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border-dark glass-panel p-5 shadow-sm">
          <h4 className="text-base font-bold text-emerald-500 mb-4 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle size={16} />
            {t('quick_wins')}
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center justify-between text-base group cursor-pointer">
              <span className="text-text-secondary font-medium group-hover:text-text-primary transition-colors">{t('automate_invoice')}</span>
              <span className="text-emerald-500 font-mono font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg">+15h/wk</span>
            </li>
            <li className="flex items-center justify-between text-base group cursor-pointer">
              <span className="text-text-secondary font-medium group-hover:text-text-primary transition-colors">{t('reactivate_users')}</span>
              <span className="text-emerald-500 font-mono font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg">{formatCurrency(5000)}</span>
            </li>
            <li className="flex items-center justify-between text-base group cursor-pointer">
              <span className="text-text-secondary font-medium group-hover:text-text-primary transition-colors">{t('switch_cloud_provider')}</span>
              <span className="text-emerald-500 font-mono font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg">{t('save_percent')}</span>
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
