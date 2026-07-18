# AI-BOS — Artificial Intelligence Business Operating System

A full-stack enterprise AI platform integrating workflow automation, CRM, analytics, finance, and AI agent orchestration.

## How to run

The workflow "Start application" runs `npm run dev`, which starts:
- **Express backend** (API routes, WebSocket, SQLite via `better-sqlite3`)
- **Vite dev server** (React frontend, served via Express middleware)

App is available on **port 5000**.

## Tech stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Recharts, React Three Fiber
- **Backend**: TypeScript/Express, SQLite (`settings.db`), WebSocket (`ws`)
- **AI**: Google Gemini via `@google/genai`
- **Auth/DB**: Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- **Integrations**: Telegram bot (`TELEGRAM_BOT_TOKEN`), Firebase/Firestore, n8n

## Required secrets (set in Replit Secrets)

| Secret | Purpose |
|--------|---------|
| `GEMINI_API_KEY` | AI agent features — get free at aistudio.google.com |
| `VITE_SUPABASE_URL` | Supabase project URL (auth & database) |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |
| `TELEGRAM_BOT_TOKEN` | Optional — enables Telegram bot integration |
| `APP_AUTH_TOKEN` | Optional — secures internal API communication |

## Optional Python backend

The `/backend` directory contains a separate FastAPI service (Python). It is **not** required for the main app to run. To use it:
```bash
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
```

## Notes

- SQLite database (`settings.db`) is pre-seeded and lives at the project root.
- `PORT` is set to `5000` via Replit environment so the preview works correctly.
- `npm run build` compiles the app for production; `npm start` serves the built output.

## User preferences

<!-- Add user preferences here -->
