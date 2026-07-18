import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, Database, GitCommit, Brain, CheckCircle2, AlertCircle } from 'lucide-react';

const CustomNode = ({ data, selected }: NodeProps) => {
  const getIcon = () => {
    switch (data.type) {
      case 'trigger': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'action': return <Database className="w-5 h-5 text-blue-500" />;
      case 'condition': return <GitCommit className="w-5 h-5 text-purple-500" />;
      case 'ai': return <Brain className="w-5 h-5 text-indigo-500" />;
      default: return <Zap className="w-5 h-5 text-text-muted" />;
    }
  };

  const getBorderColor = () => {
    if (selected) return 'border-brand-500 ring-1 ring-brand-500';
    return 'border-border-dark hover:border-border-light';
  };

  return (
    <div className={`min-w-[240px] bg-surface-card border rounded-xl shadow-lg transition-all ${getBorderColor()}`}>
      {/* Input Handle */}
      {data.type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-2.5 h-2.5 !bg-text-muted !border-2 !border-surface-card"
        />
      )}

      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2.5 bg-surface-ground rounded-lg border border-border-dark">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-bold text-base text-text-primary leading-tight">{data.label}</h3>
            <p className="text-base font-bold uppercase tracking-wider text-text-muted mt-0.5">{data.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-ground border border-border-dark rounded-md w-fit">
          {data.isValid ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-base font-medium text-text-secondary">Valid</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-base font-medium text-text-secondary">Incomplete</span>
            </>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-text-muted !border-2 !border-surface-card"
      />
    </div>
  );
};

export default memo(CustomNode);
