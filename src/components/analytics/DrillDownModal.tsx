import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Download, ChevronRight, TrendingUp, TrendingDown, 
  AlertTriangle, Brain, Calendar, Filter, FileText, FileSpreadsheet, FileIcon,
  Sparkles, BarChart2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, AreaChart, Area, PieChart, Pie
} from 'recharts';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';
import AIExplanationModal from './AIExplanationModal';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  module: string;
  metric: string;
  initialLevel?: 'month' | 'week' | 'day' | 'transactions';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
}

export default function DrillDownModal({ isOpen, onClose, title, module, metric, initialLevel = 'month', chartType = 'bar' }: DrillDownModalProps) {
  const { formatCurrency } = useCurrencyFormatter();
  
  const formatValue = (val: number, isAxis = false) => {
    if (metric === 'roi' || metric === 'ctr' || metric === 'performance') {
      return `${val.toFixed(1)}%`;
    }
    if (metric === 'roas') {
      return `${val.toFixed(2)}x`;
    }
    if (metric === 'count' || metric === 'leads' || metric === 'stock') {
      return val.toLocaleString();
    }
    return formatCurrency(val, isAxis, true);
  };

  const [level, setLevel] = useState(initialLevel);
  const [period, setPeriod] = useState<'YTD' | 'QTD' | 'MTD'>('YTD');
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [insights, setInsights] = useState<any>({});
  const [outliers, setOutliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{isOpen: boolean, title: string, data: any}>({isOpen: false, title: '', data: null});
  
  // Breadcrumbs state
  const [path, setPath] = useState<{level: string, label: string, param?: string}[]>([
    { level: 'month', label: 'Yillik Xulosa' }
  ]);

  const fetchData = useCallback(async (currentLevel: string, params: any = {}) => {
    if (!module || !metric) return;
    
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ period, ...params });
      const response = await fetch(`/api/analytics/${module}/${metric}/drilldown/${currentLevel}?${queryParams.toString()}`, {
        headers: {
          'x-user-role': 'ceo' // Mock RBAC
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result.data || []);
      setSummary(result.summary || {});
      setInsights(result.insights || {});
      setOutliers(result.outliers || []);
      setLevel(currentLevel as any);
    } catch (error) {
      console.error("Error fetching drill-down data:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [module, metric, period]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchData(initialLevel);
      setPath([{ level: initialLevel, label: 'Yillik Xulosa' }]);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialLevel, fetchData]);

  const handlePeriodChange = (newPeriod: 'YTD' | 'QTD' | 'MTD') => {
    setPeriod(newPeriod);
    // When period changes, we usually reset to top level but filtered
    if (newPeriod === 'MTD') {
       // For MTD, we might want to show weeks of current month
       // But for simplicity, let's keep level='month' and let backend filter or just show current month
       // Or switch to 'week' level for current month
       // Let's stick to 'month' level for consistency with YTD/QTD unless logic dictates otherwise
       // Actually, MTD usually implies daily breakdown for the month.
       // Let's keep it simple: just update period state, which triggers fetchData via dependency.
       // But we might need to reset level to 'month' if we were deep in 'transactions'.
       setLevel('month');
       setPath([{ level: 'month', label: 'Xulosa' }]);
    } else {
       setLevel('month');
       setPath([{ level: 'month', label: 'Yillik Xulosa' }]);
    }
  };

  const handleBarClick = (entry: any) => {
    if (level === 'month') {
      setPath([...path, { level: 'week', label: entry.name, param: entry.name }]);
      fetchData('week', { month: entry.name });
    } else if (level === 'week') {
      setPath([...path, { level: 'day', label: entry.name, param: entry.name }]);
      fetchData('day', { week: entry.name });
    } else if (level === 'day') {
      setPath([...path, { level: 'transactions', label: entry.name, param: entry.name }]);
      fetchData('transactions', { date: entry.name });
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    const target = newPath[newPath.length - 1];
    
    let params = {};
    if (target.level === 'week') params = { month: target.param };
    if (target.level === 'day') params = { week: target.param };
    if (target.level === 'transactions') params = { date: target.param };
    
    fetchData(target.level, params);
  };

  const handleExport = (type: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${metric}_analytics_${period}_${timestamp}`;

    if (type === 'CSV') {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === 'JSON') {
      const jsonContent = JSON.stringify({ summary, insights, data }, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Export to ${type} is not fully implemented in this demo. Please use CSV or JSON.`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <AIExplanationModal
            isOpen={aiExplanation.isOpen}
            onClose={() => setAiExplanation({...aiExplanation, isOpen: false})}
            title={aiExplanation.title}
            chartData={aiExplanation.data}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-7xl h-[90vh] bg-surface-dark rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border-dark glass-panel"
            >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-dark bg-surface-card">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
              
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 mt-2 text-base text-text-muted">
                {path.map((p, idx) => (
                  <React.Fragment key={`breadcrumb-${p.level}-${idx}`}>
                    <button 
                      onClick={() => handleBreadcrumbClick(idx)}
                      className={`hover:text-brand-500 transition-colors ${idx === path.length - 1 ? 'font-semibold text-text-primary' : ''}`}
                    >
                      {p.label}
                    </button>
                    {idx < path.length - 1 && <ChevronRight className="w-4 h-4" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setAiExplanation({isOpen: true, title: `${title} (${path[path.length - 1].label})`, data: data});
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-base font-medium rounded-lg border border-brand-500/30 transition-colors"
              >
                <Sparkles size={14} />
                AI Tahlil
              </button>
              {/* Filters */}
              <div className="hidden md:flex items-center gap-2 bg-surface-dark border border-border-dark rounded-lg p-1">
                <button 
                  onClick={() => handlePeriodChange('YTD')}
                  className={`px-3 py-1.5 text-base font-medium rounded-md transition-colors ${period === 'YTD' ? 'bg-surface-hover text-text-primary shadow-sm' : 'text-text-muted hover:bg-surface-card'}`}
                >
                  YTD
                </button>
                <button 
                  onClick={() => handlePeriodChange('QTD')}
                  className={`px-3 py-1.5 text-base font-medium rounded-md transition-colors ${period === 'QTD' ? 'bg-surface-hover text-text-primary shadow-sm' : 'text-text-muted hover:bg-surface-card'}`}
                >
                  QTD
                </button>
                <button 
                  onClick={() => handlePeriodChange('MTD')}
                  className={`px-3 py-1.5 text-base font-medium rounded-md transition-colors ${period === 'MTD' ? 'bg-surface-hover text-text-primary shadow-sm' : 'text-text-muted hover:bg-surface-card'}`}
                >
                  MTD
                </button>
              </div>
              
              {/* Export Dropdown (Mock) */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-base font-medium text-text-secondary hover:bg-surface-hover transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-surface-dark border border-border-dark rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 glass-panel">
                  <div className="p-2 space-y-1">
                    <button onClick={() => handleExport('PDF')} className="w-full flex items-center gap-2 px-3 py-2 text-base text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-md"><FileIcon className="w-4 h-4 text-rose-500"/> PDF</button>
                    <button onClick={() => handleExport('Excel')} className="w-full flex items-center gap-2 px-3 py-2 text-base text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-md"><FileSpreadsheet className="w-4 h-4 text-emerald-500"/> Excel</button>
                    <button onClick={() => handleExport('CSV')} className="w-full flex items-center gap-2 px-3 py-2 text-base text-text-secondary hover:bg-surface-hover hover:text-text-primary rounded-md"><FileText className="w-4 h-4 text-brand-500"/> CSV</button>
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Chart Area */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Error Loading Data</h3>
                  <p className="text-text-muted mb-4 max-w-md">{error}</p>
                  <button 
                    onClick={() => fetchData(level || initialLevel)}
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="h-[400px] w-full mb-8">
                    {data.length === 0 ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                        <BarChart2 className="w-12 h-12 mb-2 opacity-20" />
                        <p>Ma'lumot mavjud emas</p>
                      </div>
                    ) : level === 'transactions' ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-base">
                          <thead className="bg-surface-card text-text-muted">
                            <tr>
                              <th className="px-4 py-3 font-medium">ID</th>
                              <th className="px-4 py-3 font-medium">Vaqt</th>
                              <th className="px-4 py-3 font-medium">Mijoz</th>
                              <th className="px-4 py-3 font-medium">Miqdor</th>
                              <th className="px-4 py-3 font-medium">Holat</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-dark">
                            {data.map((trx: any, idx: number) => (
                              <tr key={`${trx.id}-${idx}`} className="hover:bg-surface-hover transition-colors">
                                <td className="px-4 py-3 font-mono text-text-primary">{trx.id}</td>
                                <td className="px-4 py-3 text-text-muted">{trx.time}</td>
                                <td className="px-4 py-3 text-text-primary">{trx.client}</td>
                                <td className="px-4 py-3 font-medium text-text-primary">{formatValue(trx.amount)}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-base font-medium rounded-full ${trx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {trx.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        {chartType === 'line' ? (
                          <LineChart data={data} onClick={(e: any) => e?.activePayload && handleBarClick(e.activePayload[0].payload)}>
                            <defs>
                              <linearGradient id="colorValueLine" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-dark)" opacity={0.5} />
                            <XAxis dataKey="name" tick={{fontSize: 16, fill: 'var(--color-text-muted)'}} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(val) => formatValue(val, true)} tick={{fontSize: 16, fill: 'var(--color-text-muted)'}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-dark)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', color: 'var(--color-text-primary)' }} formatter={(value: number) => [formatValue(value, false), 'Qiymat']} />
                            <Line type="monotone" dataKey="value" stroke="var(--color-brand-500)" strokeWidth={3} dot={{r: 4, fill: 'var(--color-brand-500)', strokeWidth: 2, stroke: 'var(--color-surface-dark)'}} activeDot={{r: 6, strokeWidth: 0}} />
                          </LineChart>
                        ) : chartType === 'area' ? (
                          <AreaChart data={data} onClick={(e: any) => e?.activePayload && handleBarClick(e.activePayload[0].payload)}>
                            <defs>
                              <linearGradient id="colorValueArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-dark)" opacity={0.5} />
                            <XAxis dataKey="name" tick={{fontSize: 16, fill: 'var(--color-text-muted)'}} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(val) => formatValue(val, true)} tick={{fontSize: 16, fill: 'var(--color-text-muted)'}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-dark)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', color: 'var(--color-text-primary)' }} formatter={(value: number) => [formatValue(value, false), 'Qiymat']} />
                            <Area type="monotone" dataKey="value" stroke="var(--color-brand-500)" fill="url(#colorValueArea)" />
                          </AreaChart>
                        ) : chartType === 'pie' ? (
                          <PieChart onClick={(e: any) => e?.activePayload && handleBarClick(e.activePayload[0].payload)}>
                            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} innerRadius={60} fill="var(--color-brand-500)" label>
                              {data.map((entry, index) => <Cell key={`pie-cell-${index}`} fill={['var(--color-brand-500)', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-dark)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', color: 'var(--color-text-primary)' }} formatter={(value: number) => [formatValue(value, false), 'Qiymat']} />
                          </PieChart>
                        ) : (
                          <BarChart data={data} onClick={(e: any) => e?.activePayload && handleBarClick(e.activePayload[0].payload)}>
                            <defs>
                              <linearGradient id="colorValueBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={1}/>
                                <stop offset="100%" stopColor="var(--color-brand-600)" stopOpacity={0.6}/>
                              </linearGradient>
                              <linearGradient id="colorValueBarOutlier" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-dark)" opacity={0.5} />
                            <XAxis dataKey="name" tick={{fontSize: 16, fill: 'var(--color-text-muted)'}} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(val) => formatValue(val, true)} tick={{fontSize: 16, fill: 'var(--color-text-muted)'}} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: 'var(--color-surface-hover)'}} contentStyle={{ backgroundColor: 'var(--color-surface-dark)', border: '1px solid var(--color-border-dark)', borderRadius: '8px', color: 'var(--color-text-primary)' }} formatter={(value: number) => [formatValue(value, false), 'Qiymat']} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} className="cursor-pointer" isAnimationActive={true} animationDuration={800} animationEasing="ease-in-out">
                              {data.map((entry, index) => (
                                <Cell key={`bar-cell-${index}`} fill={outliers.find(o => o.name === entry.name) ? 'url(#colorValueBarOutlier)' : 'url(#colorValueBar)'} className="hover:opacity-80 transition-opacity" />
                              ))}
                            </Bar>
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Outliers Section */}
                  {outliers.length > 0 && level !== 'transactions' && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-purple-500" />
                        <h4 className="font-semibold text-purple-400">Anomaliyalar aniqlandi</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {outliers.map((o, index) => (
                          <span key={`outlier-${o.name}-${index}`} className="px-3 py-1 bg-surface-dark text-purple-400 rounded-lg text-base font-medium shadow-sm border border-purple-500/20">
                            {o.name}: {formatValue(o.value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Panel: Metrics & AI Insights */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border-dark bg-surface-card/50 p-6 overflow-y-auto custom-scrollbar">
              
              {/* Summary Metrics */}
              <div className="space-y-6 mb-8">
                <div>
                  <p className="text-base font-medium text-text-muted mb-1">Jami Tushum</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-bold text-text-primary">
                      {summary.total ? formatValue(summary.total) : '0'}
                    </h3>
                    {summary.growth && (
                      <span className={`flex items-center text-base font-medium mb-1 ${summary.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {summary.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {Math.abs(summary.growth).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-base font-medium text-text-muted mb-1">O'rtacha</p>
                  <h4 className="text-xl font-semibold text-text-secondary">
                    {summary.average ? formatValue(summary.average) : '0'}
                  </h4>
                </div>
              </div>

              {/* AI Insights Block */}
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Brain className="w-24 h-24 text-brand-500" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-brand-500" />
                    <h4 className="font-bold text-text-primary">AI Tahlili</h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-base font-semibold text-brand-400 uppercase tracking-wider mb-1">O'zgarish Sababi</p>
                      <p className="text-base text-text-secondary leading-relaxed">
                        {insights.whyChanged || "Ma'lumot yetarli emas."}
                      </p>
                    </div>

                    <div>
                      <p className="text-base font-semibold text-purple-400 uppercase tracking-wider mb-1">Anomaliya</p>
                      <p className="text-base text-text-secondary leading-relaxed">
                        {insights.anomaly || "Anomaliyalar aniqlanmadi."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-brand-500/20">
                      <p className="text-base font-semibold text-emerald-400 uppercase tracking-wider mb-1">Tavsiya</p>
                      <p className="text-base font-medium text-text-primary">
                        {insights.suggestedAction || "Kuzatishda davom eting."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-base text-text-muted">Xavf ehtimoli:</span>
                      <span className={`text-base font-bold px-2 py-1 rounded-md ${
                        insights.riskProbability?.includes('Past') ? 'bg-emerald-500/10 text-emerald-500' : 
                        insights.riskProbability?.includes('O\'rta') ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                        {insights.riskProbability || "Noma'lum"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
