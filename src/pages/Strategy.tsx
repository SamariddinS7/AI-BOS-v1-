import React, { useState, useMemo, memo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend
} from 'recharts';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import Card from '../components/ui/Card';
import { useToast } from '../hooks/useToast';

// Color Palette from user's code
const T = {
  accent:   "#3b82f6", // blue-500
  accentDim:"rgba(59,130,246,0.10)",
  accentStr:"rgba(59,130,246,0.28)",
  green:    "#10b981",  greenDim: "rgba(16,185,129,0.12)",
  amber:    "#f59e0b",  amberDim: "rgba(245,158,11,0.12)",
  red:      "#ef4444",  redDim:   "rgba(239,68,68,0.11)",
  violet:   "#8b5cf6",  violetDim:"rgba(139,92,246,0.12)",
  teal:     "#0d9488",  tealDim:  "rgba(13,148,136,0.11)",
  sky:      "#0ea5e9",  skyDim:   "rgba(14,165,233,0.11)",
  border:   "#1e293b", // slate-800
  borderHi: "#334155", // slate-700
  t1: "#f8fafc", // slate-50
  t2: "#cbd5e1", // slate-300
  t3: "#64748b", // slate-500
  t4: "#334155", // slate-700
};

const STRAT_TABS = [
  {id:"architecture", label:"Arxitektura",   icon:""},
  {id:"monetization", label:"Monetizatsiya", icon:""},
  {id:"investor",     label:"Investor",       icon:""},
  {id:"expansion",    label:"Kengayish",      icon:""},
  {id:"roadmap",      label:"Yo'l xaritasi",  icon:""},
];

