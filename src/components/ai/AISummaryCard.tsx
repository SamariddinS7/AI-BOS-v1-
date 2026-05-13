import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface AISummaryCardProps {
  summary: string;
  recommendation: string;
  trend?: 'up' | 'down' | 'neutral';
  riskLevel?: 'low' | 'medium' | 'high';
}

export default function AISummaryCard({ summary, recommendation, trend = 'neutral', riskLevel = 'low' }: AISummaryCardProps) {
  return (
    <div className="bg-gradient-to-r from-brand-900/20 to-indigo-900/20 border border-brand-500/20 rounded-xl p-6 mb-8 shadow-sm relative overflow-hidden backdrop-blur-sm">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-500/10 rounded-full opacity-50 blur-xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-indigo-500/10 rounded-full opacity-50 blur-xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6">
        {/* Header / Icon Section */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center md:items-start md:justify-start gap-2 min-w-[120px] border-b md:border-b-0 md:border-r border-brand-500/20 pb-4 md:pb-0 md:pr-6">
          <div className="bg-brand-600 text-white p-3 rounded-lg shadow-md shadow-brand-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-brand-100 text-base uppercase tracking-wider mt-2">AI-BOS Tahlili</h3>
          
          {/* Status Badges */}
          <div className="flex flex-col gap-2 mt-2 w-full">
            {trend !== 'neutral' && (
              <div className={`flex items-center gap-1 text-base font-medium px-2 py-1 rounded-full ${
                trend === 'up' ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 'bg-red-900/30 text-red-400 border border-red-900/50'
              }`}>
                <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
                {trend === 'up' ? 'O\'sish tendensiyasi' : 'Pasayish tendensiyasi'}
              </div>
            )}
            {riskLevel !== 'low' && (
              <div className={`flex items-center gap-1 text-base font-medium px-2 py-1 rounded-full ${
                riskLevel === 'high' ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50'
              }`}>
                <AlertTriangle className="w-3 h-3" />
                {riskLevel === 'high' ? 'Yuqori xavf' : 'O\'rta xavf'}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-base font-semibold text-brand-200 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Xulosa
            </h4>
            <p className="text-text-secondary text-base leading-relaxed">
              {summary}
            </p>
          </div>
          
          <div className="bg-surface-card/60 rounded-lg p-4 border border-brand-500/20 backdrop-blur-md">
            <h4 className="text-base font-semibold text-indigo-300 mb-1 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Tavsiyasi
            </h4>
            <p className="text-text-primary text-base font-medium leading-relaxed">
              {recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
