import React, { useState } from 'react';
import { Terminal, Play, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { executeAICommand } from '../lib/aiExecutionEngine';

export default function AICommandCenter() {
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!command.trim()) return;
    
    setIsExecuting(true);
    setError(null);
    setResult(null);

    try {
      const data = await executeAICommand(command, { current_page: 'marketing' });
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden mb-6 transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-50 dark:bg-gray-950 transition-colors">
        <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200">AI Execution Engine</h3>
        <span className="ml-auto text-base text-gray-500 font-mono">v1.0.0</span>
      </div>
      
      <div className="p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            placeholder="e.g., 'Past samarali kampaniyalarni to'xtat va byudjetni eng yuqori ROAS kampaniyaga o'tkaz'"
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-base text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            disabled={isExecuting}
          />
          <button
            onClick={handleExecute}
            disabled={isExecuting || !command.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Execute
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 transition-colors">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
            <p className="text-base text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-4">
            {/* Intent Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 transition-colors">
              <h4 className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">1. Detected Intent (JSON)</h4>
              <pre className="text-base text-green-600 dark:text-green-400 font-mono overflow-x-auto">
                {JSON.stringify(result.intent, null, 2)}
              </pre>
            </div>

            {/* Execution Result */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 transition-colors">
              <h4 className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">2. Execution Result</h4>
              <div className="flex items-center gap-2 mb-2">
                {result.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                )}
                <span className={`text-base font-medium ${result.status === 'success' ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              {result.result && (
                <pre className="text-base text-blue-600 dark:text-blue-300 font-mono overflow-x-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              )}
            </div>

            {/* Post-Execution Report */}
            {result.report && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 transition-colors">
                <h4 className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">3. Post-Execution Report</h4>
                <div className="grid grid-cols-2 gap-4 text-base">
                  <div>
                    <span className="text-gray-500 block text-base">Action Performed</span>
                    <span className="text-gray-900 dark:text-gray-200">{result.report.action_performed}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-base">Objects Affected</span>
                    <span className="text-gray-900 dark:text-gray-200">{result.report.objects_affected}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-base">KPI Change</span>
                    <span className="text-green-600 dark:text-green-400">{result.report.kpi_change}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-base">Financial Impact</span>
                    <span className="text-blue-600 dark:text-blue-400">{result.report.financial_impact}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-base">Risk Impact</span>
                    <span className="text-yellow-600 dark:text-yellow-400">{result.report.risk_impact}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-base">Confidence</span>
                    <span className="text-purple-600 dark:text-purple-400">{result.report.confidence_level}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