const C4_LAYERS = [
  {
    id:"L1", label:"Qatlam 1 — Ma'lumot Kiritish",
    color:T.accent, dim:T.accentDim, border:T.accentStr,
    icon:"Down",
    desc:"Barcha reklama kanallaridan real-vaqt ma'lumot yig'ish va normallashtirish",
    nodes:[
      {n:"Meta Ads API",     detail:"Graph API v19+ · OAuth 2.0 · 15 daqiqa yangilanish"},
      {n:"Google Ads API",   detail:"v15 Service Account · Kalit so'zlar, konversiya"},
      {n:"TV / Offline",     detail:"CSV batch + REST · Kunlik yuklash · Kechikish modeli"},
      {n:"CRM Connector",    detail:"HubSpot / Salesforce · Webhook + REST · Real-vaqt"},
      {n:"Social APIs",      detail:"Instagram, TikTok, YouTube · Engagement, mention"},
      {n:"ERP Ko'prigi",     detail:"Moliya moduli bilan to'g'ridan bog'liq · P&L map"},
    ],
    output:"-> Normalangan event oqimi · ichki message bus (kanal JSON sxemasi)",
  },
  {
    id:"L2", label:"Qatlam 2 — Hisoblash va KPI",
    color:T.teal, dim:T.tealDim, border:"rgba(13,148,136,0.28)",
    icon:"",
    desc:"Deterministik matematik formulalar — AI hech qachon bu qatlamga aralashmaydi",
    nodes:[
      {n:"KPI Engine",         detail:"ROI=(Dar-Xar)/Xar · ROAS=Dar/Xar · CAC=Xar/Konv"},
      {n:"Attribution Engine", detail:"First/Last/Linear/Time-Decay · 4 model parallell"},
      {n:"ROI Calculator",     detail:"CPM=(Xar/Imp)*1000 · CTR=Bosish/Imp · CPC=Xar/Bosish"},
      {n:"Sentiment Analyzer", detail:"Pos/Neu/Neg klassifikatsiya · Brand xavf indeksi"},
      {n:"Competitor Tracker", detail:"Bozor ulushi · O'sish sur'ati · Bosim balli"},
    ],
    output:"-> Strukturali KPI ob'ektlar har bir kampaniya/kanal/vaqt oynasi uchun",
  },
  {
    id:"L3", label:"Qatlam 3 — Aql-zakovat",
    color:T.violet, dim:T.violetDim, border:"rgba(139,92,246,0.28)",
    icon:"",
    desc:"L2 natijalaridan strategik tushunchalar va tavsiyalar generatsiyasi",
    nodes:[
      {n:"Budget Rebalancer",       detail:"Increase/Decrease/Optimize/Hold · ROAS/CAC asosida"},
      {n:"Forecast Engine",         detail:"Ko'chuvchi o'rtacha + linear regressiya · 1–6 oy"},
      {n:"Marketing Health Index",  detail:"0–100 ball: Samaradorlik+O'sish+Barqarorlik+Raqobat"},
      {n:"Risk Detector",           detail:"CAC/LTV nisbat xavfi · ROI chegarasi · Sentiment spike"},
    ],
    output:"-> Tavsiyalar + xavf bayroqlari + prognoz ob'ektlari",
  },
  {
    id:"L4", label:"Qatlam 4 — AI Talqin",
    color:T.amber, dim:T.amberDim, border:"rgba(245,158,11,0.28)",
    icon:"",
    desc:"Faqat L3 natijalarini o'qiydi — hech qachon hisoblash bajarmaydi",
    nodes:[
      {n:"Strategiya Tafsiri",    detail:"L3 tavsiyalarini biznes tilida tushuntiradi"},
      {n:"Kampaniya Narrativi",   detail:"Optimizatsiya yo'nalishlarini hikoya sifatida beradi"},
      {n:"Ijrochi Xulosa",        detail:"Boshqaruv kengashi uchun avtomatik hisobot generatsiyasi"},
      {n:"Ad Copy Skorer",        detail:"Aniqlik / Hissiyot / Ishontirish / CTA samaradorligi"},
    ],
    output:"-> Tabiiy til tushunchalari · Hisobot matnlari · Tavsiya narrativlari",
    rule:"QOIDA: AI hech qachon ROI, ROAS, CAC yoki boshqa raqamli ko'rsatkichlarni HISOBLAMAYDI",
  },
  {
    id:"L5", label:"Qatlam 5 — Dashboard va API",
    color:T.sky, dim:T.skyDim, border:"rgba(14,165,233,0.28)",
    icon:"Up",
    desc:"Foydalanuvchi interfeysi, REST API, webhook va integratsiyalar",
    nodes:[
      {n:"React Dashboard",  detail:"AI-BOS v3 · 5 modul · Mobil responsive"},
      {n:"REST API",         detail:"/marketing/summary · /forecast · /optimize · /attribution"},
      {n:"Webhook / n8n",    detail:"HMAC imzolangan · Nonce replay himoya · Circuit breaker"},
      {n:"Voice Agent",      detail:"Whisper STT (UZ/RU/EN) · Claude intent · ElevenLabs TTS"},
      {n:"RBAC + Audit",     detail:"admin/manager/analyst/viewer · Har so'rov uchun log"},
    ],
    output:"-> Foydalanuvchi harakati · API javobi · Audit yozuvi",
  },
];

