import React, { memo } from 'react';
import { Server, RefreshCw, Activity, Database, Link } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const SystemStatus = memo(() => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 border-b border-border-dark pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Server size={18} className="text-brand-500" />
          {t('system_status')}
        </h3>
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-base font-bold border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {t('operational')}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-surface-layer/30 rounded-xl border border-border-dark hover:border-brand-500/30 transition-all group backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500 group-hover:scale-110 transition-transform"><RefreshCw size={16} /></div>
            <div>
              <p className="text-base font-bold text-white">{t('n8n_workflow_engine')}</p>
              <p className="text-base text-text-muted font-bold">v1.24.0 • {t('uptime')} 99.9%</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-layer/30 rounded-xl border border-border-dark hover:border-brand-500/30 transition-all group backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500 group-hover:scale-110 transition-transform"><Activity size={16} /></div>
            <div>
              <p className="text-base font-bold text-white">{t('ai_engine_gemini')}</p>
              <p className="text-base text-text-muted font-bold">{t('latency')}: 45ms</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-layer/30 rounded-xl border border-border-dark hover:border-brand-500/30 transition-all group backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500 group-hover:scale-110 transition-transform"><Database size={16} /></div>
            <div>
              <p className="text-base font-bold text-white">{t('postgresql_db')}</p>
              <p className="text-base text-text-muted font-bold">{t('connections')}: 45/100</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-layer/30 rounded-xl border border-border-dark hover:border-brand-500/30 transition-all group backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500 group-hover:scale-110 transition-transform"><Link size={16} /></div>
            <div>
              <p className="text-base font-bold text-white">{t('external_apis')}</p>
              <p className="text-base text-text-muted font-bold">Stripe, Twilio, Slack</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
        </div>
      </div>
    </div>
  );
});

SystemStatus.displayName = 'SystemStatus';

export default SystemStatus;
