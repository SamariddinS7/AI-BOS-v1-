import React from 'react';
import { Mail, Phone, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { Interaction } from '../../types/crm';

interface InteractionTimelineProps {
  interactions: Interaction[];
}

const getIcon = (type: string) => {
  switch (type) {
    case 'email': return <Mail size={16} />;
    case 'call': return <Phone size={16} />;
    case 'meeting': return <Calendar size={16} />;
    case 'support': return <AlertCircle size={16} />;
    default: return <MessageSquare size={16} />;
  }
};

export const InteractionTimeline: React.FC<InteractionTimelineProps> = ({ interactions }) => {
  return (
    <div className="space-y-6">
      {interactions.map((interaction, idx) => (
        <div key={`${interaction.id}-${idx}`} className="flex gap-4 items-start border-l border-border-dark pl-4 py-2 relative">
          <div className="absolute -left-[5px] top-3 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-surface-dark"></div>
          <div className="p-2 bg-surface-card rounded-lg text-brand-500">
            {getIcon(interaction.type)}
          </div>
          <div>
            <p className="text-base font-medium text-text-primary">{interaction.description}</p>
            <span className="text-base text-text-muted uppercase tracking-wider">{new Date(interaction.timestamp).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
