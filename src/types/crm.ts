export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  region: string;
  account_value: number;
  status: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  created_at: string;
}

export interface Deal {
  id: string;
  customer_id: string;
  title: string;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  value: number;
  probability: number;
  expected_close_date: string;
  created_at: string;
}

export interface Interaction {
  id: string;
  customer_id: string;
  type: 'email' | 'call' | 'meeting' | 'support' | 'note';
  description: string;
  timestamp: string;
}
