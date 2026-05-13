import React, { useState, useMemo, memo } from 'react';
import { 
  TrendingUp, DollarSign, Activity, 
  BarChart2, Megaphone, Zap, Download, Target, Users, Shield, Filter, Calendar, Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell, PieChart, Pie, AreaChart, Area, ComposedChart, ReferenceLine
} from 'recharts';
import { motion } from 'motion/react';
import DrillDownModal from '../components/analytics/DrillDownModal';
import AIExplanationModal from '../components/analytics/AIExplanationModal';
import KPICard from '../components/dashboard/KPICard';
import Card from '../components/ui/Card';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import ExpandedChartModal from '../components/dashboard/ExpandedChartModal';
import MarketingAssets from '../components/marketing/MarketingAssets';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import { useToast } from '../hooks/useToast';

// Color Palette
const COLORS = {
  primary: 'var(--color-brand-500)', // blue-500
  positive: 'var(--color-emerald-500)', // emerald-500
  warning: 'var(--color-amber-500)', // amber-500
  negative: 'var(--color-rose-500)', // red-500
  surface: 'var(--color-surface-card)', // slate-900
  teal: 'var(--color-enterprise-teal)', // teal-600
  violet: 'var(--color-violet-500)', // violet-500
  sky: 'var(--color-brand-400)', // sky-500
  border: 'var(--color-border-dark)', // slate-800
  t3: 'var(--color-text-muted)', // slate-500
  t1: 'var(--color-text-primary)' // slate-50
};

const MONTHS = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];
const MKT_CHANNELS = [
  { id:"google",     label:"Google Ads",   icon:"", color:COLORS.primary,  type:"digital"  },
  { id:"meta",       label:"Meta Ads",     icon:"", color:COLORS.violet,  type:"social"   },
  { id:"tv",         label:"TV Reklama",   icon:"", color:COLORS.warning,   type:"offline"  },
  { id:"influencer", label:"Influencer",   icon:"", color:COLORS.teal,    type:"social"   },
  { id:"outdoor",    label:"Outdoor",      icon:"", color:COLORS.sky,     type:"offline"  },
  { id:"radio",      label:"Radio",        icon:"", color:COLORS.positive,   type:"offline"  },
];

const rng = (seed: number) => { let s=seed; return () => { s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; }; };

function buildChannelData(seed: number, year: string) {
  const r = rng(seed + parseInt(year||"2025")*7);
  return MKT_CHANNELS.map((ch, i) => {
    const base_spend     = [45,38,80,22,30,15][i] * 1e6 * (1 + r()*0.3);
    const impressions    = Math.round([2200,3100,850,420,680,310][i] * 1e3 * (1+r()*0.25));
    const clicks         = Math.round([88000,62000,8500,9200,4100,1800][i] * (1+r()*0.2));
    const conversions    = Math.round([3100,2200,220,680,190,95][i]  * (1+r()*0.22));
    const revenue        = Math.round([180,130,95,72,48,28][i] * 1e6 * (1+r()*0.28));
    const spend          = Math.round(base_spend);
    const ltv            = Math.round([420,380,310,290,260,220][i] * 1e3 * (1+r()*0.15));
    const conv_lag_days  = ch.type==="offline" ? Math.round(8+r()*14) : 0;

    const roi  = spend>0 ? ((revenue - spend) / spend * 100) : 0;
    const roas = spend>0 ? (revenue / spend) : 0;
    const cac  = conversions>0 ? (spend / conversions) : 0;
    const ctr  = impressions>0 ? (clicks / impressions * 100) : 0;
    const cpc  = clicks>0 ? (spend / clicks) : 0;
    const cpm  = impressions>0 ? (spend / impressions * 1000) : 0;

    const monthly = MONTHS.map((_,mi) => {
      const rv2 = rng(seed*13+i*7+mi);
      const s = Math.round(spend/12*(0.8+rv2()*0.4));
      const rev_m = Math.round(revenue/12*(0.75+rv2()*0.5));
      return { label:MONTHS[mi], spend:s, revenue:rev_m,
        roi:(rev_m-s)/s*100, roas:rev_m/s, conversions:Math.round(conversions/12*(0.7+rv2()*0.6)) };
    });

    return { ...ch, spend, impressions, clicks, conversions, revenue, ltv,
      roi:parseFloat(roi.toFixed(2)), roas:parseFloat(roas.toFixed(2)),
      cac:Math.round(cac), ctr:parseFloat(ctr.toFixed(3)),
      cpc:Math.round(cpc), cpm:Math.round(cpm), conv_lag_days, monthly };
  });
}

