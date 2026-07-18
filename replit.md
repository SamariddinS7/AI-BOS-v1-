# AI-BOS — Business Operating System

AI-BOS is a monorepo business platform with AI integrations, featuring a dashboard, CRM, finance, analytics, HR, and workflow automation modules. The UI is in Uzbek.

## Architecture

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, Zustand, Recharts, Three.js |
| Backend | Node.js/Express 5, TypeScript, `tsx` for dev |
| Database | SQLite (`better-sqlite3`) for local dev |
| AI | Google Gemini (lazy-loaded), optional OpenAI/Anthropic |
| Auth | JWT via `SESSION_SECRET`, dev bypass active in `development` mode |

## Monorepo Structure

```
apps/api/     — Express API server  (port 5001 in dev)
apps/web/     — Vite/React frontend (port 5000 in dev)
packages/     — Shared config and types
infra/        — Docker/K8s configs and env example
archive/      — Python backend (archived, not used)
```

## Running

```bash
npm install     # install all workspace deps
npm run dev     # starts API (5001) + Web (5000) concurrently
```

The workflow **Start application** runs `npm run dev` and serves the web app on port 5000.

## Environment Variables

Set via Replit's Secrets/Env panel (not `.env` files):

| Variable | Purpose | Required? |
|---|---|---|
| `SESSION_SECRET` | JWT signing secret | Yes (already set) |
| `API_PORT` | API server port | Set to `5001` |
| `PORT` | Vite dev port | Set to `5000` |
| `APP_AUTH_TOKEN` | Internal API auth token | Set to `dev-auth-token` |
| `VITE_APP_AUTH_TOKEN` | Frontend auth token | Set to `dev-auth-token` |
| `GEMINI_API_KEY` | Google Gemini AI | Optional (AI features) |
| `VITE_SUPABASE_URL` | Supabase project URL | Optional (cloud DB) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Optional (cloud DB) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot | Optional |

## Notes

- Auth is bypassed in `development` mode (`NODE_ENV=development`) — no login required.
- Gemini is lazy-initialized; missing key only fails when AI endpoints are called.
- Supabase/Firebase are optional; the app falls back to local SQLite.

## User Preferences

- Keep the existing monorepo structure and TypeScript/Express stack.
