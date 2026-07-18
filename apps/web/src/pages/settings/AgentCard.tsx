import React from 'react';
import { Settings, Power, Link as LinkIcon, MoreVertical } from 'lucide-react';
import Card from '../../components/ui/Card';

interface AgentCardProps {
  name: string;
  type: string;
  status: 'active' | 'paused' | 'error';
  lastActivity: string;
  events: string[];
}

const AgentCard: React.FC<AgentCardProps> = ({ name, type, status, lastActivity, events }) => {
  return (
    <Card className={`p-5 flex flex-col ${
      status === 'active' ? 'border-brand-500/50 dark:border-brand-500/30' : 'border-border-dark'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            type === 'n8n' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
            type === 'Zapier' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
            'bg-blue-100 text-brand-500 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-text-primary">{name}</h4>
            <span className="text-base text-text-muted">{type} Integration</span>
          </div>
        </div>
        <button className="p-1 text-text-muted hover:text-text-primary transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-medium text-text-muted">Allowed Events:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {events.map((event, index) => (
            <span key={`${event}-${index}`} className="px-2 py-1 bg-surface-ground text-text-secondary rounded text-base font-mono border border-border-dark">
              {event}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border-dark mt-auto">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'active' ? 'bg-green-500 animate-pulse' :
            status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-base text-text-muted">
            {status === 'active' ? 'Active' : status === 'paused' ? 'Paused' : 'Error'} • {lastActivity}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-text-muted hover:text-brand-600 transition-colors bg-surface-ground rounded-md">
            <Settings className="w-4 h-4" />
          </button>
          <button className={`p-1.5 transition-colors rounded-md ${
            status === 'active' 
              ? 'text-red-500 hover:bg-red-500/5 dark:hover:bg-red-900/20 bg-surface-ground' 
              : 'text-green-500 hover:bg-green-500/5 dark:hover:bg-green-900/20 bg-surface-ground'
          }`}>
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default AgentCard;