function calcHealthIndex(channels: any[]) {
  const avg_roi  = channels.reduce((a,c)=>a+c.roi,0)/channels.length;
  const avg_roas = channels.reduce((a,c)=>a+c.roas,0)/channels.length;
  const revs     = channels.map(c=>c.revenue);
  const mean_rev = revs.reduce((a,b)=>a+b,0)/revs.length;
  const std_rev  = Math.sqrt(revs.reduce((a,v)=>a+(v-mean_rev)**2,0)/revs.length);
  const cv       = mean_rev>0?std_rev/mean_rev:1;

  const efficiency = Math.min(25, avg_roas/4*25);
  const growth     = Math.min(25, Math.max(0, avg_roi/300*25));
  const stability  = Math.min(25, Math.max(0, (1-cv)*25));
  const n_digital  = channels.filter(c=>c.type==="digital"||c.type==="social").length;
  const competitive= Math.min(25, n_digital/channels.length*30);

  const total = Math.round(efficiency+growth+stability+competitive);
  return { total:Math.min(100,Math.max(0,total)), efficiency:Math.round(efficiency), growth:Math.round(growth), stability:Math.round(stability), competitive:Math.round(competitive) };
}

function buildAlerts(channels: any[]) {
  const alerts: any[] = [];
  channels.forEach(c=>{
    if(c.roi<20) alerts.push({severity:"high",icon:"",channel:c.label,msg:`ROI ${c.roi.toFixed(1)}% — minimum chegaradan past`,color:COLORS.negative});
    if(c.cac>c.ltv*0.4) alerts.push({severity:"med",icon:"",channel:c.label,msg:`CAC/LTV nisbati ${(c.cac/c.ltv*100).toFixed(0)}% — xavfli zona`,color:COLORS.warning});
  });
  return alerts.slice(0,4);
}

function calcOptimizations(channels: any[]) {
  const recs: any[] = [];
  channels.forEach(c => {
    if(c.roi<0) recs.push({ type:"risk", channel:c.label, title:"Manfiy ROI", desc:`${c.label} kanalida ROI = ${c.roi.toFixed(1)}%. Byudjetni ${Math.abs(Math.round(c.roi/2))}% kamaytiring yoki to'xtating.`, priority:"yuqori" });
    if(c.ctr>0.05&&c.conversions/c.clicks<0.02&&c.type!=="offline") recs.push({ type:"opt", channel:c.label, title:"Yuqori CTR, past konversiya", desc:`${c.label}: CTR ${(c.ctr).toFixed(2)}% lekin landing page konversiyasi ${(c.conversions/c.clicks*100).toFixed(1)}%. Landing page optimizatsiya talab.`, priority:"o'rta" });
    if(c.cpm>100000) recs.push({ type:"opt", channel:c.label, title:"Yuqori CPM", desc:`${c.label} CPM = ${c.cpm} so'm. Auditoriya segmentatsiyasini kengaytiring.`, priority:"past" });
    if(c.roas>5) recs.push({ type:"opp", channel:c.label, title:"Yuqori ROAS — Byudjet oshiring", desc:`${c.label} ROAS ${c.roas.toFixed(1)}x. Qo'shimcha byudjet ajratish tavsiya etiladi.`, priority:"yuqori" });
  });
  return recs.slice(0,5);
}

const ChartTip = memo(({active, payload, label}: any) => {
  if(!active||!payload?.length) return null;
  return (
    <div className="bg-surface-card border border-border-dark rounded-lg p-3 shadow-xl text-base">
      <div className="text-text-muted mb-2">{label}</div>
      {payload.map((p: any, i: number)=>(
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{background:p.color||COLORS.t1}}/>
          <span className="text-text-muted">{p.name}:</span>
          <strong style={{color:p.color||COLORS.t1}}>{typeof p.value==="number"&&p.value>50000?p.value.toLocaleString()+" so'm":p.value}</strong>
        </div>
      ))}
    </div>
  );
});

