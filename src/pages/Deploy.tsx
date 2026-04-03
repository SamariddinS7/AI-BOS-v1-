import React, { useState, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const T = {
  bg:       "#0B0F19",
  surface:  "#111827",
  card:     "#1A2236",
  cardHov:  "#1E2840",
  border:   "#2A3655",
  borderHi: "#3D4F78",
  accent:   "#00D4FF",
  accentDim:"rgba(0,212,255,0.10)",
  accentStr:"rgba(0,212,255,0.28)",
  green:    "#22C55E",  greenDim: "rgba(34,197,94,0.12)",
  amber:    "#F59E0B",  amberDim: "rgba(245,158,11,0.12)", amberStr: "rgba(245,158,11,0.28)",
  red:      "#EF4444",  redDim:   "rgba(239,68,68,0.11)",
  violet:   "#A78BFA",  violetDim:"rgba(167,139,250,0.12)",
  teal:     "#2DD4BF",  tealDim:  "rgba(45,212,191,0.11)",
  sky:      "#38BDF8",  skyDim:   "rgba(56,189,248,0.11)",
  t1: "#F0F4FF",
  t2: "#8B9EC4",
  t3: "#4D618A",
  t4: "#283350",
  sans: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  r1: "6px", r2: "10px", r3: "14px", r4: "20px",
};

const Tag = memo(({ children, color=T.accent, dim }: any) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, fontFamily: T.mono, border: "1px solid transparent", color, background: dim||`${color}12`, borderColor:`${color}30` }}>{children}</span>
));

const N8N_WORKFLOWS = [
  { id: "wf_lead_sync", name: "Lead Sync (CRM -> AI)", status: "active", triggers: ["Webhook", "Schedule"], nodes: 8, lastRun: "2 daqiqa oldin", successRate: "99.8%" },
  { id: "wf_daily_report", name: "Kunlik Hisobot Generatsiyasi", status: "active", triggers: ["Cron (08:00)"], nodes: 12, lastRun: "Bugun 08:00", successRate: "100%" },
  { id: "wf_anomaly_alert", name: "Anomaliya Deteksiyasi & Telegram Alert", status: "active", triggers: ["Webhook (AI-BOS)"], nodes: 5, lastRun: "Kecha 15:30", successRate: "98.5%" },
  { id: "wf_invoice_gen", name: "Avtomatik Invoys Yaratish", status: "paused", triggers: ["Webhook (Payment)"], nodes: 15, lastRun: "3 kun oldin", successRate: "95.2%" },
];

const DEPLOY_TARGETS = [
  { id: "prod_server", name: "Production Server (Tashkent)", type: "VPS", ip: "195.158.xx.xx", status: "online", uptime: "99.99%", lastDeploy: "2025-03-01 14:30" },
  { id: "staging_server", name: "Staging Server (Frankfurt)", type: "Cloud", ip: "18.192.xx.xx", status: "online", uptime: "99.95%", lastDeploy: "2025-03-05 09:15" },
];

