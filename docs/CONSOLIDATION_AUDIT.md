# Konsolidatsiya Audit Hisoboti
**Sana:** 2026-07-18  
**Maqsad:** Ikki parallel backendni (Node/Express + Python/FastAPI) bitta yagona Node/Express backendga birlashtirish rejalashtirilmoqda. Ushbu hujjat hozirgi holat tahlili, arxivlash natijalari va keyingi bosqichlarga mo'ljallangan ko'chirish rejasini o'z ichiga oladi.

---

## 1. Arxivlash natijalari

| Harakat | Natija |
|---------|--------|
| `backend/` papkasi `archive/python-backend/` ga ko'chirildi | ✅ |
| `backend/` papkasi git tarixidan olib tashlandi (`git rm -r`) | ✅ |
| Barcha 68 ta `.py` fayl arxivda saqlanib qoldi | ✅ |
| `archive/python-backend/` `.gitignore`ga qo'shilmagan — tarix saqlanadi | ✅ |

**Sabab:** Python/FastAPI backend haqiqiy biznes-mantiq (PnL, Cashflow, KPI, Marketing, CircuitBreaker, Prometheus metrics va h.k.) saqlaydi, lekin frontend bilan **hech qanday bog'lanishi yo'q** — frontend faqat Node backend `/api/*` marshrut­laridan foydalanadi. Resurslarni birlashtirib, bitta yetuk stack qilish uchun Python backend arxivlandi. Kelajakda og'ir ML/data-science kerak bo'lsa, `ml-service/` sifatida mustaqil mikroservis bo'lib qaytarilishi mumkin.

---

## 2. Node/Express backend — haqiqatan ishlaydigan funksiyalar

| Modul | Endpoint | Status | Tavsif |
|-------|----------|--------|--------|
| **Finance** | `GET/POST /api/finance/accounts` | ✅ REAL | SQLite, hisob raqamlar CRUD |
| | `GET /api/finance/categories` | ✅ REAL | Kategoriyalar ro'yxati |
| | `GET/POST /api/finance/transactions` | ✅ REAL | Tranzaksiyalar CRUD |
| | `GET /api/finance/summary` | ✅ REAL | Moliyaviy umumiy ko'rsatkich |
| **Accounting** | `GET /api/accounting/kpis` | ✅ REAL | KPI ko'rsatkichlari (SQLite) |
| | `GET/POST /api/accounting/transactions` | ✅ REAL | Buxgalteriya tranzaksiyalari |
| **CRM** | `GET/POST /api/crm/customers` | ✅ REAL | Mijozlar CRUD |
| | `GET /api/crm/deals` | ✅ REAL | Bitimlar ro'yxati |
| | `PUT /api/crm/deals/:id/stage` | ✅ REAL | Bitim bosqichini yangilash |
| | `GET/POST /api/crm/interactions` | ✅ REAL | Mijoz bilan muloqotlar |
| **Admin** | `GET/POST /api/admin/users` | ✅ REAL | Foydalanuvchilar boshqaruvi |
| | `GET /api/admin/roles` | ✅ REAL | Rollar ro'yxati |
| | `GET/POST /api/admin/audit-logs` | ✅ REAL | Audit jurnali |
| | `GET /api/admin/api-keys` | ✅ REAL | API kalitlar boshqaruvi |
| | `GET /api/admin/backups` | ✅ REAL | Zaxira nusxalar |
| | `GET /api/admin/tenants` | ✅ REAL | Tenant boshqaruvi |
| | `GET /api/admin/dashboard-metrics` | ✅ REAL | Dashboard metrikalar |
| **Agents** | `GET/POST /api/agents` | ✅ REAL | AI agentlar CRUD |
| | `PATCH /api/agents/:id` | ✅ REAL | Agent yangilash |
| | `DELETE /api/agents/:id` | ✅ REAL | Agent o'chirish |
| | `POST /api/agents/:id/check-health` | ✅ REAL | Agent holat tekshiruv |
| **Analytics** | `GET /api/analytics/:module/:metric` | ⚠️ QISMAN | Parametrga qarab hisoblash, ba'zi qismlar stub |
| | `GET /api/analytics/:module/:metric/drilldown/:dimension` | ⚠️ QISMAN | Drilldown qisman stub |
| | `GET /api/analytics/export` | ✅ REAL | Ma'lumot eksport |
| **Integrations** | `GET/POST /api/integrations/v1/customers` | ✅ REAL | Tashqi integratsiyalar |
| | `GET/POST /api/integrations/webhooks` | ✅ REAL | Webhook boshqaruvi |
| | `GET/POST /api/integrations/api-keys` | ✅ REAL | API kalitlar |
| | `GET /api/integrations/gateway/stats` | ✅ REAL | Gateway statistikasi |
| **Settings** | `GET/PUT /api/settings/user` | ✅ REAL | Foydalanuvchi sozlamalari |
| | `GET/PUT /api/settings/notifications` | ✅ REAL | Bildirishnoma sozlamalari |
| | `GET/PUT /api/settings/security` | ✅ REAL | Xavfsizlik sozlamalari |
| | `GET /api/settings/sessions` | ✅ REAL | Faol sessiyalar |
| | `GET/PUT /api/settings/integrations` | ✅ REAL | Integratsiya sozlamalari |
| | `GET /api/settings/audit` | ✅ REAL | Sozlamalar audit jurnali |
| **Skills** | `GET /api/skills/available` | ✅ REAL | Mavjud AI ko'nikmalar |
| | `POST /api/skills/execute` | ✅ REAL | Ko'nikma bajarish (Gemini) |
| | `POST /api/skills/approve` | ✅ REAL | Ko'nikma tasdiqlash |
| **Workflows** | `GET /api/workflows` | ✅ REAL | Workflow ro'yxati |
| | `POST /api/workflows` | ✅ REAL | Yangi workflow yaratish |
| | `POST /api/workflows/:id/execute` | ✅ REAL | Workflow ishga tushirish |
| **Telegram** | `GET/POST /api/telegram/settings` | ✅ REAL | Telegram bot sozlamalari |
| | `GET /api/telegram/status` | ✅ REAL | Bot holati |
| | `POST /api/telegram/start` | ✅ REAL | Botni ishga tushirish |
| **Voice** | `POST /voice/process` | ✅ REAL | Ovozli buyruq (Gemini AI) |
| **n8n** | `GET/POST /api/integrations/n8n/config` | ✅ REAL | n8n integratsiyasi |
| **System** | `GET /api/health` | ⚠️ STUB | Faqat `{ ok: true }` qaytaradi |
| | `GET /api/system/download` | ✅ REAL | Loyihani zip qilib yuklab olish |

