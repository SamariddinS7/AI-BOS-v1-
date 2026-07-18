import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, ComposedChart, ReferenceDot
} from 'recharts';
import { Download, ZoomIn, Bot, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import DrillDownModal from './DrillDownModal';

interface UniversalChartProps {
  module: string;
  metric: string;
  title: string;
  color?: string;
}

export default function UniversalChart({ module, metric, title, color = "#8884d8" }: UniversalChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [inView, setInView] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [model, setModel] = useState<'linear' | 'prophet' | 'arima' | 'lstm'>('prophet');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [module, metric, timeRange, model]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/${module}/${metric}?time_range=${timeRange}&model=${model}`);
      const result = await res.json();
      
      setData(result.data);
      setForecast(result.forecast);
      setAnomalies(result.anomalies);
      setExplanation(result.explanation);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.location.href = `/api/analytics/export?module=${module}&metric=${metric}&format=csv`;
  };

  // Combine data and forecast for visualization
  const chartData = [
    ...data.map(d => ({ ...d, type: 'historical' })),
    ...forecast.map(d => ({ ...d, type: 'forecast' }))
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      onViewportEnter={() => setInView(true)}
      className="bg-white dark:bg-surface-card rounded-xl border border-slate-200 dark:border-border-dark p-6 shadow-sm"
    >
      <DrillDownModal 
        isOpen={isDrillDownOpen}
        onClose={() => setIsDrillDownOpen(false)}
        title={`Drill Down: ${title}`}
        module={module}
        metric={metric}
        initialLevel="month"
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            {title}
            {anomalies.length > 0 && (
              <span className="flex items-center gap-1 text-base font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                {anomalies.length} Anomalies
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={model}
            onChange={(e) => setModel(e.target.value as any)}
            className="bg-slate-50 dark:bg-surface-ground border border-slate-200 dark:border-border-dark rounded-lg text-base px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-500"
            title="Forecasting Model"
          >
            <option value="linear">Linear</option>
            <option value="prophet">Prophet (Seasonality)</option>
            <option value="arima">ARIMA (Auto-Regressive)</option>
            <option value="lstm">LSTM (Deep Learning)</option>
          </select>

          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-50 dark:bg-surface-ground border border-slate-200 dark:border-border-dark rounded-lg text-base px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>

          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className={`p-2 rounded-lg transition-colors ${showExplanation ? 'bg-brand-100 text-brand-600' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'}`}
            title="AI Explanation"
          >
            <Bot className="w-4 h-4" />
          </button>

          <button 
            onClick={handleExport}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 transition-colors"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showExplanation && explanation && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/50 rounded-lg p-4"
        >
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h4 className="text-base font-medium text-brand-900 dark:text-brand-100 mb-1">AI Analysis</h4>
              <p className="text-base text-brand-700 dark:text-brand-300 leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="h-[300px] w-full">
        {loading ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-4">
            <div className="w-full h-full bg-slate-100 dark:bg-surface-ground rounded-lg animate-pulse flex items-end px-4 pb-4 gap-2">
              {[40, 70, 45, 90, 65, 80, 55, 100, 75, 60, 85, 50].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-200 dark:bg-border-dark rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={chartData}
              onClick={() => setIsDrillDownOpen(true)}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="var(--color-text-muted)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="var(--color-text-muted)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface-dark)', borderRadius: '8px', border: '1px solid var(--color-border-dark)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: 'var(--color-text-primary)' }}
                labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}
                itemStyle={{ color: 'var(--color-brand-400)' }}
                formatter={(value: number) => [value.toLocaleString(), title]}
              />
              <Legend />
              
              {/* Historical Data */}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                fill={`url(#gradient-${metric})`} 
                strokeWidth={2}
                connectNulls
                isAnimationActive={inView}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              
              {/* Forecast Data */}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeDasharray="5 5" 
                dot={false} 
                connectNulls
                name="Forecast"
                isAnimationActive={inView}
                animationDuration={800}
                animationEasing="ease-in-out"
              />

              {/* Anomalies */}
              {anomalies.map((anomaly, index) => (
                <ReferenceDot 
                  key={`anomaly-${anomaly.date}`} 
                  x={anomaly.date} 
                  y={anomaly.value} 
                  r={5} 
                  fill="var(--color-red-500)" 
                  stroke="var(--color-surface-dark)"
                  strokeWidth={2}
                />
              ))}

              <defs>
                <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
