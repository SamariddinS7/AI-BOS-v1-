import React, { memo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { fmt } from '../../utils/analytics';

interface KPICardProps {
  label: string;
  value: number;
  prevValue?: number;
  sparkData: { v: number }[];
  color?: string;
  icon?: React.ReactNode;
  suffix?: string;
  isAnomaly?: boolean;
}

export const KPICard = memo(({ label, value, prevValue, sparkData, color = '#00D4FF', icon, suffix = "", isAnomaly }: KPICardProps) => {
  const delta = prevValue ? ((value - prevValue) / prevValue * 100).toFixed(1) : "0";
  const isUp = Number(delta) >= 0;

  return (
    <div className="card fade-up p-5 min-w-[240px] relative">
      {/* Anomaliya belgisi */}
      {isAnomaly && (
        <div className="absolute top-3 right-3 text-amber-500 text-base font-bold">
          ANOMALIYA
        </div>
      )}
      
      <div className="flex justify-between mb-3">
        <span className="text-base text-text-muted uppercase tracking-wider">{label}</span>
        <span className="opacity-70">{icon}</span>
      </div>

      <div className="text-[28px] font-bold text-text-primary font-mono mb-2">
        {fmt(value)}<span className="text-base text-text-muted">{suffix}</span>
      </div>

      {/* Sparkline (Kichik grafik) */}
      <div className="h-10 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id={`grad-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} fill={`url(#grad-${label.replace(/\s+/g, '-')})`} strokeWidth={2} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={`text-base font-bold px-1.5 py-0.5 rounded ${isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {isUp ? "Up" : "Down"} {Math.abs(Number(delta))}%
        </span>
        <span className="text-base text-text-muted/70">o'tgan davrga nisbatan</span>
      </div>
    </div>
  );
});
