import React, { useState } from 'react';

type InsightType = 'risk' | 'opportunity' | 'optimization';

interface InsightCardProps {
  type: InsightType;
  title: string;
  desc: string;
  confidence: number;
  impact: string;
}

export const InsightCard = ({ type, title, desc, confidence, impact }: InsightCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const colors = {
    risk: 'border-red-500 text-red-500',
    opportunity: 'border-teal-500 text-teal-500',
    optimization: 'border-amber-500 text-amber-500'
  };

  return (
    <div className={`card p-4 border-l-4 ${colors[type].split(' ')[0]}`}>
      <div className="flex justify-between mb-2">
        <span className={`text-base font-bold uppercase ${colors[type].split(' ')[1]}`}>{type}</span>
        <span className="text-base text-text-muted font-mono">Ishonch: {confidence}%</span>
      </div>
      
      <h4 className="text-base font-bold text-text-primary mb-1.5">{title}</h4>
      <p className="text-base text-text-secondary leading-relaxed mb-3">{desc}</p>

      {expanded && (
        <div className="fade-in pt-3 border-t border-border-dark mt-3">
          <div className="text-base text-text-muted mb-1">MOLIYAVIY TA'SIR:</div>
          <div className="text-base font-bold text-text-primary">{impact}</div>
        </div>
      )}

      <button 
        onClick={() => setExpanded(!expanded)}
        className="bg-transparent border-none text-brand-500 text-base cursor-pointer p-0 mt-2 hover:text-brand-400 transition-colors"
      >
        {expanded ? "Yopish" : "Batafsil"}
      </button>
    </div>
  );
};
