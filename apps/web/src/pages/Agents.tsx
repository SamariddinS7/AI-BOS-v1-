import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, X, Check, AlertCircle, Bot, Globe, Shield, Zap, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { safeJson } from '../lib/utils';

const T = {
  bg:       "var(--color-app-bg)",
  surface:  "rgba(9, 9, 11, 0.2)",
  card:     "rgba(24, 24, 27, 0.4)",
  cardHov:  "var(--color-surface-layer)", // 30% hover
  border:   "var(--color-border-dark)",
  borderHi: "var(--color-border-glow)",
  accent:   "var(--color-brand-500)", // 10%
  accentDim: "rgba(0, 212, 255, 0.1)",
  accentStr: "rgba(0, 212, 255, 0.3)",
  green:    "#22C55E",  greenDim: "rgba(34,197,94,0.12)",
  amber:    "#F59E0B",  amberDim: "rgba(245,158,11,0.12)",
  red:      "#EF4444",  redDim:   "rgba(239,68,68,0.11)",
  violet:   "#A78BFA",  violetDim:"rgba(167,139,250,0.12)",
  teal:     "#2DD4BF",  tealDim:  "rgba(45,212,191,0.11)",
  sky:      "#38BDF8",  skyDim:   "rgba(56,189,248,0.11)",
  t1: "var(--color-text-primary)",
  t2: "var(--color-text-secondary)",
  t3: "var(--color-text-muted)",
  t4: "var(--color-border-dark)",
  sans: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  r1: "6px", r2: "10px", r3: "14px", r4: "20px",
};

import { GoogleGenAI } from "@google/genai";

const AI_MODEL = "gemini-3-flash-preview";

async function callAI(messages: any[], system: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Convert Anthropic messages format to Gemini contents format
    // Anthropic: [{role: "user", content: "..."}]
    // Gemini: "..." (for simple text) or { role: "user", parts: [{text: "..."}] }
    const promptString = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: promptString,
      config: {
        systemInstruction: system || "Siz AI-BOS biznes tahlil tizimisiz. O'zbek tilida, professional, 2-3 jumlada aniq javob bering.",
      }
    });
    
    return response.text || "Tahlil mavjud emas.";
  } catch (e: any) {
    return "Xatolik yuz berdi: " + e.message;
  }
}

const AGENT_TOOLS = {
  get_financial_summary: () => ({ revenue: 125000000, expenses: 82000000, profit: 43000000, margin: "34.4%" }),
  get_marketing_kpis: () => ({ total_spend: 15000000, total_revenue: 65000000, overall_roi: "333.3%", top_channel: "Google Ads", channels: 6 }),
  get_hr_metrics: () => ({ total_employees: 54, departments: 6, avg_kpi_pct: "88", top_dept: "Finance" }),
  analyze_budget_allocation: () => ({ reallocation_count: 2, increase: ["Google Ads"], decrease: ["Radio"], expected_rev_impact: 4500000 }),
  get_sentiment_report: () => ({ score: 72, risk_level: "past", positive_pct: "65%", negative_pct: "12%", top_topic: "Mahsulot sifati" }),
  detect_anomalies: () => ({ count: 1, months: ["Avg"], severity: "o'rta" }),
  generate_forecast: () => ({ next_3_months: [{period:"+1 oy", revenue:135000000, confidence:"88%"},{period:"+2 oy", revenue:142000000, confidence:"80%"}] }),
  get_competitor_analysis: () => ({ pressure_score: 45, market_saturation: "68%", recommended_strategy: "Mudofaa — ROAS optimizatsiya" }),
  calculate_health_index: () => ({ total: 82, efficiency: 22, growth: 20, stability: 20, competitive: 20 }),
  get_risk_factors: () => ({ total_risks: 2, high: 0, medium: 2, details: [{channel:"Radio",msg:"ROI 75% — minimum chegaradan past"}] }),
};

