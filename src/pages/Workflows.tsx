import React, { useState } from 'react';
import { Network, Sparkles, Store, Activity, Plus, Webhook, Bot, FileText } from 'lucide-react';
import WorkflowBuilder from './workflows/WorkflowBuilder';
import AIGenerator from './workflows/AIGenerator';
import Marketplace from './workflows/Marketplace';
import AgentMonitor from './workflows/AgentMonitor';
import AgentIntegrationPage from './settings/AgentIntegrationPage';
import FinancialReportWorkflow from './workflows/FinancialReportWorkflow';
import { useToast } from '../hooks/useToast';

export default function Workflows() {
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState('financial-report');

  const tabs = [
    { id: 'financial-report', label: 'Financial P&L Report', icon: FileText },
    { id: 'builder', label: 'Workflow Builder', icon: Network },
    { id: 'ai-gen', label: 'AI Auto-Generator', icon: Sparkles },
    { id: 'marketplace', label: 'Plugin Marketplace', icon: Store },
    { id: 'monitor', label: 'Agent Monitor', icon: Activity },
    { id: 'integrations', label: 'Agent Integrations', icon: Bot },
  ];

  return (
    <div className="flex-1 flex flex-col h-full font-sans bg-surface-ground transition-colors duration-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border-dark bg-surface-card flex justify-between items-center shrink-0 shadow-sm z-10">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Network className="w-6 h-6 text-brand-600" />
            Agent Ecosystem
          </h2>
          <p className="text-base text-text-muted mt-1">
            Enterprise-grade automation and agent orchestration platform.
          </p>
        </div>
        {activeTab === 'builder' && (
          <button 
            onClick={() => success("Yangi workflow yaratish oynasi ochilmoqda")}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-brand-500/20 text-base"
          >
            <Plus className="w-5 h-5" />
            New Workflow
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-2 bg-surface-card border-b border-border-dark shrink-0 z-10">
        <div className="flex gap-6 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-1 py-3 text-base font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-brand-600 border-brand-600'
                  : 'text-text-muted border-transparent hover:text-text-primary hover:border-border-dark'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-brand-600' : 'text-text-muted'}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-surface-ground">
        {activeTab === 'financial-report' && <div className="h-full overflow-y-auto"><FinancialReportWorkflow /></div>}
        {activeTab === 'builder' && <WorkflowBuilder />}
        {activeTab === 'ai-gen' && <div className="h-full overflow-y-auto"><AIGenerator /></div>}
        {activeTab === 'marketplace' && <div className="h-full overflow-y-auto"><Marketplace /></div>}
        {activeTab === 'monitor' && <div className="h-full overflow-y-auto"><AgentMonitor /></div>}
        {activeTab === 'integrations' && (
          <div className="h-full overflow-y-auto p-6">
            <AgentIntegrationPage />
          </div>
        )}
      </div>
    </div>
  );
}