const TIERS = [
  {
    id:"basic", label:"BASIC", color:T.teal, dim:T.tealDim,
    price:"$299 – $499", period:"/oy",
    target:"Kichik va o'rta biznes · Startaplar",
    margin:"~72%",
    features:[
      {f:"3 ta kanal",                ok:true},
      {f:"Last-touch atribusiya",     ok:true},
      {f:"ROI/ROAS/CAC/CTR/CPM",      ok:true},
      {f:"AI qatlami",                ok:false},
      {f:"Prognoz (3 oy)",            ok:false},
      {f:"TV atribusiya",             ok:false},
      {f:"Raqobatchi tahlili",        ok:false},
      {f:"Voice Agent",               ok:false},
      {f:"API (faqat o'qish)",        ok:true},
      {f:"99.5% SLA",                 ok:true},
    ],
  },
  {
    id:"pro", label:"PRO", color:T.accent, dim:T.accentDim,
    price:"$999 – $1,999", period:"/oy",
    target:"O'rta bozor · 50–500 xodim",
    margin:"~80%",
    hot:true,
    features:[
      {f:"8 ta kanal",                ok:true},
      {f:"4 ta atribusiya modeli",    ok:true},
      {f:"AI strategiya tavsiyalari", ok:true},
      {f:"3 oylik prognoz",           ok:true},
      {f:"TV atribusiya (add-on)",    ok:"add"},
      {f:"Sentiment AI (add-on)",     ok:"add"},
      {f:"Raqiblar tahlili (add-on)", ok:"add"},
      {f:"Voice Agent",               ok:false},
      {f:"To'liq REST API",           ok:true},
      {f:"99.9% SLA",                 ok:true},
    ],
  },
  {
    id:"enterprise", label:"ENTERPRISE", color:T.violet, dim:T.violetDim,
    price:"$3,500 – $8,000+", period:"/oy",
    target:"Korporativ · Agentliklar · Holdinglar",
    margin:"~85%",
    features:[
      {f:"Cheksiz kanallar",          ok:true},
      {f:"Maxsus atribusiya modeli",  ok:true},
      {f:"To'liq AI orkestrasiya",    ok:true},
      {f:"12 oylik prognoz + stsenario",ok:true},
      {f:"TV atribusiya (o'rnatilgan)",ok:true},
      {f:"Sentiment + Brand xavf",    ok:true},
      {f:"Raqobatchi razvedkasi",     ok:true},
      {f:"Voice Agent (UZ/RU/EN)",    ok:true},
      {f:"REST + webhook + maxsus",   ok:true},
      {f:"99.99% SLA + CSM",          ok:true},
    ],
  },
];

const ADDONS = [
  {l:"Sentiment Intelligence", p:"$299/oy",  m:"~88%", t:"Brand / PR menejerlar"},
  {l:"Competitor Ad Intel",    p:"$399/oy",  m:"~82%", t:"O'sish / Strategiya"},
  {l:"TV Offline Attribution", p:"$599/oy",  m:"~79%", t:"Media byudjeti bor korxonalar"},
  {l:"Executive AI Reports",   p:"$199/oy",  m:"~90%", t:"Boshqaruv kengashi"},
  {l:"Voice Command Agent",    p:"$499/oy",  m:"~75%", t:"Operatsion jamoalar"},
];

const PROBLEMS = [
  {n:"1",c:T.red,   title:"Marketing byudjetini isrof qilish",    stat:"26%",  statLabel:"o'rtacha noto'g'ri taqsimlangan xarajat",  fix:"Deterministik KPI engine + attribution"},
  {n:"2",c:T.amber, title:"Cross-kanal atribusiya buzilgan",      stat:"60–80%",statLabel:"funnel qismi last-click bilan o'lchab bo'lmaydi",fix:"4-model atribusiya + TV lag modeli"},
  {n:"3",c:T.violet,title:"Oflayn reklamalar o'lchanmaydi",       stat:"$200B+",statLabel:"global TV/radio xarajat — ROI noma'lum",   fix:"TV lag attribution + probabilistik model"},
  {n:"4",c:T.sky,   title:"AI moliyadan uzilgan",                 stat:"0 ta", statLabel:"mavjud AI tool P&L bilan integratsiyalangan",fix:"ERP ko'prigi + deterministik L2 qatlam"},
];

