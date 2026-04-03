import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '../../types/crm';

const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

const SortableDeal: React.FC<{ deal: Deal }> = ({ deal }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: deal.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-surface-card p-4 rounded-lg border border-border-dark cursor-grab mb-2">
      <h4 className="font-medium text-text-primary text-base">{deal.title}</h4>
      <p className="text-base text-text-muted">${deal.value.toLocaleString()}</p>
    </div>
  );
};

interface SalesPipelineProps {
  deals: Deal[];
  onDealMove: (dealId: string, stage: string) => void;
}

export const SalesPipeline: React.FC<SalesPipelineProps> = ({ deals, onDealMove }) => {
  return (
    <div className="grid grid-cols-6 gap-4">
      {stages.map(stage => (
        <div key={stage} className="bg-surface-dark p-4 rounded-xl border border-border-dark">
          <h3 className="font-bold text-text-primary text-base mb-4">{stage}</h3>
          <div className="min-h-[200px]">
            {deals.filter(d => d.stage === stage).map(deal => (
              <SortableDeal key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
