import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle, 
  Brain, 
  Target, 
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  Activity,
  ShieldCheck,
  BarChart3,
  ChevronRight,
  DollarSign,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { MarketingAgentFramework } from '../lib/marketingAgents';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import DrillDownModal from '../components/analytics/DrillDownModal';
import AIExplanationModal from '../components/analytics/AIExplanationModal';
import ExpandedChartModal from '../components/dashboard/ExpandedChartModal';
import { useToast } from '../hooks/useToast';

const revenueForecastData = [
  { name: 'Jan', revenue: 4000, forecast: 4200 },
  { name: 'Feb', revenue: 3000, forecast: 3200 },
  { name: 'Mar', revenue: 2000, forecast: 2500 },
  { name: 'Apr', revenue: 2780, forecast: 3000 },
  { name: 'May', revenue: 1890, forecast: 2200 },
  { name: 'Jun', revenue: 2390, forecast: 2800 },
  { name: 'Jul', revenue: 3490, forecast: 3800 },
  { name: 'Aug', revenue: 4000, forecast: 4500 },
  { name: 'Sep', revenue: 3000, forecast: 3500 },
  { name: 'Oct', revenue: 2000, forecast: 2600 },
  { name: 'Nov', revenue: 2780, forecast: 3200 },
  { name: 'Dec', revenue: 3890, forecast: 4200 },
];

const deptPerformanceData = [
  { name: 'Sales', value: 92, color: 'bg-green-500' },
  { name: 'Marketing', value: 88, color: 'bg-green-500' },
  { name: 'Product', value: 74, color: 'bg-yellow-500' },
  { name: 'Engineering', value: 95, color: 'bg-green-500' },
  { name: 'HR', value: 65, color: 'bg-red-500' },
  { name: 'Finance', value: 82, color: 'bg-green-500' },
];

