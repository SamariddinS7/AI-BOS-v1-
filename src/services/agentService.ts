export interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  platform: string;
  webhook_url: string;
  webhookUrl?: string; // Alias for backward compatibility
  allowed_events: string[];
  events?: string[]; // Alias for backward compatibility
  permissions: string[];
  status: 'active' | 'paused' | 'error';
  created_at: string;
  createdAt?: string; // Alias for backward compatibility
  updated_at: string;
  lastActivity?: string; // For compatibility
  created_by?: string;
  deleted_at?: string;
}

export const agentService = {
  getAgents: async (): Promise<Agent[]> => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },

  registerAgent: async (agentData: any): Promise<Agent> => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register agent');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error registering agent:', error);
      throw error;
    }
  },

  getAgent: async (id: string): Promise<Agent | null> => {
    try {
      const response = await fetch(`/api/agents/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch agent');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  },

  updateAgent: async (id: string, data: any): Promise<Agent | null> => {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update agent');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  },

  updateAgentStatus: async (id: string, status: 'active' | 'paused'): Promise<Agent | null> => {
    return agentService.updateAgent(id, { status });
  },

  deleteAgent: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  }
};

// For backward compatibility with some files that might use AgentService class
export const AgentService = agentService;

