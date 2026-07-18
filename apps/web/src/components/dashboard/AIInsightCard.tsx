import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Zap, AlertTriangle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AIInsightCardProps {
  title: string;
  description: string;
  impact: string;
  confidence: number;
  action: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'warning';
  className?: string;
  onAction?: () => void;
}

const AIInsightCard: React.FC<AIInsightCardProps> = memo(({ 
  title, 
  description, 
  impact, 
  confidence, 
  action, 
  type,
  className = '',
  onAction
}) => {
  const { t } = useLanguage();
  const isOpportunity = type === 'opportunity';
  const isRisk = type === 'risk' || type === 'warning';
  const isOptimization = type === 'optimization';

  const color = isOpportunity ? 'text-emerald-500' : isRisk ? 'text-rose-500' : 'text-brand-500';
  const bg = isOpportunity ? 'bg-emerald-500/10' : isRisk ? 'bg-rose-500/10' : 'bg-brand-500/10';
  const border = isOpportunity ? 'border-emerald-500/20' : isRisk ? 'border-rose-500/20' : 'border-brand-500/20';
  const glow = isOpportunity ? 'shadow-emerald-500/20' : isRisk ? 'shadow-rose-500/20' : 'shadow-brand-500/20';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={`
        relative overflow-hidden rounded-2xl border border-border-dark enterprise-card p-4 lg:p-6 transition-all shadow-sm
        hover:border-brand-500/30 hover:shadow-md ${glow}
        ${className}
      `}
    >
      {/* Background Glow */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-10 ${isOpportunity ? 'bg-emerald-500' : isRisk ? 'bg-rose-500' : 'bg-brand-500'}`} />

      <div className="relative z-10 flex justify-between items-start mb-3 lg:mb-4">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className={`p-2 lg:p-2.5 rounded-xl ${bg} ${border} border shadow-inner`}>
            {isOpportunity && <Zap size={16} className={`${color} lg:w-5 lg:h-5`} />}
            {isRisk && <AlertTriangle size={16} className={`${color} lg:w-5 lg:h-5`} />}
            {isOptimization && <CheckCircle size={16} className={`${color} lg:w-5 lg:h-5`} />}
          </div>
          <div>
            <h3 className="text-sm lg:text-lg font-bold text-white tracking-tight">{title}</h3>
            <div className="flex items-center gap-1 mt-0.5 lg:mt-1">
              <Sparkles size={14} className="text-brand-500 lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-base font-bold text-brand-500">{t('ai_confidence')}: {confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      <p className="relative z-10 text-xs lg:text-base text-text-muted mb-4 lg:mb-6 leading-relaxed">{description}</p>

      <div className="relative z-10 flex items-center justify-between pt-3 lg:pt-4 border-t border-border-dark">
        <div className="flex flex-col">
          <span className="text-[10px] lg:text-base font-bold text-text-muted uppercase tracking-wider">{t('impact')}</span>
          <span className={`text-xs lg:text-base font-bold ${color}`}>{impact}</span>
        </div>

        <button 
          onClick={onAction}
          className={`
          flex items-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl text-xs lg:text-base font-bold transition-all
          bg-surface-layer/30 hover:bg-surface-layer border border-border-dark hover:border-brand-500/30 text-text-muted hover:text-white
          hover:pr-3 group shadow-sm
        `}>
          {action} 
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 lg:w-4 lg:h-4" />
        </button>
      </div>
    </motion.div>
  );
});

AIInsightCard.displayName = 'AIInsightCard';

export default AIInsightCard;
