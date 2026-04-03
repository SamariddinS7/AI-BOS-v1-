import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Play, Pause } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const ActivityItem = memo(({ time, type, message, status }: any) => {
  const statusColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      className="flex gap-4 items-start border-l border-border-dark pl-4 py-3 relative group hover:bg-surface-card/50 rounded-r-lg transition-colors"
    >
      <div className={`absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full ${statusColors[status as keyof typeof statusColors]} ring-4 ring-surface-dark group-hover:ring-surface-card transition-all`}></div>
      <span className="text-base font-mono text-text-muted w-20 flex-shrink-0 pt-1">{time}</span>
      <div>
        <p className="text-base text-text-secondary font-medium group-hover:text-text-primary transition-colors">{message}</p>
        <span className="text-base text-text-muted uppercase tracking-wider font-semibold">{type}</span>
      </div>
    </motion.div>
  );
});

ActivityItem.displayName = 'ActivityItem';

interface ActivityTimelineProps {
  activities: any[];
}

const ActivityTimeline = memo(({ activities }: ActivityTimelineProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 border-b border-border-dark pb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-text-primary">
          <Activity size={20} className="text-blue-500" />
          {t('live_activity_feed')}
        </h3>
        <div className="flex gap-2">
          <button className="p-1.5 hover:bg-surface-card rounded text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border-dark">
            <Play size={16} />
          </button>
          <button className="p-1.5 hover:bg-surface-card rounded text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border-dark">
            <Pause size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar min-h-[300px]">
        {activities.map((activity, index) => (
          <ActivityItem key={`${activity.time}-${activity.message}-${index}`} {...activity} />
        ))}
      </div>
    </div>
  );
});

ActivityTimeline.displayName = 'ActivityTimeline';

export default ActivityTimeline;
