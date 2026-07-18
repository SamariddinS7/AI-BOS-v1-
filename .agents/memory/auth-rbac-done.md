---
name: Auth & RBAC completion
description: What was missing and fixed in Step 3 of the rebuild (auth/RBAC lockdown)
---

# Auth & RBAC — Step 3 complete

## What already existed (do not re-implement)
- `apps/api/src/middleware/auth.ts` — `requireAuth` with JWT (15m access / 7d refresh via SESSION_SECRET), dev bypass when NODE_ENV≠production && REQUIRE_AUTH≠true
- `apps/api/src/middleware/rbac.ts` — `requireRole([...])` with hierarchy OWNER(5) > ADMIN(4) > MANAGER(3) > VIEWER(2) > AI_AGENT(1)
- All route files under `apps/api/src/routes/` already had both middlewares applied
- `apps/api/src/middleware/auth.test.ts` — 10 passing tests (401/403 cases)

## What was fixed
13 inline endpoints in `apps/api/src/server.ts` had zero auth:
- `/api/finance/*` (6 routes) → VIEWER for GETs, MANAGER for POSTs
- `/api/telegram/*` (9 routes) → VIEWER for reads, MANAGER for send, ADMIN for settings/start/stop/delete/proxy
- `/api/v1/customers` → VIEWER
- `/api/system/download` → OWNER only (downloads entire source!)
- `/voice/process` → VIEWER

Also removed dead `app.use(apiGatewayMiddleware)` that was registered after all route handlers (never fired). Gateway is applied inside integrationsRouter for actual /api/v1 external routes.

**Why:** The route files were safe but the 13 inline endpoints in server.ts were completely open — anyone with the preview URL could read financial data or download the whole project.

**How to apply:** Any future inline endpoint added to server.ts must include `requireAuth, requireRole([...])` before the handler. Never add a bare `(req, res) => {}` handler to the app directly.