const AGENT_DEFS = [
  {
    id: "finance_analyst", label: "Moliya Analitiki", icon: "", color: T.accent, dim: T.accentDim, badge: "Finance",
    desc: "P&L tahlili, daromad trendi, likvidlik va moliyaviy ko'rsatkichlarni avtomatik baholaydi", category: "analytics",
    tools: ["get_financial_summary","detect_anomalies","generate_forecast"],
    system: "Siz AI-BOS moliya analitik agentisiz. Moliyaviy ma'lumotlarni tahlil qilib, O'zbek tilida aniq, strukturali hisobot bering. Faqat berilgan tool natijalariga asoslanib fikr yuriting. Hisob-kitob bajarmang — faqat talqin qiling. Javobingizda: 1) Asosiy topilmalar 2) Xavf omillari 3) Tavsiyalar bo'lsin.",
    task: "2025 yil moliyaviy ko'rsatkichlarini tahlil qil: daromad, xarajat, foyda, anomaliyalar va 3 oylik prognozni baholа.",
  },
  {
    id: "marketing_strategist", label: "Marketing Strateg", icon: "", color: T.violet, dim: T.violetDim, badge: "Marketing",
    desc: "Multi-kanal ROI, atribusiya, byudjet rebalansi va reklama samaradorligini strategik baholaydi", category: "strategy",
    tools: ["get_marketing_kpis","analyze_budget_allocation","get_competitor_analysis"],
    system: "Siz AI-BOS marketing strategiyasi agentisiz. Multi-kanal reklama ma'lumotlarini tahlil qilib, O'zbek tilida strategik tavsiyalar bering. Faqat tool natijalarini talqin qiling. ROI/ROAS hisob-kitob bajarmang — faqat interpretatsiya. Javobingizda: 1) Eng samarali/samarasiz kanallar 2) Byudjet qayta taqsimlash 3) Raqobat vaziyati 4) Qisqa muddatli tavsiyalar.",
    task: "Barcha marketing kanallarini tahlil qil: ROI ko'rsatkichlari, byudjet qayta taqsimlash zaruriyati va raqobat vaziyatini baholа.",
  },
  {
    id: "hr_optimizer", label: "HR Optimizer", icon: "", color: T.teal, dim: T.tealDim, badge: "HR",
    desc: "Xodimlar KPI, bo'lim samaradorligi va inson resurslari ko'rsatkichlarini baholaydi", category: "analytics",
    tools: ["get_hr_metrics","get_financial_summary"],
    system: "Siz AI-BOS HR optimallashtirish agentisiz. Xodimlar va bo'lim ko'rsatkichlarini tahlil qilib, O'zbek tilida amaliy tavsiyalar bering. Javobingizda: 1) Xodimlar holati 2) KPI baholash 3) Samaradorlikni oshirish tavsiyalari.",
    task: "HR ko'rsatkichlarini tahlil qil: xodimlar soni, KPI darajasi, bo'limlar samaradorligi va moliyaviy hissani baholа.",
  },
  {
    id: "risk_detector", label: "Risk Detektori", icon: "", color: T.red, dim: T.redDim, badge: "Risk",
    desc: "Moliyaviy, marketing va operatsion xavf omillarini kompleks skanerlaydi va ogohlantirishlar generatsiya qiladi", category: "risk",
    tools: ["get_risk_factors","detect_anomalies","get_sentiment_report"],
    system: "Siz AI-BOS risk deteksiya agentisiz. Xavf omillarini aniqlash va prioritetlash bo'yicha O'zbek tilida hisobot bering. Har bir xavf uchun: og'irlik darajasi (yuqori/o'rta/past), sabab va darhol harakat tavsiyasi bering.",
    task: "Barcha tizim bo'yicha xavf skanerlashini o'tkaz: moliyaviy anomaliyalar, marketing ogohlantirishlari va brand sentiment xavflarini aniqlа.",
  },
  {
    id: "growth_advisor", label: "O'sish Maslahatchisi", icon: "", color: T.green, dim: T.greenDim, badge: "Growth",
    desc: "O'sish imkoniyatlarini, prognoz va marketing sog'lig'ini kompleks baholaydi", category: "strategy",
    tools: ["generate_forecast","calculate_health_index","get_marketing_kpis"],
    system: "Siz AI-BOS o'sish strategiyasi agentisiz. Prognoz va marketing sog'lig'i ma'lumotlariga asoslanib O'zbek tilida o'sish yo'nalishlarini tavsiya qiling. Javobingizda: 1) O'sish imkoniyatlari 2) Prognoz izohi 3) Marketing sog'lig'i baholash 4) 90 kunlik harakatlar rejasi.",
    task: "O'sish imkoniyatlarini tahlil qil: 3 oylik prognoz, marketing health indeksi va asosiy KPI ko'rsatkichlarini baholа.",
  },
  {
    id: "executive_reporter", label: "Ijrochi Hisobotchi", icon: "", color: T.amber, dim: T.amberDim, badge: "Executive",
    desc: "Barcha modullardan ma'lumot yig'ib, boshqaruv kengashi uchun qisqa muddatli ijrochi xulosa tayyorlaydi", category: "reporting",
    tools: ["get_financial_summary","get_marketing_kpis","get_hr_metrics","get_risk_factors"],
    system: "Siz AI-BOS ijrochi hisobot agentisiz. Boshqaruv kengashi uchun O'zbek tilida aniq, qisqa va qarorga yo'naltirilgan hisobot tayyorlang. Format: MOLIYA | MARKETING | HR | XAVFLAR | TAVSIYALAR. Har bo'lim 2-3 jumladan iborat bo'lsin.",
    task: "Barcha modullar bo'yicha ijrochi xulosa tayyorla: moliya, marketing, HR va xavf omillarini boshqaruv kengashi formatida taqdim et.",
  },
];

