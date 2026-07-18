---
name: Python backend archived
description: What's in archive/python-backend/ that is not yet ported to Node.js
---

## Rule
The Python/FastAPI backend is archived in archive/python-backend/. It is NOT running — frontend only talks to Node.js (apps/api).

**Priority missing in Node.js (from docs/CONSOLIDATION_AUDIT.md):**
- PnLService (modules/finance/pnl.py) — P&L statement generation
- CashflowService (modules/finance/cashflow.py) — cashflow by operational/investing/financing
- KPIService (modules/hr/kpi.py) — weighted KPI score, productivity calc
- CircuitBreaker (resilience/circuit_breaker.py) — CLOSED/OPEN/HALF_OPEN state machine

**Why:** Python backend was archived in Prompt 1. Port these to apps/api/src/modules/ in Prompt 6.

**How to apply:** When implementing any of these, read the Python reference first from archive/python-backend/, then implement in TypeScript with SQLite/Prisma.
