import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

interface KPICardProps {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  change: string;
  data?: { value: number }[];
  icon?: React.ElementType;
  className?: string;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = memo(({ 
  title, 
  value, 
  trend, 
  change, 
  data = [], 
  icon: Icon,
  className = '',
  onClick
}) => {
  const { t } = useLanguage();
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  
  const trendColor = isPositive ? 'text-emerald-500' : isNegative ? 'text-rose-500' : 'text-text-muted';
  const trendBg = isPositive ? 'bg-emerald-500/10' : isNegative ? 'bg-rose-500/10' : 'bg-surface-dark/50';
  const strokeColor = isPositive ? '#10B981' : isNegative ? '#F43F5E' : '#4D618A';
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-2xl border border-border-dark glass-panel p-6 transition-all shadow-sm
        hover:border-brand-500/30 hover:shadow-lg group
        ${className}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {/* Background Gradient Blob */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-10 ${isPositive ? 'bg-emerald-500' : isNegative ? 'bg-rose-500' : 'bg-brand-500'}`} />

      <div className="relative z-10 flex justify-between items-start mb-4">
        <div>
          <p className="text-base font-bold text-text-muted mb-1 tracking-wider uppercase">{title}</p>
          <h3 className="text-3xl font-bold text-text-primary tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${trendBg} ${trendColor} border border-border-dark shadow-inner backdrop-blur-md`}>
            <Icon size={22} />
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-end justify-between mt-4">
        <div className="flex flex-col gap-1">
          <div className={`flex items-center gap-1.5 text-base font-bold px-2.5 py-1 rounded-lg w-fit ${trendBg} ${trendColor} border border-white/5`}>
            <TrendIcon size={16} />
            {change}
          </div>
          <span className="text-base text-text-muted font-bold uppercase tracking-tight ml-1">{t('vs_last_period')}</span>
        </div>
        
        {data.length > 0 && (
          <div className="h-12 w-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={strokeColor} 
                  strokeWidth={2} 
                  fill={`url(#gradient-${title.replace(/\s+/g, '-')})`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
});

KPICard.displayName = 'KPICard';

export default KPICard;
