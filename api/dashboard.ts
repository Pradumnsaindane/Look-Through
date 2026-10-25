import { sql } from 'drizzle-orm'

type VercelRequest = { method?: string; query: Record<string, string | string[] | undefined> }
type VercelResponse = { status: (code: number) => VercelResponse; json: (body: unknown) => VercelResponse }
import { db } from '../src/server/persistence/drizzle'
import { authFailure, requireOrganizationContext, requirePermission } from '../src/server/modules/authentication/session'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'GET required' } })
  try {
    const context = await requireOrganizationContext(req)
    requirePermission(context, 'analytics.read')
    const organizationId = context.organizationId
    const [financial, counts, pipeline, tasks, activity] = await Promise.all([
      db.execute(sql`select
        coalesce((select sum(total_minor) from invoices where organization_id = ${organizationId} and status = 'paid' and created_at >= date_trunc('month', now())), 0)::bigint as revenue_minor,
        coalesce((select sum(total_minor) from invoices where organization_id = ${organizationId} and status in ('sent','overdue')), 0)::bigint as receivables_minor`),
      db.execute(sql`select
        (select count(*) from customers where organization_id = ${organizationId} and status = 'active')::int as customers,
        (select count(*) from invoices where organization_id = ${organizationId} and status = 'overdue')::int as overdue_invoices,
        (select coalesce(sum(total_minor),0) from invoices where organization_id = ${organizationId} and status = 'overdue')::bigint as overdue_minor,
        (select count(*) from tasks where organization_id = ${organizationId} and status <> 'done')::int as open_tasks`),
      db.execute(sql`select stage, count(*)::int as count, coalesce(sum(amount_minor),0)::bigint as amount_minor from deals where organization_id = ${organizationId} and stage not in ('won','lost') group by stage order by stage`),
      db.execute(sql`select id, title, priority, status, due_at from tasks where organization_id = ${organizationId} and status in ('todo','in_progress') order by case priority when 'urgent' then 1 when 'high' then 2 else 3 end, due_at nulls last limit 8`),
      db.execute(sql`select id, action, entity_type, entity_id, created_at from audit_logs where organization_id = ${organizationId} order by created_at desc limit 10`),
    ])
    return res.status(200).json({ ok: true, data: { financial: { ...financial.rows[0], expenses_minor: null, cash_in_minor: null, cash_out_minor: null }, counts: { ...counts.rows[0], pending_expenses: null }, pipeline: pipeline.rows, tasks: tasks.rows, insights: [], alerts: [], activity: activity.rows } })
  } catch (error) {
    if (error instanceof Error && 'status' in error) return authFailure(res, error)
    console.error('[dashboard] query failed', error)
    return res.status(500).json({ ok: false, error: { code: 'DASHBOARD_QUERY_FAILED', message: 'Dashboard data could not be loaded.' } })
  }
}
