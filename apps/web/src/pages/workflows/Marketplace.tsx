import React, { useState } from 'react';
import { Search, Filter, Star, Download, ShieldCheck, Store } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function Marketplace() {
  const [plugins] = useState([
    { id: 1, name: 'Google Ads Connector', author: 'AI-BOS Official', rating: 4.8, installs: '12k+', verified: true, description: 'Manage campaigns, adjust budgets, and pull performance metrics directly from Google Ads.' },
    { id: 2, name: 'Salesforce CRM Sync', author: 'Enterprise Integrations', rating: 4.5, installs: '8k+', verified: true, description: 'Two-way sync for leads, opportunities, and accounts with Salesforce.' },
    { id: 3, name: 'Financial Forecaster AI', author: 'FinTech Solutions', rating: 4.9, installs: '3k+', verified: true, description: 'Advanced predictive models for cash flow and revenue forecasting.' },
    { id: 4, name: 'Slack Notifier', author: 'Community', rating: 4.2, installs: '25k+', verified: false, description: 'Send formatted alerts and reports to specific Slack channels.' },
    { id: 5, name: 'Shopify Inventory Sync', author: 'E-Comm Tools', rating: 4.6, installs: '5k+', verified: true, description: 'Real-time inventory synchronization and order management for Shopify.' },
    { id: 6, name: 'Custom Data Transformer', author: 'DataGeeks', rating: 3.9, installs: '1k+', verified: false, description: 'Write custom JS/Python scripts to transform data between nodes.' },
  ]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Store className="w-6 h-6 text-brand-600" />
            Enterprise Plugin Marketplace
          </h3>
          <p className="text-base text-text-muted mt-1">
            Discover, install, and manage secure integrations and AI agents.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search plugins..." 
              className="w-full pl-10 pr-4 py-2.5 bg-surface-ground border border-border-dark rounded-lg text-base focus:ring-2 focus:ring-brand-500 outline-none transition-all text-text-primary placeholder-text-muted"
            />
          </div>
          <button className="p-2.5 bg-surface-ground border border-border-dark rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-ground/80 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <Card key={plugin.id} className="p-6 flex flex-col h-full group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-surface-ground rounded-lg flex items-center justify-center text-text-secondary font-bold text-xl border border-border-dark shrink-0">
                  {plugin.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-base leading-tight group-hover:text-brand-600 transition-colors mb-1">
                    {plugin.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-base text-text-muted">
                    {plugin.verified && <ShieldCheck className="w-5 h-5 text-green-500" />}
                    <span>{plugin.author}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-base text-text-secondary mb-6 flex-1 leading-relaxed">
              {plugin.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-border-dark mt-auto">
              <div className="flex items-center gap-4 text-base font-medium text-text-muted">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  {plugin.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-5 h-5" />
                  {plugin.installs}
                </div>
              </div>
              <button className="px-4 py-2 bg-surface-ground text-brand-600 rounded-md hover:bg-surface-ground/80 transition-colors text-base font-semibold tracking-wide border border-border-dark">
                Install
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
