import React, { useState, useEffect } from 'react';
import { Activity, PlayCircle, CheckCircle2, XCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { workflowService } from '../../services/workflowService';
import Card from '../../components/ui/Card';

export default function AgentMonitor() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    successRate: 0,
    failed: 0
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Get all workflows to find executions for each
      const workflows = await workflowService.getWorkflows();
      let allExecutions: any[] = [];
      
      for (const w of workflows) {
        const execs = await workflowService.getExecutions(w.id);
        allExecutions = [...allExecutions, ...execs.map(e => ({ ...e, workflowName: w.name }))];
      }

      // Sort by start time
      allExecutions.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
      setExecutions(allExecutions);

      // Calculate stats
      const active = allExecutions.filter(e => e.status === 'running').length;
      const failed = allExecutions.filter(e => e.status === 'failed').length;
      const completed = allExecutions.filter(e => e.status === 'completed').length;
      const successRate = allExecutions.length > 0 ? (completed / (completed + failed)) * 100 : 0;

      setStats({ active, successRate, failed });
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-600" />
            Agent & Workflow Monitor
          </h3>
          <p className="text-text-secondary mt-2">
            Real-time execution tracking, node-level logs, and performance metrics.
          </p>
        </div>
        <button 
          onClick={() => { setIsLoading(true); fetchData(); }}
          className="p-2 text-text-muted hover:text-brand-600 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 flex flex-col items-center justify-center">
          <h4 className="text-base font-medium text-text-muted mb-2">Active Executions</h4>
          <p className="text-4xl font-black text-brand-600">{stats.active}</p>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <h4 className="text-base font-medium text-text-muted mb-2">Success Rate</h4>
          <p className="text-4xl font-black text-green-600 dark:text-green-400">{stats.successRate.toFixed(1)}%</p>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full"></div>
          <h4 className="text-base font-medium text-text-muted mb-2">Failed Executions</h4>
          <p className="text-4xl font-black text-red-600 dark:text-red-400">{stats.failed}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border-dark flex justify-between items-center">
          <h4 className="font-bold text-text-primary text-base">Recent Executions</h4>
          <button className="text-base font-medium text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1">
            View All <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-ground">
              <tr className="border-b border-border-dark text-base font-semibold text-text-muted uppercase tracking-wider">
                <th className="py-4 px-6">Execution ID</th>
                <th className="py-4 px-6">Workflow</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Start Time</th>
                <th className="py-4 px-6">End Time</th>
              </tr>
            </thead>
            <tbody className="text-base divide-y divide-border-dark">
              {executions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted italic">No executions found.</td>
                </tr>
              )}
              {executions.map((exec) => (
                <tr key={exec.id} className="hover:bg-surface-ground transition-colors group cursor-pointer">
                  <td className="py-4 px-6 font-mono text-base text-text-muted">{exec.id.slice(0, 8)}...</td>
                  <td className="py-4 px-6 font-medium text-text-primary">{exec.workflowName}</td>
                  <td className="py-4 px-6">
                    {exec.status === 'running' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-base font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
                        <PlayCircle className="w-5 h-5 animate-pulse" /> Running
                      </span>
                    )}
                    {exec.status === 'completed' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-base font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/30">
                        <CheckCircle2 className="w-5 h-5" /> Success
                      </span>
                    )}
                    {exec.status === 'failed' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-base font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30">
                        <XCircle className="w-5 h-5" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-text-secondary whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-5 h-5" />
                      {new Date(exec.start_time).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-secondary">
                    {exec.end_time ? new Date(exec.end_time).toLocaleTimeString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
