import prisma from './prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { Agent } from '../../services/agentService';

export const agentDbService = {
  getAgents: async (tenantId: string = 'default-tenant-id'): Promise<Agent[]> => {
    try {
      const agents = await prisma.agent.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        orderBy: { created_at: 'desc' }
      });
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
      await prisma.agent.create({
        data: {
          id,
          tenant_id: tenantId,
          name: agentData.name,
          platform: agentData.platform,
          webhook_url: webhookUrl,
          allowed_events: allowedEvents,
          permissions,
          status: agentData.status || 'active',
          created_by: agentData.created_by || null
        }
      });

      return (await agentDbService.getAgent(id)) as Agent;
    } catch (error: any) {
      console.error('Register Agent Error:', error.message);
      throw new Error(`Agentni ro'yxatdan o'tkazishda xatolik: ${error.message}`);
    }
  },

  getAgent: async (id: string): Promise<Agent | null> => {
    try {
      const agent = await prisma.agent.findFirst({
        where: { id, deleted_at: null }
      });
      if (agent) {
        const allowed_events = JSON.parse((agent as any).allowed_events || '[]');
        const permissions = JSON.parse((agent as any).permissions || '[]');
        return {
          ...agent,
          allowed_events,
          events: allowed_events,
          permissions,
          webhookUrl: (agent as any).webhook_url,
          createdAt: (agent as any).created_at,
          lastActivity: 'Noma\'lum'
        } as any;
      }
      return null;
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
      const webhookUrl = data.webhook_url || data.webhookUrl || (current as any).webhook_url;

      const updateData: any = {
        allowed_events: allowedEvents,
        permissions
      };
      if (data.name) updateData.name = data.name;
      if (data.platform) updateData.platform = data.platform;
      if (webhookUrl !== undefined) updateData.webhook_url = webhookUrl;
      if (data.status) updateData.status = data.status;

      await prisma.agent.update({
        where: { id },
        data: updateData
      });

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
      await prisma.agent.update({
        where: { id },
        data: { deleted_at: new Date() }
      });
    } catch (error: any) {
      console.error('Delete Agent Error:', error.message);
      throw error;
    }
  }
};
