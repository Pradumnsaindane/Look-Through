import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '../src/server/persistence/drizzle'
import { auditLogs, customers, deals, invoices } from '../src/server/persistence/schema'

type Request = { method?: string; query: Record<string, string | string[] | undefined>; body?: unknown; headers?: Record<string, string | string[] | undefined> }
type Response = { status: (code: number) => Response; json: (body: unknown) => Response }
type Input = { organizationId?: string; id?: string; q?: string; status?: string; page?: number; pageSize?: number; name?: string; email?: string; phone?: string }

const fail = (res: Response, code: number, error: string, message: string) => res.status(code).json({ ok: false, error: { code: error, message } })
const value = (input: unknown) => typeof input === 'string' ? input.trim() : ''
const inputFrom = (req: Request): Input => {
  const query = req.query ?? {}
  const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {}
  return {
    organizationId: value(body.organizationId) || value(query.organizationId), id: value(body.id) || value(query.id),
    q: value(body.q) || value(query.q), status: value(body.status) || value(query.status),
    page: Math.max(1, Number(body.page || query.page || 1)), pageSize: Math.min(100, Math.max(1, Number(body.pageSize || query.pageSize || 20))),
    name: value(body.name), email: value(body.email), phone: value(body.phone),
  }
}
const audit = (organizationId: string, actorId: string, action: string, entityId: string) => db.insert(auditLogs).values({ organizationId, actorId: actorId || null, action, entityType: 'customer', entityId, requestId: crypto.randomUUID() })

export default async function handler(req: Request, res: Response) {
  const input = inputFrom(req)
  const organizationId = input.organizationId
  if (!organizationId) return fail(res, 401, 'UNAUTHORIZED', 'Select an organization to continue.')
  const actorId = value(req.headers?.['x-user-id'])
  const roles = String(req.headers?.['x-user-roles'] || 'Viewer').split(',').map((role) => role.trim())
  const canWrite = roles.some((role) => ['Owner', 'Admin', 'Manager', 'Employee'].includes(role))
  const canDelete = roles.some((role) => ['Owner', 'Admin'].includes(role))
  try {
    if (req.method === 'GET') {
      if (input.id) {
        const [customer] = await db.select().from(customers).where(and(eq(customers.organizationId, organizationId), eq(customers.id, input.id))).limit(1)
        if (!customer) return fail(res, 404, 'NOT_FOUND', 'Customer not found.')
        const [customerDeals, customerInvoices, customerActivity] = await Promise.all([
          db.select().from(deals).where(and(eq(deals.organizationId, organizationId), eq(deals.customerId, input.id))).orderBy(desc(deals.updatedAt)),
          db.select().from(invoices).where(and(eq(invoices.organizationId, organizationId), eq(invoices.customerId, input.id))).orderBy(desc(invoices.updatedAt)),
          db.execute(sql`select id, action, entity_type, entity_id, created_at from activities where organization_id = ${organizationId} and entity_id = ${input.id} order by created_at desc limit 50`),
        ])
        return res.status(200).json({ ok: true, data: { customer, deals: customerDeals, invoices: customerInvoices, activity: customerActivity.rows } })
      }
      const page = input.page || 1, pageSize = input.pageSize || 20
      const filters = [eq(customers.organizationId, organizationId)]
      if (input.status && input.status !== 'all') filters.push(eq(customers.status, input.status.toLowerCase() === 'new' ? 'prospect' : input.status.toLowerCase() === 'at risk' ? 'inactive' : input.status.toLowerCase()))
      if (input.q) filters.push(or(ilike(customers.name, `%${input.q}%`), ilike(customers.email, `%${input.q}%`), ilike(customers.phone, `%${input.q}%`))!)
      const [rows, total] = await Promise.all([
        db.select().from(customers).where(and(...filters)).orderBy(customers.name).limit(pageSize).offset((page - 1) * pageSize),
        db.select({ count: sql<number>`count(*)::int` }).from(customers).where(and(...filters)),
      ])
      return res.status(200).json({ ok: true, data: { rows, total: total[0]?.count || 0, page, pageSize } })
    }
    if (!canWrite) return fail(res, 403, 'FORBIDDEN', 'You do not have permission to change customers.')
    if (req.method === 'POST') {
      if (!input.name || input.name.length > 160) return fail(res, 422, 'VALIDATION_ERROR', 'A customer name is required.')
      const [created] = await db.insert(customers).values({ organizationId, name: input.name, email: input.email || null, phone: input.phone || null }).returning()
      await audit(organizationId, actorId, 'customer.created', created.id)
      return res.status(201).json({ ok: true, data: created })
    }
    if (!input.id) return fail(res, 422, 'VALIDATION_ERROR', 'Customer id is required.')
    const [existing] = await db.select().from(customers).where(and(eq(customers.organizationId, organizationId), eq(customers.id, input.id))).limit(1)
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Customer not found.')
    if (req.method === 'PATCH') {
      if (!input.name || input.name.length > 160) return fail(res, 422, 'VALIDATION_ERROR', 'A customer name is required.')
      const [updated] = await db.update(customers).set({ name: input.name, email: input.email || null, phone: input.phone || null, updatedAt: new Date() }).where(and(eq(customers.organizationId, organizationId), eq(customers.id, input.id))).returning()
      await audit(organizationId, actorId, 'customer.updated', updated.id)
      return res.status(200).json({ ok: true, data: updated })
    }
    if (req.method === 'DELETE') {
      if (!canDelete) return fail(res, 403, 'FORBIDDEN', 'Only admins can archive customers.')
      const [archived] = await db.update(customers).set({ status: 'inactive', updatedAt: new Date() }).where(and(eq(customers.organizationId, organizationId), eq(customers.id, input.id))).returning()
      await audit(organizationId, actorId, 'customer.archived', archived.id)
      return res.status(200).json({ ok: true, data: archived })
    }
    return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Unsupported customer operation.')
  } catch (error) {
    console.error('[customers] request failed', error)
    return fail(res, 500, 'CUSTOMER_OPERATION_FAILED', 'Customer data could not be saved.')
  }
}
