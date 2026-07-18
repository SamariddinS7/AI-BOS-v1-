import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import DrillDownModal from './DrillDownModal';

export interface InteractiveChartProps {
  chart: React.ReactNode;
  module: string;
  metric: string;
  title: string;
  initialLevel?: 'month' | 'week' | 'day' | 'transactions';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  className?: string;
}

export const InteractiveChart = ({ 
  chart, 
  module,
  metric, 
  title, 
  initialLevel = 'month',
  chartType = 'bar',
  className = ""
}: InteractiveChartProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative group ${className}`}>
      <div className="cursor-pointer h-full w-full" onClick={() => setIsOpen(true)}>
        {chart}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded">
          <Maximize2 size={16} className="text-white" />
        </div>
      </div>
      <DrillDownModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={title}
        module={module}
        metric={metric}
        initialLevel={initialLevel}
        chartType={chartType}
      />
    </div>
  );
};
