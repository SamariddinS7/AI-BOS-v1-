import { Customer, Deal, Interaction } from '../types/crm';

export const crmService = {
  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const res = await fetch('/api/crm/customers');
    return res.json();
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
    return res.json();
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
    return res.json();
  },
  addInteraction: async (interaction: Omit<Interaction, 'id' | 'timestamp'>) => {
    await fetch('/api/crm/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interaction)
    });
  }
};
