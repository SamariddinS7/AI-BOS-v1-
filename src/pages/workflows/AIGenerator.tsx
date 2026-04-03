import React, { useState } from 'react';
import { Sparkles, Code, Play, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function AIGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedWorkflow({
        name: "ROI Optimization Workflow",
        description: "Automatically monitors ROI and adjusts marketing budget while notifying the team.",
        nodes: [
          { id: 'trigger_1', type: 'Marketing Event', config: { metric: 'ROI', condition: '<', value: 20 } },
          { id: 'action_1', type: 'Notify Team', config: { channel: 'marketing-alerts', message: 'ROI dropped below 20%' } },
          { id: 'action_2', type: 'Adjust Budget', config: { platform: 'Google Ads', action: 'reduce', percentage: 10 } }
        ],
        permissions: ['marketing.read', 'marketing.write', 'notifications.send'],
        securityCheck: 'passed'
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          AI-Powered Workflow Generator
        </h3>
        <p className="text-text-secondary mt-2">
          Describe the automation you need in natural language, and AI-BOS will generate a secure, production-ready workflow graph.
        </p>
      </div>

      <Card className="p-6 mb-8">
        <label className="block text-base font-bold text-text-primary mb-2">
          What do you want to automate?
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., When ROI drops below 20%, notify marketing and reduce Google Ads budget by 10%."
            className="w-full h-32 px-4 py-3 bg-surface-ground border border-border-dark rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-text-primary resize-none placeholder-text-muted text-base"
          ></textarea>
          <button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="absolute bottom-4 right-4 px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {isGenerating ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generate Workflow</>
            )}
          </button>
        </div>
      </Card>

      {generatedWorkflow && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-lg font-bold text-text-primary">{generatedWorkflow.name}</h4>
                  <p className="text-base text-text-muted mt-1">{generatedWorkflow.description}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-base font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Ready to Deploy
                </span>
              </div>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-dark before:to-transparent">
                {generatedWorkflow.nodes.map((node: any, idx: number) => (
                  <div key={node.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-card bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface-ground p-4 rounded-xl border border-border-dark shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-text-primary text-base">{node.type}</h5>
                      </div>
                      <pre className="text-base text-text-secondary font-mono bg-surface-card p-2 rounded border border-border-dark mt-2 overflow-x-auto">
                        {JSON.stringify(node.config, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="font-bold text-text-primary mb-4 flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5 text-yellow-500" /> Security & Governance
              </h4>
              <div className="space-y-4">
                <div>
                  <span className="text-base font-bold text-text-muted uppercase tracking-wider block mb-2">Required Permissions</span>
                  <div className="flex flex-wrap gap-2">
                    {generatedWorkflow.permissions.map((perm: string) => (
                      <span key={perm} className="px-2 py-1 bg-surface-ground text-text-secondary rounded text-base font-mono border border-border-dark">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg">
                  <p className="text-base text-green-700 dark:text-green-400 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Guardrails Passed
                  </p>
                  <p className="text-base text-green-600 dark:text-green-500/80 mt-1">
                    This workflow does not violate any financial limits or RBAC policies.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-text-primary mb-4 text-base">Actions</h4>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm text-base">
                  <Play className="w-5 h-5" /> Deploy Workflow
                </button>
                <button className="w-full px-4 py-2 bg-surface-ground text-text-primary border border-border-dark rounded-lg hover:bg-surface-ground/80 transition-colors flex items-center justify-center gap-2 font-medium text-base">
                  <Code className="w-5 h-5" /> Open in Builder
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
