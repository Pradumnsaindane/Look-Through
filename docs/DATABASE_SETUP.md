# Database setup (Neon PostgreSQL)

## Create and connect
1. Create a project and database at neon.tech. Copy the pooled connection string.
2. `cp .env.example .env` and set `DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require`.
3. `npm run db:migrate:plan` (lists files, offline) then `npm run db:migrate`.

The runner (`scripts/migrate.mjs`) creates `schema_migrations`, applies pending `migrations/NNNN_*.sql` in filename order, one transaction per file, and stops on the first error. All shipped SQL uses `if not exists`, so re-running is safe. (A static test, `tests/migrations.test.js`, checks ordering and idempotency; the SQL has **not** been executed against a live database in the packaging environment.)

## Migration order
| File | Purpose |
|---|---|
| `0001_foundation.sql` | organizations, users, memberships, audit_events |
| `0002_production_domains.sql` | roles, permissions, role_permissions, customers, customer_contacts, leads, deals, deal_activities, accounts, transactions, invoices, invoice_items, expenses, projects, tasks, activities, notifications, alerts, ai_* tables, integrations, dashboard_layouts, audit_logs, files |
| `0003_ai_orchestration.sql` | AI run/action traceability |
| `0003_seed_authorization_permissions.sql` | Inserts permission keys (needs `permissions` from 0002) |
| `0004_reconcile_ai_traceability.sql` | Reconciles AI tables/indexes |
| `0005_contact_submissions.sql` | Contact form storage |
| `seed/development.sql` | **Sample data only** (`*.example.test`), via `npm run db:seed:dev`, refuses `NODE_ENV=production` |

## Schema source of truth
Drizzle definitions: `src/server/persistence/schema.ts`. SQL migrations are hand-maintained and must be kept in step with it (there is no drizzle-kit configuration in this project).

## Indexes defined in migrations
`audit_events(organization_id, created_at desc)`, `customers(organization_id)`, `deals(organization_id, stage)`, `invoices(organization_id, status)`, `tasks(organization_id, status)`, partial `notifications(organization_id, user_id) where read_at is null`, `audit_logs(organization_id, created_at desc)`, `ai_runs(organization_id, created_at desc)`, `ai_actions(organization_id, created_at desc)`, `ai_actions(run_id)`, `audit_logs(ai_run_id)`, unique `ai_actions` idempotency index per organization, `contact_submissions(created_at desc)`.

## Relationships (summary)
Every business table carries `organization_id → organizations(id)`. `memberships(organization_id, user_id)` joins users to organizations and points at a `roles` row; `role_permissions` maps roles to `permissions`. Customers own contacts, deals and invoices; invoices own items; AI runs own AI actions.

## Tenant isolation
Isolation is enforced **in application code**: the organization comes from the verified session's membership, and queries filter on `organization_id`. There are **no PostgreSQL row-level-security policies** in the migrations, so any new query must include the organization filter. Cross-tenant and permission-denial cases are covered by `tests/api-authorization.integration.test.js` using test doubles.

## Provisioning a first user
Neon Auth creates the user on sign-up, but this app grants access only through a `memberships` row (with a role). A brand-new account has no organization and receives `403 NO_ORGANIZATION_ACCESS` until a membership exists. There is no onboarding endpoint in this codebase; insert the organization/membership yourself (SQL console) or extend the app. Never commit production data or dumps.
