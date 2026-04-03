import React, { useState } from 'react';
import { Key, Copy, Check, Trash2, Plus, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useToast } from '../../hooks/useToast';

export default function TokenManager() {
  const { success, toast: customToast } = useToast();
  const [tokens, setTokens] = useState([
    { id: 1, name: 'n8n Production Token', token: 'aibos_prod_8f92a...3b1', created: '2023-10-25', lastUsed: '2 mins ago', status: 'active' },
    { id: 2, name: 'Zapier Staging Token', token: 'aibos_stg_1a2b3...4c5', created: '2023-11-02', lastUsed: '1 day ago', status: 'active' },
    { id: 3, name: 'Custom HR Agent Token', token: 'aibos_dev_9d8e7...6f5', created: '2023-11-15', lastUsed: 'Just now', status: 'active' },
  ]);

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    success("Token nusxalandi");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: number) => {
    // Using customToast for confirmation
    customToast({
      type: 'warning',
      title: "Tokenni bekor qilishni tasdiqlaysizmi?",
      action: {
        label: "Bekor qilish",
        onClick: () => {
          setTokens(tokens.filter(t => t.id !== id));
          success("Token muvaffaqiyatli bekor qilindi");
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 flex justify-between items-center">
        <div>
          <h4 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-600" />
            API Tokens
          </h4>
          <p className="text-base text-text-muted">
            Manage tokens used by external agents to authenticate requests to AI-BOS.
          </p>
        </div>
        <button className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 font-medium shadow-sm whitespace-nowrap text-base">
          <Plus className="w-4 h-4" />
          Generate Token
        </button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-ground">
              <tr className="border-b border-border-dark text-base font-semibold text-text-muted uppercase tracking-wider">
                <th className="py-3 px-6">Token Name</th>
                <th className="py-3 px-6">Token</th>
                <th className="py-3 px-6">Created</th>
                <th className="py-3 px-6">Last Used</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-base divide-y divide-border-dark">
              {tokens.map((token) => (
                <tr key={token.id} className="hover:bg-surface-ground transition-colors">
                  <td className="py-4 px-6 font-medium text-text-primary">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${token.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {token.name}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <code className="bg-surface-ground px-2 py-1 rounded text-base font-mono text-text-secondary border border-border-dark">
                        {token.token}
                      </code>
                      <button 
                        onClick={() => handleCopy(token.id, token.token)}
                        className="text-text-muted hover:text-brand-600 transition-colors"
                        title="Copy Token"
                      >
                        {copiedId === token.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-secondary">{token.created}</td>
                  <td className="py-4 px-6 text-text-secondary">{token.lastUsed}</td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleDelete(token.id)}
                      className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Revoke Token"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {tokens.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    No active tokens found. Generate a new token to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-5 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="text-base font-bold text-red-800 dark:text-red-400 mb-1">Security Warning</h5>
          <p className="text-base text-red-700 dark:text-red-500/80 leading-relaxed">
            Tokens provide full access to the AI-BOS integration API based on their configured permissions. 
            Treat them like passwords. Never commit tokens to version control or share them in insecure channels.
            If you suspect a token has been compromised, revoke it immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
