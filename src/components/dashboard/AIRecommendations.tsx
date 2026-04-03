import React, { memo } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';
import AIInsightCard from './AIInsightCard';
import { useLanguage } from '../../contexts/LanguageContext';

interface Recommendation {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization';
  titleKey: string;
  descriptionKey: string;
  impactKey: string;
  confidence: number;
  actionKey: string;
}

const recommendations: Recommendation[] = [
  {
    id: '1',
    type: 'optimization',
    titleKey: 'increase_marketing_budget',
    descriptionKey: 'increase_marketing_budget_desc',
    impactKey: 'increase_marketing_budget_impact',
    confidence: 92,
    actionKey: 'reallocate_budget'
  },
  {
    id: '2',
    type: 'optimization',
    titleKey: 'automate_invoice_processing',
    descriptionKey: 'automate_invoice_processing_desc',
    impactKey: 'automate_invoice_processing_impact',
    confidence: 88,
    actionKey: 'enable_automation'
  },
  {
    id: '3',
    type: 'opportunity',
    titleKey: 'expand_eco_segment',
    descriptionKey: 'expand_eco_segment_desc',
    impactKey: 'expand_eco_segment_impact',
    confidence: 85,
    actionKey: 'launch_campaign'
  }
];

const AIRecommendations = memo(() => {
  const { formatCurrency } = useCurrencyFormatter();
  const { success, info } = useToast();
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-border-dark glass-panel p-6 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-purple-500">
        <Sparkles size={120} />
      </div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-bold text-text-primary">{t('ai_strategic_recommendations')}</h3>
        </div>
        <span className="text-base font-semibold text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
          {t('live_analysis')}
        </span>
      </div>

      <div className="space-y-4 relative z-10">
        {recommendations.map((rec) => (
          <AIInsightCard
            key={rec.id}
            type={rec.type}
            title={t(rec.titleKey)}
            description={t(rec.descriptionKey)}
            impact={t(rec.impactKey)}
            confidence={rec.confidence}
            action={t(rec.actionKey)}
            onAction={() => info(`${t(rec.actionKey)} ${t('process_started')}`)}
          />
        ))}
      </div>

      <button 
        onClick={() => success(t('generating_new_insights'))}
        className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white text-base font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 relative z-10 group"
      >
        <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
        {t('generate_new_insights')}
      </button>
    </div>
  );
});

AIRecommendations.displayName = 'AIRecommendations';

export default AIRecommendations;
