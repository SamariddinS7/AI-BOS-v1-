import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { Terminal, CheckCircle, XCircle, AlertTriangle, Play, Shield } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function APITesting() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { info, success, error } = useToast();

  const handleTestEndpoints = async () => {
    setIsRunning(true);
    setResults([]);
    info("API Testing Agent ishga tushirildi...");
    
    const endpointsToTest = [
      { method: 'GET', path: '/api/health', auth: false, mockPayload: undefined },
      { method: 'GET', path: '/api/skills/available', auth: true, mockPayload: undefined },
      { method: 'POST', path: '/api/skills/execute', auth: true, mockPayload: { skill_type: 'pricing-strategy', parameters: {} } },
      { method: 'GET', path: '/api/skills/execution/1', auth: true, mockPayload: undefined },
      { method: 'POST', path: '/api/skills/approve', auth: true, mockPayload: { workflow_id: 'test_wf_123', decision: 'approved' } },
      { method: 'GET', path: '/api/skills/user/permissions', auth: true, mockPayload: undefined },
      { method: 'GET', path: '/api/skills/audit/history', auth: true, mockPayload: undefined }
    ];

    const tempResults: any[] = [];

    for (const ep of endpointsToTest) {
      const startTime = performance.now();
      let statusCode = 500;
      let isSuccess = false;
      let notes = 'none';
      let payloadValid = 'yes';
      let permissionError = 'no';
      
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (ep.auth) {
          // Send invalid auth first to test 401
          const testRes = await fetch(ep.path, { method: ep.method, headers });
          if (testRes.status === 401) {
            // expected 401
          } else {
            notes = 'Failed missing auth test';
          }
          headers['Authorization'] = `Bearer ${import.meta.env.VITE_APP_AUTH_TOKEN}`;
        }

        // Send incorrect payload if POST to test 422
        if (ep.mockPayload && ep.method === 'POST') {
          const testRes2 = await fetch(ep.path, { method: ep.method, headers, body: JSON.stringify({}) });
          if (testRes2.status === 422) {
             // expected 422
          } else {
             payloadValid = 'no (422 expected)';
          }
        }

        const res = await fetch(ep.path, {
          method: ep.method,
          headers,
          body: ep.mockPayload ? JSON.stringify(ep.mockPayload) : undefined
        });
        
        statusCode = res.status;
        isSuccess = res.ok;
        if (statusCode === 403) permissionError = 'yes';
        if (statusCode === 404) notes = 'Endpoint topilmadi';
        
      } catch (e: any) {
        statusCode = 500;
        notes = e.message;
      }
      
      const responseTime = Math.floor(performance.now() - startTime);

      tempResults.push({
        method: ep.method,
        endpoint: ep.path,
        authRequired: ep.auth ? 'yes' : 'no',
        responseTime: responseTime,
        statusCode: statusCode,
        responseCheck: isSuccess ? 'passed' : 'failed',
        payloadValid: ep.mockPayload ? payloadValid : 'yes',
        permissionError: permissionError,
        notes: notes
      });
      
      setResults([...tempResults]);
    }

    setIsRunning(false);
    success("API testlari muvaffaqiyatli yakunlandi.");
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans space-y-6 animate-slide-in text-text-primary">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-brand-500" />
            API Testing Agent
          </h1>
          <p className="text-text-secondary">
            AI-BOS / CalcusAgent API endpointlarini avtomatik tekshirish va hujjatlashtirish moduli.
          </p>
        </div>
        <button 
          onClick={handleTestEndpoints}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
        >
          {isRunning ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Tekshirilmoqda...</>
          ) : (
            <><Play className="w-4 h-4" /> Barcha Endpointlarni Tekshirish</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6 h-full border border-brand-500/20 bg-surface-ground">
            <div className="flex items-center gap-2 mb-4 text-brand-400">
              <Terminal className="w-5 h-5" />
              <h3 className="font-bold">Agent System Prompt</h3>
            </div>
            <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono leading-relaxed bg-surface-card p-4 rounded-lg border border-border-dark max-h-[600px] overflow-y-auto">
{`SYSTEM PROMPT: API TESTING AGENT
ROLE: API Connection Validator Agent

OBJECTIVE:
You are responsible for testing, verifying, and documenting all API endpoints of a business management platform (AI-BOS / CalcusAgent).

You test:
- Endpoint availability (status 200/401/403/500)
- Auth header requirements
- Expected response schema
- Response time (ms)
- Required parameters and validation errors
- Permission-based access (RBAC)

YOU RECEIVE:
A list of base URL and API paths, with optional authentication headers and example request payloads.

OUTPUT FORMAT:
For each endpoint, produce:

🔹 Endpoint: [GET/POST] /api/skills/execute  
🔐 Auth Required: yes/no  
⏱️ Response Time: 164ms  
📄 Status Code: 200  
✅ Response Check: passed  
📥 Payload Valid: yes  
🔒 Permission Error: no  
⚠️ Notes: none

RULES:
- Always test with valid and invalid inputs
- Check response schema and types
- If auth missing, return 401
- If permission denied, return 403
- If payload is wrong, return 422
- If success, verify status, data, message keys
- Highlight broken or undocumented endpoints`}
            </pre>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden border border-border-dark">
            <div className="px-6 py-4 border-b border-border-dark bg-surface-ground flex justify-between items-center">
              <h3 className="font-bold text-lg">Test Natijalari Jurnali</h3>
              <div className="text-sm font-mono text-text-muted">
                {results.length} ta endpoint tekshirildi
              </div>
            </div>
            
            {results.length === 0 ? (
              <div className="p-12 text-center text-text-muted flex flex-col items-center gap-3">
                <Terminal className="w-12 h-12 opacity-20" />
                <p>Hozircha testlar bajarilmagan. Boshlash uchun "Barcha Endpointlarni Tekshirish" tugmasini bosing.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-dark max-h-[600px] overflow-y-auto">
                {results.map((res, i) => (
                  <div key={i} className="p-6 hover:bg-surface-ground/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${res.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {res.method}
                        </span>
                        <span className="font-mono font-medium">{res.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {res.responseCheck === 'passed' ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 px-2 py-1 bg-emerald-400/10 rounded text-sm font-medium">
                            <CheckCircle className="w-4 h-4" /> Passed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-rose-400 px-2 py-1 bg-rose-400/10 rounded text-sm font-medium">
                            <XCircle className="w-4 h-4" /> Failed
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-3 p-4 bg-surface-ground rounded-lg border border-border-dark/50">
                      <div>
                        <span className="text-text-muted block mb-1">Status Code</span>
                        <span className={`font-mono ${res.statusCode >= 400 ? 'text-rose-400' : 'text-emerald-400'}`}>{res.statusCode}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block mb-1">Zaruriyat (Auth)</span>
                        <span className="text-text-secondary">{res.authRequired}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block mb-1">Vaqt (ms)</span>
                        <span className="font-mono text-text-secondary">{res.responseTime}ms</span>
                      </div>
                      <div>
                        <span className="text-text-muted block mb-1">Ruxsat Xatosi</span>
                        <span className={res.permissionError === 'yes' ? 'text-rose-400' : 'text-text-secondary'}>{res.permissionError}</span>
                      </div>
                    </div>

                    {res.notes !== 'none' && (
                      <div className="mt-3 flex gap-2 text-sm text-amber-400 bg-amber-400/10 px-3 py-2 rounded">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{res.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
