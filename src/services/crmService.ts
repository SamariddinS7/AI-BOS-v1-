import { Customer, Deal, Interaction } from '../types/crm';
import { safeJson } from '../lib/utils';

export const crmService = {
  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const res = await fetch('/api/crm/customers');
    const data = await safeJson<Customer[]>(res);
    return data || [];
  },
  addCustomer: async (customer: Omit<Customer, 'id' | 'created_at'>) => {
    await fetch('/api/crm/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
  },

  // Deals
  getDeals: async (): Promise<Deal[]> => {
    const res = await fetch('/api/crm/deals');
    const data = await safeJson<Deal[]>(res);
    return data || [];
  },
  updateDealStage: async (dealId: string, stage: Deal['stage']) => {
    await fetch(`/api/crm/deals/${dealId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage })
    });
  },

  // Interactions
  getInteractions: async (customerId: string): Promise<Interaction[]> => {
    const res = await fetch(`/api/crm/interactions/${customerId}`);
    const data = await safeJson<Interaction[]>(res);
    return data || [];
  },
  addInteraction: async (interaction: Omit<Interaction, 'id' | 'timestamp'>) => {
    await fetch('/api/crm/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interaction)
    });
  }
};
