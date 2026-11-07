# Look Through

An intelligent business operating system: customers, deals, finance, work, analytics and a permission-checked AI layer in one workspace. The `/dashboard` experience is a continuous, scroll-driven glass interface over a WebGL planet, with module pages (Customers, Finance, Work, Analytics, AI, Alerts, Integrations, Settings) opening inside it.

This package is the **actual source application**: React frontend, serverless API handlers, Drizzle schema, SQL migrations, tests and docs. It is not a static preview.

## 1. Architecture at a glance

| Layer | Where | Notes |
|---|---|---|
| Frontend | `src/`, `index.html`, `public/`, `vite.config.ts` | React 19 + TypeScript + Vite 8 + Tailwind 4 |
| Immersive dashboard | `src/components/immersive/` | Sections, floating nav, planet scene (three.js r0.143 loaded lazily from a CDN; CSS fallback) |
| API | `api/*.ts` | **Vercel serverless functions** (`ai`, `contact`, `customers`, `dashboard`, `tasks`) |
| Local API | `vite.config.ts` (`apiDevBridge`) | Dev-only bridge so `npm run dev` serves `/api/*` from the same handlers |
| Server logic | `src/server/` | auth session verification, authorization policy, domain modules, Drizzle access |
| Database | `src/server/persistence/schema.ts`, `migrations/*.sql` | PostgreSQL (Neon) via `drizzle-orm` + `pg` |
| Auth | Neon Auth (Better Auth) | Browser client `src/auth/neonAuthClient.ts`; server verifies sessions |
| Tests | `tests/*.test.js` | Node's built-in test runner |

The repository layout is intentionally **flat** (not split into `frontend/` and `backend/`): Vercel requires `api/` at the project root and the TypeScript/Vite config and imports depend on the current paths. See `docs/ARCHITECTURE.md`.

## 2. Prerequisites
- **Node.js 22 LTS** (minimum 20.19, required by Vite 8). `.nvmrc` is included: `nvm use`.
- npm 10+
- A **Neon** account (free tier is fine) for PostgreSQL and Neon Auth.
- macOS / VS Code terminal commands are shown below; they also work on Linux.

## 3. Quick start (macOS, VS Code terminal)
```bash
cd look-through-complete
nvm use                      # or install Node 22 from nodejs.org
npm ci                       # reproducible install from package-lock.json
cp .env.example .env         # then edit .env (see §4)
npm run db:migrate           # apply SQL migrations to your Neon database (see §5)
npm run dev                  # http://localhost:5173  (API served at /api/* by the dev bridge)
```
Without a database or auth URL the app still runs: the interface loads, every visitor is a guest, and API calls return honest errors. **Nothing is reported as connected until you configure and verify it.**

## 4. Environment variables
Copy `.env.example` to `.env`. Never commit `.env`. Variables starting with `VITE_` are public in the browser bundle.

| Variable | Required | Scope | Purpose / example |
|---|---|---|---|
| `DATABASE_URL` | Yes (for any data) | Server only | Neon connection string, `postgresql://USER:PASSWORD@HOST/DB?sslmode=require`. Also accepted: `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `NEON_DATABASE_URL` |
| `NEON_AUTH_BASE_URL` | Yes (for sign-in / protected API) | Server only | Neon Auth base URL; the server calls `<base>/get-session` to verify the cookie. Fallbacks: `VITE_NEON_AUTH_URL`, `NEON_AUTH_URL`, `BETTER_AUTH_URL` |
| `VITE_NEON_AUTH_URL` | Yes (for browser sign-in) | **Public** | Same Neon Auth URL; empty disables the browser auth client |
| `VITE_API_BASE_URL` | No | Public | Defaults to `/api` |
| `VITE_APP_VERSION` | No | Public | Version label, default `0.0.0` |
| `LOG_LEVEL` | No | Server | `debug`/`info`/`warn`/`error` |

There is **no OpenAI/LLM key**: the AI layer is a tool orchestrator over your own data (see `docs/API_DOCUMENTATION.md`). `BETTER_AUTH_SECRET` is not read by this code (Neon Auth manages its own secret), so it is not in `.env.example`.

## 5. Neon database setup and migrations
1. Create a Neon project and database; copy the connection string into `DATABASE_URL`.
2. Run `npm run db:migrate:plan` to list migrations (no database needed).
3. Run `npm run db:migrate`. It records applied files in `schema_migrations` and runs each file in a transaction. The shipped SQL uses `if not exists`, so it is safe to run against an already-provisioned database.
4. Optional, **development databases only**: `npm run db:seed:dev` inserts one sample organization/user/customer (`*.example.test`). It refuses to run with `NODE_ENV=production`.

More detail, relationships, indexes and tenant isolation: `docs/DATABASE_SETUP.md`. Authentication and the first-user/organization requirement: `docs/AUTHENTICATION.md`.

## 6. Scripts (all implemented in `package.json`)
| Command | What it does |
|---|---|
| `npm ci` | Clean, lockfile-exact install |
| `npm run dev` | Vite dev server with the local `/api` bridge |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | `oxlint src` |
| `npm run format:check` | `scripts/check-format.mjs` |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run preview` | Serve the production build (frontend only; **no** `/api` bridge) |
| `npm test` | `node --test tests/**/*.test.js` |
| `npm run db:migrate` / `db:migrate:plan` / `db:seed:dev` | Migration runner (`scripts/migrate.mjs`) |

## 7. Deployment (Vercel)
`vercel.json` rewrites every non-`/api` path to `index.html` (SPA) and `api/*.ts` deploy as serverless functions. Set `DATABASE_URL`, `NEON_AUTH_BASE_URL` and `VITE_NEON_AUTH_URL` in the Vercel project settings, run `npm run db:migrate` once against the production database, then deploy. **Azure Functions is not supported**: there is no Azure runtime implementation in this project.

## 8. API summary
`GET/POST/PATCH/DELETE /api/customers`, `GET/POST/PATCH/DELETE /api/tasks`, `GET /api/dashboard`, `POST /api/ai`, `POST /api/contact`. Full reference: `docs/API_DOCUMENTATION.md`.

## 9. Known limitations (honest list)
- **Not verified against a live Neon database or live Neon Auth in the packaging environment.** Tenant isolation is covered by the included server tests with test doubles, not by a live end-to-end run. You must verify with your own credentials.
- Persisted API modules today: customers, tasks, dashboard aggregates, AI tool runs, contact form. Other module screens (parts of Finance, Work sub-tabs, Settings, Alerts/Integrations state) are partly client-side state, as recorded in `docs/PRODUCTION_READINESS_AUDIT.md`. Settings contains in-memory defaults that are not persisted.
- Meetings, Projects UI, Notes, Learning and Team collaboration have no backend; the dashboard labels them "Coming soon".
- Integration "connected" toggles are local state, not verified connections; the dashboard never claims "connected".
- The planet scene loads three.js r0.143 from `unpkg.com` and its model/texture files from a third-party bucket. Self-host these for production; the CSS fallback activates if they fail.
- `npm run lint` reported pre-existing warnings in the audit baseline (unused imports and similar).
- No LICENSE file exists in the source project, so none is included: add the license you intend.
- `docs/LEGACY_PRODUCT_NOTES.md` is old product copy with illustrative figures.

## 10. Troubleshooting
See `docs/TROUBLESHOOTING.md`.
