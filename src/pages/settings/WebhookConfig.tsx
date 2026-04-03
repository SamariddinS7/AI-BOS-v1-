import React, { useState } from 'react';
import { Link as LinkIcon, Check, Copy, ShieldAlert } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useToast } from '../../hooks/useToast';

export default function WebhookConfig() {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const webhookUrl = 'https://api.ai-bos.com/v1/webhooks/inbound/agent-12345';

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    success("Webhook URL nusxalandi");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-brand-600" />
          Inbound Webhook Configuration
        </h4>
        <p className="text-base text-text-secondary mb-6">
          Use this URL to send events from your external agents (n8n, Zapier, etc.) to AI-BOS.
          All requests must include the `Authorization: Bearer {'<token>'}` header and a valid HMAC signature.
        </p>

        <div className="mb-6">
          <label className="block text-base font-medium text-text-primary mb-2">
            Endpoint URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-surface-ground border border-border-dark rounded-lg px-4 py-2.5 font-mono text-base text-text-primary overflow-x-auto">
              {webhookUrl}
            </div>
            <button 
              onClick={handleCopy}
              className="px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 font-medium shadow-sm whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy URL'}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-base font-bold text-yellow-800 dark:text-yellow-400 mb-1">Security Requirement</h5>
            <p className="text-base text-yellow-700 dark:text-yellow-500/80 leading-relaxed">
              To prevent replay attacks and ensure authenticity, all inbound webhooks must be signed using your API Secret.
              The signature must be included in the `X-AI-BOS-Signature` header.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="text-lg font-bold text-text-primary mb-4">Event Mapping</h4>
        <p className="text-base text-text-secondary mb-6">
          Map internal AI-BOS events to external agent triggers.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-dark text-base font-medium text-text-muted">
                <th className="pb-3 pr-4 font-semibold">Internal Event</th>
                <th className="pb-3 px-4 font-semibold">Description</th>
                <th className="pb-3 pl-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-base">
              <tr className="border-b border-border-dark hover:bg-surface-ground transition-colors">
                <td className="py-4 pr-4 font-mono text-brand-600">marketing.update</td>
                <td className="py-4 px-4 text-text-secondary">Triggered when marketing metrics change significantly.</td>
                <td className="py-4 pl-4 text-right">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                  </label>
                </td>
              </tr>
              <tr className="border-b border-border-dark hover:bg-surface-ground transition-colors">
                <td className="py-4 pr-4 font-mono text-brand-600">finance.report_ready</td>
                <td className="py-4 px-4 text-text-secondary">Triggered when a new financial report is generated.</td>
                <td className="py-4 pl-4 text-right">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                  </label>
                </td>
              </tr>
              <tr className="hover:bg-surface-ground transition-colors">
                <td className="py-4 pr-4 font-mono text-text-muted">crm.new_lead</td>
                <td className="py-4 px-4 text-text-secondary">Triggered when a new high-value lead is added.</td>
                <td className="py-4 pl-4 text-right">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
