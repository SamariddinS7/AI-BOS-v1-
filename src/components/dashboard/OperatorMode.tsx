import React, { useState, useEffect, memo } from 'react';
import { 
  Filter, Calendar, MapPin, Layers, ShoppingBag, 
  CheckCircle, AlertCircle, Clock, Activity, Database, 
  Server, Link, Play, Pause, RefreshCw, Search
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { motion } from 'motion/react';
import { useRealTimeAnalytics } from '../../hooks/useRealTimeAnalytics';
import CountUp from '../ui/CountUp';
import StatusCard from './StatusCard';
import Card from '../ui/Card';
import ExpandedChartModal from './ExpandedChartModal';
import ActivityTimeline from './ActivityTimeline';
import SystemStatus from './SystemStatus';
import { useLanguage } from '../../contexts/LanguageContext';

interface OperatorModeProps {
  realTimeUpdates?: any[];
}

const OperatorMode = memo(({ realTimeUpdates = [] }: OperatorModeProps) => {
  const { success, info } = useToast();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (realTimeUpdates.length > 0) {
      const latest = realTimeUpdates[0];
      // Avoid duplicates if possible, though simplistic check here
      setActivities(prev => {
        const newActivity = {
          time: new Date(latest.timestamp).toLocaleTimeString(),
          type: latest.module || 'System',
          message: latest.data.message || JSON.stringify(latest.data),
          status: latest.type === 'anomaly_detected' ? 'error' : 'info'
        };
        // Check if already added (simple check by time/message)
        if (prev[0]?.time === newActivity.time && prev[0]?.message === newActivity.message) return prev;
        return [newActivity, ...prev].slice(0, 50);
      });
    }
  }, [realTimeUpdates]);

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6 font-sans text-white">
      <ExpandedChartModal
        isOpen={expandedCard === 'activity'}
        onClose={() => setExpandedCard(null)}
        title={t('live_activity_feed')}
      >
        <ActivityTimeline activities={activities} />
      </ExpandedChartModal>
      <ExpandedChartModal
        isOpen={expandedCard === 'system'}
        onClose={() => setExpandedCard(null)}
        title={t('system_status')}
      >
        <SystemStatus />
      </ExpandedChartModal>

      {/* Global Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-4 enterprise-card p-2 lg:p-3 rounded-2xl sticky top-0 z-20 border border-border-dark/20 shadow-sm backdrop-blur-md bg-transparent">
        <div className="flex items-center gap-1.5 lg:gap-2 text-text-muted border-r border-border-dark/20 pr-3 lg:pr-4">
          <Filter size={16} className="lg:w-[18px] lg:h-[18px]" />
          <span className="text-xs lg:text-base font-bold uppercase tracking-wider">{t('filters')}</span>
        </div>
        
        <div 
          onClick={() => info(`${t('today')} ${t('filter_selected')}`)}
          className="flex items-center gap-1.5 lg:gap-2 bg-transparent hover:bg-surface-layer/20 border border-border-dark/20 px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm"
        >
          <Calendar size={16} className="text-brand-500 lg:w-[18px] lg:h-[18px]" />
          <span className="text-xs lg:text-base font-bold text-text-muted hover:text-white">{t('today')}: Mar 03</span>
        </div>

        <div 
          onClick={() => info(`${t('all_branches')} ${t('filter_selected')}`)}
          className="flex items-center gap-1.5 lg:gap-2 bg-transparent hover:bg-surface-layer/20 border border-border-dark/20 px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm"
        >
          <MapPin size={16} className="text-brand-500 lg:w-[18px] lg:h-[18px]" />
          <span className="text-xs lg:text-base font-bold text-text-muted hover:text-white">{t('all_branches')}</span>
        </div>

        <div 
          onClick={() => info(`${t('all_departments')} ${t('filter_selected')}`)}
          className="flex items-center gap-1.5 lg:gap-2 bg-transparent hover:bg-surface-layer/20 border border-border-dark/20 px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm"
        >
          <Layers size={16} className="text-brand-500 lg:w-[18px] lg:h-[18px]" />
          <span className="text-xs lg:text-base font-bold text-text-muted hover:text-white">{t('all_departments')}</span>
        </div>

        <div className="flex-1"></div>

        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted lg:w-[18px] lg:h-[18px]" />
          <input 
            type="text" 
            placeholder={t('search_logs')} 
            className="bg-transparent border border-border-dark/20 rounded-xl pl-9 pr-4 py-1.5 lg:py-2 text-xs lg:text-base text-white focus:outline-none focus:border-brand-500 w-48 lg:w-64 transition-all focus:ring-1 focus:ring-brand-500 placeholder:text-text-muted/70 shadow-sm"
          />
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        <StatusCard 
          title={t('orders_today')} 
          value={<CountUp value={1245} />} 
          status="normal" 
          icon={ShoppingBag} 
        />
        <StatusCard 
          title={t('pending_tasks')} 
          value={<CountUp value={34} />} 
          status="warning" 
          icon={Clock} 
        />
        <StatusCard 
          title={t('failed_workflows')} 
          value={<CountUp value={2} />} 
          status="critical" 
          icon={AlertCircle} 
        />
        <StatusCard 
          title={t('inventory_alerts')} 
          value={<><CountUp value={12} /> SKUs</>} 
          status="warning" 
          icon={Layers} 
        />
        <StatusCard 
          title={t('campaign_status')} 
          value={<><CountUp value={4} /> {t('active')}</>} 
          status="success" 
          icon={Activity} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Activity Timeline (Real-time Log) */}
        <Card 
          className="lg:col-span-2 p-4 lg:p-6 h-[400px] lg:h-[500px] overflow-hidden flex flex-col rounded-2xl cursor-pointer hover:border-brand-500/30 transition-all shadow-sm enterprise-card"
          onClick={() => setExpandedCard('activity')}
        >
          <ActivityTimeline activities={activities} />
        </Card>

        {/* Live Status Block */}
        <div className="space-y-4 lg:space-y-6">
          <Card 
            className="p-4 lg:p-6 rounded-2xl cursor-pointer hover:border-brand-500/30 transition-all shadow-sm enterprise-card"
            onClick={() => setExpandedCard('system')}
          >
            <SystemStatus />
          </Card>

          <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-4 lg:p-6 backdrop-blur-sm shadow-sm">
            <h4 className="text-sm lg:text-base font-bold text-brand-500 mb-1.5 lg:mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="lg:w-[18px] lg:h-[18px]" /> {t('operator_note')}
            </h4>
            <p className="text-xs lg:text-base text-text-muted leading-relaxed mb-3 lg:mb-4 font-bold">
              {t('maintenance_note')}
            </p>
            <button 
              onClick={() => success(`${t('acknowledge')} ${t('process_started')}`)}
              className="w-full py-1.5 lg:py-2 bg-brand-600 hover:bg-brand-500 text-black text-xs lg:text-base font-bold rounded-xl transition-colors shadow-lg shadow-brand-500/20"
            >
              {t('acknowledge')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

OperatorMode.displayName = 'OperatorMode';

export default OperatorMode;