---

## 3. Python/FastAPI backend — haqiqatan ishlaydigan funksiyalar

| Modul | Servis | Status | Tavsif |
|-------|--------|--------|--------|
| **Finance** | `PnLService` | ✅ REAL | Daromad-xarajat hisoboti (Revenue, COGS, Gross Profit, Net Profit) |
| | `CashflowService` | ✅ REAL | Pul oqimi (Operational/Investing/Financing) |
| | `LedgerService` | ✅ REAL | Buxgalteriya kitobi |
| | `TaxService` | ✅ REAL | Soliq hisoblash |
| **HR** | `KPIService` | ✅ REAL | Xodim KPI balli (og'irlik bo'yicha o'rtacha) |
| | `PayrollService` | ✅ REAL | Ish haqi hisoblash |
| **CRM** | `RevenueService` | ✅ REAL | Daromad hisobi (davr bo'yicha) |
| | `ForecastService` | ✅ REAL | CRM prognoz |
| **Analytics** | `DemandForecastService` | ✅ REAL | Talab prognozi |
| | `OptimizationService` | ✅ REAL | Narx optimallashtirish, zarar ko'rayotgan mahsulotlar |
| **Marketing** | `MarketingAnalyticsService` | ✅ REAL | Marketing analitika to'plami |
| | `CampaignAgent`, `StrategistAgent` | ✅ REAL | AI marketing agentlar |
| | `MarketingOrchestrator` | ✅ REAL | Marketing AI orkestratsiya |
| | `metrics/dashboard` | ❌ MOCK | Hardcoded JSON qaytaradi |
| **Intelligence** | `ExecutiveInsightsEngine` | ✅ REAL | Rahbariyat uchun xulosa/risk/o'sish |
| | `DataAggregator` | ✅ REAL | Modullararo ma'lumot yig'ish |
| | `AIService (chat/think/execute)` | ✅ REAL | AI suhbat va bajarish |
| **Admin** | `AIControlService` | ✅ REAL | AI rejim boshqaruvi |
| | `ModelRegistryService` | ✅ REAL | Model registri |
| | `PolicyConfigService` | ✅ REAL | Qoidalar konfiguratsiyasi |
| | `AuditViewerService` | ✅ REAL | Audit ko'rish |
| | `SystemHealthMonitor` | ✅ REAL | Tizim holat monitoru |
| | `ApprovalWorkflowService` | ✅ REAL | Tasdiqlash workflow |
| **Lifecycle** | `ABTestingService` | ✅ REAL | A/B test |
| | `VersionManager` | ✅ REAL | Model versiyalar |
| | `RollbackService` | ✅ REAL | Rollback mexanizmi |
| **Resilience** | `CircuitBreaker` | ✅ REAL | 3 xatoda OPEN, 30s timeout, recovery |
| | `SelfHealingService` | ✅ REAL | Avtomatik o'z-o'zini tiklash |
| | `FailoverManager` | ✅ REAL | Zaxira tizimga o'tish |
| | `RetryPolicy` | ✅ REAL | Qayta urinish siyosati |
| | `DegradedMode` | ✅ REAL | Cheklangan rejim |
| **Observability** | `MetricsService` (Prometheus) | ✅ REAL | Counter, Histogram, Gauge |
| | `StructuredLogger` | ✅ REAL | Tizimli logging |
| | `BenchmarkService` | ✅ REAL | Model benchmark |

---

## 4. Frontend qaysi backend bilan gaplashadi

**Xulosa: Frontend faqat Node/Express backend bilan bog'liq.**

| Frontend fayl | Chaqiriladigan endpoint | Backend |
|---------------|------------------------|---------|
| `src/pages/Admin*` | `/api/admin/*` | Node ✅ |
| `src/pages/Finance*` | `/api/finance/*`, `/api/accounting/*` | Node ✅ |
| `src/pages/CRM*` | `/api/crm/*` | Node ✅ |
| `src/pages/Integrations*` | `/api/integrations/*` | Node ✅ |
| `src/pages/Settings*` | `/api/settings/*` | Node ✅ |
| `src/services/agentService.ts` | `/api/agents` | Node ✅ |
| `src/services/crmService.ts` | `/api/crm/deals`, `/api/crm/interactions` | Node ✅ |
| `src/services/workflowService.ts` | `/api/workflows` | Node ✅ |
| `src/services/voicePipeline.ts` | `https://api.anthropic.com/v1/messages` | Tashqi ⚠️ |

**Muhim:** `voicePipeline.ts` to'g'ridan-to'g'ri Anthropic API'ga murojaat qiladi (server.ts esa Gemini ishlatadi) — bu nomuvofiqlik keyingi bosqichlarda hal qilinishi kerak.

Python/FastAPI backend hech qanday frontend qismidan chaqirilmagan. U mustaqil, ulangan bo'lmagan holda mavjud edi.

---

## 5. Node backendida YO'Q, Python backendida bor funksiyalar (ko'chirish kerak)

Quyidagi biznes-mantiq Python backendida REAL ishlaydi, lekin Node backendida mavjud emas yoki to'liq emas:

| #  | Funksiya | Python fayl | Node'da holati | Muhimlik |
|----|----------|-------------|----------------|----------|
| 1  | **P&L hisoboti** (Revenue, COGS, Gross/Net Profit) | `modules/finance/pnl.py` | Yo'q | 🔴 Yuqori |
| 2  | **Cashflow hisoboti** (Operational/Investing/Financing) | `modules/finance/cashflow.py` | Yo'q | 🔴 Yuqori |
| 3  | **Soliq hisoblash** | `modules/finance/tax.py` | Yo'q | 🟡 O'rta |
| 4  | **HR KPI skoring** (og'irlikli o'rtacha, normalizatsiya) | `modules/hr/kpi.py` | Yo'q | 🔴 Yuqori |
| 5  | **Ish haqi hisoblash** | `modules/hr/payroll.py` | Yo'q | 🟡 O'rta |
| 6  | **CRM daromad hisobi** (davr bo'yicha) | `modules/crm/revenue.py` | Qisman (stub) | 🔴 Yuqori |
| 7  | **Talab prognozi** | `modules/analytics/forecasting.py` | Yo'q | 🟡 O'rta |
| 8  | **Narx optimallashtirish** | `modules/analytics/optimization.py` | Yo'q | 🟡 O'rta |
| 9  | **Marketing analitika** (attribution, forecasting, KPI) | `modules/marketing/` | Yo'q | 🟡 O'rta |
| 10 | **CircuitBreaker (real)** | `resilience/circuit_breaker.py` | Faqat izoh/stub | 🔴 Yuqori |
| 11 | **SelfHealing xizmati** | `resilience/self_healing.py` | Yo'q | 🟡 O'rta |
| 12 | **Prometheus metrikalar** | `observability/metrics.py` | Yo'q | 🟡 O'rta |
| 13 | **Tizimli logger** (request_id, latency) | `observability/logging.py` | Yo'q | 🔴 Yuqori |
| 14 | **Real `/health` tekshiruvi** (DB + AI holati) | `admin/system_health.py` | Stub | 🟡 O'rta |
| 15 | **Model registry va lifecycle** | `lifecycle/` | Yo'q | 🟢 Past |
| 16 | **A/B test infratuzilmasi** | `lifecycle/ab_testing.py` | Yo'q | 🟢 Past |
| 17 | **Rahbariyat xulosasi** (intelligence) | `intelligence/executive_summary.py` | Qisman (Gemini orqali) | 🟡 O'rta |

**Ustuvorlik tartibi (keyingi bosqichlarga):**
1. 🔴 Yuqori — Prompt 6 da Finance (PnL, Cashflow), HR KPI, CRM Revenue ko'chiriladi
2. 🔴 Yuqori — Prompt 7 da CircuitBreaker va tizimli logger qo'shiladi
3. 🟡 O'rta — Qolganlar Prompt 6-9 jarayonida navbat bilan bajariladi

---

## 6. Arxivlangan fayllar ro'yxati

`archive/python-backend/` papkasida jami **68 ta Python fayli** saqlanmoqda:

```
archive/python-backend/
├── main.py                          # FastAPI asosiy dastur (25+ endpoint)
├── requirements.txt                 # fastapi, uvicorn, sqlalchemy, pydantic...
├── __init__.py
├── admin/                           # AI boshqaruv, model registry, audit, siyosat
│   ├── ai_control.py
│   ├── approval_workflow.py
│   ├── audit_viewer.py
│   ├── model_registry.py
│   ├── policy_config.py
│   └── system_health.py
├── database/                        # SQLAlchemy modellari va sessiya
│   ├── __init__.py
│   ├── admin_models.py
│   ├── model_versions.py
│   ├── models.py                    # Account, JournalEntry, Employee, KPI modellari
│   └── session.py
├── intelligence/                    # AI orkestratsiya va tahlil
│   ├── aggregator.py
│   ├── ai_service.py
│   ├── business_context.py
│   ├── cross_analysis.py
│   ├── execution_engine.py
│   ├── executive_summary.py
│   ├── prompts.py
│   ├── router.py
│   └── schemas.py
├── lifecycle/                       # Model versiyalar, A/B test, rollback
│   ├── ab_testing.py
│   ├── compatibility.py
│   ├── health_monitor.py
│   ├── model_registry.py
│   ├── rollback.py
│   └── version_manager.py
├── middleware/
│   └── metrics_middleware.py        # Prometheus middleware
├── modules/
│   ├── analytics/
│   │   ├── forecasting.py           # Talab prognozi
│   │   └── optimization.py          # Narx optimallashtirish
│   ├── crm/
│   │   ├── forecast.py
│   │   └── revenue.py               # CRM daromad hisoblash
│   ├── finance/
│   │   ├── cashflow.py              # Pul oqimi hisoboti ⭐
│   │   ├── ledger.py
│   │   ├── pnl.py                   # P&L hisoboti ⭐
│   │   └── tax.py
│   ├── hr/
│   │   ├── kpi.py                   # Xodim KPI skoring ⭐
│   │   └── payroll.py
│   └── marketing/                   # To'liq marketing analitika to'plami
│       ├── attribution.py
│       ├── forecasting.py
│       ├── kpi.py
│       ├── models.py
│       ├── optimization.py
│       ├── prompts.py
│       ├── router.py
│       ├── schemas.py
│       └── services/
│           ├── agents.py
│           └── analytics.py
├── observability/                   # Prometheus, tizimli logger, benchmark
│   ├── logging.py
│   ├── metrics.py                   # Prometheus Counter/Histogram/Gauge ⭐
│   ├── model_benchmark.py
│   └── optimization_engine.py
├── resilience/                      # CircuitBreaker, SelfHealing, Failover ⭐
│   ├── circuit_breaker.py
│   ├── degraded_mode.py
│   ├── failover_manager.py
│   ├── health_registry.py
│   ├── retry_policy.py
│   └── self_healing.py
└── workflows/                       # Biznes workflow'lar
    ├── cost_optimization.py
    ├── revenue_growth.py
    ├── risk_assessment.py
    └── workforce_analysis.py
```

---

## 7. Xulosa

| Savol | Javob |
|-------|-------|
| Frontend qaysi backend bilan ishlaydi? | **Faqat Node/Express** |
| Python backend frontenddga ulangan edimi? | **Yo'q — hech qachon ulangan emas** |
| Python backendda noyob biznes-mantiq bormi? | **Ha — 17 ta funksiya** (jadval 5 da) |
| Arxiv to'liqmi? | **Ha — 68 ta fayl** `archive/python-backend/` da |
| Node backendining holati? | **Ishlamoqda**, lekin Finance (P&L), HR KPI, real CircuitBreaker yo'q |

**Keyingi qadam:** Prompt 2 — Monorepo poydevorini qurish (npm workspaces, `apps/web/` + `apps/api/` tuzilishi).
