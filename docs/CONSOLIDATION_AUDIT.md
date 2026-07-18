# Konsolidatsiya Audit Hisoboti
**Sana:** 2026-07-18  
**Maqsad:** AI-BOS loyihasidagi ikki parallel backend (Node/Express va Python/FastAPI) holatini tahlil qilish va konsolidatsiya rejasini hujjatlashtirish.

---

## 1. Backend Holati — Qisqa Xulosa

| Holat | Node.js/Express (`apps/api/`) | Python/FastAPI (`archive/python-backend/`) |
|-------|-------------------------------|---------------------------------------------|
| Joylashuv | `apps/api/src/` (faol) | `archive/python-backend/` (arxivlangan) |
| Port | 5000 | 8000 (ishlatilmaydi) |
| DB | SQLite (`better-sqlite3`) | PostgreSQL + SQLAlchemy (mahalliy) |
| Frontend bog'liq | ✅ Ha (barcha `/api/*` chaqiruvlar) | ❌ Yo'q (frontend unga murojaat qilmaydi) |
| Faol | ✅ Ha | ❌ Arxivlangan |

**Xulosa:** Python/FastAPI backend `archive/python-backend/` ga ko'chirilgan va ishlatilmaydi. Frontend **faqat** Node.js backendga murojaat qiladi.

---

## 2. Node.js Backend — REAL vs MOCK tahlil jadvali

### `apps/api/src/routes/` va `apps/api/src/services/`

