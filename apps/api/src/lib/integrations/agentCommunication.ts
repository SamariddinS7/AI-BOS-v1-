import prisma from '../db/prisma.js';

export class AgentCommunication {
  static async sendMessage(fromAgent: string, toAgent: string, payload: any) {
    // In a real system, this might be a message queue or a direct API call
    // For now, we log it as an inter-agent communication event
    
    console.log(`[AgentComm] ${fromAgent} -> ${toAgent}:`, payload);
    
    await prisma.integrationLog.create({
      data: {
        tenant_id: 'default',
        integration_id: `agent-${fromAgent}`,
        type: 'agent_comm',
        action: `to_${toAgent}`,
        status: 'success',
        response_time: 0,
        payload: JSON.stringify({ from: fromAgent, to: toAgent, payload }),
      }
    });
    
    return { success: true, message: 'Message delivered' };
  }
}
