import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { 
  LayoutDashboard, Activity, Settings, Bell, Search, Menu, 
  ChevronDown, User, LogOut, Moon, Sun, Bot, Plus, Edit, FileText,
  Mic, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VoiceControl from '../components/dashboard/VoiceControl';
import { useRealTimeAnalytics } from '../hooks/useRealTimeAnalytics';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../contexts/LanguageContext';

const CEOMode = lazy(() => import('../components/dashboard/CEOMode'));
const OperatorMode = lazy(() => import('../components/dashboard/OperatorMode'));

export default function Dashboard() {
  const { t } = useLanguage();
  const { success, error: toastError, info } = useToast();
  const [mode, setMode] = useState<'ceo' | 'operator'>('ceo');
  const { isConnected, lastUpdate, updates } = useRealTimeAnalytics();

  // Handle voice actions
  const handleVoiceAction = useCallback((action: string, data: any) => {
    if (action === 'switch_mode') {
      setMode(data.mode);
    } else if (action === 'show_analytics') {
      // This would ideally open the analytics modal, but for now we just switch to CEO mode
      setMode('ceo');
    }
  }, [t, success, info]);

  // Show toast for new anomalies
  useEffect(() => {
    if (lastUpdate?.type === 'anomaly_detected') {
      toastError(t('anomaly_detected_toast').replace('{{message}}', lastUpdate.data.message), { message: t('impact') + ': ' + lastUpdate.data.impact });
    }
  }, [lastUpdate, t, toastError]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex-1 font-sans"
    >
      {/* Dashboard Header with Mode Toggle */}
      <div className="sticky top-0 z-20 glass-panel border-b border-border-dark px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">{t('dashboard')}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-base text-text-secondary">
              {mode === 'ceo' ? t('ai_recommendations') : t('automation')}
            </p>
            {isConnected && (
              <span className="flex items-center gap-1 text-base text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                LIVE
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <VoiceControl onAction={handleVoiceAction} />
          
          <div className="flex items-center bg-surface-card p-1 rounded-xl border border-border-dark">
            <button
              onClick={() => {
                setMode('ceo');
              }}
              className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
                mode === 'ceo' 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-dark'
              }`}
            >
              {t('ceo_mode')}
            </button>
            <button
              onClick={() => {
                setMode('operator');
              }}
              className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
                mode === 'operator' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-dark'
              }`}
            >
              {t('operator_mode')}
            </button>
          </div>
        </div>
      </div>

      {/* Mode Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'ceo' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'ceo' ? 20 : -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {mode === 'ceo' ? (
              <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>}>
                <CEOMode realTimeUpdates={updates} />
              </Suspense>
            ) : (
              <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>}>
                <OperatorMode realTimeUpdates={updates} />
              </Suspense>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
