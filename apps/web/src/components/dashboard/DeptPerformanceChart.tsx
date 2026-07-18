import React, { memo } from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface DeptPerformanceChartProps {
  data: { name: string; score: number; status: string }[];
}

const DeptPerformanceChart = memo(({ data }: DeptPerformanceChartProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 w-full">
      {data.map((dept) => (
        <div key={dept.name} className="flex items-center justify-between group cursor-pointer">
          <span className="text-base text-text-muted group-hover:text-white transition-colors w-32 font-bold">{t(dept.name.toLowerCase()) || dept.name}</span>
          <div className="flex items-center gap-3 flex-1">
            <div className="h-2.5 bg-surface-layer/50 rounded-full overflow-hidden w-full border border-border-dark">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${dept.score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${dept.status} rounded-full group-hover:brightness-110 shadow-[0_0_10px_rgba(59,130,246,0.3)]`} 
              />
            </div>
            <span className="text-base font-mono w-16 text-right text-text-muted group-hover:text-white transition-colors font-bold">{dept.score.toFixed(2)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
});

DeptPerformanceChart.displayName = 'DeptPerformanceChart';

export default DeptPerformanceChart;