async function runAgentLoop(agentDef, onStep, onToolCall, onDone, onError) {
  const steps = [];
  const toolResults = {};

  try {
    onStep({ type:"init", msg:`Agent ishga tushirildi: ${agentDef.label}`, ts:Date.now() });
    await new Promise(r=>setTimeout(r,300));

    for(const toolName of agentDef.tools) {
      onStep({ type:"tool_start", msg:`Tool: ${toolName}`, ts:Date.now() });
      onToolCall(toolName, "active");
      await new Promise(r=>setTimeout(r,400+Math.random()*300));

      try {
        const result = AGENT_TOOLS[toolName]?.({});
        toolResults[toolName] = result;
        onStep({ type:"tool_done", msg:`${toolName} -> ${JSON.stringify(result).slice(0,80)}…`, ts:Date.now() });
        onToolCall(toolName, "done");
      } catch(e) {
        toolResults[toolName] = { error: e.message };
        onStep({ type:"tool_error", msg:`${toolName} xatosi: ${e.message}`, ts:Date.now() });
        onToolCall(toolName, "error");
      }
      await new Promise(r=>setTimeout(r,200));
    }

    onStep({ type:"ai_start", msg:"AI talqin boshlandi…", ts:Date.now() });

    const toolSummary = Object.entries(toolResults)
      .map(([k,v])=>`[${k}]: ${JSON.stringify(v)}`)
      .join("\n");

    const aiResult = await callAI([{
      role:"user",
      content:`Vazifa: ${agentDef.task}\n\nTool natijalari:\n${toolSummary}\n\nYuqoridagi ma'lumotlarga asoslanib professional tahlil va tavsiyalar bering.`
    }], agentDef.system);

    onStep({ type:"ai_done", msg:"AI tahlili yakunlandi", ts:Date.now() });
    onDone({ output: aiResult, toolResults, completedAt: Date.now() });

  } catch(err) {
    onStep({ type:"error", msg:`Xato: ${err.message}`, ts:Date.now() });
    onError(err.message);
  }
}

const Tag = memo(({ children, color=T.accent, dim }: { children: React.ReactNode, color?: string, dim?: string }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 12px", borderRadius: "20px", fontSize: "16px", fontWeight: 600, fontFamily: T.mono, border: "1px solid transparent", color, background: dim||`${color}12`, borderColor:`${color}30` }}>{children}</span>
));

const AgentCard = memo(({ agent, onRun, status, active }: any) => {
  const isRunning = status === "running";
  const isDone    = status === "done";
  const isError   = status === "error";

  const statusColor = isRunning?T.accent : isDone?T.green : isError?T.red : T.t4;
  const statusLabel = isRunning?"Ishlayapti…" : isDone?"Bajarildi" : isError?"Xato" : "Tayyor";

  return (
    <div className={`card agent-card${isRunning?" running":isDone?" done":isError?" error":""}`}
      style={{padding:"18px 20px",borderColor:active?agent.color+"44":T.border,background:active?agent.dim:T.card, borderRadius: T.r3, border: `1px solid ${active?agent.color+"44":T.border}`, cursor:"pointer", transition:"all 180ms ease", position: "relative", overflow: "hidden"}}
      onClick={()=>!isRunning&&onRun(agent.id)}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${agent.color},transparent)`,borderRadius:"14px 14px 0 0",opacity:isRunning?1:0.5}}/>

      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
        <div style={{width:40,height:40,borderRadius:T.r2,background:agent.dim,border:`1px solid ${agent.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:agent.color,flexShrink:0,boxShadow:isRunning?`0 0 12px ${agent.color}55`:"none",transition:"box-shadow 300ms"}}>
          {agent.icon}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <span style={{fontSize:16,fontWeight:700,color:T.t1}}>{agent.label}</span>
            <Tag color={agent.color} dim={agent.dim}>{agent.badge}</Tag>
          </div>
          <p style={{fontSize:16,lineHeight:1.5, color: T.t2}}>{agent.desc}</p>
        </div>
      </div>

      <div style={{marginBottom:12,display:"flex",flexWrap:"wrap",gap:3}}>
        {agent.tools.map((t: string)=>(
          <span key={t} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:12,fontSize:16,fontFamily:T.mono,fontWeight:600,border:"1px solid transparent",margin:2, background: status==="running"?"rgba(0,212,255,0.12)":status==="done"?"rgba(34,197,94,0.10)":"rgba(255,255,255,0.04)", color: status==="running"?T.accent:status==="done"?T.green:T.t4, borderColor: status==="running"?"rgba(0,212,255,0.3)":status==="done"?"rgba(34,197,94,0.25)":T.border}}>{t.replace(/_/g," ")}</span>
        ))}
      </div>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:statusColor,boxShadow:`0 0 6px ${statusColor}`,flexShrink:0}}/>
          <span style={{fontSize:16,color:statusColor,fontFamily:T.mono,fontWeight:600}}>{statusLabel}</span>
        </div>
        <button className="active:scale-95 transition-all duration-150 hover:opacity-80 shadow-lg shadow-cyan-500/20" style={{fontSize:16,padding:"6px 16px",pointerEvents:isRunning?"none":"auto",opacity:isRunning?0.5:1, background: isRunning?"transparent":T.accent, color: isRunning?T.t3:T.bg, border: isRunning?`1px solid ${T.border}`:"none", borderRadius: T.r1, cursor: "pointer", fontWeight: 700}}
          onClick={e=>{e.stopPropagation();!isRunning&&onRun(agent.id);}}>
          {isRunning?"...":"Ishga tushir"}
        </button>
      </div>
    </div>
  );
});

