import React, { useState, useEffect } from 'react';
import { OversightAgent, OversightReport, N8NMetricInput } from '../../services/oversightAgent';
import { AlertTriangle, Brain, ShieldAlert, Zap, ArrowDown, CheckCircle } from 'lucide-react';

/**
 * OversightPanel: Nazoratchi Agent interfeysi
 */
export const OversightPanel: React.FC = () => {
  const [reports, setReports] = useState<OversightReport[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Mock n8n data trigger
  const simulateN8NTrigger = () => {
    const mockInputs: N8NMetricInput[] = [
      {
        module: "sales",
        metric: "daily_revenue",
        value: 124500,
        expected: 168000,
        change_percent: -25.9,
        threshold: -10,
        timeframe: "24h"
      },
      {
        module: "marketing",
        metric: "ad_spend_roi",
        value: 1.2,
        expected: 4.5,
        change_percent: -73.3,
        threshold: -15,
        timeframe: "24h"
      }
    ];

    const newReports = mockInputs.map(input => OversightAgent.processMetric(input));
    setReports(prev => [...newReports, ...prev].slice(0, 10));
  };

  useEffect(() => {
    if (isMonitoring) {
      const timer = setInterval(simulateN8NTrigger, 10000);
      return () => clearInterval(timer);
    }
  }, [isMonitoring]);

  return (
    <div className="card fade-up p-6 flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-6 h-6 text-brand-500" />
          <h3 className="text-lg font-extrabold text-text-primary">AI Nazoratchi & Maslahatchi</h3>
        </div>
        <button 
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`px-3 py-1.5 rounded-lg text-base font-semibold transition-colors ${
            isMonitoring 
              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
          }`}
        >
          {isMonitoring ? "Monitoring Faol" : "To'xtatilgan"}
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
        {reports.length === 0 ? (
          <div className="text-center p-10 text-text-muted">
            <Brain className="w-12 h-12 opacity-20 mb-4 mx-auto" />
            <p>N8N tugunlaridan ma'lumotlar kutilmoqda...</p>
          </div>
        ) : (
          reports.map((report, idx) => (
            <ReportItem key={idx} report={report} />
          ))
        )}
      </div>
    </div>
  );
};

const ReportItem: React.FC<{ report: OversightReport }> = ({ report }) => {
  const isCritical = report.urgency === 'CRITICAL';
  const isAlert = report.type === 'alert';
  
  const borderColorClass = isCritical ? 'border-rose-500' : isAlert ? 'border-amber-500' : 'border-brand-500';
  const bgColorClass = isCritical ? 'bg-rose-500/5' : isAlert ? 'bg-amber-500/5' : 'bg-brand-500/5';
  const textColorClass = isCritical ? 'text-rose-500' : isAlert ? 'text-amber-500' : 'text-brand-500';
  const badgeBgClass = isCritical ? 'bg-rose-500' : isAlert ? 'bg-amber-500' : 'bg-brand-500';

  return (
    <div className={`fade-in p-4 rounded-xl ${bgColorClass} border border-border-light border-l-4 ${borderColorClass}`}>
      <div className="flex justify-between mb-2.5">
        <div className="flex items-center gap-2">
          {isCritical ? <ShieldAlert className="w-[18px] h-[18px] text-rose-500" /> : isAlert ? <AlertTriangle className="w-[18px] h-[18px] text-amber-500" /> : <Brain className="w-[18px] h-[18px] text-brand-500" />}
          <span className="text-base font-bold text-text-primary uppercase">{report.type}</span>
        </div>
        <span className={`text-base font-extrabold px-2 py-0.5 rounded-full text-white ${badgeBgClass}`}>
          {report.urgency}
        </span>
      </div>

      <div className="text-base font-bold text-text-primary mb-2 flex items-center gap-1.5">
        {report.status}
      </div>

      <div className="mb-3">
        {report.observations.map((obs, i) => (
          <div key={i} className="text-base text-text-secondary mb-1 flex gap-1.5">
            <span className="text-text-muted">•</span> {obs}
          </div>
        ))}
      </div>

      <div className={`bg-black/20 p-3 rounded-lg ${report.autoTrigger ? 'mb-3' : 'mb-0'}`}>
        <div className="text-base font-bold text-text-muted mb-1.5 uppercase">Tavsiya:</div>
        {report.recommendations.map((rec, i) => (
          <div key={i} className="text-base text-text-primary mb-1 flex gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {rec}
          </div>
        ))}
      </div>

      {report.autoTrigger && (
        <div className="flex items-center gap-2.5 p-2.5 bg-emerald-500/10 rounded-lg border border-dashed border-emerald-500/30">
          <Zap className="w-5 h-5 text-emerald-500" />
          <div className="flex-1">
            <div className="text-base font-bold text-emerald-500">AUTO-TRIGGER: {report.autoTrigger.action_type}</div>
            <div className="text-base text-text-muted">Reason: {report.autoTrigger.reason}</div>
          </div>
          <div className="text-base font-bold text-emerald-500 uppercase">CONFIDENCE: {report.autoTrigger.confidence}</div>
        </div>
      )}

      <div className="mt-2.5 flex justify-between items-center">
        <span className="text-base text-text-muted font-mono">Plan: {report.planType}</span>
        <span className="text-base text-text-muted font-mono">{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
