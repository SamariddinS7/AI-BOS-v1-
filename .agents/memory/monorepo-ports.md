---
name: Monorepo dev server ports
description: Port assignments and proxy configuration for AI-BOS monorepo dev mode
---

## Rule
- Vite (apps/web) binds to PORT=5000 — this is the Replit-visible port
- API (apps/api) binds to API_PORT=5001 — internal only
- apps/web/vite.config.ts proxies /api, /voice, /ws → localhost:5001
- WebSocket server uses path '/ws' (not root '/') for clean proxy routing
- Frontend hook (useRealTimeAnalytics.ts) connects to `${protocol}//${host}/ws`

**Why:** Replit preview requires one visible port (5000). Separate processes need separate ports. WebSocket at root '/' can't be cleanly proxied by Vite.

**How to apply:** Any new WebSocket endpoint should use a named path. Any new API proxy should be added to apps/web/vite.config.ts proxy block.
