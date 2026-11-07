# Authentication and authorization

## Authentication (Neon Auth / Better Auth)
- Browser: `src/auth/neonAuthClient.ts` creates the client only when `VITE_NEON_AUTH_URL` is set; otherwise visitors stay guests.
- Server: `fetchVerifiedSession` calls `<NEON_AUTH_BASE_URL>/get-session` forwarding the request cookie, and rejects missing users, mismatched session user ids and expired sessions.
- If no auth URL is configured the API returns `500 AUTH_NOT_CONFIGURED`.

## Authorization
1. `requireOrganizationContext` loads the user's `memberships`. No membership → `403 NO_ORGANIZATION_ACCESS`. Several memberships without an active organization in the session → `403 ACTIVE_ORGANIZATION_REQUIRED`.
2. Role permissions are read from `role_permissions`. `requirePermission(context, key)` guards each operation.
3. Roles (`policy.ts`): Owner (all), Admin (all except `settings.manage`), Manager, Employee, Viewer. Permission keys include `customers.*`, `leads.*`, `deals.*`, `invoices.*`, `expenses.*`, `tasks.*`, `analytics.read`, `ai.read`, `ai.execute`, `settings.manage`.
4. Identity, organization and role are derived server-side and never accepted from the client.

## Frontend behavior
Guests see sign-in prompts instead of organization data; the dashboard does not call organization endpoints until a session exists. Module pages are wrapped in `RequireAuthentication`.

## Verification status
Guard behavior is tested with doubles (`tests/authorization.test.js`, `tests/api-authorization.integration.test.js`). **Live Neon Auth sign-in was not tested in the packaging environment**; verify it with your own project.
