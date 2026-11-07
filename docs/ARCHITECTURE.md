# Architecture

## Runtime model
- **Production:** static Vite build (`dist/`) + Vercel serverless functions from `api/*.ts`. `vercel.json` rewrites non-`/api` paths to `index.html`.
- **Development:** `npm run dev` starts Vite. The `apiDevBridge` plugin in `vite.config.ts` (serve-only) loads the matching `api/<name>.ts` handler through Vite's SSR module runner, so local code equals deployed code.
- **Not supported:** Azure Functions (no executable Azure runtime exists here), a standalone Node/Express server.

## Layout (why it is flat)
`api/` must sit at the repo root for Vercel; `tsconfig.*`, `vite.config.ts` and relative imports (`api/*.ts` → `../src/server/...`) assume the current paths, so folders were not renamed into `frontend/`/`backend/`.

| Path | Responsibility |
|---|---|
| `src/main.tsx`, `src/App.tsx` | Entry and routing: `/` and `/intro` → product story, `/dashboard` → immersive workspace, anything else → 404 view |
| `src/components/immersive/` | Scrolling dashboard shell, sections (Hero, Today, Operations, Workspace, AI, Insights, Connected, Footer), planet background, hooks, CSS |
| `src/components/immersive/scene/` | `planetScene.ts` (three r0.143 scene, composers, scroll choreography), `shaders.ts` (GLSL) |
| `src/components/{customers,finance,work,analytics,ai,alerts,integrations,settings,today}/` | Module pages opened from the dashboard via `#<module>` hash URLs |
| `src/components/auth/` | `AuthScreen`, `RequireAuthentication` guards |
| `src/context/BusinessContext.tsx` | Client state: active module, command menu, toasts, etc. |
| `src/dashboard/dashboardApi.ts` | SWR hook for `/api/dashboard` (disabled for guests) |
| `src/server/modules/authentication/session.ts` | Verifies the session with Neon Auth, resolves membership, role and permissions |
| `src/server/modules/authorization/policy.ts` | Roles (Owner, Admin, Manager, Employee, Viewer) and permission keys |
| `src/server/modules/ai/orchestrator.ts` | Approved AI tools and run recording |
| `src/server/persistence/{schema,drizzle}.ts` | Drizzle schema and pooled `pg` connection |
| `migrations/` | Ordered SQL migrations + `seed/development.sql` (sample data) |
| `scripts/` | `migrate.mjs`, `check-format.mjs` |

## Request flow (protected endpoint)
Browser (cookie) → `api/<x>.ts` → `requireOrganizationContext(req)` → Neon Auth `/get-session` → `memberships` lookup → role permissions → `requirePermission` → organization-scoped Drizzle query. The organization and role are **never read from the request body**.

## Dashboard scene
`PlanetBackground` lazy-imports the scene so three.js never loads at app start. `index.html` carries a static import map for `three` (r0.143.0, required by the injected shaders). If WebGL, the CDN or the assets are unavailable, a CSS atmosphere remains and a `[LookThrough] WebGL planet unavailable (...)` warning names the failing stage (`data-reason` on `.lt-planet`).
