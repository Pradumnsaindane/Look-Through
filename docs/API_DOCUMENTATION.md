# API reference

Base path `/api`. JSON in/out. Success: `{ "ok": true, "data": ... }`. Failure: `{ "ok": false, "error": { "code", "message" } }`. Protected endpoints read the session cookie (send `credentials: 'include'`).

| Endpoint | Method | Permission | Behavior |
|---|---|---|---|
| `/api/customers` | GET | session + membership | List (`q`, `status`, `page`, `pageSize` ≤ 100) → `{rows,total,page,pageSize}`; with `id` → customer profile with deals, invoices, contacts, activity |
| | POST | `customers.create` | Create (`name`, `email`, `phone`) → 201 |
| | PATCH | `customers.update` | Update by `id` |
| | DELETE | `customers.delete` | Archive by `id` |
| `/api/tasks` | GET | `tasks.read` | Organization's tasks |
| | POST | `tasks.create` | `title` (≤ 240), `priority` low/medium/high/urgent, `status` todo/in_progress/done/cancelled, optional `projectId`, `assigneeId`, `dueAt` → 201 |
| | PATCH | `tasks.update` | Partial update by `id`; invalid values → 422 |
| | DELETE | `tasks.delete` | Delete by `id` |
| `/api/dashboard` | GET | `analytics.read` | Aggregates: revenue, receivables, counts, pipeline by stage, tasks, insights, alerts, activity. `expenses`, `cash_in/out`, and `pending_expenses` are `null` when unsupported |
| `/api/ai` | POST | `ai.read` (`ai.execute` for `mode: WRITE`) | Body `{ prompt, tool, mode?, input? }`; runs one **approved tool**, records an `ai_runs` row, returns `{ runId, tool, result, grounded }`. Unknown tool → 404 |
| `/api/contact` | POST | public | `name` 2–120, `email`, `company` ≤ 160, `topic`, `message` 20–3000; hidden `website` field is a honeypot; stored in `contact_submissions` → 201 |

Approved AI tools: `get_business_summary`, `get_customer`, `get_overdue_invoices`, `get_sales_pipeline`, `get_expense_summary`, `get_tasks`, `get_recent_activity`, `create_task`, `prepare_invoice`, `prepare_customer_message`. Permission levels in code: READ, SUGGEST, PREPARE, APPROVE, EXECUTE, AUTONOMOUS. There is no LLM provider call: no API key is needed.

Common errors: `401 UNAUTHENTICATED`, `403 NO_ORGANIZATION_ACCESS | ACTIVE_ORGANIZATION_REQUIRED | forbidden`, `405 METHOD_NOT_ALLOWED`, `422 VALIDATION_ERROR`, `500 AUTH_NOT_CONFIGURED`.
