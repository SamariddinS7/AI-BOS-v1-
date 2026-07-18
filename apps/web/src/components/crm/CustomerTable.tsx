import React, { useState, useEffect } from 'react';
import { UserCircle, Phone, Mail, MoreVertical, History, Briefcase, TrendingUp } from 'lucide-react';
import { Customer, Deal, Interaction } from '../../types/crm';
import { crmService } from '../../services/crmService';
import Card from '../ui/Card';

import { useToast } from '../../hooks/useToast';

interface CustomerTableProps {
  customers: Customer[];
}

export const CustomerTable: React.FC<CustomerTableProps> = ({ customers }) => {
  const { info } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [customerDeals, setCustomerDeals] = useState<Deal[]>([]);

  useEffect(() => {
    if (selectedCustomer) {
      info(`${selectedCustomer.name} tafsilotlari yuklanmoqda...`);
      const fetchDetails = async () => {
        const inters = await crmService.getInteractions(selectedCustomer.id);
        const allDeals = await crmService.getDeals();
        const filteredDeals = allDeals.filter(d => d.customer_id === selectedCustomer.id);
        setInteractions(inters);
        setCustomerDeals(filteredDeals);
      };
      fetchDetails();
    }
  }, [selectedCustomer]);

  return (
    <div className="space-y-6">
      <div className="enterprise-card overflow-hidden">
        <table className="w-full text-left text-base">
          <thead className="bg-surface-card/50 text-text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Company</th>
              <th className="px-6 py-3 font-medium">Industry</th>
              <th className="px-6 py-3 font-medium">Value</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {customers.map((customer, idx) => (
              <tr 
                key={`${customer.id}-${idx}`} 
                className={`hover:bg-surface-card/50 transition-colors cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-brand-500/5' : ''}`}
                onClick={() => setSelectedCustomer(customer)}
              >
                <td className="px-6 py-4 font-medium text-text-primary flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500">
                    {customer.name.charAt(0)}
                  </div>
                  {customer.name}
                </td>
                <td className="px-6 py-4 text-text-secondary">{customer.company}</td>
                <td className="px-6 py-4 text-text-muted">{customer.industry}</td>
                <td className="px-6 py-4 text-text-primary">${customer.account_value?.toLocaleString() || '0'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-base font-medium text-blue-400 bg-blue-900/30 rounded-full border border-blue-900/50">
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-muted cursor-pointer hover:text-text-primary">
                  <MoreVertical size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-6">
            <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-brand-400" />
              Recent Interactions ({selectedCustomer.name})
            </h4>
            <div className="space-y-4">
              {interactions.map((inter) => (
                <div key={inter.id} className="p-3 rounded-lg bg-surface-ground/30 border border-border-dark/50">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-base font-bold text-brand-400 uppercase tracking-wider">{inter.type}</span>
                    <span className="text-base text-text-muted">{new Date(inter.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-base text-text-secondary">{inter.description}</p>
                </div>
              ))}
              {interactions.length === 0 && (
                <p className="text-center py-4 text-text-muted italic text-base">No interactions recorded.</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              Active Deals
            </h4>
            <div className="space-y-4">
              {customerDeals.map((deal) => (
                <div key={deal.id} className="p-3 rounded-lg bg-surface-ground/30 border border-border-dark/50 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-text-primary">{deal.title}</div>
                    <div className="text-base text-text-muted">{deal.stage}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400">${deal.value?.toLocaleString() || '0'}</div>
                    <div className="text-base text-text-muted">Prob: {deal.probability}%</div>
                  </div>
                </div>
              ))}
              {customerDeals.length === 0 && (
                <p className="text-center py-4 text-text-muted italic text-base">No active deals found.</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
