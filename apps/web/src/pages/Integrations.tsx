import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { 
  Globe, 
  Webhook, 
  Puzzle, 
  Activity, 
  Shield, 
  Book, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Key, 
  Cpu,
  ArrowRightLeft,
  LayoutGrid,
  Zap,
  Code,
  Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import { safeJson } from '../lib/utils';

// --- Sub-components ---

export const Marketplace = () => {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { info } = useToast();

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const response = await fetch('/api/integrations/plugins');
      if (response.ok) {
        const data = await safeJson<any>(response);
        setPlugins(data);
      }
    } catch (error) {
      console.error('Error fetching plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlugin = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setPlugins(plugins.map(p => p.id === id ? { ...p, status: newStatus } : p));
    info(`${newStatus === 'active' ? 'Plugin yoqildi' : 'Plugin o\'chirildi'}`);
    
    try {
      await fetch(`/api/integrations/plugins/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Error toggling plugin:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Plugin Marketplace</h3>
          <p className="text-base text-text-muted">Extend AI-BOS with third-party integrations</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search plugins..." 
            className="pl-10 pr-4 py-2 bg-surface-ground border border-border-dark rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-brand-500 text-text-primary placeholder-text-muted"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin, index) => (
          <Card key={plugin.id || `plugin-${index}`} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-500/10 rounded-xl">
                <Puzzle className="w-6 h-6 text-brand-500" />
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${plugin.status === 'active' ? 'bg-emerald-500' : 'bg-text-muted'}`} />
                <span className="text-base font-medium text-text-secondary">
                  {plugin.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <h4 className="font-bold mb-1 text-text-primary">{plugin.name}</h4>
            <p className="text-base text-text-secondary mb-4 line-clamp-2">{plugin.description}</p>
            <div className="flex items-center justify-between text-base text-text-muted mb-4">
              <span>v{plugin.version}</span>
              <span>By {plugin.author}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-text-secondary">
                {plugin.status === 'active' ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={() => togglePlugin(plugin.id, plugin.status)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  plugin.status === 'active' ? 'bg-emerald-600' : 'bg-surface-ground border border-border-dark'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    plugin.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const Webhooks = () => {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { success, info, error } = useToast();

  const [newWebhook, setNewWebhook] = useState({ event_type: 'team.message', target_url: '', secret: '' });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/integrations/webhooks');
      if (response.ok) {
        const data = await safeJson<any>(response);
        setWebhooks(data);
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    }
  };

  const addWebhook = async () => {
    try {
      const response = await fetch('/api/integrations/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebhook)
      });
      if (response.ok) {
        success("Webhook qo'shildi!");
        setShowAdd(false);
        fetchWebhooks();
        setNewWebhook({ event_type: 'team.message', target_url: '', secret: '' });
      } else {
        error("Xatolik yuz berdi");
      }
    } catch (err) {
      error("Xatolik");
    }
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    success("Webhook muvaffaqiyatli o'chirildi");
  };

  const testWebhook = async (id: string) => {
    // ... no changes to testWebhook below, just replacing above
    setIsTesting(true);
    info("Test yuborilmoqda...");
    try {
      const response = await fetch(`/api/integrations/webhooks/${id}/test`, {
        method: 'POST'
      });
      if (response.ok) {
        success("Test muvaffaqiyatli yuborildi");
      } else {
        error("Test yuborishda xatolik yuz berdi");
      }
    } catch (err) {
      error("Xatolik: " + err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Webhook Subscriptions</h3>
          <p className="text-base text-text-muted">Receive real-time updates in your external systems</p>
        </div>
        <button 
          onClick={() => {
            setShowAdd(true);
            info("Yangi webhook qo'shish oynasi ochilmoqda...");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      <Card className="overflow-hidden">
        {showAdd && (
          <div className="p-6 bg-surface-ground border-b border-border-dark space-y-4">
            <h4 className="font-bold text-text-primary">Add New Webhook</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Event Type</label>
                <input 
                  type="text" 
                  value={newWebhook.event_type}
                  onChange={e => setNewWebhook({...newWebhook, event_type: e.target.value})}
                  className="w-full px-3 py-2 bg-surface-card border border-border-dark rounded-lg text-text-primary focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="e.g. team.message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Target URL</label>
                <input 
                  type="text" 
                  value={newWebhook.target_url}
                  onChange={e => setNewWebhook({...newWebhook, target_url: e.target.value})}
                  className="w-full px-3 py-2 bg-surface-card border border-border-dark rounded-lg text-text-primary focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="https://api.enginelabs.ai/webhooks/..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">Secret (Optional for HMAC SHA256)</label>
                <input 
                  type="text" 
                  value={newWebhook.secret}
                  onChange={e => setNewWebhook({...newWebhook, secret: e.target.value})}
                  className="w-full px-3 py-2 bg-surface-card border border-border-dark rounded-lg text-text-primary focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="your-webhook-secret"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 bg-surface-ground border border-border-dark text-text-secondary rounded-lg hover:bg-surface-card transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={addWebhook}
                disabled={!newWebhook.target_url}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}
        <table className="w-full text-left">
          <thead className="bg-surface-ground border-b border-border-dark">
            <tr>
              <th className="px-6 py-4 text-base font-bold text-text-muted uppercase">Event Type</th>
              <th className="px-6 py-4 text-base font-bold text-text-muted uppercase">Target URL</th>
              <th className="px-6 py-4 text-base font-bold text-text-muted uppercase">Status</th>
              <th className="px-6 py-4 text-base font-bold text-text-muted uppercase">Created</th>
              <th className="px-6 py-4 text-base font-bold text-text-muted uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {webhooks.map((webhook, index) => (
              <tr key={webhook.id || `webhook-${index}`} className="hover:bg-surface-ground/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-brand-500/10 text-brand-500 rounded text-base font-mono">
                    {webhook.event_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-base text-text-secondary truncate max-w-xs">{webhook.target_url}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-base text-emerald-500">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-base text-text-muted">{new Date(webhook.created_at || Date.now()).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => testWebhook(webhook.id)}
                    disabled={isTesting}
                    className="p-2 text-text-muted hover:text-brand-600 transition-colors mr-2 disabled:opacity-50"
                    title="Send Test"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteWebhook(webhook.id)}
                    className="p-2 text-text-muted hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export const GatewayMonitoring = () => {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const { success, info } = useToast();

  useEffect(() => {
    fetchGatewayData();
  }, []);

  const fetchGatewayData = async () => {
    try {
      const [statsRes, keysRes] = await Promise.all([
        fetch('/api/integrations/gateway/stats'),
        fetch('/api/integrations/api-keys')
      ]);
      
      if (statsRes.ok) {
        const data = await safeJson<any>(statsRes);
        setStats(data.stats);
        setLogs(data.recentLogs);
      }
      
      if (keysRes.ok) {
        const keysData = await safeJson<any>(keysRes);
        setApiKeys(keysData);
      }
    } catch (error) {
      console.error('Error fetching gateway data:', error);
    }
  };

  const createApiKey = () => {
    const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedKey(newKey);
    setApiKeys([...apiKeys, { id: Date.now(), name: newKeyName, scopes: '["read", "write"]', status: 'active', created_at: new Date().toISOString() }]);
    setNewKeyName('');
    success("Yangi API kaliti yaratildi");
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-brand-500" />
            </div>
            <span className="text-base text-text-muted">Total Requests</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats?.total_requests || 0}</p>
          <p className="text-base text-emerald-500 mt-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Live monitoring active
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-base text-text-muted">Avg. Latency</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{Math.round(stats?.avg_latency || 0)}ms</p>
          <p className="text-base text-text-muted mt-2">Global average</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-base text-text-muted">Failed Requests</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats?.error_count || 0}</p>
          <p className="text-base text-rose-500 mt-2">0.5% error rate</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border-dark flex justify-between items-center">
          <div>
            <h3 className="font-bold text-text-primary">API Keys</h3>
            <p className="text-base text-text-muted">Manage keys for external API access</p>
          </div>
          <button 
            onClick={() => setShowNewKey(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-base font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Generate New Key
          </button>
        </div>
        
        {showNewKey && (
          <div className="p-6 bg-brand-500/5/50 bg-brand-500/5 border-b border-border-dark">
            {!generatedKey ? (
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key Name (e.g. Mobile App)"
                  className="flex-1 px-4 py-2 bg-surface-ground border border-border-dark rounded-lg text-base text-text-primary outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button 
                  onClick={createApiKey}
                  className="px-6 py-2 bg-brand-600 text-white rounded-lg text-base font-medium hover:bg-brand-700 shadow-lg shadow-brand-600/20"
                >
                  Generate
                </button>
                <button 
                  onClick={() => setShowNewKey(false)}
                  className="px-4 py-2 text-text-muted text-base hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-base text-emerald-400 mb-2 font-bold uppercase">Key Generated Successfully</p>
                  <p className="text-base text-text-secondary mb-4">Copy this key now. You won't be able to see it again.</p>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2 bg-surface-ground rounded border border-border-dark font-mono text-base break-all text-text-primary">
                      {generatedKey}
                    </code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedKey);
                        success('Key copied to clipboard');
                      }}
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-base hover:bg-emerald-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowNewKey(false);
                    setGeneratedKey(null);
                  }}
                  className="text-base text-brand-600 font-medium hover:underline"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-ground">
              <tr>
                <th className="px-6 py-3 text-base font-bold text-text-muted uppercase">Name</th>
                <th className="px-6 py-3 text-base font-bold text-text-muted uppercase">Scopes</th>
                <th className="px-6 py-3 text-base font-bold text-text-muted uppercase">Status</th>
                <th className="px-6 py-3 text-base font-bold text-text-muted uppercase">Created</th>
                <th className="px-6 py-3 text-base font-bold text-text-muted uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {apiKeys.map((key, index) => (
                <tr key={key.id || `key-${index}`} className="text-base hover:bg-surface-ground/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary">{key.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {JSON.parse(key.scopes || '[]').map((s: string, idx: number) => (
                        <span key={`${s}-${idx}`} className="px-1.5 py-0.5 bg-surface-ground rounded text-base font-mono text-text-secondary border border-border-dark">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-base font-bold uppercase">
                      {key.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-base text-text-muted">
                    {new Date(key.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setApiKeys(apiKeys.filter(k => k.id !== key.id));
                        success("API kaliti bekor qilindi");
                      }}
                      className="text-text-muted hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border-dark flex justify-between items-center">
          <h3 className="font-bold text-text-primary">Recent Traffic Logs</h3>
          <button 
            onClick={() => info("Barcha loglar yuklanmoqda...")}
            className="text-base text-brand-600 hover:underline"
          >
            View all logs
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-ground">
              <tr>
                <th className="px-6 py-3 text-base font-bold text-text-muted uppercase">Timestamp</th>
                <th className="px-6 py-3 text-base font-bold text-text-muted uppercase">Type</th>
                <th className="px-6 py-3 text-base font-bold text-text-muted uppercase">Action</th>
                <th className="px-6 py-3 text-base font-bold text-text-muted uppercase">Latency</th>
                <th className="px-6 py-3 text-base font-bold text-text-muted uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {logs.map((log, index) => (
                <tr key={log.id || `log-${index}`} className="text-base hover:bg-surface-ground/50 transition-colors">
                  <td className="px-6 py-3 text-text-muted font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-3 uppercase font-bold text-base text-text-secondary">{log.type}</td>
                  <td className="px-6 py-3 text-text-secondary">{log.action}</td>
                  <td className="px-6 py-3 text-text-muted">{log.response_time}ms</td>
                  <td className="px-6 py-3">
                    <span className={`px-1.5 py-0.5 rounded-full text-base font-bold uppercase ${
                      log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export const ApiDocumentation = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 space-y-2">
        <h4 className="text-base font-bold text-text-muted uppercase mb-4 px-3">Documentation</h4>
        <button className="w-full text-left px-3 py-2 text-base bg-brand-500/10 text-brand-600 rounded-lg font-medium">Introduction</button>
        <button className="w-full text-left px-3 py-2 text-base text-text-secondary hover:bg-surface-ground rounded-lg transition-colors">Authentication</button>
        <button className="w-full text-left px-3 py-2 text-base text-text-secondary hover:bg-surface-ground rounded-lg transition-colors">Rate Limiting</button>
        <button className="w-full text-left px-3 py-2 text-base text-text-secondary hover:bg-surface-ground rounded-lg transition-colors">Webhooks</button>
        <h4 className="text-base font-bold text-text-muted uppercase mt-8 mb-4 px-3">Resources</h4>
        <button className="w-full text-left px-3 py-2 text-base text-text-secondary hover:bg-surface-ground rounded-lg transition-colors">Customers API</button>
        <button className="w-full text-left px-3 py-2 text-base text-text-secondary hover:bg-surface-ground rounded-lg transition-colors">Workflows API</button>
        <button className="w-full text-left px-3 py-2 text-base text-text-secondary hover:bg-surface-ground rounded-lg transition-colors">Analytics API</button>
      </div>
      <div className="lg:col-span-3 space-y-8">
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4 text-text-primary">Introduction</h2>
          <p className="text-text-secondary">
            Welcome to the AI-BOS Platform API. Our API is organized around REST. 
            Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, 
            returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
          </p>
          
          <div className="my-8 p-6 bg-gray-900 rounded-xl border border-gray-800 font-mono text-base text-gray-300">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-green-600 text-white rounded text-base font-bold">GET</span>
              <span className="text-gray-500">https://api.ai-bos.com/v1/customers</span>
            </div>
            <div className="text-blue-400">// Example Request</div>
            <div>curl -X GET "https://api.ai-bos.com/v1/customers" \</div>
            <div className="pl-4">-H "Authorization: Bearer YOUR_API_KEY"</div>
          </div>

          <h3 className="text-xl font-bold mb-4 text-text-primary">Base URL</h3>
          <p className="text-text-secondary">All API requests should be made to:</p>
          <code className="px-2 py-1 bg-surface-ground rounded text-brand-600 border border-border-dark">https://api.ai-bos.com/v1</code>
        </div>
      </div>
    </div>
  );
};

export const DataMapping = () => {
  const { info, success } = useToast();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Data Transformation</h3>
          <p className="text-base text-text-muted">Map external data formats to AI-BOS internal structures</p>
        </div>
        <button 
          onClick={() => info("Yangi ma'lumotlar xaritasi yaratish...")}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          New Mapping
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <ArrowRightLeft className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-bold text-text-primary">Salesforce CRM &rarr; AI-BOS</h4>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-base">
              <span className="text-text-muted font-mono">sf_account_id</span>
              <Puzzle className="w-3 h-3 text-text-muted" />
              <span className="text-brand-600 font-mono">customer_id</span>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-text-muted font-mono">company_name</span>
              <Puzzle className="w-3 h-3 text-text-muted" />
              <span className="text-brand-600 font-mono">company</span>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-text-muted font-mono">primary_contact_email</span>
              <Puzzle className="w-3 h-3 text-text-muted" />
              <span className="text-brand-600 font-mono">email</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => info("Mapping qoidalari tahrirlanmoqda...")}
              className="flex-1 py-2 text-base font-medium border border-border-dark rounded-lg hover:bg-surface-ground transition-colors text-text-secondary"
            >
              Edit Rules
            </button>
            <button 
              onClick={() => success("Mapping o'chirildi")}
              className="p-2 text-text-muted hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const CloudIntegrations = () => {
  const { success } = useToast();
  const [activeCloud, setActiveCloud] = useState('database');

  const cloudConfigs = [
    { id: 'database', name: 'Database & Storage' },
    { id: 'ai', name: 'Cloud AI Models' },
    { id: 'monitoring', name: 'Monitoring & CI/CD' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Cloud Platform Integration</h3>
          <p className="text-base text-text-muted">Connect external cloud resources to the AI-BOS platform</p>
        </div>
        <div className="flex bg-surface-ground p-1 rounded-lg border border-border-dark">
          {cloudConfigs.map(c => (
             <button
               key={c.id}
               onClick={() => setActiveCloud(c.id)}
               className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${activeCloud === c.id ? 'bg-brand-600 text-white' : 'text-text-secondary hover:text-white'}`}
             >
               {c.name}
             </button>
          ))}
        </div>
      </div>

      {activeCloud === 'database' && (
        <Card className="p-6">
           <h4 className="font-bold text-text-primary mb-4">PostgreSQL & Cloud Storage</h4>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-text-secondary mb-1">DATABASE_URL (AWS RDS / GCP Cloud SQL)</label>
               <input type="text" placeholder="postgresql://user:pass@host:5432/db" className="w-full px-3 py-2 bg-surface-card border border-border-dark rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500" />
             </div>
             <div>
               <label className="block text-sm font-medium text-text-secondary mb-1">CLOUD_STORAGE_URL (AWS S3 / Supabase)</label>
               <input type="text" placeholder="https://your-bucket-url.s3.amazonaws.com" className="w-full px-3 py-2 bg-surface-card border border-border-dark rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500" />
             </div>
             <button onClick={() => success("Cloud Database settings saved")} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Save Configuration</button>
           </div>
        </Card>
      )}

      {activeCloud === 'ai' && (
        <Card className="p-6">
           <h4 className="font-bold text-text-primary mb-4">AI Model APIs</h4>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-text-secondary mb-1">AI_API_KEY (OpenAI / Vertex AI / Gemini)</label>
               <input type="password" placeholder="sk-..." className="w-full px-3 py-2 bg-surface-card border border-border-dark rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500" />
             </div>
             <div>
               <label className="block text-sm font-medium text-text-secondary mb-1">Vector DB URL (Pinecone / Weaviate)</label>
               <input type="text" placeholder="https://your-index.svc.pinecone.io" className="w-full px-3 py-2 bg-surface-card border border-border-dark rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500" />
             </div>
             <button onClick={() => success("AI Cloud settings saved")} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Save API Keys</button>
           </div>
        </Card>
      )}

      {activeCloud === 'monitoring' && (
        <Card className="p-6">
           <h4 className="font-bold text-text-primary mb-4">Cloud Dashboards & CI/CD</h4>
           <p className="text-text-secondary mb-4">Integrate CloudWatch, Datadog or Sentry for tracking agent execution and detecting system errors.</p>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-text-secondary mb-1">Monitoring Dashboard URL</label>
               <input type="text" placeholder="https://grafana.cloud.com/your-dashboard" className="w-full px-3 py-2 bg-surface-card border border-border-dark rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500" />
             </div>
             <button onClick={() => window.open('https://github.com/features/actions', '_blank')} className="px-4 py-2 border border-border-dark text-text-secondary rounded-lg hover:bg-surface-ground">Configure GitHub Actions Deploy</button>
           </div>
        </Card>
      )}
    </div>
  );
};

// --- Main Integrations Page ---

export default function Integrations() {
  const [activeTab, setActiveTab] = useState('marketplace');

  const tabs = [
    { id: 'marketplace', label: 'Marketplace', icon: LayoutGrid },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'gateway', label: 'API Gateway', icon: Shield },
    { id: 'cloud', label: 'Cloud Services', icon: Cloud },
    { id: 'mapping', label: 'Data Mapping', icon: ArrowRightLeft },
    { id: 'docs', label: 'API Documentation', icon: Book },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'marketplace': return <Marketplace />;
      case 'webhooks': return <Webhooks />;
      case 'gateway': return <GatewayMonitoring />;
      case 'cloud': return <CloudIntegrations />;
      case 'mapping': return <DataMapping />;
      case 'docs': return <ApiDocumentation />;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-text-primary">Ecosystem Platform</h1>
          <p className="text-text-muted">Manage integrations, plugins, and external communications</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-surface-ground rounded-xl border border-border-dark">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-surface-card text-brand-600 shadow-sm' 
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
