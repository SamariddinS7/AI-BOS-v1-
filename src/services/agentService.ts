export interface Agent {
  id: string;
  name: string;
  platform: string;
  webhookUrl: string;
  events: string[];
  permissions: string[];
  status: 'active' | 'paused' | 'error';
  lastActivity: string;
  createdAt: string;
}

// Mock storage
let agents: Agent[] = [
  {
    id: '1',
    name: 'n8n Automation',
    platform: 'n8n',
    webhookUrl: 'https://n8n.example.com/webhook/1',
    events: ['marketing.update', 'crm.new_lead'],
    permissions: ['read:marketing', 'write:crm'],
    status: 'active',
    lastActivity: '2 mins ago',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Zapier Bridge',
    platform: 'Zapier',
    webhookUrl: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
    events: ['finance.report_ready'],
    permissions: ['read:finance'],
    status: 'paused',
    lastActivity: '1 day ago',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Custom HR Agent',
    platform: 'Custom',
    webhookUrl: 'https://api.hr-system.com/webhooks/ai-bos',
    events: ['hr.kpi_update'],
    permissions: ['read:hr'],
    status: 'active',
    lastActivity: 'Just now',
    createdAt: new Date().toISOString(),
  },
];

export const agentService = {
  getAgents: async (): Promise<Agent[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return agents;
  },

  registerAgent: async (agentData: Omit<Agent, 'id' | 'status' | 'lastActivity' | 'createdAt'>): Promise<Agent> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newAgent: Agent = {
      ...agentData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'active',
      lastActivity: 'Never',
      createdAt: new Date().toISOString(),
    };
    
    agents.push(newAgent);
    return newAgent;
  },

  updateAgentStatus: async (id: string, status: 'active' | 'paused'): Promise<Agent> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = agents.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Agent not found');
    
    agents[index] = { ...agents[index], status };
    return agents[index];
  },

  deleteAgent: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    agents = agents.filter(a => a.id !== id);
  }
};
