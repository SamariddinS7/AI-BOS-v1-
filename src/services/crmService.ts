import { Customer, Interaction, Deal } from '../types/crm';
import { supabase } from '../lib/supabase';

// Helper to convert DB customer to Frontend Customer type
const mapCustomer = (row: any): Customer => ({
  id: row.id,
  name: row.name,
  company: row.metadata?.company || '',
  email: row.email || '',
  phone: row.phone || '',
  industry: row.metadata?.industry || '',
  region: row.metadata?.region || '',
  account_value: row.metadata?.account_value || 0,
  status: row.status as any,
  created_at: row.created_at,
});

export const crmService = {
  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getCustomers error:', error);
        return [];
      }
      return (data || []).map(mapCustomer);
    } catch (err) {
      console.warn('Failed to fetch customers from Supabase (network error). Operating in safe offline fallback mode.', err);
      return [];
    }
  },

  addCustomer: async (customer: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Not authenticated');

      // Mijozi qo'shish uchun oldin o'zimizning tenant_id ni topishimiz kerak, 
      // lekin RLS trigger yoki client orqali insert qilinganda xato bermasligi uchun 
      // db-da tenant_id ni o'zimiz profilimizdan o'qishimiz kerak.
      // Xavfsizroq bo'lishi uchun joriy tenant_id ni olamiz:
      let tenantId = 'default-tenant-id';
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('tenant_id')
          .eq('auth_user_id', userData.user.id)
          .single();
        if (profile?.tenant_id) {
          tenantId = profile.tenant_id;
        }
      } catch (profileErr) {
        console.warn('Could not read user profile from Supabase, using default tenant ID.', profileErr);
      }

      const dbCustomer = {
        tenant_id: tenantId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        type: customer.company ? 'company' : 'individual',
        metadata: {
          company: customer.company,
          industry: customer.industry,
          region: customer.region,
          account_value: customer.account_value,
        }
      };

      const { error } = await supabase.from('customers').insert(dbCustomer);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to add customer to Supabase (network error):', err);
      throw err;
    }
  },

  // Deals (Hozircha stub, chunki db scriptda Deals jadvali ruxsat etilmagan/yozilmagan)
  // Ammo sizning sxemangizda deals qo'shilmagandi, tepadagi transactions ni ishlatsa bo'ladi 
  // yoki mock qaytaramiz.
  getDeals: async (): Promise<Deal[]> => {
    try {
      const res = await fetch('/api/crm/deals');
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return await res.json() || [];
    } catch (err) {
      console.warn('Failed to fetch deals from API, returning local fallback array:', err);
      return [];
    }
  },
  updateDealStage: async (dealId: string, stage: Deal['stage']) => {
    try {
      const res = await fetch(`/api/crm/deals/${dealId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage })
      });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    } catch (err) {
      console.warn('Failed to update deal stage via API:', err);
    }
  },

  // Interactions (Stub)
  getInteractions: async (customerId: string): Promise<Interaction[]> => {
    try {
      const res = await fetch(`/api/crm/interactions/${customerId}`);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return await res.json() || [];
    } catch (err) {
      console.warn('Failed to fetch interactions from API, returning empty:', err);
      return [];
    }
  },
  addInteraction: async (interaction: Omit<Interaction, 'id' | 'timestamp'>) => {
    try {
      const res = await fetch('/api/crm/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interaction)
      });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    } catch (err) {
      console.warn('Failed to save interaction via API:', err);
    }
  }
};