export default function DeployPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('n8n');
  const [deploying, setDeploying] = useState(false);
  const [deployLog, setDeployLog] = useState<string[]>([]);

  const handleDeploy = () => {
    setDeploying(true);
    setDeployLog(["[INFO] Joylashtirish boshlandi...", "[INFO] Docker konteynerlar to'xtatilmoqda..."]);
    
    setTimeout(() => setDeployLog(l => [...l, "[INFO] Yangi kod yuklab olinmoqda (git pull)..."]), 1000);
    setTimeout(() => setDeployLog(l => [...l, "[INFO] Bog'liqliklar o'rnatilmoqda (npm install)..."]), 2500);
    setTimeout(() => setDeployLog(l => [...l, "[INFO] Loyiha yig'ilmoqda (npm run build)..."]), 4000);
    setTimeout(() => setDeployLog(l => [...l, "[INFO] Docker konteynerlar qayta ishga tushirilmoqda..."]), 6000);
    setTimeout(() => {
      setDeployLog(l => [...l, "[SUCCESS] Joylashtirish muvaffaqiyatli yakunlandi!"]);
      setDeploying(false);
    }, 7500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans transition-all duration-500 space-y-8 animate-slide-in" style={{background: T.bg, color: T.t1}}>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Joylashtirish & n8n</h1>
        <p className="text-base text-text-muted">Tizimni serverga joylashtirish va n8n avtomatlashtirish jarayonlarini boshqarish</p>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:20,borderBottom:`1px solid ${T.border}`,paddingBottom:10}}>
        <button onClick={()=>setActiveTab('n8n')} style={{padding:"8px 16px",borderRadius:T.r2,fontSize: 16,fontWeight:600,background:activeTab==='n8n'?T.accentDim:"transparent",color:activeTab==='n8n'?T.accent:T.t3,border:`1px solid ${activeTab==='n8n'?T.accentStr:"transparent"}`}}>n8n Workflows</button>
        <button onClick={()=>setActiveTab('deploy')} style={{padding:"8px 16px",borderRadius:T.r2,fontSize: 16,fontWeight:600,background:activeTab==='deploy'?T.accentDim:"transparent",color:activeTab==='deploy'?T.accent:T.t3,border:`1px solid ${activeTab==='deploy'?T.accentStr:"transparent"}`}}>Server Deploy</button>
        <button onClick={()=>setActiveTab('docker')} style={{padding:"8px 16px",borderRadius:T.r2,fontSize: 16,fontWeight:600,background:activeTab==='docker'?T.accentDim:"transparent",color:activeTab==='docker'?T.accent:T.t3,border:`1px solid ${activeTab==='docker'?T.accentStr:"transparent"}`}}>Docker Compose</button>
      </div>

      {activeTab === 'n8n' && (
        <div style={{display:"grid",gap:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <h2 style={{fontSize:18,fontWeight:700,color:T.t1}}>Faol n8n Jarayonlari</h2>
          </div>
          
          <div style={{display: "flex", justifyContent: "flex-end"}}>
            <button style={{padding:"8px 16px",background:T.accent,color:T.bg,borderRadius:"9999px",fontSize: 16,fontWeight:700,border:"none",cursor:"pointer"}}>+ Yangi Workflow</button>
          </div>
          
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(350px,1fr))",gap:16}}>
            {N8N_WORKFLOWS.map(wf => (
              <div key={wf.id} style={{padding:"20px",background:T.card,borderRadius:T.r3,border:`1px solid ${T.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div style={{fontSize: 16,fontWeight:700,color:T.t1}}>{wf.name}</div>
                  <Tag color={wf.status==="active"?T.green:T.amber} dim={wf.status==="active"?T.greenDim:T.amberDim}>{wf.status==="active"?"Faol":"To'xtatilgan"}</Tag>
                </div>
                
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize: 16}}>
                    <span style={{color:T.t3}}>Triggerlar:</span>
                    <span style={{color:T.t2,fontFamily:T.mono}}>{wf.triggers.join(", ")}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize: 16}}>
                    <span style={{color:T.t3}}>Tugunlar (Nodes):</span>
                    <span style={{color:T.t2,fontFamily:T.mono}}>{wf.nodes} ta</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize: 16}}>
                    <span style={{color:T.t3}}>Oxirgi ishga tushish:</span>
                    <span style={{color:T.t2,fontFamily:T.mono}}>{wf.lastRun}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize: 16}}>
                    <span style={{color:T.t3}}>Muvaffaqiyat ko'rsatkichi:</span>
                    <span style={{color:T.green,fontFamily:T.mono,fontWeight:700}}>{wf.successRate}</span>
                  </div>
                </div>
                
                <div style={{display:"flex",gap:10}}>
                  <button style={{flex:1,padding:"8px",background:T.surface,color:T.t2,border:`1px solid ${T.border}`,borderRadius:T.r2,fontSize: 16,fontWeight:600,cursor:"pointer"}}>Tahrirlash</button>
                  <button style={{flex:1,padding:"8px",background:wf.status==="active"?T.amberDim:T.greenDim,color:wf.status==="active"?T.amber:T.green,border:`1px solid ${wf.status==="active"?T.amberStr:T.greenDim}`,borderRadius:T.r2,fontSize: 16,fontWeight:600,cursor:"pointer"}}>
                    {wf.status==="active"?"To'xtatish":"Ishga tushirish"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{padding:"20px",background:T.card,borderRadius:T.r3,border:`1px solid ${T.border}`,marginTop:20}}>
            <h3 style={{fontSize:16,fontWeight:700,color:T.t1,marginBottom:12}}>n8n Webhook URL manzillari</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:T.surface,borderRadius:T.r2,border:`1px solid ${T.border}`}}>
                <span style={{color:T.accent,fontSize: 16}}>Webhook 1 (Lead Sync):</span>
                <code style={{flex:1,color:T.t2,fontFamily:T.mono,fontSize: 16}}>https://n8n.ai-bos.uz/webhook/lead-sync-prod</code>
                <button style={{padding:"4px 10px",background:T.accentDim,color:T.accent,border:`1px solid ${T.accentStr}`,borderRadius:T.r1,fontSize: 16,cursor:"pointer"}}>Nusxa olish</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:T.surface,borderRadius:T.r2,border:`1px solid ${T.border}`}}>
                <span style={{color:T.accent,fontSize: 16}}>Webhook 2 (Alerts):</span>
                <code style={{flex:1,color:T.t2,fontFamily:T.mono,fontSize: 16}}>https://n8n.ai-bos.uz/webhook/system-alerts</code>
                <button style={{padding:"4px 10px",background:T.accentDim,color:T.accent,border:`1px solid ${T.accentStr}`,borderRadius:T.r1,fontSize: 16,cursor:"pointer"}}>Nusxa olish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deploy' && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 350px",gap:20}}>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{padding:"20px",background:T.card,borderRadius:T.r3,border:`1px solid ${T.border}`}}>
              <h2 style={{fontSize:18,fontWeight:700,color:T.t1,marginBottom:16}}>Serverlar</h2>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {DEPLOY_TARGETS.map(target => (
                  <div key={target.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px",background:T.surface,borderRadius:T.r2,border:`1px solid ${T.border}`}}>
                    <div>
                      <div style={{fontSize: 16,fontWeight:700,color:T.t1,marginBottom:4}}>{target.name}</div>
                      <div style={{fontSize: 16,color:T.t3,fontFamily:T.mono}}>{target.type} • {target.ip}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <Tag color={T.green} dim={T.greenDim}>{target.status}</Tag>
                      <div style={{fontSize: 16,color:T.t3,marginTop:6}}>Uptime: {target.uptime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{padding:"20px",background:T.card,borderRadius:T.r3,border:`1px solid ${T.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <h2 style={{fontSize:18,fontWeight:700,color:T.t1}}>Joylashtirish (Deploy)</h2>
                <button 
                  onClick={handleDeploy} 
                  disabled={deploying}
                  style={{padding:"10px 20px",background:deploying?T.t4:T.accent,color:deploying?T.t2:T.bg,borderRadius:T.r2,fontSize: 16,fontWeight:700,border:"none",cursor:deploying?"not-allowed":"pointer",transition:"all 0.2s"}}>
                  {deploying ? "Joylashtirilmoqda..." : "Hozir joylashtirish (Deploy Now)"}
                </button>
              </div>
              
              <div style={{background:T.bg,padding:"16px",borderRadius:T.r2,border:`1px solid ${T.border}`,minHeight:200,maxHeight:400,overflowY:"auto",fontFamily:T.mono,fontSize: 16,color:T.t2,display:"flex",flexDirection:"column",gap:6}}>
                {deployLog.length === 0 ? (
                  <div style={{color:T.t4,textAlign:"center",marginTop:80}}>Joylashtirish jurnali bu yerda ko'rinadi</div>
                ) : (
                  deployLog.map((log, i) => (
                    <div key={i} style={{color:log.includes("[ERROR]")?T.red:log.includes("[SUCCESS]")?T.green:log.includes("[INFO]")?T.sky:T.t2}}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{padding:"20px",background:T.card,borderRadius:T.r3,border:`1px solid ${T.border}`}}>
              <h3 style={{fontSize: 16,fontWeight:700,color:T.t1,marginBottom:12}}>Muhit O'zgaruvchilari (.env)</h3>
              <p style={{fontSize: 16,color:T.t3,marginBottom:16}}>Serverdagi muhit o'zgaruvchilarini boshqarish. O'zgarishlar keyingi deployda qo'llaniladi.</p>
              <button style={{width:"100%",padding:"10px",background:T.surface,color:T.t1,border:`1px solid ${T.border}`,borderRadius:T.r2,fontSize: 16,fontWeight:600,cursor:"pointer"}}>Muharrirni ochish</button>
            </div>
            
            <div style={{padding:"20px",background:T.card,borderRadius:T.r3,border:`1px solid ${T.border}`}}>
              <h3 style={{fontSize: 16,fontWeight:700,color:T.t1,marginBottom:12}}>Zaxira Nusxalari (Backups)</h3>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize: 16,padding:"8px 0",borderBottom:`1px solid ${T.border}55`}}>
                  <span style={{color:T.t2}}>2025-03-05_db.sql.gz</span>
                  <span style={{color:T.accent,cursor:"pointer"}}>Yuklab olish</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize: 16,padding:"8px 0",borderBottom:`1px solid ${T.border}55`}}>
                  <span style={{color:T.t2}}>2025-03-04_db.sql.gz</span>
                  <span style={{color:T.accent,cursor:"pointer"}}>Yuklab olish</span>
                </div>
                <button style={{marginTop:10,padding:"8px",background:T.surface,color:T.t1,border:`1px solid ${T.border}`,borderRadius:T.r2,fontSize: 16,fontWeight:600,cursor:"pointer"}}>Yangi zaxira yaratish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'docker' && (
        <div style={{padding:"20px",background:T.card,borderRadius:T.r3,border:`1px solid ${T.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h2 style={{fontSize:18,fontWeight:700,color:T.t1}}>docker-compose.yml</h2>
            <div style={{display:"flex",gap:10}}>
              <button style={{padding:"8px 16px",background:T.surface,color:T.t1,border:`1px solid ${T.border}`,borderRadius:T.r2,fontSize: 16,fontWeight:600,cursor:"pointer"}}>Nusxa olish</button>
              <button style={{padding:"8px 16px",background:T.accent,color:T.bg,borderRadius:T.r2,fontSize: 16,fontWeight:700,border:"none",cursor:"pointer"}}>Saqlash</button>
            </div>
          </div>
          
          <pre style={{background:T.bg,padding:"20px",borderRadius:T.r2,border:`1px solid ${T.border}`,overflowX:"auto",fontFamily:T.mono,fontSize: 16,color:T.t2,lineHeight:1.5}}>
{`version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    restart: always
    environment:
      - NODE_ENV=production
    depends_on:
      - backend

  backend:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./server:/app
    command: npm start
    ports:
      - "3000:3000"
    restart: always
    environment:
      - DB_HOST=postgres
      - DB_USER=\${DB_USER}
      - DB_PASS=\${DB_PASS}
    depends_on:
      - postgres

  postgres:
    image: postgres:14-alpine
    restart: always
    environment:
      - POSTGRES_USER=\${DB_USER}
      - POSTGRES_PASSWORD=\${DB_PASS}
      - POSTGRES_DB=aibos_db
    volumes:
      - pgdata:/var/lib/postgresql/data

  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=n8n.ai-bos.uz
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.ai-bos.uz/
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  pgdata:
  n8n_data:`}
          </pre>
        </div>
      )}
    </div>
  );
}