const GaugeArc = memo(({value=0, max=100, color=COLORS.primary, size=120, label=""}: any) => {
  const pct = Math.min(1, Math.max(0, value/max));
  const r=46, cx=60, cy=60, sweep=240;
  const startA = (180-sweep/2)*Math.PI/180;
  const endA   = startA + sweep*Math.PI/180*pct;
  const x1=cx+r*Math.cos(startA),y1=cy+r*Math.sin(startA);
  const x2=cx+r*Math.cos(startA+sweep*Math.PI/180),y2=cy+r*Math.sin(startA+sweep*Math.PI/180);
  const xv=cx+r*Math.cos(endA), yv=cy+r*Math.sin(endA);
  const bgPath=`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;
  const valPath=pct<0.001?"":`M ${x1} ${y1} A ${r} ${r} 0 ${pct>0.667?1:0} 1 ${xv} ${yv}`;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <path d={bgPath} fill="none" stroke={COLORS.border} strokeWidth={10} strokeLinecap="round"/>
      {valPath&&<path d={valPath} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" style={{filter:`drop-shadow(0 0 6px ${color})`}}/>}
      <text x={60} y={64} textAnchor="middle" fill={COLORS.t1} fontSize={20} fontWeight={800} fontFamily="monospace">{value}</text>
      <text x={60} y={80} textAnchor="middle" fill={COLORS.t3} fontSize={16} fontFamily="monospace">{label}</text>
    </svg>
  );
});

export default function Marketing() {
  const { success, info } = useToast();
  const { t } = useLanguage();
  const { formatCurrency } = useCurrencyFormatter();
  const [dateRange, setDateRange] = useState('30days');
  const [analytics, setAnalytics] = useState<{isOpen: boolean, title: string, metric: string}>({isOpen: false, title: '', metric: ''});
  const [aiExplanation, setAiExplanation] = useState<{isOpen: boolean, title: string, data: any}>({isOpen: false, title: '', data: null});
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  const channels = useMemo(() => buildChannelData(42, "2025"), []);
  const health = useMemo(() => calcHealthIndex(channels), [channels]);
  const alerts = useMemo(() => buildAlerts(channels), [channels]);
  const opts = useMemo(() => calcOptimizations(channels), [channels]);

  const total_spend = channels.reduce((a,c)=>a+c.spend,0);
  const total_revenue = channels.reduce((a,c)=>a+c.revenue,0);
  const overall_roi = total_spend>0?(total_revenue-total_spend)/total_spend*100:0;
  const overall_roas = total_spend>0?total_revenue/total_spend:0;
  const total_cac = channels.reduce((a,c)=>a+c.conversions,0)>0?total_spend/channels.reduce((a,c)=>a+c.conversions,0):0;

  const kpiData = [
    { value: 4000 }, { value: 3000 }, { value: 2000 }, { value: 2780 },
    { value: 1890 }, { value: 2390 }, { value: 3490 }
  ];

  return (
    <div className="flex-1 p-8 font-sans space-y-8 animate-slide-in">
      <DrillDownModal 
        isOpen={analytics.isOpen} 
        onClose={() => setAnalytics({...analytics, isOpen: false})} 
        title={analytics.title}
        metric={analytics.metric}
        module="marketing"
        initialLevel="month"
      />
      <AIExplanationModal
        isOpen={aiExplanation.isOpen}
        onClose={() => setAiExplanation({...aiExplanation, isOpen: false})}
        title={aiExplanation.title}
        chartData={aiExplanation.data}
      />
      
      <ExpandedChartModal
        isOpen={expandedChart === 'roi_comparison'}
        onClose={() => setExpandedChart(null)}
        title="Kanal ROI Taqqoslama"
      >
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channels} margin={{left:0,right:8,top:4,bottom:4}}>
              <CartesianGrid strokeDasharray="2 6" stroke={COLORS.border} strokeOpacity={0.5}/>
              <XAxis dataKey="label" tick={{fill:COLORS.t3,fontSize:16}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`${v.toFixed(0)}%`} tick={{fill:COLORS.t3,fontSize:16}} axisLine={false} tickLine={false} width={44}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="roi" name="ROI %" radius={[4,4,0,0]}>
                {channels.map((c,i)=><Cell key={i} fill={c.roi>100?COLORS.positive:c.roi>0?COLORS.warning:COLORS.negative} fillOpacity={0.9}/>)}
              </Bar>
              <ReferenceLine y={0} stroke={COLORS.border} strokeWidth={1}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ExpandedChartModal>

      <ExpandedChartModal
        isOpen={expandedChart === 'roas_cac'}
        onClose={() => setExpandedChart(null)}
        title="ROAS vs CAC Samaradorlik"
      >
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channels} margin={{left:0,right:8,top:4,bottom:4}}>
              <CartesianGrid strokeDasharray="2 6" stroke={COLORS.border} strokeOpacity={0.5}/>
              <XAxis dataKey="label" tick={{fill:COLORS.t3,fontSize:16}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:COLORS.t3,fontSize:16}} axisLine={false} tickLine={false} width={36}/>
              <Tooltip content={<ChartTip/>}/>
              <Legend wrapperStyle={{fontSize:16,color:COLORS.t3}}/>
              <Bar dataKey="roas" name="ROAS" fill={COLORS.teal} radius={[4,4,0,0]} fillOpacity={0.85}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ExpandedChartModal>

      {/* Header with Robust Filters */}
      <div className="flex justify-between items-center bg-surface-card p-4 rounded-xl border border-border-dark">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{t('marketing_intelligence')}</h1>
          <p className="text-base text-text-muted mt-1">{t('marketing_subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-surface-ground border border-border-dark text-text-secondary text-base rounded-lg px-3 py-2 outline-none">
            <option className="bg-surface-ground text-text-primary">{t('date_range_label')}: {t('last_30_days')}</option>
            <option className="bg-surface-ground text-text-primary">{t('date_range_label')}: This Quarter</option>
          </select>
          <select className="bg-surface-ground border border-border-dark text-text-secondary text-base rounded-lg px-3 py-2 outline-none">
            <option className="bg-surface-ground text-text-primary">{t('channel_label')}: All</option>
            <option className="bg-surface-ground text-text-primary">{t('channel_label')}: Google</option>
          </select>
          <button 
            onClick={() => success('Marketing hisoboti eksport qilindi')}
            className="px-4 py-2 bg-accent text-white font-bold rounded-lg text-base flex items-center gap-2 shadow-lg shadow-accent/20"
          >
            <Download size={16} /> {t('export')}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {alerts.map((a, i) => (
            <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-base font-mono border" style={{backgroundColor: `${a.color}11`, borderColor: `${a.color}44`, color: a.color}}>
              <span className="animate-pulse">{a.icon}</span>
              <strong>[{a.channel}]</strong>
              {a.msg}
            </div>
          ))}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard title={t('total_spend')} value={formatCurrency(total_spend)} change="" trend="neutral" icon={DollarSign} data={kpiData} onClick={() => setAnalytics({isOpen: true, title: t('total_spend_analysis'), metric: 'spend'})} />
        <KPICard title={t('revenue')} value={formatCurrency(total_revenue)} change="" trend="neutral" icon={TrendingUp} data={kpiData} onClick={() => setAnalytics({isOpen: true, title: t('revenue_analysis'), metric: 'revenue'})} />
        <KPICard title={t('roi')} value={`${overall_roi.toFixed(1)}%`} change="" trend="neutral" icon={Target} data={kpiData} onClick={() => setAnalytics({isOpen: true, title: t('roi_analysis'), metric: 'roi'})} />
        <KPICard title="Umumiy ROAS" value={`${overall_roas.toFixed(2)}x`} change="" trend="neutral" icon={Activity} data={kpiData} onClick={() => setAnalytics({isOpen: true, title: 'ROAS Analysis', metric: 'roas'})} />
        <KPICard title={t('cac')} value={formatCurrency(total_cac)} change="" trend="neutral" icon={Users} data={kpiData} onClick={() => setAnalytics({isOpen: true, title: t('cac_analysis'), metric: 'cac'})} />
      </div>

      <MarketingAssets />

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Index + Channel table */}
        <Card className="p-6 bg-surface-card border-border-dark flex flex-col items-center">
          <h3 className="text-base font-semibold mb-4 text-text-muted uppercase tracking-wider w-full text-center">Marketing Health</h3>
          <GaugeArc value={health.total} max={100} color={health.total>=70?COLORS.positive:health.total>=45?COLORS.warning:COLORS.negative} size={160} label="/ 100" />
          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            {[{l:"Samaradorlik",v:health.efficiency,c:COLORS.primary},{l:"O'sish",v:health.growth,c:COLORS.positive},{l:"Barqarorlik",v:health.stability,c:COLORS.teal},{l:"Raqobat",v:health.competitive,c:COLORS.violet}].map(s=>(
              <div key={s.l} className="bg-surface-ground rounded-lg p-3 border border-border-dark">
                <div className="text-base text-text-muted mb-1">{s.l}</div>
                <div className="text-lg font-bold font-mono" style={{color: s.c}}>{s.v}/25</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Channel Performance Table */}
        <Card className="lg:col-span-2 p-6 bg-surface-card border-border-dark overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Kanal Ko'rsatkichlari</h3>
          <table className="w-full text-left text-base">
            <thead className="text-text-muted uppercase tracking-wider text-base border-b border-border-dark">
              <tr>
                <th className="pb-3">Kanal</th>
                <th className="pb-3">Xarajat</th>
                <th className="pb-3">Daromad</th>
                <th className="pb-3">ROI</th>
                <th className="pb-3">ROAS</th>
                <th className="pb-3">CAC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark/50">
              {channels.map((c, i) => (
                <tr 
                  key={i} 
                  onClick={() => info(`${c.label} kanali tafsilotlari`)}
                  className="hover:bg-surface-ground/30 transition-colors cursor-pointer"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{background: c.color, boxShadow: `0 0 6px ${c.color}`}}/>
                      <strong className="text-text-primary">{c.label}</strong>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-text-secondary">{formatCurrency(c.spend)}</td>
                  <td className="py-3 font-mono text-green-400">{formatCurrency(c.revenue)}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-base font-medium" style={{
                      color: c.roi>100?COLORS.positive:c.roi>0?COLORS.warning:COLORS.negative,
                      backgroundColor: `${c.roi>100?COLORS.positive:c.roi>0?COLORS.warning:COLORS.negative}22`
                    }}>
                      {c.roi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 font-mono" style={{color: c.roas>3?COLORS.teal:COLORS.t3}}>{c.roas.toFixed(2)}x</td>
                  <td className="py-3 font-mono" style={{color: c.cac>200000?COLORS.warning:COLORS.t3}}>{formatCurrency(c.cac)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-surface-card border-border-dark cursor-pointer hover:border-accent transition-colors" onClick={() => setExpandedChart('roi_comparison')}>
          <h3 className="text-lg font-semibold mb-6 text-text-primary">Kanal ROI Taqqoslama</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels} margin={{left:0,right:8,top:4,bottom:4}}>
                <CartesianGrid strokeDasharray="2 6" stroke={COLORS.border} strokeOpacity={0.5}/>
                <XAxis dataKey="label" tick={{fill:COLORS.t3,fontSize:16}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>`${v.toFixed(0)}%`} tick={{fill:COLORS.t3,fontSize:16}} axisLine={false} tickLine={false} width={44}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="roi" name="ROI %" radius={[4,4,0,0]}>
                  {channels.map((c,i)=><Cell key={i} fill={c.roi>100?COLORS.positive:c.roi>0?COLORS.warning:COLORS.negative} fillOpacity={0.9}/>)}
                </Bar>
                <ReferenceLine y={0} stroke={COLORS.border} strokeWidth={1}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-surface-card border-border-dark cursor-pointer hover:border-accent transition-colors" onClick={() => setExpandedChart('roas_cac')}>
          <h3 className="text-lg font-semibold mb-6 text-text-primary">ROAS vs CAC Samaradorlik</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels} margin={{left:0,right:8,top:4,bottom:4}}>
                <CartesianGrid strokeDasharray="2 6" stroke={COLORS.border} strokeOpacity={0.5}/>
                <XAxis dataKey="label" tick={{fill:COLORS.t3,fontSize:16}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:COLORS.t3,fontSize:16}} axisLine={false} tickLine={false} width={36}/>
                <Tooltip content={<ChartTip/>}/>
                <Legend wrapperStyle={{fontSize:16,color:COLORS.t3}}/>
                <Bar dataKey="roas" name="ROAS" fill={COLORS.teal} radius={[4,4,0,0]} fillOpacity={0.85}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI Optimizations */}
      {opts.length > 0 && (
        <Card className="p-6 bg-surface-card border-border-dark">
          <h3 className="text-lg font-semibold mb-4 text-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" /> AI Optimizatsiya Tavsiyalari
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opts.map((o, i) => (
              <div key={i} className="bg-surface-ground rounded-xl p-4 border" style={{
                borderColor: `${o.type==="risk"?COLORS.negative:o.type==="opp"?COLORS.teal:COLORS.warning}44`,
                borderLeftWidth: '4px',
                borderLeftColor: o.type==="risk"?COLORS.negative:o.type==="opp"?COLORS.teal:COLORS.warning
              }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-text-primary text-base">{o.title}</span>
                  <span className="px-2 py-0.5 rounded text-base font-bold uppercase" style={{
                    color: o.priority==="yuqori"?COLORS.negative:o.priority==="o'rta"?COLORS.warning:COLORS.teal,
                    backgroundColor: `${o.priority==="yuqori"?COLORS.negative:o.priority==="o'rta"?COLORS.warning:COLORS.teal}22`
                  }}>{o.priority}</span>
                </div>
                <div className="text-base font-mono mb-2" style={{color: o.type==="risk"?COLORS.negative:COLORS.t3}}>[{o.channel}]</div>
                <p className="text-base text-text-secondary mb-3">{o.desc}</p>
                <button 
                  onClick={() => success(`${o.title} amalga oshirildi`)}
                  className="w-full py-1.5 bg-surface-card border border-border-dark text-text-primary text-base rounded-lg hover:bg-surface-dark transition-colors"
                >
                  Amalga oshirish
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
