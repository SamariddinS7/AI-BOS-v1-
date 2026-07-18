import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

interface SmartKPICardProps {
  title: string;
  value: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
  data: { date: string; value: number }[]; // for sparkline
  icon: any;
  color: string; // e.g., "blue", "green"
  onClick?: () => void;
  prefix?: string;
  suffix?: string;
}

export const SmartKPICard = ({
  title,
  value,
  change,
  trend,
  data,
  icon: Icon,
  color,
  onClick,
  prefix = '',
  suffix = ''
}: SmartKPICardProps) => {
  const { formatCurrency } = useCurrencyFormatter();

  const getColorClass = (colorName: string) => {
    switch (colorName) {
      case 'blue': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'green': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'purple': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'orange': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'red': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStrokeColor = (colorName: string) => {
    switch (colorName) {
      case 'blue': return '#3b82f6';
      case 'green': return '#22c55e';
      case 'purple': return '#a855f7';
      case 'orange': return '#f97316';
      case 'red': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const colorClasses = getColorClass(color);
  const strokeColor = getStrokeColor(color);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-panel rounded-2xl border border-border-dark p-0 relative overflow-hidden group cursor-pointer h-full flex flex-col transition-all hover:border-brand-500/30 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${colorClasses} backdrop-blur-md border shadow-inner`}>
            <Icon size={24} />
          </div>
          <div className="flex flex-col items-end">
             <span className={`flex items-center text-base font-bold px-2 py-1 rounded-lg border ${
                trend === 'up' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 
                trend === 'down' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 
                'text-text-muted bg-surface-dark/50 border-border-dark'
             }`}>
                {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : 
                 trend === 'down' ? <ArrowDownRight size={14} className="mr-1" /> : 
                 <Minus size={14} className="mr-1" />}
                {Math.abs(change)}%
             </span>
             <span className="text-base text-text-muted font-bold uppercase tracking-tight mt-1">vs last month</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-text-muted mb-1 uppercase tracking-wider">{title}</h3>
        <div className="text-3xl font-bold text-text-primary mb-4 tracking-tight">
            {prefix}{formatCurrency(value, false, true)}{suffix}
        </div>
      </div>

      {/* Sparkline Area */}
      <div className="h-16 w-full mt-auto relative border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface-dark)', 
                  border: '1px solid var(--color-border-dark)', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  backdropFilter: 'blur(8px)'
                }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
                cursor={{ stroke: 'var(--color-border-dark)', strokeWidth: 1 }}
            />
            <Line 
                type="monotone" 
                dataKey="value" 
                stroke={strokeColor} 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4, fill: strokeColor, stroke: 'var(--color-text-primary)', strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
