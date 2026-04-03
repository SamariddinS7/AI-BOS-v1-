import { describe, it, expect } from 'vitest';
import { agentService } from './agentService';

describe('agentService', () => {
  it('getAgents should return initial agents', async () => {
    const agents = await agentService.getAgents();
    expect(agents.length).toBeGreaterThan(0);
  });

  it('registerAgent should add a new agent', async () => {
    const newAgentData = {
      name: 'Test Agent',
      platform: 'Test',
      webhookUrl: 'http://test.com',
      events: [],
      permissions: [],
    };

    const agent = await agentService.registerAgent(newAgentData);
    expect(agent.id).toBeDefined();
    expect(agent.name).toBe(newAgentData.name);

    const agents = await agentService.getAgents();
    expect(agents).toContainEqual(agent);
  });

  it('updateAgentStatus should update status', async () => {
    const agents = await agentService.getAgents();
    const agentToUpdate = agents[0];
    const newStatus = agentToUpdate.status === 'active' ? 'paused' : 'active';

    const updatedAgent = await agentService.updateAgentStatus(agentToUpdate.id, newStatus);
    expect(updatedAgent.status).toBe(newStatus);
  });

  it('deleteAgent should remove an agent', async () => {
    const agentsBefore = await agentService.getAgents();
    const agentToDelete = agentsBefore[0];

    await agentService.deleteAgent(agentToDelete.id);

    const agentsAfter = await agentService.getAgents();
    expect(agentsAfter.find(a => a.id === agentToDelete.id)).toBeUndefined();
  });
});
