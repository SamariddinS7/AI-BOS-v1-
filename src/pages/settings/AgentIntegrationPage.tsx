import React, { useState, useEffect } from 'react';
import { Plus, Webhook, Activity, ShieldAlert, Key, Link as LinkIcon, Loader2 } from 'lucide-react';
import AgentCard from './AgentCard';
import WebhookConfig from './WebhookConfig';
import TokenManager from './TokenManager';
import AgentLogsViewer from './AgentLogsViewer';
import AddAgentForm from './AddAgentForm';
import { agentService, Agent } from '../../services/agentService';
import Card from '../../components/ui/Card';

export default function AgentIntegrationPage() {
  const [activeSubTab, setActiveSubTab] = useState('agents');
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const data = await agentService.getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'agents' && !isAddingAgent) {
      fetchAgents();
    }
  }, [activeSubTab, isAddingAgent]);

  const subTabs = [
    { id: 'agents', label: 'Connected Agents', icon: Webhook },
    { id: 'webhooks', label: 'Event Mapping', icon: LinkIcon },
    { id: 'tokens', label: 'API Tokens', icon: Key },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-text-primary">Agent Integrations</h3>
          <p className="text-base text-text-muted mt-1">
            Manage secure webhook connections to external automation platforms.
          </p>
        </div>
        {activeSubTab === 'agents' && !isAddingAgent && (
          <button 
            onClick={() => setIsAddingAgent(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-base font-medium shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New Agent
          </button>
        )}
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-2 border-b border-border-dark mb-6 overflow-x-auto custom-scrollbar pb-1">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-base font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-500/5/50 dark:bg-brand-900/10'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-ground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeSubTab === 'agents' && (
          isAddingAgent ? (
            <AddAgentForm onCancel={() => setIsAddingAgent(false)} />
          ) : (
            isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {agents.map(agent => (
                  <AgentCard 
                    key={agent.id}
                    name={agent.name} 
                    type={agent.platform} 
                    status={agent.status} 
                    lastActivity={agent.lastActivity}
                    events={agent.events}
                  />
                ))}
              </div>
            )
          )
        )}

        {activeSubTab === 'webhooks' && <WebhookConfig />}
        {activeSubTab === 'tokens' && <TokenManager />}
        {activeSubTab === 'logs' && <AgentLogsViewer />}
      </div>
    </div>
  );
}