| Modul | Fayl | Endpoint(lar) | Holat | Izoh |
|-------|------|---------------|-------|------|
| **Analytics** | `routes/analytics.ts` + `services/AnalyticsService.ts` | `GET /:module/:metric`, `GET /:module/:metric/drilldown/:dim`, `GET /export` | ✅ **REAL** | SQLite `transactions` va `AnalyticsData` jadvallaridan haqiqiy ma'lumot. Gemini AI bilan insights generatsiyasi. `simple-statistics` bilan statistik hisob. |
| **CRM** | `routes/crm.ts` | `GET /customers`, `POST /customers`, `GET /deals`, `PUT /deals/:id/stage`, `GET /interactions/:cId`, `POST /interactions` | ✅ **REAL** | SQLite `Customers`, `Deals`, `Interactions` jadvallaridan haqiqiy CRUD. |
| **Accounting** | `routes/accounting.ts` + `services/TransactionService.ts` | `GET /kpis`, `GET /transactions`, `POST /transactions` | ✅ **REAL** | SQLite `transactions` jadvalidan haqiqiy hisob-kitob. KPI (joriy balans, kutilayotgan tushum) formulalari real. |
| **Agents** | `routes/agents.ts` + `lib/db/agentDb.ts` | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id`, `POST /:id/check-health` | ✅ **REAL** | SQLite `Agents` jadvalida haqiqiy CRUD. |
| **Workflows** | `routes/workflows.ts` + `lib/workflow-engine/ExecutionEngine.ts` | `GET /`, `GET /:id`, `POST /`, `DELETE /:id`, `POST /:id/execute` | ✅ **REAL** | SQLite `Workflows`, `WorkflowNodes`, `WorkflowEdges` — haqiqiy saqlash. `ExecutionEngine` — haqiqiy ijro mexanizmi. |
| **Admin** | `routes/admin.ts` | `GET /users`, `POST /users`, `PUT /users/:id`, `GET /roles`, `GET /permissions`, `GET /audit-logs`, `POST /audit-logs`, `GET /api-keys`, `GET /backups` | ✅ **REAL** | SQLite jadvallaridan haqiqiy ma'lumot. |
| **Settings** | `routes/settings.ts` | `GET /user`, `PUT /user`, `GET /audit`, `GET /integrations`, `PUT /integrations`, `GET /notifications`, `PUT /notifications`, `GET /security`, `PUT /security`, `GET /sessions`, `DELETE /sessions/:id` | ✅ **REAL** | SQLite + Supabase sinxronizatsiyasi. |
| **Integrations** | `routes/integrations.ts` | `/plugins`, `/webhooks`, `/gateway/stats`, `/api-keys` | ✅ **REAL** | `PluginManager`, `WebhookManager` orqali haqiqiy boshqaruv. |
| **Skills** | `routes/skills.ts` | `GET /available`, `POST /execute`, `POST /approve` | ✅ **REAL** | Gemini AI orqali haqiqiy bajarish. |
| **Finance (accounts)** | `server.ts` inline | `GET /api/finance/accounts` | ✅ **REAL** | SQLite `accounts` jadvalidan. |
| **AI/Gemini** | `lib/ai/agent.ts`, `services/geminiService.ts`, `lib/gemini.ts` | `/api/chat`, `/api/ai/*` | ✅ **REAL** | Haqiqiy Gemini API integratsiyasi. `GEMINI_API_KEY` bo'lmasa graceful xato. |
| **Telegram Bot** | `lib/telegram/bot.ts` | `/api/telegram/*` | ✅ **REAL** | Token bo'lmasa o'chiriladi (graceful). Token bo'lsa to'liq ishlaydi. |
| **Admin — dashboard-metrics** | `routes/admin.ts` | `GET /dashboard-metrics` | ⚠️ **MOCK** | `mock` yoki hardcoded qiymatlar qaytarishi mumkin — tekshiruv kerak. |
| **n8n Integration** | `lib/n8n-integration/` | `/api/n8n/*` | ⚠️ **SHARTLI** | n8n instance konfiguratsiya qilinmasa ishlaydi lekin ulana olmaydi. |

---

## 3. Python/FastAPI Backend — REAL vs MOCK tahlil jadvali

| Modul | Servis | Holat | Ko'chirish kerakmi? |
|-------|--------|-------|---------------------|
| **Finance — P&L** | `modules/finance/pnl.py` → `PnLService.generate_pnl()` | ✅ **REAL** (PostgreSQL bilan) | ✅ **Ha** — Node.js da mavjud emas |
| **Finance — Cashflow** | `modules/finance/cashflow.py` → `CashflowService.generate_cashflow()` | ✅ **REAL** (PostgreSQL bilan) | ✅ **Ha** — Node.js da mavjud emas |
| **Finance — Ledger** | `modules/finance/ledger.py` | ✅ **REAL** | ✅ **Ha** — Node.js da mavjud emas |
| **Finance — Tax** | `modules/finance/tax.py` | ✅ **REAL** | ✅ **Ha** — Node.js da mavjud emas |
| **HR — KPI** | `modules/hr/kpi.py` → `KPIService` | ✅ **REAL** | ✅ **Ha** — Node.js da yo'q |
| **HR — Payroll** | `modules/hr/payroll.py` | ✅ **REAL** | ✅ **Ha** — Node.js da yo'q |
| **CRM — Revenue** | `modules/crm/revenue.py` → `RevenueService` | ✅ **REAL** | ⚠️ **Qisman** — Node tarafida analytics bor, lekin CRM revenue projection yo'q |
| **CRM — Forecast** | `modules/crm/forecast.py` | ✅ **REAL** | ✅ **Ha** — Node.js da yo'q |
| **Analytics — Forecasting** | `modules/analytics/forecasting.py` → `DemandForecastService` | ✅ **REAL** | ✅ **Ha** — Node tarafida faqat tarixiy ma'lumot bor, forecast yo'q |
| **Analytics — Optimization** | `modules/analytics/optimization.py` | ✅ **REAL** | ⚠️ **Keyingi bosqich** |
| **Marketing — Attribution** | `modules/marketing/attribution.py` | ✅ **REAL** | ✅ **Ha** — Node.js da yo'q |
| **Marketing — KPI** | `modules/marketing/kpi.py` | ✅ **REAL** | ✅ **Ha** — Node.js da yo'q |
| **Intelligence — Executive Summary** | `intelligence/executive_summary.py` → `ExecutiveInsightsEngine` | ✅ **REAL** | ✅ **Ha** — risk/growth/efficiency score Node da yo'q |
| **Intelligence — Cross Analysis** | `intelligence/cross_analysis.py` → `CrossModuleAnalyzer` | ✅ **REAL** | ✅ **Ha** — modular cross-analysis Node da yo'q |
| **Admin — AI Control** | `admin/ai_control.py` | ✅ **REAL** | ✅ **Ha** — Node tarafida yo'q |
| **Admin — Model Registry** | `admin/model_registry.py` | ✅ **REAL** | ✅ **Ha** — Node tarafida yo'q |
| **Admin — Approval Workflow** | `admin/approval_workflow.py` | ✅ **REAL** | ✅ **Ha** — Node tarafida yo'q |
| **Resilience — Circuit Breaker** | `resilience/circuit_breaker.py` | ✅ **REAL** | ✅ **Ha** — Node tarafida faqat izoh sifatida |
| **Resilience — Self Healing** | `resilience/self_healing.py` | ✅ **REAL** | ✅ **Ha** — Node tarafida mavjud emas |
| **Observability — Prometheus metrics** | `observability/metrics.py` + `middleware/metrics_middleware.py` | ✅ **REAL** | ✅ **Ha** — Node tarafida `/metrics` endpoint yo'q |
| **Workflows — Cost/Revenue/Risk** | `workflows/cost_optimization.py`, `revenue_growth.py`, `risk_assessment.py` | ✅ **REAL** | ⚠️ **Keyingi bosqich** — Node WorkflowEngine bor, lekin bu templatelar yo'q |
| **Lifecycle — A/B Testing** | `lifecycle/ab_testing.py` | ✅ **REAL** | ⚠️ **Keyingi bosqich** |

---

## 4. Frontend — Qaysi Backendga Murojaat Qiladi?

**Frontend faqat Node.js/Express backendiga murojaat qiladi.**

Barcha `fetch()` chaqiruvlari **relative URL** (`/api/...`, `/voice/...`) orqali:

| Frontend sahifasi/komponenti | Endpoint(lar) | Backend |
|-----------------------------|---------------|---------|
| `Dashboard`, `CEOMode` | `/api/analytics/revenue/*`, `/api/analytics/expenses/*` | ✅ Node.js |
| `Finance.tsx` | `/api/finance/accounts` | ✅ Node.js |
| `CRM` related | `/api/crm/customers`, `/api/crm/deals` | ✅ Node.js |
| `Agents.tsx` | `/api/agents`, `/api/agents/:id/*` | ✅ Node.js |
| `Admin.tsx` | `/api/admin/*` (users, roles, audit-logs, api-keys, backups) | ✅ Node.js |
| `AISkills.tsx` | `/api/skills/available`, `/api/skills/execute`, `/api/skills/approve` | ✅ Node.js |
| `Integrations.tsx` | `/api/integrations/plugins`, `/api/integrations/webhooks`, `/api/integrations/gateway/stats` | ✅ Node.js |
| `Settings/*` | `/api/settings/*`, `/api/telegram/*` | ✅ Node.js |
| `VoiceControl.tsx` | `/voice/process` | ✅ Node.js |
| `LiveChat.tsx` | `/api/analytics/*`, `/api/crm/customers`, `/api/workflows/:id/execute` | ✅ Node.js |
| `DrillDownModal.tsx`, `UniversalChart.tsx` | `/api/analytics/:module/:metric*` | ✅ Node.js |

**Python/FastAPI endpointlariga (`localhost:8000`) birorta ham frontend chaqiruvi yo'q.**

---

## 5. Node.js da Mavjud Emas — Ko'chirish Kerak (Prioritet bo'yicha)

### 🔴 Yuqori prioritet (MVP uchun kerak)

| Python moduli | Servis/Funksiya | Node.js ekvivalenti | Tavsiya |
|---------------|-----------------|---------------------|---------|
| `modules/finance/pnl.py` | `PnLService.generate_pnl()` | ❌ Yo'q | `apps/api/src/modules/finance/pnl.service.ts` yaratish |
| `modules/finance/cashflow.py` | `CashflowService.generate_cashflow()` | ❌ Yo'q | `apps/api/src/modules/finance/cashflow.service.ts` yaratish |
| `modules/hr/kpi.py` | `KPIService.calculate_kpi_score()`, `calculate_productivity()` | ❌ Yo'q | `apps/api/src/modules/hr/kpi.service.ts` yaratish |
| `resilience/circuit_breaker.py` | `CircuitBreaker` (CLOSED/OPEN/HALF_OPEN) | ❌ Faqat izoh | Haqiqiy implementatsiya kerak |

### 🟡 O'rta prioritet

| Python moduli | Servis/Funksiya | Tavsiya |
|---------------|-----------------|---------|
| `modules/analytics/forecasting.py` | `DemandForecastService.demand_forecast()` | `apps/api/src/modules/analytics/forecasting.service.ts` |
| `intelligence/executive_summary.py` | `ExecutiveInsightsEngine` (risk/growth/efficiency score) | `apps/api/src/intelligence/InsightsEngine.ts` |
| `modules/marketing/attribution.py`, `kpi.py` | Marketing attribution va KPI | `apps/api/src/modules/marketing/` |
| `observability/metrics.py` | Prometheus `/metrics` endpoint | `prom-client` kutubxonasi bilan |
| `modules/hr/payroll.py` | `PayrollService` | `apps/api/src/modules/hr/payroll.service.ts` |

### 🟢 Keyingi bosqichlarga qoldirish mumkin

| Python moduli | Sabab |
|---------------|-------|
| `lifecycle/ab_testing.py` | MVP uchun kerak emas |
| `lifecycle/version_manager.py`, `rollback.py` | MVP uchun kerak emas |
| `workflows/cost_optimization.py`, `revenue_growth.py` | Node WorkflowEngine bor — keyinroq template sifatida qo'shish |

---

## 6. Arxivlash Holati

### Python Backend

```
archive/python-backend/   ← ✅ Mavjud (to'liq arxivlangan)
├── admin/                ← AI control, model registry, audit
├── database/             ← SQLAlchemy models va session
├── intelligence/         ← aggregator, executive summary, cross-analysis
├── lifecycle/            ← A/B testing, versioning, rollback
├── middleware/           ← metrics middleware
├── modules/
│   ├── analytics/        ← forecasting, optimization
│   ├── crm/              ← revenue, forecast
│   ├── finance/          ← pnl, cashflow, ledger, tax
│   ├── hr/               ← kpi, payroll
│   └── marketing/        ← attribution, kpi, optimization
├── observability/        ← structured logging, Prometheus metrics
├── resilience/           ← circuit breaker, self-healing, failover
├── workflows/            ← cost, revenue, risk, workforce workflows
├── main.py               ← FastAPI app entry point
└── requirements.txt
```

**Holat:** Python backend to'liq `archive/python-backend/` da saqlangan. Hech qanday kod o'chirilmagan. Istalgan vaqt reference sifatida ishlatish mumkin.

---

## 7. Kod Ikkilanishi (Duplication) Topildi

**Muammo:** Root `src/` papkasi `apps/api/src/` bilan deyarli bir xil backend fayllarini ham, frontend fayllarini ham o'z ichiga oladi:

| Root `src/` | Holati |
|-------------|--------|
| `src/routes/`, `src/lib/`, `src/middleware/` | Eski backend kodi — `apps/api/src/` bilan dublikat |
| `src/pages/`, `src/components/`, `src/contexts/` | Eski frontend kodi — `apps/web/src/` bilan dublikat |
| Root `server.ts` | Eski entry point — `apps/api/src/server.ts` bilan dublikat |

**Tavsiya (Prompt 2 uchun):** `npm run dev` `apps/api/src/server.ts` ni ishlatadi — bu to'g'ri. Root `src/`, root `server.ts`, root `vite.config.ts`, root `index.html` esa eski monolitik strukturaning qoldig'i. Ular Prompt 2 da tozalanishi kerak.

---

## 8. Xavfsizlik Topilmalari (Diqqat!)

| Muammo | Joylashuv | Xavf darajasi |
|--------|-----------|---------------|
| `settings.db` (SQLite) repo'ga commit qilingan | Root papka | 🔴 Yuqori |
| Ko'pchilik `/admin/*`, `/finance/*` endpointlarda autentifikatsiya yo'q | `apps/api/src/routes/` | 🔴 Yuqori |
| `tenantId = 'default-tenant-id'` hardcoded | Barcha route fayllar | 🟡 O'rta |
| `APP_AUTH_TOKEN` undefined bo'lsa ishlab turadi | `apps/api/src/server.ts` | 🟡 O'rta |

---

## 9. Keyingi Bosqichlar (Prompt 2–10)

| Bosqich | Maqsad |
|---------|--------|
| **Prompt 2** | Root `src/`, `server.ts`, `vite.config.ts`, `index.html` larni tozalash; monorepo strukturasini to'liq qilish |
| **Prompt 3** | Barcha endpointlarga JWT + RBAC autentifikatsiyasi qo'shish |
| **Prompt 4** | SQLite → PostgreSQL (Prisma ORM), `settings.db` ni git tarixidan olib tashlash |
| **Prompt 5** | `AIOrchestrator` markazlashtirish, fallback mexanizmi |
| **Prompt 6** | `PnLService`, `CashflowService` ni Node/TypeScript da qayta yozish |
| **Prompt 7** | Structured logging, Prometheus metrics, real CircuitBreaker |
| **Prompt 8** | CI/CD, test qamrovi ≥70% |
| **Prompt 9** | Docker Compose (api + web + postgres + redis) |
| **Prompt 10** | Hujjatlar sinxronizatsiyasi |

---

*Ushbu hujjat Prompt 1 — Audit va Konsolidatsiya bosqichi natijasi sifatida yaratildi.*  
*Barcha keyingi o'zgarishlar ushbu hujjatga mos holda yangilanishi shart.*
