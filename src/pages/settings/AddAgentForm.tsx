import React, { useState } from 'react';
import { ArrowLeft, Save, ShieldAlert, Loader2 } from 'lucide-react';
import { agentService } from '../../services/agentService';
import Card from '../../components/ui/Card';

interface AddAgentFormProps {
  onCancel: () => void;
}

export default function AddAgentForm({ onCancel }: AddAgentFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    platform: 'n8n',
    webhookUrl: '',
    events: [] as string[],
    permissions: [] as string[],
  });

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlError('');
      return;
    }
    try {
      new URL(url);
      setUrlError('');
    } catch (e) {
      setUrlError('Please enter a valid URL (e.g., https://example.com/webhook)');
    }
  };

  const availableEvents = [
    'marketing.update',
    'finance.report_ready',
    'crm.new_lead',
    'hr.kpi_update',
  ];

  const availablePermissions = [
    'read:marketing',
    'write:marketing',
    'read:finance',
    'read:crm',
    'write:crm',
    'read:hr',
  ];

  const handleEventToggle = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const handlePermissionToggle = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  return (
    <Card className="p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border-dark">
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-surface-ground rounded-lg transition-colors text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h4 className="text-lg font-bold text-text-primary">Register New Agent</h4>
          <p className="text-base text-text-muted">Configure a new external automation agent connection.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-text-primary mb-2">Agent Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Marketing Automation Bot"
              className="w-full px-4 py-2.5 bg-surface-ground border border-border-dark rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all text-text-primary placeholder-text-muted"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-text-primary mb-2">Platform Type</label>
            <select 
              value={formData.platform}
              onChange={e => setFormData({...formData, platform: e.target.value})}
              className="w-full px-4 py-2.5 bg-surface-ground border border-border-dark rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all text-text-primary appearance-none"
            >
              <option value="n8n">n8n</option>
              <option value="Zapier">Zapier</option>
              <option value="Make">Make (Integromat)</option>
              <option value="Custom">Custom Agent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-base font-medium text-text-primary mb-2">Outbound Webhook URL</label>
          <input 
            type="url" 
            value={formData.webhookUrl}
            onChange={e => {
              const val = e.target.value;
              setFormData({...formData, webhookUrl: val});
              validateUrl(val);
            }}
            placeholder="https://your-agent-platform.com/webhook/..."
            className={`w-full px-4 py-2.5 bg-surface-ground border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all text-text-primary font-mono text-base ${
              urlError ? 'border-red-500 focus:ring-red-500' : 'border-border-dark'
            }`}
          />
          {urlError && <p className="text-base text-red-500 mt-1">{urlError}</p>}
          <p className="text-base text-text-muted mt-1">AI-BOS will send event payloads to this URL.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-text-primary mb-3">Allowed Events (Triggers)</label>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {availableEvents.map(event => (
                <label key={event} className="flex items-center gap-3 p-3 bg-surface-ground border border-border-dark rounded-lg cursor-pointer hover:bg-surface-ground/80 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.events.includes(event)}
                    onChange={() => handleEventToggle(event)}
                    className="w-4 h-4 text-brand-600 rounded border-border-dark focus:ring-brand-500"
                  />
                  <span className="text-base font-mono text-text-primary">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-text-primary mb-3">API Permissions (Scopes)</label>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {availablePermissions.map(perm => (
                <label key={perm} className="flex items-center gap-3 p-3 bg-surface-ground border border-border-dark rounded-lg cursor-pointer hover:bg-surface-ground/80 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.permissions.includes(perm)}
                    onChange={() => handlePermissionToggle(perm)}
                    className="w-4 h-4 text-brand-600 rounded border-border-dark focus:ring-brand-500"
                  />
                  <span className="text-base font-mono text-text-primary">{perm}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-base font-bold text-blue-800 dark:text-blue-400 mb-1">Security Note</h5>
            <p className="text-base text-blue-700 dark:text-blue-500/80 leading-relaxed">
              Upon registration, a unique API Token and HMAC Secret will be generated. You will only see the HMAC Secret once. Make sure to store it securely in your external platform.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-dark">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-base font-medium text-text-secondary hover:bg-surface-ground rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              setIsSaving(true);
              try {
                await agentService.registerAgent({
                  name: formData.name,
                  platform: formData.platform,
                  webhookUrl: formData.webhookUrl,
                  events: formData.events,
                  permissions: formData.permissions,
                });
                onCancel();
              } catch (error) {
                console.error('Failed to register agent:', error);
                alert('Failed to register agent');
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={!formData.name || !formData.webhookUrl || isSaving || !!urlError}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Register Agent
          </button>
        </div>
      </div>
    </Card>
  );
}