const MOATS = [
  {icon:"",label:"Ma'lumot tarmoq effekti",   desc:"Har bir mijozning atribusiya ma'lumoti barcha mijozlar uchun modelni yaxshilaydi",years:"5+ yil"},
  {icon:"",label:"ERP/CRM integratsiya chuqurligi",desc:"Almashtirish 3–6 oylik migratsiya loyihasi — yuqori switching cost",years:"1-kundan kuchli"},
  {icon:"",label:"Mahalliy muvofiqlik murakkabligi",desc:"O'zbekiston vergi va hisobot formatlari — xorijiy raqobatchilar tezda kira olmaslik",years:"5 yillik to'siq"},
  {icon:"",label:"Gibrid AI arxitekturasi",    desc:"Deterministik L2 + AI L4 — enterprise audit talablarini o'tadigan yagona yechim",years:"2–3 yil texnik ustunlik"},
  {icon:"",label:"Til / madaniy moslik",       desc:"UZ/RU/EN native AI qo'llab-quvvatlash — marketing terminologiyasi bilan",years:"3–4 yillik geografik to'siq"},
];

const PHASES = [
  {
    id:1, label:"BOSQICH 1", sub:"Lokal bozor", geo:"O'zbekiston · Qozog'iston",
    color:T.teal, period:"0–12 oy",
    arr:"$500K – $1.2M", clients:"15–30 ta",
    items:[
      "50–500 xodimli kompaniyalar",
      "$100K–$2M yillik reklama xarajati",
      "UZS/USD multi-valyuta",
      "O'zReSO 1.0 ma'lumot lokalizatsiya",
      "Mahalliy to'lov tizimlari (Payme, Click)",
      "Toshkent/Almaty cloud hududlari",
    ],
  },
  {
    id:2, label:"BOSQICH 2", sub:"Mintaqaviy kengayish", geo:"MDH · Kavkaz · Sharqiy Yevropa",
    color:T.accent, period:"12–24 oy",
    arr:"$2M – $5M", clients:"80–150 ta",
    items:[
      "O'rta bozor korporatsiyalari",
      "Raqamli agentliklar va media guruhlar",
      "KZT/RUB/USD/EUR to'liq qo'llab-quvvatlash",
      "Frankfurt + Singapur bulut hududlari",
      "GDPR muvofiqlik (Yevropa bozori uchun)",
      "SSO (SAML 2.0) va enterprise API",
    ],
  },
  {
    id:3, label:"BOSQICH 3", sub:"Global SaaS", geo:"MENA · SEA · G'arbiy Yevropa · PLG",
    color:T.violet, period:"24–48 oy",
    arr:"$8M – $20M", clients:"300–600+ ta",
    items:[
      "Holding va korporativ brendlar ($5M+ reklama)",
      "Arab tili UI (MENA kirish)",
      "PLG (Product-Led Growth) harakati",
      "ProductHunt + AppSumo kanallar",
      "US-East + multi-CDN arxitektura",
      "Series A: $15M–$25M mablag' jalb qilish",
    ],
  },
];

const ROADMAP = [
  {period:"M0–M2",theme:"Poydevor",color:T.teal,
   items:[
     {label:"Kanal integratsiya",  done:true,  detail:"Meta + Google API, KPI engine (ROI/ROAS/CAC/CTR/CPM)"},
     {label:"Attribution MVP",     done:true,  detail:"Last-touch + linear + CRM connector"},
     {label:"Xavfsizlik bazasi",   done:true,  detail:"RBAC v1, audit log, HMAC, JWT"},
     {label:"SQLite ma'lumot qatlami",done:true,detail:"Multi-table schema, indekslar, backup"},
   ]},
  {period:"M2–M6",theme:"MVP Chiqarilishi",color:T.accent,
   items:[
     {label:"4 ta atribusiya modeli",done:true, detail:"First/Last/Linear/Time-Decay + TV lag"},
     {label:"AI qatlam v1",          done:true, detail:"Tushunchalar, tavsiyalar, ad copy tahlili"},
     {label:"Prognoz mexanizmi",      done:true, detail:"3 oylik prognoz, ishonch balli"},
     {label:"n8n integratsiya",       done:true, detail:"HMAC webhook, circuit breaker, queue"},
   ]},
  {period:"M6–M9",theme:"AI Kuchaytirilishi",color:T.violet,
   items:[
     {label:"Raqiblar razvedkasi",  done:false, detail:"Raqobat bosimi balli, bozor to'yinganligi"},
     {label:"Sentiment AI",         done:false, detail:"Brand xavf ogohlantirish, mavzu klasterlash"},
     {label:"Voice Agent (UZ/RU/EN)",done:false,detail:"Whisper STT + Claude intent + ElevenLabs TTS"},
     {label:"Budget rebalancer v2", done:false, detail:"AI-yordamida ishonch balli bilan rebalans"},
   ]},
  {period:"M9–M12",theme:"Enterprise Kirish",color:T.amber,
   items:[
     {label:"Multi-tenant arxitektura",done:false,detail:"Tashkilot darajasida ma'lumot izolyatsiyasi"},
     {label:"SSO (SAML 2.0)",          done:false,detail:"Okta, Azure AD, Google Workspace"},
     {label:"Performance narxlash",    done:false,detail:"% xarajat + % daromad o'sishi moduli"},
     {label:"99.99% SLA infratuzilma", done:false,detail:"HA arxitektura, avto-failover"},
   ]},
];

