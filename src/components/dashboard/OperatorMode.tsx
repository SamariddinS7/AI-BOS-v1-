import React, { useState, useEffect, memo } from 'react';
import { 
  Filter, Calendar, MapPin, Layers, ShoppingBag, 
  CheckCircle, AlertCircle, Clock, Activity, Database, 
  Server, Link, Play, Pause, RefreshCw, Search
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { motion } from 'motion/react';
import { useRealTimeAnalytics } from '../../hooks/useRealTimeAnalytics';
import CountUp from '../CountUp';
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
  const [activities, setActivities] = useState<any[]>([
    { time: "11:14:55", type: "System", message: "Database backup completed successfully.", status: "success" },
    { time: "11:12:30", type: "Marketing", message: "Campaign 'Spring Sale' budget increased by 10% (AI Auto-Action).", status: "info" },
    { time: "11:05:12", type: "Workflow", message: "Workflow #492 failed at step 'Send Email'.", status: "error" },
    { time: "10:58:45", type: "Sales", message: "New enterprise lead detected: Acme Corp.", status: "success" },
    { time: "10:45:22", type: "Inventory", message: "Low stock alert: SKU-992 (Wireless Mouse).", status: "warning" },
    { time: "10:30:10", type: "Finance", message: "Daily revenue report generated.", status: "info" },
    { time: "10:15:00", type: "HR", message: "New employee onboarding workflow started.", status: "info" },
    { time: "09:55:30", type: "Security", message: "Unusual login attempt blocked from IP 192.168.1.105.", status: "warning" },
  ]);

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
    <div className="space-y-6 p-6 font-sans">
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
      <div className="flex flex-wrap items-center gap-4 glass-panel p-3 rounded-2xl sticky top-0 z-10 border border-border-dark shadow-sm backdrop-blur-md bg-surface-ground/80">
        <div className="flex items-center gap-2 text-text-secondary border-r border-border-dark pr-4">
          <Filter size={18} />
          <span className="text-base font-semibold uppercase tracking-wider">{t('filters')}</span>
        </div>
        
        <div 
          onClick={() => info(`${t('today')} ${t('filter_selected')}`)}
          className="flex items-center gap-2 bg-surface-card hover:bg-surface-dark border border-border-dark px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm"
        >
          <Calendar size={18} className="text-blue-500" />
          <span className="text-base font-medium text-text-secondary">{t('today')}: Mar 03</span>
        </div>

        <div 
          onClick={() => info(`${t('all_branches')} ${t('filter_selected')}`)}
          className="flex items-center gap-2 bg-surface-card hover:bg-surface-dark border border-border-dark px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm"
        >
          <MapPin size={18} className="text-purple-500" />
          <span className="text-base font-medium text-text-secondary">{t('all_branches')}</span>
        </div>

        <div 
          onClick={() => info(`${t('all_departments')} ${t('filter_selected')}`)}
          className="flex items-center gap-2 bg-surface-card hover:bg-surface-dark border border-border-dark px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm"
        >
          <Layers size={18} className="text-orange-500" />
          <span className="text-base font-medium text-text-secondary">{t('all_departments')}</span>
        </div>

        <div className="flex-1"></div>

        <div className="relative hidden sm:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder={t('search_logs')} 
            className="bg-surface-card border border-border-dark rounded-xl pl-9 pr-4 py-2 text-base text-text-primary focus:outline-none focus:border-brand-500 w-64 transition-all focus:ring-1 focus:ring-brand-500 placeholder:text-text-muted/70 shadow-sm"
          />
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline (Real-time Log) */}
        <Card 
          className="lg:col-span-2 p-6 h-[500px] overflow-hidden flex flex-col rounded-2xl cursor-pointer hover:border-brand-500/30 transition-all shadow-sm glass-panel"
          onClick={() => setExpandedCard('activity')}
        >
          <ActivityTimeline activities={activities} />
        </Card>

        {/* Live Status Block */}
        <div className="space-y-6">
          <Card 
            className="p-6 rounded-2xl cursor-pointer hover:border-brand-500/30 transition-all shadow-sm glass-panel"
            onClick={() => setExpandedCard('system')}
          >
            <SystemStatus />
          </Card>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm shadow-sm">
            <h4 className="text-base font-bold text-blue-500 mb-2 flex items-center gap-2">
              <AlertCircle size={18} /> {t('operator_note')}
            </h4>
            <p className="text-base text-text-secondary leading-relaxed mb-4">
              {t('maintenance_note')}
            </p>
            <button 
              onClick={() => success(`${t('acknowledge')} ${t('process_started')}`)}
              className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white text-base font-semibold rounded-xl transition-colors shadow-lg shadow-brand-500/20"
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
