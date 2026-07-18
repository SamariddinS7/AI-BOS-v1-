import React, { memo } from 'react';
import { TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface Suggestion {
  id: string;
  titleKey: string;
  descriptionKey: string;
  potentialImpactKey: string;
  type: 'savings' | 'revenue';
}

const ProactiveGrowthSuggestions = memo(() => {
  const { t } = useLanguage();

  const suggestions: Suggestion[] = [
    {
      id: '1',
      titleKey: 'optimize_cloud_infrastructure',
      descriptionKey: 'optimize_cloud_infrastructure_desc',
      potentialImpactKey: 'optimize_cloud_infrastructure_impact',
      type: 'savings'
    },
    {
      id: '2',
      titleKey: 'upsell_enterprise_tier',
      descriptionKey: 'upsell_enterprise_tier_desc',
      potentialImpactKey: 'upsell_enterprise_tier_impact',
      type: 'revenue'
    },
    {
      id: '3',
      titleKey: 'reduce_vendor_overlap',
      descriptionKey: 'reduce_vendor_overlap_desc',
      potentialImpactKey: 'reduce_vendor_overlap_impact',
      type: 'savings'
    }
  ];

  return (
    <div className="rounded-2xl border border-border-dark enterprise-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-white">{t('proactive_growth_opportunities')}</h3>
      </div>
      
      <div className="space-y-4">
        {suggestions.map((s, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={s.id} 
            className="group p-5 rounded-xl bg-surface-layer/30 border border-border-dark hover:bg-surface-layer hover:border-brand-500/30 transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl ${s.type === 'savings' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-500'}`}>
                {s.type === 'savings' ? <DollarSign className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-base">{t(s.titleKey)}</h4>
                  <span className={`text-base font-bold px-2.5 py-1 rounded-lg ${s.type === 'savings' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-500'}`}>
                    {t(s.potentialImpactKey)}
                  </span>
                </div>
                <p className="text-base text-text-muted mt-2 leading-relaxed font-bold">{t(s.descriptionKey)}</p>
                
                <div className="mt-4 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="text-base text-brand-500 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    {t('view_details')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

ProactiveGrowthSuggestions.displayName = 'ProactiveGrowthSuggestions';

export default ProactiveGrowthSuggestions;