const AgentPanel = memo(({ agent, steps, toolStatus, result, error, onClose }: any) => {
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ if(logRef.current) logRef.current.scrollTop=logRef.current.scrollHeight; },[steps]);

  const stepIcon = (type: string) =>
    type==="init"? "" : type==="tool_start"? "" : type==="tool_done"? "" :
    type==="ai_start"? "" : type==="ai_done"? "" : type==="error"? "" : "";
  const stepColor = (type: string) =>
    type==="tool_done"||type==="ai_done"?T.green : type==="error"?T.red :
    type==="tool_start"||type==="ai_start"?T.accent : T.t3;

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:agent.dim,border:`1px solid ${agent.color}44`,borderRadius:T.r2}}>
        <span style={{fontSize:20,color:agent.color}}>{agent.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:700,color:T.t1}}>{agent.label}</div>
          <div style={{fontSize:16,color:T.t3,fontFamily:T.mono}}>{agent.task.slice(0,80)}…</div>
        </div>
        <button className="active:scale-95 hover:bg-white/5 transition-all duration-150" style={{fontSize:16,padding:"6px 12px", background: "transparent", color: T.t3, border: `1px solid ${T.border}`, borderRadius: T.r1, cursor: "pointer"}} onClick={onClose}>Yopish</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,flex:1,minHeight:0}}>
        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column", background: T.card, borderRadius: T.r3, border: `1px solid ${T.border}`}}>
          <div style={{fontSize:16,fontWeight:700,color:T.t1,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
            Bajarish Jurnali
          </div>
          <div ref={logRef} style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {steps.length===0&&(
              <div style={{color:T.t4,fontSize:16,fontFamily:T.mono,padding:"8px 0"}}>Agent ishga tushirilishini kutmoqda…</div>
            )}
            {steps.map((s: any,i: number)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"6px 10px",background:T.surface,borderRadius:T.r1,border:`1px solid ${T.border}`}}>
                <span style={{color:stepColor(s.type),fontSize:16,flexShrink:0,fontFamily:T.mono}}>{stepIcon(s.type)}</span>
                <span style={{fontSize:16,color:T.t2,fontFamily:T.mono,flex:1,wordBreak:"break-all"}}>{s.msg}</span>
                <span style={{fontSize: 16,color:T.t4,fontFamily:T.mono,flexShrink:0}}>{new Date(s.ts).toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:"14px 16px", background: T.card, borderRadius: T.r3, border: `1px solid ${T.border}`}}>
            <div style={{fontSize:16,fontWeight:700,color:T.t1,marginBottom:10}}>Tool Holatlari</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {agent.tools.map((t: string)=>{
                const st = toolStatus[t]||"idle";
                const c  = st==="active"?T.accent : st==="done"?T.green : st==="error"?T.red : T.t4;
                return (
                  <div key={t} style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:c,boxShadow:`0 0 5px ${c}`,flexShrink:0,transition:"all 300ms"}}/>
                    <span style={{fontSize:16,fontFamily:T.mono,color:c,flex:1}}>{t.replace(/_/g," ")}</span>
                    <Tag color={c} dim={`${c}18`}>{st==="active"?"ishlaydi":st==="done"?"tayyor":st==="error"?"xato":"kutish"}</Tag>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{padding:"14px 16px",flex:1,display:"flex",flexDirection:"column", background: T.card, borderRadius: T.r3, border: `1px solid ${T.border}`}}>
            <div style={{fontSize:16,fontWeight:700,color:T.t1,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
              AI Tahlil Natijasi
            </div>
            {error&&(
              <div style={{padding:"10px 12px",background:T.redDim,border:`1px solid ${T.red}44`,borderRadius:T.r2,fontSize:16,color:T.red,fontFamily:T.mono}}>{error}</div>
            )}
            {!result&&!error&&(
              <div style={{display:"flex",gap:4,alignItems:"center",color:T.t4,fontSize:16,fontFamily:T.mono,padding:"8px 0"}}>
                <span style={{marginLeft:6}}>Agent ishlashini kutmoqda…</span>
              </div>
            )}
            {result&&(
              <div style={{flex:1,overflowY:"auto"}}>
                <div style={{fontFamily:T.mono, fontSize:16, lineHeight:1.7, color:T.t2, whiteSpace:"pre-wrap", wordBreak:"break-word"}}>{result.output}</div>
                {result.completedAt&&(
                  <div style={{marginTop:10,padding:"8px 12px",background:T.greenDim,border:`1px solid ${T.green}33`,borderRadius:T.r1,fontSize: 16,color:T.green,fontFamily:T.mono}}>
                    Bajarildi: {new Date(result.completedAt).toLocaleTimeString("uz")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const OrchestratorPanel = memo(({ onStart, running, results }: any) => {
  const total   = AGENT_DEFS.length;
  const done    = Object.values(results).filter((r: any)=>r?.output).length;
  const pct     = Math.round(done/total*100);

  return (
    <div style={{padding:"18px 20px",border:`1px solid ${T.accentStr}`,background:T.accentDim, borderRadius: T.r3}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <div style={{fontSize: 16,fontWeight:700,color:T.accent,marginBottom:3}}>AI Agent Orkestrator</div>
          <div style={{fontSize: 16,color:T.t3}}>Barcha {total} ta agentni ketma-ket ishga tushiradi va yagona hisobot yaratadi</div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize: 16,fontWeight:700,color:T.accent,fontFamily:T.mono}}>{done}/{total}</div>
            <div style={{fontSize: 16,color:T.t3}}>bajarildi</div>
          </div>
          <button className="active:scale-95 transition-all duration-150 hover:opacity-80 shadow-lg shadow-cyan-500/20" style={{padding:"9px 20px",fontSize: 16,opacity:running?0.5:1, background: T.accent, color: T.bg, border: "none", borderRadius: T.r1, cursor: "pointer", fontWeight: 700}} onClick={onStart} disabled={running}>
            {running?"Orkestrlash...":"Hammasini ishga tushir"}
          </button>
        </div>
      </div>
      <div style={{marginBottom:10}}>
        <div style={{height:4,background:T.border,borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${T.teal},${T.accent},${T.green})`,borderRadius:3,transition:"width 0.5s ease"}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {AGENT_DEFS.map(ag=>{
          const r = results[ag.id];
          const c = r?.output?T.green : r?.error?T.red : running&&!r?T.accent:T.t4;
          return (
            <div key={ag.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:T.surface,borderRadius:20,border:`1px solid ${c}44`}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:c,boxShadow:`0 0 5px ${c}`}}/>
              <span style={{fontSize: 16,color:c,fontFamily:T.mono,fontWeight:600}}>{ag.badge}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const HistoryItem = memo(({ agent, record, onView }: any) => (
  <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:T.surface,borderRadius:T.r2,border:`1px solid ${T.border}`,marginBottom:6,cursor:"pointer",transition:"all 140ms"}}
    onClick={()=>onView(agent, record)}>
    <span style={{fontSize:18,color:agent.color}}>{agent.icon}</span>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:16,fontWeight:600,color:T.t1}}>{agent.label}</div>
      <div style={{fontSize: 16,color:T.t3,fontFamily:T.mono,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{record.output?.slice(0,60)}…</div>
    </div>
    <div style={{textAlign:"right",flexShrink:0}}>
      <div style={{fontSize: 16,color:T.t3,fontFamily:T.mono}}>{new Date(record.ts).toLocaleTimeString("uz",{hour:"2-digit",minute:"2-digit"})}</div>
      <Tag color={T.green} dim={T.greenDim}>OK</Tag>
    </div>
  </div>
));

export default function AgentsPage() {
  const { t } = useLanguage();
  const [activeAgent,  setActiveAgent]  = useState<string | null>(null);
  const [agentSteps,   setAgentSteps]   = useState<any>({});
  const [toolStatus,   setToolStatus]   = useState<any>({});
  const [agentResults, setAgentResults] = useState<any>({});
  const [agentErrors,  setAgentErrors]  = useState<any>({});
  const [agentStatus,  setAgentStatus]  = useState<any>({});
  const [orchRunning,  setOrchRunning]  = useState(false);
  const [history,      setHistory]      = useState<any[]>([]);
  const [historyView,  setHistoryView]  = useState<any>(null);
  const [filter,       setFilter]       = useState("all");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registeredAgents, setRegisteredAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    platform: 'Telegram',
    webhook_url: '',
    allowed_events: [] as string[],
    permissions: [] as string[]
  });

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await safeJson<any>(response);
        setRegisteredAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  }, []);

  const checkAgentHealth = useCallback(async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/check-health`, {
        method: 'POST'
      });
      if (response.ok) {
        const updatedAgent = await response.json();
        setRegisteredAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
      }
    } catch (error) {
      console.error(`Error checking health for agent ${agentId}:`, error);
    }
  }, []);

  const registeredAgentsRef = useRef(registeredAgents);
  useEffect(() => {
    registeredAgentsRef.current = registeredAgents;
  }, [registeredAgents]);

  useEffect(() => {
    fetchAgents();
    
    // Periodic health check every 30 seconds
    const intervalId = setInterval(() => {
      registeredAgentsRef.current.forEach(agent => {
        checkAgentHealth(agent.id);
      });
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchAgents, checkAgentHealth]);

  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });

      if (response.ok) {
        toast.success('Agent muvaffaqiyatli ro\'yxatdan o\'tkazildi');
        setIsRegisterModalOpen(false);
        setNewAgent({
          name: '',
          platform: 'Telegram',
          webhook_url: '',
          allowed_events: [],
          permissions: []
        });
        fetchAgents();
      } else {
        const error = await safeJson<any>(response);
        toast.error(error.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      toast.error('Server bilan bog\'lanishda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Haqiqatan ham ushbu agentni o\'chirmoqchimisiz?')) return;
    try {
      const response = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Agent o\'chirildi');
        fetchAgents();
      }
    } catch (error) {
      toast.error('O\'chirishda xatolik');
    }
  };

  const runAgent = useCallback(async(agentId: string) => {
    const agent = AGENT_DEFS.find(a=>a.id===agentId);
    if(!agent) return;

    setActiveAgent(agentId);
    setAgentStatus((s: any)=>({...s,[agentId]:"running"}));
    setAgentSteps((s: any)=>({...s,[agentId]:[]}));
    setToolStatus((s: any)=>({...s,[agentId]:{}}));
    setAgentResults((s: any)=>({...s,[agentId]:null}));
    setAgentErrors((s: any)=>({...s,[agentId]:null}));

    await runAgentLoop(
      agent,
      (step: any)    => setAgentSteps((s: any)=>({...s,[agentId]:[...(s[agentId]||[]),step]})),
      (tool: any,st: any) => setToolStatus((s: any)=>({...s,[agentId]:{...(s[agentId]||{}),[tool]:st}})),
      (result: any)  => {
        setAgentResults((s: any)=>({...s,[agentId]:result}));
        setAgentStatus((s: any)=>({...s,[agentId]:"done"}));
        setHistory((h: any)=>[{agentId,ts:Date.now(),output:result.output},...h].slice(0,20));
      },
      (err: any)     => {
        setAgentErrors((s: any)=>({...s,[agentId]:err}));
        setAgentStatus((s: any)=>({...s,[agentId]:"error"}));
      },
    );
  }, []);

  const runAll = useCallback(async() => {
    if(orchRunning) return;
    setOrchRunning(true);
    for(const agent of AGENT_DEFS) {
      await runAgent(agent.id);
      await new Promise(r=>setTimeout(r,500));
    }
    setOrchRunning(false);
  }, [orchRunning, runAgent]);

  const cats = [{id:"all",label:"Barchasi"},{id:"analytics",label:"Analitika"},{id:"strategy",label:"Strategiya"},{id:"risk",label:"Risk"},{id:"reporting",label:"Hisobot"}];
  const filtered = filter==="all" ? AGENT_DEFS : AGENT_DEFS.filter(a=>a.category===filter);

  const completedCount = Object.values(agentStatus).filter(s=>s==="done").length;
  const runningCount   = Object.values(agentStatus).filter(s=>s==="running").length;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in" style={{background: 'transparent', color: T.t1}}>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">AI Agentlar</h1>
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: T.accent,
              color: T.bg,
              border: 'none',
              borderRadius: T.r2,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            <Plus size={20} />
            Yangi Agent
          </button>
        </div>
        <p className="text-base text-text-muted">Avtomatik AI agent tizimi — har bir agent mustaqil vazifa bajaradi va real vaqtda natija beradi</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
        {[
          {l:"Jami Agentlar",     v:AGENT_DEFS.length,   c:T.accent,  icon:""},
          {l:"Bajarildi",         v:completedCount,       c:T.green,   icon:""},
          {l:"Ishlayapti",        v:runningCount,         c:T.amber,   icon:""},
          {l:"Jurnal Yozuvlari",  v:history.length,       c:T.violet,  icon:""},
        ].map((k,i)=>(
          <div key={i} style={{padding:"14px 18px", background: T.card, borderRadius: T.r3, border: `1px solid ${T.border}`, position: "relative", overflow: "hidden"}}>
            <div style={{position:"absolute",top:0,left:16,right:16,height:1,background:`linear-gradient(90deg,transparent,${k.c}55,transparent)`}}/>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24,color:k.c}}>{k.icon}</span>
              <div>
                <div style={{fontSize:24,fontWeight:800,color:k.c,fontFamily:T.mono,lineHeight:1}}>{k.v}</div>
                <div style={{marginTop:3, fontSize: 16, color: T.t3, textTransform: "uppercase", letterSpacing: "0.08em"}}>{k.l}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginBottom:16}}>
        <OrchestratorPanel onStart={runAll} running={orchRunning} results={agentResults}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:16,alignItems:"start"}}>
        <div>
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            {cats.map(c=>(
              <button key={c.id} onClick={()=>setFilter(c.id)}
                style={{padding:"8px 16px",borderRadius:20,fontSize:16,fontFamily:T.sans,fontWeight:600, cursor: "pointer",
                  background:filter===c.id?T.accentDim:"transparent",
                  color:filter===c.id?T.accent:T.t3,
                  border:`1px solid ${filter===c.id?T.accentStr:T.border}`}}>
                {c.label}
              </button>
            ))}
          </div>

          {activeAgent&&(
            <div style={{padding:"18px 20px",marginBottom:14,minHeight:380, background: T.card, borderRadius: T.r3, border: `1px solid ${T.border}`}}>
              <AgentPanel
                agent={AGENT_DEFS.find(a=>a.id===activeAgent)}
                steps={agentSteps[activeAgent]||[]}
                toolStatus={toolStatus[activeAgent]||{}}
                result={agentResults[activeAgent]}
                error={agentErrors[activeAgent]}
                onClose={()=>setActiveAgent(null)}/>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
            {filtered.map(agent=>(
              <AgentCard key={agent.id} agent={agent}
                status={agentStatus[agent.id]||"idle"}
                active={activeAgent===agent.id}
                onRun={(id: string)=>{ runAgent(id); }}/>
            ))}
          </div>

          {registeredAgents.length > 0 && (
            <div style={{marginTop: 32}}>
              <h2 style={{fontSize: 20, fontWeight: 700, color: T.t1, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8}}>
                <Globe size={20} color={T.accent} />
                Ro'yxatdan o'tgan Agentlar
              </h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
                {registeredAgents.map(agent => (
                  <div 
                    key={agent.id}
                    style={{
                      padding: '18px 20px',
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      borderRadius: T.r3,
                      position: 'relative'
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <div style={{width: 36, height: 36, borderRadius: T.r2, background: T.accentDim, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: T.accent}}>
                          <Bot size={20} />
                        </div>
                        <div>
                          <h3 style={{fontSize: 16, fontWeight: 700, color: T.t1}}>{agent.name}</h3>
                          <span style={{fontSize: 12, color: T.t3, fontFamily: T.mono}}>{agent.platform}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteAgent(agent.id)}
                        style={{background: 'transparent', border: 'none', color: T.t4, cursor: 'pointer'}}
                        className="hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div style={{fontSize: 14, color: T.t2, marginBottom: 12}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4}}>
                        <Zap size={14} color={T.amber} />
                        <span>{agent.allowed_events.length} ta hodisa</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                        <Shield size={14} color={T.green} />
                        <span>{agent.permissions.length} ta ruxsatnoma</span>
                      </div>
                    </div>

                    <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}`}}>
                      <div style={{flex: 1, fontSize: 12, color: T.t3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {agent.webhook_url || 'Webhook yo\'q'}
                      </div>
                      <Tag color={agent.status === 'active' ? T.green : agent.status === 'error' ? T.red : T.t4} dim={agent.status === 'active' ? T.greenDim : agent.status === 'error' ? T.redDim : undefined}>
                        {agent.status}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {completedCount>0&&(
            <div style={{padding:"16px 18px", background: T.card, borderRadius: T.r3, border: `1px solid ${T.border}`}}>
              <div style={{fontSize:18,fontWeight:700,color:T.t1,marginBottom:12}}>Oxirgi Natijalar</div>
              {AGENT_DEFS.filter(a=>agentResults[a.id]?.output).map(agent=>(
                <div key={agent.id} style={{marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${T.border}33`}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                    <span style={{fontSize:18,color:agent.color}}>{agent.icon}</span>
                    <span style={{fontSize:16,fontWeight:700,color:T.t1}}>{agent.label}</span>
                    <Tag color={T.green} dim={T.greenDim}>OK</Tag>
                  </div>
                  <div style={{fontSize:16,color:T.t2,fontFamily:T.mono,lineHeight:1.6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>
                    {agentResults[agent.id].output}
                  </div>
                  <button className="active:scale-95 hover:opacity-80 transition-all duration-150 shadow-lg shadow-cyan-500/20" style={{marginTop:8,fontSize:16,padding:"6px 12px", background: T.accent, color: T.bg, border: "none", borderRadius: T.r1, cursor: "pointer", fontWeight: 700}}
                    onClick={()=>{setActiveAgent(agent.id);}}>
                    To'liq ko'rish {"->"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {historyView&&(
            <div style={{padding:"16px 18px",border:`1px solid ${historyView.agent.color}44`, background: T.card, borderRadius: T.r3}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:historyView.agent.color,fontSize:18}}>{historyView.agent.icon}</span>
                  <span style={{fontSize:16,fontWeight:700,color:T.t1}}>{historyView.agent.label}</span>
                </div>
                <button className="active:scale-95 hover:bg-white/5 transition-all duration-150" style={{fontSize:16,padding:"4px 10px", background: "transparent", color: T.t3, border: `1px solid ${T.border}`, borderRadius: T.r1, cursor: "pointer"}} onClick={()=>setHistoryView(null)}>Yopish</button>
              </div>
              <div style={{fontSize:16,maxHeight:200,overflowY:"auto", fontFamily: T.mono, color: T.t2, whiteSpace: "pre-wrap"}}>{historyView.record.output}</div>
            </div>
          )}

          <div style={{padding:"16px 18px", background: T.card, borderRadius: T.r3, border: `1px solid ${T.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:18,fontWeight:700,color:T.t1}}>Bajarish Tarixi</div>
              {history.length>0&&<button className="active:scale-95 hover:bg-white/5 transition-all duration-150" style={{fontSize:16,padding:"6px 12px", background: "transparent", color: T.t3, border: `1px solid ${T.border}`, borderRadius: T.r1, cursor: "pointer"}} onClick={()=>setHistory([])}>Tozalash</button>}
            </div>
            {history.length===0?(
              <div style={{color:T.t4,fontSize:16,fontFamily:T.mono,padding:"16px 0",textAlign:"center"}}>Hali agent ishlatilmagan</div>
            ):(
              history.map((h,i)=>{
                const agent = AGENT_DEFS.find(a=>a.id===h.agentId);
                if(!agent) return null;
                return <HistoryItem key={i} agent={agent} record={h} onView={(ag: any,rec: any)=>setHistoryView({agent:ag,record:rec})}/>;
              })
            )}
          </div>

          <div style={{padding:"16px 18px", background: T.card, borderRadius: T.r3, border: `1px solid ${T.border}`}}>
            <div style={{fontSize:18,fontWeight:700,color:T.t1,marginBottom:10}}>Qo'llanma</div>
            {[
              {icon:"1",text:"Agent kartasini bosing yoki ishga tushirish tugmasini bosing"},
              {icon:"2",text:"Agent tool-larni bajaradi va ma'lumot yig'adi"},
              {icon:"3",text:"Claude AI yig'ilgan ma'lumotni O'zbek tilida tahlil qiladi"},
              {icon:"4",text:"Natijani panel da ko'ring va tarixda saqlang"},
              {icon:"",text:"Orkestrator barcha agentlarni ketma-ket ishlatadi"},
            ].map((g,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
                <span style={{width:24,height:24,borderRadius:"50%",background:T.accentDim,border:`1px solid ${T.accentStr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize: 16,color:T.accent,fontFamily:T.mono,fontWeight:700,flexShrink:0}}>{g.icon}</span>
                <span style={{fontSize:16,color:T.t2,lineHeight:1.5}}>{g.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Register Agent Modal */}
      {isRegisterModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)'
        }}>
          <div 
            style={{
              width: '100%',
              maxWidth: '500px',
              background: T.surface,
              border: `1px solid ${T.borderHi}`,
              borderRadius: T.r4,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
            className="animate-in fade-in zoom-in duration-200"
          >
            <div style={{padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h2 style={{fontSize: 20, fontWeight: 700, color: T.t1}}>Yangi Agent Ro'yxatdan O'tkazish</h2>
              <button 
                onClick={() => setIsRegisterModalOpen(false)}
                style={{background: 'transparent', border: 'none', color: T.t3, cursor: 'pointer'}}
                className="hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleRegisterAgent} style={{padding: '24px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <div>
                  <label style={{display: 'block', fontSize: 14, fontWeight: 600, color: T.t2, marginBottom: 6}}>Agent Nomi</label>
                  <input 
                    type="text"
                    required
                    value={newAgent.name}
                    onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                    placeholder="Masalan: Telegram Bot Analitiki"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      borderRadius: T.r2,
                      color: T.t1,
                      outline: 'none'
                    }}
                    className="focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label style={{display: 'block', fontSize: 14, fontWeight: 600, color: T.t2, marginBottom: 6}}>Platforma</label>
                  <select 
                    value={newAgent.platform}
                    onChange={e => setNewAgent({...newAgent, platform: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      borderRadius: T.r2,
                      color: T.t1,
                      outline: 'none'
                    }}
                    className="focus:border-cyan-500 transition-colors"
                  >
                    <option value="Telegram">Telegram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Web">Web Widget</option>
                    <option value="Slack">Slack</option>
                    <option value="Discord">Discord</option>
                  </select>
                </div>

                <div>
                  <label style={{display: 'block', fontSize: 14, fontWeight: 600, color: T.t2, marginBottom: 6}}>Webhook URL</label>
                  <input 
                    type="url"
                    value={newAgent.webhook_url}
                    onChange={e => setNewAgent({...newAgent, webhook_url: e.target.value})}
                    placeholder="https://your-api.com/webhook"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      borderRadius: T.r2,
                      color: T.t1,
                      outline: 'none'
                    }}
                    className="focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label style={{display: 'block', fontSize: 14, fontWeight: 600, color: T.t2, marginBottom: 6}}>Ruxsat etilgan hodisalar</label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                    {['message', 'join', 'leave', 'payment', 'error'].map(event => (
                      <button
                        key={event}
                        type="button"
                        onClick={() => {
                          const events = newAgent.allowed_events.includes(event)
                            ? newAgent.allowed_events.filter(e => e !== event)
                            : [...newAgent.allowed_events, event];
                          setNewAgent({...newAgent, allowed_events: events});
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: newAgent.allowed_events.includes(event) ? T.accentDim : T.card,
                          color: newAgent.allowed_events.includes(event) ? T.accent : T.t3,
                          border: `1px solid ${newAgent.allowed_events.includes(event) ? T.accentStr : T.border}`
                        }}
                      >
                        {event}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{display: 'block', fontSize: 14, fontWeight: 600, color: T.t2, marginBottom: 6}}>Ruxsatnomalar</label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                    {['read_data', 'write_data', 'admin', 'execute_tools', 'manage_users'].map(perm => (
                      <button
                        key={perm}
                        type="button"
                        onClick={() => {
                          const perms = newAgent.permissions.includes(perm)
                            ? newAgent.permissions.filter(p => p !== perm)
                            : [...newAgent.permissions, perm];
                          setNewAgent({...newAgent, permissions: perms});
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: newAgent.permissions.includes(perm) ? T.greenDim : T.card,
                          color: newAgent.permissions.includes(perm) ? T.green : T.t3,
                          border: `1px solid ${newAgent.permissions.includes(perm) ? T.green + '44' : T.border}`
                        }}
                      >
                        {perm.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{marginTop: 32, display: 'flex', gap: 12}}>
                <button 
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'transparent',
                    border: `1px solid ${T.border}`,
                    borderRadius: T.r2,
                    color: T.t2,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  className="hover:bg-white/5 transition-colors"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: T.accent,
                    border: 'none',
                    borderRadius: T.r2,
                    color: T.bg,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                  className="hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Saqlanmoqda...' : (
                    <>
                      <Check size={20} />
                      Ro'yxatdan o'tkazish
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
