import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { useLanguage } from '../../contexts/LanguageContext';

interface StatusCardProps {
  title: string;
  value: React.ReactNode;
  status: 'critical' | 'warning' | 'normal' | 'success';
  icon: React.ElementType;
  className?: string;
}

const StatusCard: React.FC<StatusCardProps> = memo(({ 
  title, 
  value, 
  status, 
  icon: Icon,
  className = '' 
}) => {
  const { t } = useLanguage();

  const statusConfig = {
    critical: { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: t('critical') },
    warning: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: t('warning') },
    normal: { color: 'text-brand-500', bg: 'bg-brand-500/10', border: 'border-brand-500/20', label: t('normal') },
    success: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: t('active') },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.normal;

  return (
    <Card className={`p-5 flex flex-col justify-between enterprise-card border-border-dark hover:border-brand-500/30 transition-all ${className}`} hoverEffect={true}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-base font-bold text-text-muted uppercase tracking-widest">{title}</p>
        <div className={`p-2 rounded-xl ${config.bg} ${config.color} border border-white/5 backdrop-blur-md shadow-inner`}>
          <Icon size={18} />
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-base font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${config.bg} ${config.color} border ${config.border} backdrop-blur-sm`}>
            {config.label}
          </span>
        </div>
      </div>
    </Card>
  );
});

StatusCard.displayName = 'StatusCard';

export default StatusCard;
