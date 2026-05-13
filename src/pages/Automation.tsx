import React, { useState } from 'react';
import AISkills from './AISkills';
import AgentsPage from './Agents';
import APITesting from './APITesting';
import Workflows from './Workflows';
import { Bot, Sparkles, Shield, Network } from 'lucide-react';

export default function Automation() {
  const [activeTab, setActiveTab] = useState<'skills' | 'agents' | 'testing' | 'workflows'>('skills');

  const tabs = [
    { id: 'skills', label: 'AI Skills', icon: Sparkles },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'testing', label: 'API Testing', icon: Shield },
    { id: 'workflows', label: 'Ish Jarayonlari', icon: Network },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="border-b border-border-dark bg-surface-ground">
        <div className="flex items-center gap-6 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="text-brand-500 w-8 h-8"/>
            Avtomatlashtirish Markazi
          </h1>
          <div className="flex bg-surface-card p-1 rounded-lg border border-border-dark">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  activeTab === tab.id 
                    ? 'bg-brand-600 text-white' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'skills' && <AISkills />}
        {activeTab === 'agents' && <AgentsPage />}
        {activeTab === 'testing' && <APITesting />}
        {activeTab === 'workflows' && <Workflows />}
      </div>
    </div>
  );
}