export default function AIRecommendations() {
  const { success, info, warning } = useToast();
  const { formatCurrency } = useCurrencyFormatter();
  const [aiInsights, setAiInsights] = useState<{
    rootCause: string;
    recommendations: { title: string; desc: string; confidence: string }[];
  } | null>(null);
  const [marketingPlan, setMarketingPlan] = useState<any>(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [ceoMode, setCeoMode] = useState(false);
  const [analytics, setAnalytics] = useState<{isOpen: boolean, title: string, metric: string}>({isOpen: false, title: '', metric: ''});
  const [aiExplanation, setAiExplanation] = useState<{isOpen: boolean, title: string, data: any}>({isOpen: false, title: '', data: null});
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  const runMarketingOrchestrator = async () => {
    setIsOrchestrating(true);
    try {
      const framework = new MarketingAgentFramework();
      const plan = await framework.runOrchestrator({
        market: "O'zbekiston mebel bozori, 2024 trendlari",
        budget: `${formatCurrency(50000)} / oy`,
        audience: "Yangi uy egalari, 25-45 yosh",
        historical: "O'tgan yilgi o'sish 15%"
      });
      setMarketingPlan(plan);
    } catch (error) {
      console.error("Orchestration error:", error);
    } finally {
      setIsOrchestrating(false);
    }
  };

  return (
    <div className="relative h-full w-full text-enterprise-primary font-sans">
      <DrillDownModal 
        isOpen={analytics.isOpen} 
        onClose={() => setAnalytics({...analytics, isOpen: false})} 
        title={analytics.title}
        metric={analytics.metric}
        module="ai_recommendations"
        initialLevel="month"
      />
      <AIExplanationModal
        isOpen={aiExplanation.isOpen}
        onClose={() => setAiExplanation({...aiExplanation, isOpen: false})}
        title={aiExplanation.title}
        chartData={aiExplanation.data}
      />
      
      <ExpandedChartModal
        isOpen={expandedChart === 'revenue_forecast'}
        onClose={() => setExpandedChart(null)}
        title="Revenue Forecast (AI)"
      >
        <div className="flex flex-col gap-6">
          <div className="h-96 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueForecastData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fontSize: 16}} axisLine={false} tickLine={false} />
                   <YAxis stroke="rgba(255,255,255,0.3)" tick={{fontSize: 16}} axisLine={false} tickLine={false} tickFormatter={(value) => formatCurrency(value, true, true)} />
                   <Tooltip 
                      contentStyle={{ 
                         backgroundColor: '#0A0A0F', 
                         border: '1px solid rgba(255,255,255,0.1)', 
                         borderRadius: '8px', 
                         color: '#fff'
                      }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      formatter={(value: number) => [formatCurrency(value, false, true)]}
                   />
                   <Bar dataKey="revenue" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="forecast" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-base text-enterprise-muted">Total Forecast (Year)</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(42000, false, true)}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-base text-enterprise-muted">Peak Month</p>
              <p className="text-2xl font-bold text-blue-400">August</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-base text-enterprise-muted">Growth Rate</p>
              <p className="text-2xl font-bold text-green-400">+18.5%</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
             <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" /> AI Forecast Insight
             </h4>
             <p className="text-2xl text-blue-200/80">
                The model predicts a significant revenue spike in August driven by back-to-school campaigns. 
                However, Q4 growth appears conservative due to potential supply chain constraints. 
                Recommend securing inventory by July to capitalize on demand.
             </p>
          </div>
        </div>
      </ExpandedChartModal>

      <ExpandedChartModal
        isOpen={expandedChart === 'dept_performance'}
        onClose={() => setExpandedChart(null)}
        title="Department Performance"
      >
        <div className="flex flex-col gap-6">
          <div className="space-y-6 p-4">
             {deptPerformanceData.map((dept, index) => (
                <div key={`dept-expanded-${index}`}>
                   <div className="flex justify-between text-base mb-2">
                      <span className="text-gray-300 text-lg">{dept.name}</span>
                      <span className="text-gray-400 text-lg font-bold">{dept.value}%</span>
                   </div>
                   <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div 
                         className={`h-full ${dept.color} rounded-full transition-all duration-1000`} 
                         style={{ width: `${dept.value}%` }}
                      ></div>
                   </div>
                   <div className="flex justify-between text-base text-enterprise-muted">
                      <span>Efficiency: {dept.value > 90 ? 'High' : dept.value > 75 ? 'Medium' : 'Low'}</span>
                      <span>Satisfaction: {Math.min(100, dept.value + 5)}%</span>
                   </div>
                </div>
             ))}
          </div>

          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
             <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Critical Attention Needed
             </h4>
             <p className="text-2xl text-red-200/80">
                HR Department performance is lagging at 65%. 
                Primary bottlenecks identified in recruitment turnaround time and internal ticket resolution. 
                Recommend initiating a process audit and implementing an automated ticketing system.
             </p>
          </div>
        </div>
      </ExpandedChartModal>

      <div className="relative z-10 p-6 md:p-8 max-w-[1600px] mx-auto">
        {/* Header & System Health */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 animate-slide-in">
              <div className="bg-gradient-to-br from-teal-500/20 to-teal-900/20 border border-teal-500/30 p-2.5 rounded-xl backdrop-blur-md">
                <Brain className="w-6 h-6 text-enterprise-teal" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">AI Command Center</h2>
            </div>
            <p className="text-enterprise-muted text-base ml-1 animate-slide-in" style={{ animationDelay: '0.1s' }}>
              Enterprise Intelligence & Autonomous Decision Engine
            </p>
          </div>

          {/* SECTION 5 — SYSTEM HEALTH PANEL */}
          <div className="flex flex-wrap items-center gap-4 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            {/* System Status */}
            <div className="enterprise-card py-2 px-4 flex items-center gap-3 !rounded-full">
              <div className="pulse-indicator"></div>
              <span className="text-base font-medium tracking-wide text-enterprise-teal">SYSTEM ONLINE</span>
            </div>

            {/* AI Confidence */}
            <div className="enterprise-card py-2 px-4 flex items-center gap-3 !rounded-full">
              <ShieldCheck className="w-4 h-4 text-enterprise-teal" />
              <span className="text-base font-medium text-enterprise-muted">Confidence:</span>
              <span className="text-base font-bold text-white animate-count-up">98.4%</span>
            </div>

            {/* Active Risk */}
            <div className="enterprise-card py-2 px-4 flex items-center gap-3 !rounded-full border-enterprise-red/30 bg-red-500/5">
              <AlertTriangle className="w-4 h-4 text-enterprise-red risk-badge-blink" />
              <span className="text-base font-medium text-enterprise-red">Active Risks: 3</span>
            </div>

            {/* SECTION 6 — CEO MODE TOGGLE */}
            <div 
              className={`toggle-switch flex items-center ${ceoMode ? 'active' : ''}`} 
              onClick={() => setCeoMode(!ceoMode)}
              title="CEO Mode"
            >
              <div className="toggle-thumb"></div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — KEY METRICS (NEW) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-in" style={{ animationDelay: '0.25s' }}>
           {/* Total Revenue */}
           <div 
             className="enterprise-card p-6 relative overflow-hidden group hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer"
             onClick={() => setAnalytics({isOpen: true, title: 'Total Revenue', metric: 'total_revenue'})}
           >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign size={80} className="text-blue-500" />
              </div>
              <p className="text-base text-enterprise-muted mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-white mb-2">{formatCurrency(12500000, false, true)}</h3>
              <div className="flex items-center gap-2 text-base">
                <span className="text-green-400 flex items-center font-bold bg-green-500/10 px-1.5 py-0.5 rounded">
                  <ArrowUpRight size={12} className="mr-1" /> +14.2%
                </span>
                <span className="text-enterprise-muted">vs last month</span>
              </div>
           </div>

           {/* Net Profit */}
           <div 
             className="enterprise-card p-6 relative overflow-hidden group hover:ring-2 hover:ring-green-500/50 transition-all cursor-pointer"
             onClick={() => setAnalytics({isOpen: true, title: 'Net Profit', metric: 'net_profit'})}
           >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <PieChartIcon size={80} className="text-green-500" />
              </div>
              <p className="text-base text-enterprise-muted mb-1">Net Profit</p>
              <h3 className="text-3xl font-bold text-white mb-2">{formatCurrency(3200000, false, true)}</h3>
              <div className="flex items-center gap-2 text-base">
                <span className="text-green-400 flex items-center font-bold bg-green-500/10 px-1.5 py-0.5 rounded">
                  <ArrowUpRight size={12} className="mr-1" /> +8.1%
                </span>
                <span className="text-enterprise-muted">vs last month</span>
              </div>
           </div>

           {/* Cashflow */}
           <div 
             className="enterprise-card p-6 relative overflow-hidden group hover:ring-2 hover:ring-purple-500/50 transition-all cursor-pointer"
             onClick={() => setAnalytics({isOpen: true, title: 'Cashflow', metric: 'cashflow'})}
           >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Activity size={80} className="text-purple-500" />
              </div>
              <p className="text-base text-enterprise-muted mb-1">Cashflow</p>
              <h3 className="text-3xl font-bold text-white mb-2">{formatCurrency(1800000, false, true)}</h3>
              <div className="flex items-center gap-2 text-base">
                <span className="text-red-400 flex items-center font-bold bg-red-500/10 px-1.5 py-0.5 rounded">
                  <ArrowDownRight size={12} className="mr-1" /> -2.4%
                </span>
                <span className="text-enterprise-muted">vs last month</span>
              </div>
           </div>

           {/* Marketing ROI */}
           <div 
             className="enterprise-card p-6 relative overflow-hidden group hover:ring-2 hover:ring-orange-500/50 transition-all cursor-pointer"
             onClick={() => setAnalytics({isOpen: true, title: 'Marketing ROI', metric: 'marketing_roi'})}
           >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Target size={80} className="text-orange-500" />
              </div>
              <p className="text-base text-enterprise-muted mb-1">Marketing ROI</p>
              <h3 className="text-3xl font-bold text-white mb-2">420%</h3>
              <div className="flex items-center gap-2 text-base">
                <span className="text-green-400 flex items-center font-bold bg-green-500/10 px-1.5 py-0.5 rounded">
                  <ArrowUpRight size={12} className="mr-1" /> +12%
                </span>
                <span className="text-enterprise-muted">vs last month</span>
              </div>
           </div>
        </div>

        {/* SECTION 3 — INSIGHT CARDS (RISK / OPPORTUNITY / OPTIMIZATION) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-slide-in" style={{ animationDelay: '0.3s' }}>
           {/* RISK */}
           <div className="enterprise-card p-6 border-l-4 border-l-red-500 relative group hover:bg-white/5 transition-all">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2 text-red-500 font-bold text-base tracking-wider uppercase">
                    <AlertTriangle size={16} /> RISK
                 </div>
                 <span className="text-base bg-white/10 px-2 py-1 rounded text-enterprise-muted border border-white/10">
                    Impact: -5% Revenue
                 </span>
              </div>
              <h4 className="text-white font-bold mb-2 text-2xl">Supply chain disruption detected in Asia region. Expected delay: 14 days.</h4>
              <button 
                onClick={() => warning('Ta\'minot zanjiri muammosi hal qilinmoqda...')}
                className="w-full mt-4 py-2 border border-white/10 rounded-lg text-base font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group-hover:border-red-500/30"
              >
                 Take Action <ArrowUpRight size={12} />
              </button>
           </div>

           {/* OPPORTUNITY */}
           <div className="enterprise-card p-6 border-l-4 border-l-green-500 relative group hover:bg-white/5 transition-all">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2 text-green-500 font-bold text-base tracking-wider uppercase">
                    <TrendingUp size={16} /> OPPORTUNITY
                 </div>
                 <span className="text-base bg-white/10 px-2 py-1 rounded text-enterprise-muted border border-white/10">
                    Impact: +12% Growth
                 </span>
              </div>
              <h4 className="text-white font-bold mb-2 text-2xl">New market segment identified: 'Eco-conscious Gen Z'. Projected growth: +20%.</h4>
              <button 
                onClick={() => success('Yangi bozor segmenti tahlil qilinmoqda...')}
                className="w-full mt-4 py-2 border border-white/10 rounded-lg text-base font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group-hover:border-green-500/30"
              >
                 Take Action <ArrowUpRight size={12} />
              </button>
           </div>

           {/* OPTIMIZATION */}
           <div className="enterprise-card p-6 border-l-4 border-l-yellow-500 relative group hover:bg-white/5 transition-all">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2 text-yellow-500 font-bold text-base tracking-wider uppercase">
                    <Zap size={16} /> OPTIMIZATION
                 </div>
                 <span className="text-base bg-white/10 px-2 py-1 rounded text-enterprise-muted border border-white/10">
                    Impact: {formatCurrency(45000, false, true)} Savings
                 </span>
              </div>
              <h4 className="text-white font-bold mb-2 text-2xl">Redundant software licenses detected across 3 departments.</h4>
              <button 
                onClick={() => info('Litsenziyalar optimizatsiya qilinmoqda...')}
                className="w-full mt-4 py-2 border border-white/10 rounded-lg text-base font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group-hover:border-yellow-500/30"
              >
                 Take Action <ArrowUpRight size={12} />
              </button>
           </div>
        </div>

        {/* SECTION 4 — CHARTS (REVENUE FORECAST & DEPT PERFORMANCE) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-slide-in" style={{ animationDelay: '0.4s' }}>
           {/* Revenue Forecast */}
           <div 
             className="lg:col-span-2 enterprise-card p-6 cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all"
             onClick={() => setExpandedChart('revenue_forecast')}
           >
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Revenue Forecast (AI)
                 </h3>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setAiExplanation({isOpen: true, title: 'Revenue Forecast (AI)', data: revenueForecastData});
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-base rounded-lg border border-brand-500/30 transition-colors"
                    >
                      <Sparkles size={12} />
                      AI Tahlil
                    </button>
                    <span className="text-base text-enterprise-muted bg-white/5 px-2 py-1 rounded border border-white/10">Last 6 Months</span>
                 </div>
              </div>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueForecastData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fontSize: 16}} axisLine={false} tickLine={false} />
                       <YAxis stroke="rgba(255,255,255,0.3)" tick={{fontSize: 16}} axisLine={false} tickLine={false} tickFormatter={(value) => formatCurrency(value, true, true)} />
                       <Tooltip 
                          contentStyle={{ 
                             backgroundColor: '#0A0A0F', 
                             border: '1px solid rgba(255,255,255,0.1)', 
                             borderRadius: '8px', 
                             color: '#fff'
                          }}
                          cursor={{fill: 'rgba(255,255,255,0.05)'}}
                          formatter={(value: number) => [formatCurrency(value, false, true)]}
                       />
                       <Bar dataKey="revenue" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="forecast" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Dept Performance */}
           <div 
             className="enterprise-card p-6 cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all"
             onClick={() => setExpandedChart('dept_performance')}
           >
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Dept. Performance
                 </h3>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setAiExplanation({isOpen: true, title: 'Department Performance', data: deptPerformanceData});
                   }}
                   className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-base rounded-lg border border-brand-500/30 transition-colors"
                 >
                   <Sparkles size={12} />
                   AI Tahlil
                 </button>
              </div>
              <div className="space-y-6">
                 {deptPerformanceData.map((dept, index) => (
                    <div key={`dept-${index}`}>
                       <div className="flex justify-between text-base mb-2">
                          <span className="text-gray-300">{dept.name}</span>
                          <span className="text-gray-400">{dept.value}%</span>
                       </div>
                       <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                             className={`h-full ${dept.color} rounded-full transition-all duration-1000`} 
                             style={{ width: `${dept.value}%` }}
                          ></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 4. Automatic Decisions */}
        <div className="mb-12 animate-slide-in border border-blue-500/30 p-6 rounded-2xl" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-enterprise-teal" />
            Autonomous Decision Engine
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiInsights?.recommendations ? (
              aiInsights.recommendations.map((rec, idx) => (
                <div key={`rec-${rec.title}-${idx}`} className={`enterprise-card ${rec.confidence.includes('YUQORI') ? 'insight-card-opportunity' : 'insight-card-optimization'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-bold px-2 py-1 rounded tracking-wider uppercase ${rec.confidence.includes('YUQORI') ? 'bg-teal-500/20 text-enterprise-teal border border-teal-500/30' : 'bg-amber-500/20 text-enterprise-amber border border-amber-500/30'}`}>
                        {rec.confidence}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-bold text-white text-lg mb-2">{rec.title}</h4>
                  <p className="text-enterprise-muted text-2xl mb-6 leading-relaxed">{rec.desc}</p>
                  <div className="flex items-center gap-3">
                    <button className="btn-enterprise bg-enterprise-teal text-black px-5 py-2 rounded-lg text-base font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button className="btn-enterprise bg-white/5 text-white px-5 py-2 rounded-lg text-base font-medium hover:bg-white/10 flex items-center gap-2 border border-white/10">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="enterprise-card insight-card-opportunity">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-teal-500/20 text-enterprise-teal border border-teal-500/30 text-base font-bold px-2 py-1 rounded tracking-wider uppercase">High Confidence (98%)</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-white text-lg mb-2">Inventory Replenishment</h4>
                  <p className="text-enterprise-muted text-2xl mb-6 leading-relaxed">
                    "iPhone 15 Pro" stock depletion predicted in 72h. Initiate automated reorder sequence?
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="btn-enterprise bg-enterprise-teal text-black px-5 py-2 rounded-lg text-base font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button className="btn-enterprise bg-white/5 text-white px-5 py-2 rounded-lg text-base font-medium hover:bg-white/10 flex items-center gap-2 border border-white/10">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>

                <div className="enterprise-card insight-card-optimization">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/20 text-enterprise-amber border border-amber-500/30 text-base font-bold px-2 py-1 rounded tracking-wider uppercase">Medium Confidence (75%)</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-white text-lg mb-2">Dynamic Pricing Adjustment</h4>
                  <p className="text-enterprise-muted text-2xl mb-6 leading-relaxed">
                    Competitor price drop detected (-5%). Recommend -3% adjustment for "Winter Collection" to maintain market share.
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="btn-enterprise bg-enterprise-teal text-black px-5 py-2 rounded-lg text-base font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button className="btn-enterprise bg-white/5 text-white px-5 py-2 rounded-lg text-base font-medium hover:bg-white/10 flex items-center gap-2 border border-white/10">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 5. Marketing Agent Framework */}
        <div className="animate-slide-in" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Marketing Agent Orchestrator
            </h3>
            <button 
              onClick={runMarketingOrchestrator}
              disabled={isOrchestrating}
              className="btn-enterprise flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium"
            >
              {isOrchestrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isOrchestrating ? "Orchestrating Agents..." : "Generate Unified Growth Plan"}
            </button>
          </div>

          {marketingPlan ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Unified Plan */}
              <div className="lg:col-span-2 enterprise-card bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/30">
                <h4 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                  <Target className="w-6 h-6 text-purple-400" />
                  Unified Strategic Roadmap
                </h4>
                <div className="space-y-8">
                  <div>
                    <h5 className="text-purple-300 font-bold mb-2 text-base uppercase tracking-wider">Executive Summary</h5>
                    <p className="text-purple-100 text-4xl leading-relaxed font-light">
                      {marketingPlan.finalPlan.executiveSummary}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-purple-300 font-bold mb-3 text-base uppercase tracking-wider">Strategic Milestones</h5>
                      <ul className="space-y-3">
                        {marketingPlan?.finalPlan?.strategicRoadmap?.map((item: string, i: number) => (
                          <li key={`roadmap-${i}`} className="flex items-start gap-3 text-purple-100 text-2xl">
                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2.5 flex-shrink-0"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-purple-300 font-bold mb-3 text-base uppercase tracking-wider">Actionable Next Steps</h5>
                      <ul className="space-y-3">
                        {marketingPlan?.finalPlan?.nextSteps?.map((item: string, i: number) => (
                          <li key={`nextstep-${i}`} className="flex items-start gap-3 text-purple-100 text-2xl">
                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-2.5 flex-shrink-0"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-6 border-t border-purple-500/20">
                    <div className="bg-purple-500/10 border border-purple-500/20 px-5 py-3 rounded-xl">
                      <span className="text-purple-300 text-base block mb-1 uppercase tracking-wide">Budget Allocation</span>
                      <span className="font-bold text-white font-mono">{marketingPlan.finalPlan.budgetAllocation}</span>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 px-5 py-3 rounded-xl">
                      <span className="text-purple-300 text-base block mb-1 uppercase tracking-wide">Expected ROI</span>
                      <span className="font-bold text-white font-mono">{marketingPlan.finalPlan.expectedROI}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Agent Outputs */}
              <div className="enterprise-card">
                <h5 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  Market Analyst AI
                </h5>
                <div className="space-y-4">
                  <div>
                    <div className="text-base font-bold text-blue-400 uppercase tracking-wide mb-2">Trends</div>
                    <ul className="text-xl text-enterprise-muted space-y-1.5">
                      {marketingPlan?.marketInsights?.trends?.map((t: string, i: number) => (
                        <li key={`trend-${i}`} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-base font-bold text-blue-400 uppercase tracking-wide mb-2">SWOT Analysis</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-xl bg-green-500/10 border border-green-500/20 p-2 rounded text-green-300">
                        <span className="font-bold block mb-1">STRENGTH</span>
                        {marketingPlan?.marketInsights?.swot?.strengths?.[0]}
                      </div>
                      <div className="text-xl bg-red-500/10 border border-red-500/20 p-2 rounded text-red-300">
                        <span className="font-bold block mb-1">WEAKNESS</span>
                        {marketingPlan?.marketInsights?.swot?.weaknesses?.[0]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="enterprise-card">
                <h5 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Campaign Strategist AI
                </h5>
                <div className="space-y-3">
                  {marketingPlan?.strategy?.channels?.map((c: any, i: number) => (
                    <div key={`channel-${i}`} className="text-xl p-3 bg-yellow-500/5 rounded border border-yellow-500/20">
                      <div className="font-bold text-yellow-400 mb-1">{c.name}</div>
                      <div className="text-enterprise-muted flex justify-between">
                        <span>Budget: {c.budget}</span>
                      </div>
                      <div className="text-base text-yellow-500/70 mt-1 italic">Target: {c.targetAudience}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="enterprise-card">
                <h5 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  Performance Optimizer AI
                </h5>
                <div className="space-y-3">
                  {marketingPlan?.optimization?.recommendations?.map((rec: any, i: number) => (
                    <div key={`opt-${i}`} className="text-xl p-3 bg-orange-500/5 rounded border border-orange-500/20">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-orange-400">{rec.channel}</span>
                        <span className="text-orange-300/70">{rec.expectedImpact}</span>
                      </div>
                      <span className="text-enterprise-muted">{rec.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="enterprise-card">
                <h5 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-500" />
                  Content & Messaging AI
                </h5>
                <div className="space-y-3">
                  <div className="text-xl p-3 bg-green-500/5 rounded border border-green-500/20">
                    <div className="font-bold text-green-400 mb-1">{marketingPlan?.content?.adCopy?.[0]?.headline}</div>
                    <div className="text-xl text-enterprise-muted mt-1 mb-2 italic">"{marketingPlan?.content?.adCopy?.[0]?.body}"</div>
                    <div className="text-xl text-green-500 font-bold uppercase tracking-wide border-t border-green-500/20 pt-2">
                      CTA: {marketingPlan?.content?.adCopy?.[0]?.cta}
                    </div>
                  </div>
                  <div className="text-xl text-enterprise-muted italic border-l-2 border-white/10 pl-3">
                    Brand Voice: {marketingPlan?.content?.brandVoice}
                  </div>
                </div>
              </div>

              <div className="enterprise-card">
                <h5 className="font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Growth Forecast AI
                </h5>
                <div className="space-y-2">
                  {marketingPlan?.forecast?.projections?.map((p: any, i: number) => (
                    <div key={`proj-${i}`} className="flex justify-between text-xl border-b border-white/5 pb-2 mb-2 last:border-0">
                      <span className="text-enterprise-muted font-mono">{p.month}</span>
                      <span className="font-bold text-purple-400 font-mono">+{formatCurrency(p.revenue)}</span>
                    </div>
                  ))}
                  <div className="text-xl text-purple-300/50 mt-2 italic">
                    Assumption: {marketingPlan?.forecast?.assumptions?.[0]}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="enterprise-card p-12 border-2 border-dashed border-white/10 text-center bg-transparent hover:border-white/20 transition-colors">
              <div className="bg-purple-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/20 animate-pulse">
                <Brain className="w-10 h-10 text-purple-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">AI Agents Standby</h4>
              <p className="text-2xl text-enterprise-muted max-w-md mx-auto leading-relaxed">
                Initialize the Marketing Agent Framework to deploy autonomous agents for market analysis, strategy formulation, and growth forecasting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