const TAM_DATA = [
  {label:"TAM",   val:18000,  desc:"Global marketing analytics bozori",   color:T.t3},
  {label:"SAM",   val:620,    desc:"MDH + Markaziy Osiyo + Sharqiy Yevropa",color:T.accent},
  {label:"SOM Y1",val:45,     desc:"O'zbekiston + Qozog'iston enterprise", color:T.teal},
  {label:"SOM Y3",val:240,    desc:"Mintaqaviy + Global SaaS kirish",       color:T.green},
];

const UE_DATA = [
  {tier:"Basic",    mrr:380,  life:14, ltv:5320,   cac:480,   ratio:11.1},
  {tier:"Pro",      mrr:1450, life:22, ltv:31900,  cac:2800,  ratio:11.4},
  {tier:"Enterprise",mrr:5200,life:36, ltv:187200, cac:14000, ratio:13.4},
];

const C4LayerCard = memo(({layer, expanded, onToggle}: any)=>{
  return (
    <div onClick={onToggle} className={`cursor-pointer border rounded-2xl transition-all duration-300 mb-3 overflow-hidden ${expanded ? 'bg-surface-card border-brand-500/50' : 'bg-surface-card border-border-dark'}`}>
      <div className={`flex items-center gap-3 p-4 ${expanded ? 'border-b border-border-dark' : ''}`}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0" style={{backgroundColor: layer.dim, border: `1px solid ${layer.border}`, color: layer.color}}>
          {layer.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold" style={{color: layer.color}}>{layer.id}</div>
          <div className="text-base font-bold text-text-primary">{layer.label.split("—")[1]?.trim()||layer.label}</div>
        </div>
        <span className={`text-text-muted transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>v</span>
      </div>

      {expanded&&(
        <div className="p-4 animate-in fade-in slide-in-from-top-2">
          <p className="text-base text-text-secondary mb-4 leading-relaxed">{layer.desc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {layer.nodes.map((n: any, i: number)=>(
              <div key={i} className="bg-surface-ground rounded-lg p-3 border border-border-dark">
                <div className="text-base font-bold text-text-primary mb-1">{n.n}</div>
                <div className="text-base text-text-muted font-mono">{n.detail}</div>
              </div>
            ))}
          </div>
          {layer.rule&&(
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-base text-amber-400 font-semibold mb-3">
              {layer.rule}
            </div>
          )}
          <div className="text-base font-mono p-2 bg-surface-ground rounded-lg border border-border-dark" style={{color: layer.color}}>
            {layer.output}
          </div>
        </div>
      )}
    </div>
  );
});

export default function StrategyPage() {
  const { t } = useLanguage();
  const { info } = useToast();
  const [tab, setTab] = useState("architecture");
  const [expanded, setExpanded] = useState("L1");
  const [phase, setPhase] = useState(1);

  const ArchTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-3 mb-6 p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl">
          <span className="text-2xl text-brand-400"></span>
          <div>
            <div className="text-base font-bold text-brand-400">C4 Model — 5 Qatlamli Arxitektura</div>
            <div className="text-base text-text-muted font-mono">Har bir qatlam faqat quyi qatlam natijasini o'qiydi</div>
          </div>
        </div>

        {C4_LAYERS.map((layer, i) => (
          <div key={layer.id}>
            <C4LayerCard 
              layer={layer} 
              expanded={expanded === layer.id} 
              onToggle={() => {
                setExpanded(expanded === layer.id ? null : layer.id);
                if (expanded !== layer.id) {
                  info(`${layer.label.split("—")[1]?.trim() || layer.label} qatlami ochildi`);
                }
              }} 
            />
            {i < C4_LAYERS.length - 1 && (
              <div className="flex justify-center h-5 items-center relative">
                <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-text-muted/20 to-transparent" />
                <span className="absolute text-base text-text-muted/50 font-mono mt-1">v</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Card className="p-4 border-l-4 border-l-amber-500 bg-surface-card">
          <div className="text-base font-bold text-amber-500 mb-2">Asosiy Qoida</div>
          <p className="text-base text-text-secondary leading-relaxed">
            AI (L4) <strong className="text-text-primary">hech qachon</strong> ROI, ROAS, CAC yoki boshqa raqamli ko'rsatkichlarni <strong className="text-red-500">hisoblamaydi</strong>. Barcha arifmetik hisob-kitoblar L2 da deterministik formulalar orqali amalga oshiriladi.
          </p>
        </Card>

        <Card className="p-4 bg-surface-card">
          <div className="text-base font-bold text-text-primary mb-4">Integratsiya Matrisi</div>
          <div className="space-y-3">
            {[
              {n:"Meta Ads",   prot:"Graph API",   freq:"15 min", c:T.violet},
              {n:"Google Ads", prot:"Ads API",     freq:"15 min", c:T.accent},
              {n:"TV/Offline", prot:"CSV Batch",   freq:"Daily",  c:T.amber},
              {n:"CRM",        prot:"Webhook",     freq:"Real-time", c:T.teal},
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border-dark/50 last:border-0">
                <span className="w-2 h-2 rounded-full" style={{background: r.c, boxShadow: `0 0 5px ${r.c}`}} />
                <span className="text-base font-bold text-text-primary w-24">{r.n}</span>
                <span className="text-base text-text-muted font-mono flex-1">{r.prot}</span>
                <span className="text-base px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{r.freq}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const MonetizationTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map(tier => (
          <Card key={tier.id} className={`p-6 relative overflow-hidden transition-all duration-300 ${tier.hot ? 'border-brand-500/50 ring-1 ring-brand-500/20' : 'border-border-dark'}`}>
            {tier.hot && <div className="absolute top-0 right-0 bg-brand-500 text-white text-base font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Tavsiya</div>}
            <div className="mb-4">
              <span className="text-base font-bold px-2 py-1 rounded-md uppercase tracking-widest" style={{backgroundColor: tier.dim, color: tier.color}}>{tier.label}</span>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">{tier.price}</div>
            <div className="text-base text-text-muted font-mono mb-6">{tier.period} · Margin: {tier.margin}</div>
            <div className="space-y-3 border-t border-border-dark pt-4">
              {tier.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`text-base ${f.ok === true ? 'text-emerald-500' : f.ok === 'add' ? 'text-amber-500' : 'text-text-muted'}`}>{f.ok === true ? "OK" : f.ok === "add" ? "+" : "-"}</span>
                  <span className={`text-base ${f.ok === false ? 'text-text-muted' : 'text-text-secondary'}`}>{f.f}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-surface-card">
          <h3 className="text-xl font-bold text-text-primary mb-4">Unit Iqtisodiyot</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead className="text-text-muted uppercase tracking-wider border-b border-border-dark">
                <tr>
                  <th className="pb-3">Tier</th>
                  <th className="pb-3">MRR</th>
                  <th className="pb-3">LTV</th>
                  <th className="pb-3">LTV:CAC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/50">
                {UE_DATA.map((u, i) => (
                  <tr key={i} className="hover:bg-surface-ground/30 transition-colors">
                    <td className="py-3 font-bold text-text-primary">{u.tier}</td>
                    <td className="py-3 font-mono">${u.mrr}</td>
                    <td className="py-3 font-mono text-emerald-400">${u.ltv}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold">{u.ratio}x</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 bg-surface-card border-l-4 border-l-emerald-500">
          <h3 className="text-xl font-bold text-text-primary mb-2">Retention Insight</h3>
          <p className="text-base text-text-secondary leading-relaxed">
            Mijoz o'rtacha <strong className="text-emerald-400">24+ oy</strong> qoladi. ERP/CRM integratsiya chuqurligi sababli yuqori <span className="italic text-text-muted">switching cost</span> yuzaga keladi, bu esa barqaror ARR o'sishini ta'minlaydi.
          </p>
        </Card>
      </div>
    </div>
  );

  const InvestorTab = () => (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-brand-500/10 to-violet-500/10 border border-brand-500/20 rounded-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-9xl opacity-5 font-black"></div>
        <div className="text-base font-bold text-brand-400 uppercase tracking-widest mb-2">Pozitsionlash</div>
        <h2 className="text-2xl font-bold text-text-primary mb-4 leading-tight">AI-BOS Marketing — shunchaki dashboard emas.</h2>
        <p className="text-base text-text-secondary leading-relaxed max-w-3xl">
          Bu reklama kanallari ma'lumotlari va korporativ P&L hisobi o'rtasidagi <strong className="text-brand-400">operatsion tizim qatlami</strong> — deterministik KPI hisoblash va AI talqinini birlashtirgan yagona yechim.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-surface-card">
          <h3 className="text-xl font-bold text-text-primary mb-6">TAM / SAM / SOM Tahlili</h3>
          <div className="space-y-5">
            {TAM_DATA.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-base font-bold text-text-primary">{d.label}</span>
                  <span className="text-base font-mono font-bold" style={{color: d.color}}>${d.val}M</span>
                </div>
                <div className="h-2 bg-surface-ground rounded-full overflow-hidden border border-border-dark">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.log10(d.val)/Math.log10(18000)*100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full rounded-full" 
                    style={{background: `linear-gradient(90deg, ${d.color}88, ${d.color})`}}
                  />
                </div>
                <p className="text-base text-text-muted mt-1 font-mono italic">{d.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-surface-card">
          <h3 className="text-xl font-bold text-text-primary mb-6">Raqobat To'siqlari</h3>
          <div className="space-y-4">
            {MOATS.slice(0, 3).map((m, i) => (
              <div key={i} className="flex gap-3 p-3 bg-surface-ground rounded-xl border border-border-dark">
                <span className="text-2xl text-brand-400">{m.icon}</span>
                <div>
                  <div className="text-base font-bold text-text-primary mb-1">{m.label}</div>
                  <p className="text-base text-text-muted leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const ExpansionTab = () => (
    <div className="space-y-6">
      <div className="flex gap-2 bg-surface-card p-1 rounded-xl border border-border-dark">
        {PHASES.map(p => (
          <button 
            key={p.id} 
            onClick={() => {
              setPhase(p.id);
              info(`${p.label} tanlandi`);
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-base font-bold transition-all duration-300 ${phase === p.id ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-text-muted hover:text-text-primary hover:bg-surface-dark'}`}
          >
            {p.label}
            <div className="text-base opacity-70 font-mono">{p.period}</div>
          </button>
        ))}
      </div>

      {PHASES.filter(p => p.id === phase).map(ph => (
        <div key={ph.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-6 bg-surface-card border-t-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary mb-1">{ph.sub}</h2>
              <div className="text-base font-mono" style={{color: ph.color}}>{ph.geo}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface-ground p-4 rounded-xl border border-border-dark">
                <div className="text-base text-text-muted uppercase tracking-widest mb-1">Maqsad ARR</div>
                <div className="text-xl font-bold font-mono" style={{color: ph.color}}>{ph.arr}</div>
              </div>
              <div className="bg-surface-ground p-4 rounded-xl border border-border-dark">
                <div className="text-base text-text-muted uppercase tracking-widest mb-1">Mijozlar</div>
                <div className="text-xl font-bold font-mono" style={{color: ph.color}}>{ph.clients}</div>
              </div>
            </div>
            <div className="space-y-3">
              {ph.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-base font-bold" style={{color: ph.color}}>{"->"}</span>
                  <span className="text-base text-text-secondary leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-surface-card">
            <h3 className="text-xl font-bold text-text-primary mb-4">Texnik Talablar</h3>
            <div className="space-y-4">
              {[
                {l:"Ma'lumot izolyatsiyasi", v:"Multi-tenant arxitektura", p:"P0", c:T.red},
                {l:"Multi-valyuta",          v:"USD/UZS/KZT normalizatsiya", p:"P0", c:T.red},
                {l:"GDPR muvofiqlik",        v:"EU Data Residency", p:"P1", c:T.amber},
                {l:"Local Compliance",       v:"O'zReSO 1.0 muvofiqligi", p:"P0", c:T.red},
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border-dark/50 last:border-0">
                  <span className="text-base font-bold px-1.5 py-0.5 rounded bg-surface-ground border" style={{color: r.c, borderColor: `${r.c}44`}}>{r.p}</span>
                  <span className="text-base font-bold text-text-primary flex-1">{r.l}</span>
                  <span className="text-base text-text-muted font-mono">{r.v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );

  const RoadmapTab = () => (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-500 via-violet-500 to-emerald-500 opacity-20" />
        
        {ROADMAP.map((phase, pi) => (
          <div key={pi} className="relative pl-12 mb-8 last:mb-0">
            <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-surface-card z-10" style={{backgroundColor: phase.color, boxShadow: `0 0 10px ${phase.color}88`}} />
            <div className="mb-4">
              <div className="text-base font-bold font-mono mb-1" style={{color: phase.color}}>{phase.period}</div>
              <h3 className="text-xl font-bold text-text-primary">{phase.theme}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {phase.items.map((item, ii) => (
                <div key={ii} className={`p-3 rounded-xl border transition-all duration-300 ${item.done ? 'bg-surface-card border-emerald-500/30' : 'bg-surface-card border-border-dark opacity-70'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-base ${item.done ? 'text-emerald-500' : 'text-text-muted'}`}>{item.done ? "OK" : "-"}</span>
                    <span className="text-base font-bold text-text-primary">{item.label}</span>
                  </div>
                  <p className="text-base text-text-muted font-mono pl-6">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TAB_MAP: Record<string, React.ReactNode> = {
    architecture: <ArchTab />,
    monetization: <MonetizationTab />,
    investor: <InvestorTab />,
    expansion: <ExpansionTab />,
    roadmap: <RoadmapTab />
  };

  return (
    <div className="flex-1 p-8 font-sans space-y-8 animate-slide-in overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Marketing Strategiya</h1>
        <p className="text-base text-text-muted">Enterprise Marketing Command Center — Arxitektura · Monetizatsiya · Investor · Global Kengayish</p>
      </div>

      <div className="flex gap-2 bg-surface-card p-1 rounded-xl border border-border-dark overflow-x-auto scrollbar-hide">
        {STRAT_TABS.map(t => (
          <button 
            key={t.id} 
            onClick={() => {
              setTab(t.id);
            }}
            className={`flex-1 py-2.5 px-6 rounded-lg text-base font-bold whitespace-nowrap transition-all duration-300 flex items-center justify-center gap-2 ${tab === t.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-text-muted hover:text-text-primary hover:bg-surface-dark'}`}
          >
            <span className="opacity-70">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {TAB_MAP[tab]}
      </div>
    </div>
  );
}
