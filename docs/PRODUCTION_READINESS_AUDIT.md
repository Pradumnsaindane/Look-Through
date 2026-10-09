# Look Through production-readiness audit

Audit date: 2026-10-09

## Executive summary

The product story at `/` and `/intro` is publicly reachable and renders successfully in the deployed application. The authenticated business workspace has a real API and database-backed authorization layer, but production readiness is currently **blocked**: direct navigation to `/dashboard` returned a deployed 404, and the available verification environment does not provide authenticated Neon Auth credentials or a production database session. Several workspace modules also contain presentation-only state and demo copy that must not be treated as persisted business functionality.

## Verified findings

| Priority | Finding | Evidence / root cause | Status |
| --- | --- | --- | --- |
| P1 | Direct `/dashboard` navigation returned `404 NOT_FOUND` on `https://look-through.vercel.app/dashboard`. | The repository had no Vercel rewrite configuration, so the SPA entry document was not served for client routes. | Fixed in this change with `vercel.json`; deployment verification remains pending. |
| P1 | Workspace routes were not explicitly bounded in the client. | Any non-story path rendered the dashboard shell, masking mistyped or unsupported routes. | Fixed in this change with an explicit `/dashboard` route and 404 view. |
| P0 | Authenticated tenant isolation cannot be verified against the deployed service here. | No authorized test account/session or production database access was available. | Blocked; existing server integration tests cover session-derived organization scoping and permission denial. |
| P1 | Customer, dashboard, and AI handlers depend on Neon Auth and PostgreSQL runtime configuration. | `NEON_AUTH_BASE_URL`/`DATABASE_URL` are server requirements; no safe live credential test was available. | Blocked for live verification. |
| P2 | Product-story surfaces intentionally show `LIVE / DEMO CONTEXT`. | `ProductStory.tsx` is marketing/demo content, not persisted business data. | Working as a demo surface; must not be presented as live records. |
| P2 | Settings includes in-memory defaults such as `Apex Global Corp` and GST text. | `SettingsView.tsx` initializes local React state and no persistence API was found in the inspected routes. | Incomplete; requires an organization-settings data model/API before claiming persistence. |
| P2 | Lint reports many unused imports/variables and a state-in-effect warning. | Baseline `npm run lint` completed with warnings. | Open cleanup work; typecheck passed. |

## Feature completeness matrix

| Module | Status | Notes |
| --- | --- | --- |
| Product story | WORKING | Verified on deployed `/`; CTA uses `/dashboard`. |
| Routing | PARTIALLY WORKING | `/` works; `/dashboard` fix is committed locally but needs deployment verification. |
| Authentication | BLOCKED | Real Neon Auth flow not executable without test credentials/configuration. |
| Authorization | PARTIALLY WORKING | Server derives identity and organization from verified session; integration tests cover cross-tenant and permission cases. |
| Dashboard | BLOCKED | API-backed implementation exists; live authenticated data unavailable for verification. |
| Customers | PARTIALLY WORKING | Real handler and client API exist; persistence/detail refresh requires authenticated DB verification. |
| Finance | BLOCKED | Requires authenticated live data verification. |
| Work / Today | PARTIALLY WORKING | UI actions exist; persistence coverage is not established by the inspected API surface. |
| Analytics / Alerts | BLOCKED | Live data and failure paths require authenticated verification. |
| AI intelligence | PARTIALLY WORKING | Permission gate and audit-oriented schema exist; live model execution is not verified. |
| Integrations | NOT IMPLEMENTED / BLOCKED | Connector UI must not imply a verified Google Workspace connection. |
| Settings | PARTIALLY WORKING | Controls render, but organization defaults are local state without persistence evidence. |

## Test report

- `npm run typecheck` — **PASS** (baseline output recorded).
- `npm run lint` — **PASS with warnings**; warnings are actionable unused-code and React lint findings.
- `npm run test` — **PASS** in the existing authorization integration suite when run with its test database mocks (six scenarios).
- `npm run build` — **PASS** after the routing change; Vite emitted only the existing large-chunk warning. Deployment verification remains pending.
- Browser: deployed `/` — **PASS**, title `Business OS — Intelligent Operational Command Center`, no blocking render error observed.
- Browser: deployed `/dashboard` — **FAIL before fix**, `404 NOT_FOUND`; recheck after deployment.

## Security report

The inspected authorization path uses a verified Neon Auth session, resolves membership server-side, derives permissions from role mappings, ignores client-supplied identity/role/org claims, and returns 401/403/404/500 responses through centralized handlers. Remaining risk is verification coverage: production session restoration, expired cookies, RLS/database constraints, and authenticated customer persistence still require a safe test account and live environment access.

## Remaining blockers and next actions

1. Deploy the rewrite fix and verify `/dashboard`, `/intro`, refresh behavior, API routes, and static assets in the deployed environment.
2. Add a non-production Neon Auth test account and safe seed data, then verify signup/login/logout/session expiry and customer persistence after refresh.
3. Compare the deployed database schema with Drizzle definitions and add additive migrations only where drift is confirmed.
4. Replace settings demo state with an authenticated, organization-scoped settings API or label those controls as non-persistent.
5. Add browser coverage for the critical authenticated workflow and remove the remaining lint warnings before release.

The application must not be declared production-ready until these blocked checks are completed with evidence.

## Implementation report

- Added `vercel.json` SPA rewrite that preserves `/api/*` handlers.
- Added explicit client route handling and a 404 page in `src/App.tsx`.
- Added this audit document; it intentionally distinguishes verified behavior from blocked verification.
