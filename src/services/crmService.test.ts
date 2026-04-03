import { describe, it, expect, vi, beforeEach } from 'vitest';
import { crmService } from './crmService';

describe('crmService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('getCustomers should fetch customers', async () => {
    const mockCustomers = [{ id: 1, name: 'Customer 1' }];
    (global.fetch as any).mockResolvedValue({
      json: async () => mockCustomers,
    });

    const customers = await crmService.getCustomers();
    expect(global.fetch).toHaveBeenCalledWith('/api/crm/customers');
    expect(customers).toEqual(mockCustomers);
  });

  it('addCustomer should post a new customer', async () => {
    const newCustomer = { 
      name: 'Customer 2', 
      company: 'Company B', 
      email: 'test@test.com', 
      phone: '123456789', 
      industry: 'Tech', 
      region: 'North', 
      account_value: 1000, 
      status: 'Lead' 
    };
    (global.fetch as any).mockResolvedValue({ ok: true });

    await crmService.addCustomer(newCustomer as any);
    expect(global.fetch).toHaveBeenCalledWith('/api/crm/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer),
    });
  });

  it('getDeals should fetch deals', async () => {
    const mockDeals = [{ id: 1, title: 'Deal 1' }];
    (global.fetch as any).mockResolvedValue({
      json: async () => mockDeals,
    });

    const deals = await crmService.getDeals();
    expect(global.fetch).toHaveBeenCalledWith('/api/crm/deals');
    expect(deals).toEqual(mockDeals);
  });

  it('updateDealStage should update deal stage', async () => {
    const dealId = '123';
    const stage = 'Won';
    (global.fetch as any).mockResolvedValue({ ok: true });

    await crmService.updateDealStage(dealId, stage as any);
    expect(global.fetch).toHaveBeenCalledWith(`/api/crm/deals/${dealId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
  });

  it('getInteractions should fetch interactions for a customer', async () => {
    const customerId = '456';
    const mockInteractions = [{ id: 1, note: 'Interaction 1' }];
    (global.fetch as any).mockResolvedValue({
      json: async () => mockInteractions,
    });

    const interactions = await crmService.getInteractions(customerId);
    expect(global.fetch).toHaveBeenCalledWith(`/api/crm/interactions/${customerId}`);
    expect(interactions).toEqual(mockInteractions);
  });

  it('addInteraction should post a new interaction', async () => {
    const newInteraction = { 
      customer_id: '1', 
      type: 'email', 
      description: 'Follow up email' 
    };
    (global.fetch as any).mockResolvedValue({ ok: true });

    await crmService.addInteraction(newInteraction as any);
    expect(global.fetch).toHaveBeenCalledWith('/api/crm/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInteraction),
    });
  });
});
