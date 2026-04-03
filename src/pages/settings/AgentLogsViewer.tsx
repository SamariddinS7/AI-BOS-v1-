import React, { useState } from 'react';
import { Activity, Search, Filter, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function AgentLogsViewer() {
  const [logs] = useState([
    { id: 'req_1a2b3c', time: '10:45:22 AM', agent: 'n8n Automation', event: 'marketing.update', status: 'success', duration: '120ms' },
    { id: 'req_4d5e6f', time: '10:42:15 AM', agent: 'Zapier Bridge', event: 'finance.report_ready', status: 'failed', duration: '45ms', error: 'Invalid HMAC signature' },
    { id: 'req_7g8h9i', time: '10:30:00 AM', agent: 'Custom HR Agent', event: 'hr.kpi_update', status: 'success', duration: '85ms' },
    { id: 'req_0j1k2l', time: '09:15:44 AM', agent: 'n8n Automation', event: 'crm.new_lead', status: 'success', duration: '210ms' },
    { id: 'req_3m4n5o', time: '08:00:01 AM', agent: 'Zapier Bridge', event: 'finance.report_ready', status: 'success', duration: '150ms' },
  ]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-600" />
              Activity Logs
            </h4>
            <p className="text-base text-text-muted mt-1">
              Monitor inbound and outbound webhook requests.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search logs..." 
                className="w-full pl-9 pr-4 py-2 bg-surface-ground border border-border-dark rounded-lg text-base focus:ring-2 focus:ring-brand-500 outline-none transition-all text-text-primary placeholder-text-muted"
              />
            </div>
            <button className="p-2 bg-surface-ground border border-border-dark rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-ground/80 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-ground">
              <tr className="border-b border-border-dark text-base font-semibold text-text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="text-base divide-y divide-border-dark">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-ground transition-colors group">
                  <td className="py-3 px-4 text-text-muted whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {log.time}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-text-primary">{log.agent}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-surface-ground text-brand-600 rounded text-base font-mono border border-border-dark">
                      {log.event}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {log.status === 'success' ? (
                      <div className="flex items-center gap-1.5 text-green-600 text-base font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Success
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-600 text-base font-medium" title={log.error}>
                        <XCircle className="w-4 h-4" /> Failed
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-text-muted text-base">{log.duration}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-brand-600 hover:text-brand-700 text-base font-medium flex items-center gap-1 justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity">
                      View Payload <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-between items-center text-base text-text-muted">
          <span>Showing 5 of 1,248 logs</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 border border-border-dark rounded hover:bg-surface-ground disabled:opacity-50">Prev</button>
            <button className="px-2 py-1 border border-border-dark rounded hover:bg-surface-ground">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
