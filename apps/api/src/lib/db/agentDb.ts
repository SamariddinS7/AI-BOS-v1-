import db from './settings';
import { v4 as uuidv4 } from 'uuid';
import { Agent } from '../../services/agentService';

export const agentDbService = {
  getAgents: async (tenantId: string = 'default-tenant-id'): Promise<Agent[]> => {
    try {
      const agents = db.prepare('SELECT * FROM agents WHERE tenant_id = ? AND deleted_at IS NULL ORDER BY created_at DESC').all(tenantId);
      return agents.map((agent: any) => {
        const allowed_events = JSON.parse(agent.allowed_events || '[]');
        const permissions = JSON.parse(agent.permissions || '[]');
        return {
          ...agent,
          allowed_events,
          events: allowed_events,
          permissions,
          webhookUrl: agent.webhook_url,
          createdAt: agent.created_at,
          lastActivity: 'Noma\'lum'
        };
      });
    } catch (error: any) {
      console.error('Get Agents Error:', error.message);
      throw error;
    }
  },

  registerAgent: async (agentData: any): Promise<Agent> => {
    const id = uuidv4();
    const tenantId = agentData.tenant_id || 'default-tenant-id';
    const events = agentData.allowed_events || agentData.events || [];
    const allowedEvents = JSON.stringify(events);
    const permissions = agentData.permissions ? JSON.stringify(agentData.permissions) : '[]';
    const webhookUrl = agentData.webhook_url || agentData.webhookUrl || null;

    try {
      db.prepare(`
        INSERT INTO agents (
          id, tenant_id, name, platform, webhook_url, allowed_events, permissions, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        tenantId,
        agentData.name,
        agentData.platform,
        webhookUrl,
        allowedEvents,
        permissions,
        agentData.status || 'active',
        agentData.created_by || null
      );

      return (await agentDbService.getAgent(id)) as Agent;
    } catch (error: any) {
      console.error('Register Agent Error:', error.message);
      throw new Error(`Agentni ro'yxatdan o'tkazishda xatolik: ${error.message}`);
    }
  },

  getAgent: async (id: string): Promise<Agent | null> => {
    try {
      const agent = db.prepare('SELECT * FROM agents WHERE id = ? AND deleted_at IS NULL').get(id);
      if (agent) {
        const allowed_events = JSON.parse(agent.allowed_events || '[]');
        const permissions = JSON.parse(agent.permissions || '[]');
        return {
          ...agent,
          allowed_events,
          events: allowed_events,
          permissions,
          webhookUrl: agent.webhook_url,
          createdAt: agent.created_at,
          lastActivity: 'Noma\'lum'
        };
      }
      return agent;
    } catch (error: any) {
      console.error('Get Agent Error:', error.message);
      throw error;
    }
  },

  updateAgent: async (id: string, data: any): Promise<Agent | null> => {
    try {
      const current = await agentDbService.getAgent(id);
      if (!current) throw new Error('Agent topilmadi');

      const events = data.allowed_events || data.events || current.allowed_events;
      const allowedEvents = JSON.stringify(events);
      const permissions = data.permissions ? JSON.stringify(data.permissions) : JSON.stringify(current.permissions);
      const webhookUrl = data.webhook_url || data.webhookUrl || current.webhook_url;

      db.prepare(`
        UPDATE agents 
        SET 
          name = COALESCE(?, name),
          platform = COALESCE(?, platform),
          webhook_url = COALESCE(?, webhook_url),
          allowed_events = ?,
          permissions = ?,
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        data.name || null,
        data.platform || null,
        webhookUrl,
        allowedEvents,
        permissions,
        data.status || null,
        id
      );

      return agentDbService.getAgent(id);
    } catch (error: any) {
      console.error('Update Agent Error:', error.message);
      throw error;
    }
  },

  updateAgentStatus: async (id: string, status: 'active' | 'paused'): Promise<Agent | null> => {
    return agentDbService.updateAgent(id, { status });
  },

  deleteAgent: async (id: string): Promise<void> => {
    try {
      db.prepare('UPDATE agents SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    } catch (error: any) {
      console.error('Delete Agent Error:', error.message);
      throw error;
    }
  }
};
