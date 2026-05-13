import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Sparkles, ShieldCheck, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { safeJson } from '../lib/utils';

interface Skill {
  type: string;
  name: string;
  description: string;
  risk: string;
}

export default function AISkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeTab, setActiveTab] = useState<'skills' | 'approvals'>('skills');
  const [executing, setExecuting] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const { success, error, info } = useToast();

  useEffect(() => {
    fetch('/api/skills/available', {
      headers: { 'Authorization': `Bearer ${import.meta.env.VITE_APP_AUTH_TOKEN}` }
    })
      .then(r => r.json())
      .then(d => setSkills(d.skills || []))
      .catch(e => console.error("Could not fetch skills", e));
  }, []);

  const handleExecute = async (skill: Skill) => {
    setExecuting(skill.type);
    try {
      const res = await fetch('/api/skills/execute', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_APP_AUTH_TOKEN}`
        },
        body: JSON.stringify({
          skill_type: skill.type,
          parameters: { target: 'market-a' } // mock param
        })
      });
      const data = await res.json();
      
      if (data.status === 'pending_approval') {
        info(`Approval required. Workflow ID: ${data.approval_workflow_id}`);
        setResults(prev => [{ ...data, skill_name: skill.name }, ...prev]);
      } else if (data.status === 'completed') {
        success(`Execution completed. Confidence: ${(data.confidence * 100).toFixed(0)}%`);
        setResults(prev => [{ ...data, skill_name: skill.name }, ...prev]);
      } else {
        error('Execution failed');
      }
    } catch (err: any) {
      error(`Error: ${err.message}`);
    } finally {
      setExecuting(null);
    }
  };

  const handleApprove = async (workflowId: string, decision: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/skills/approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_APP_AUTH_TOKEN}`
        },
        body: JSON.stringify({ workflow_id: workflowId, decision })
      });
      const data = await res.json();
      if (data.status === 'approved') {
        success('Approval submitted, skill executed!');
      } else {
        info('Skill execution rejected.');
      }
      
      // Update local state to hide or mark completed
      setResults(prev => prev.map(r => r.approval_workflow_id === workflowId ? { ...r, status: decision } : r));
    } catch (err) {
      error("Action failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-500" />
            AI Skills & CalcusAgent Workspace
          </h2>
          <p className="text-text-secondary">Execute marketing skills with Decision Protocol and Validation Engine.</p>
        </div>
        <div className="flex bg-surface-ground p-1 rounded-lg border border-border-dark">
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${activeTab === 'skills' ? 'bg-brand-600 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            Available Skills
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${activeTab === 'approvals' ? 'bg-brand-600 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            Approvals & History
          </button>
        </div>
      </div>

      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map(skill => (
            <Card key={skill.type} className="p-6 flex flex-col h-full bg-surface-card border-border-dark hover:border-brand-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand-500/10 rounded-xl">
                  {skill.risk === 'low' && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {skill.risk === 'medium' && <Clock className="w-6 h-6 text-yellow-500" />}
                  {(skill.risk === 'high' || skill.risk === 'critical') && <ShieldCheck className="w-6 h-6 text-rose-500" />}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded border ${
                  skill.risk === 'low' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  skill.risk === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {skill.risk.toUpperCase()} RISK
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{skill.name}</h3>
              <p className="text-sm text-text-secondary mb-6 flex-grow">{skill.description}</p>
              
              <button
                disabled={executing === skill.type}
                onClick={() => handleExecute(skill)}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {executing === skill.type ? 'Executing...' : 'Execute Skill'}
              </button>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-12 text-text-muted">No execution history yet.</div>
          ) : (
            results.map((req, idx) => (
              <Card key={idx} className="p-4 border-l-4 border-l-brand-500">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-white text-lg">{req.skill_name || req.skill_type}</h4>
                    <p className="text-sm text-text-secondary">Status: <span className="font-mono text-xs ml-1 py-0.5 px-1.5 bg-surface-ground rounded">{req.status}</span></p>
                    {req.confidence && (
                      <p className="text-sm text-text-secondary mt-1">Validation Score: <span className="text-green-400">{(req.confidence * 100).toFixed(1)}%</span></p>
                    )}
                  </div>
                  {req.status === 'pending_approval' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(req.approval_workflow_id, 'approved')} className="px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-600/30 rounded hover:bg-green-600/30">Approve</button>
                      <button onClick={() => handleApprove(req.approval_workflow_id, 'rejected')} className="px-3 py-1.5 bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded hover:bg-rose-600/30">Reject</button>
                    </div>
                  )}
                  {req.status === 'completed' && (
                     <div className="px-3 py-1.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded">
                       Completed
                     </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
