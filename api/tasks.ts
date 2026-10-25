import { and, desc, eq } from 'drizzle-orm'
import { db } from '../src/server/persistence/drizzle'
import { auditLogs, tasks } from '../src/server/persistence/schema'
import { AuthError, authFailure, requireOrganizationContext, requirePermission } from '../src/server/modules/authentication/session'

type Request = { method?: string; query?: Record<string, string | string[] | undefined>; body?: unknown; headers?: Record<string, string | string[] | undefined> }
type Response = { status: (code: number) => Response; json: (body: unknown) => Response }
const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value
const bodyOf = (req: Request) => req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {}
const audit = (organizationId: string, actorId: string, action: string, entityId: string) => db.insert(auditLogs).values({ organizationId, actorId, action, entityType: 'task', entityId, requestId: crypto.randomUUID() })
const fail = (res: Response, status: number, code: string, message: string) => res.status(status).json({ ok: false, error: { code, message } })

export default async function handler(req: Request, res: Response) {
  try {
    const context = await requireOrganizationContext(req)
    const organizationId = context.organizationId
    const actorId = context.userId
    const body = bodyOf(req)
    const query = req.query ?? {}
    const id = text(body.id) || text(first(query.id))

    if (req.method === 'GET') {
      requirePermission(context, 'tasks.read')
      const rows = await db.select().from(tasks).where(and(eq(tasks.organizationId, organizationId), id ? eq(tasks.id, id) : undefined)).orderBy(desc(tasks.dueAt), desc(tasks.createdAt))
      return res.status(200).json({ ok: true, data: rows })
    }

    if (req.method === 'POST') {
      requirePermission(context, 'tasks.create')
      const title = text(body.title)
      if (!title || title.length > 240) return fail(res, 422, 'VALIDATION_ERROR', 'A task title between 1 and 240 characters is required.')
      const priority = text(body.priority) || 'medium'
      const status = text(body.status) || 'todo'
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) return fail(res, 422, 'VALIDATION_ERROR', 'Invalid task priority.')
      if (!['todo', 'in_progress', 'done', 'cancelled'].includes(status)) return fail(res, 422, 'VALIDATION_ERROR', 'Invalid task status.')
      const [created] = await db.insert(tasks).values({ organizationId, title, priority, status, projectId: text(body.projectId) || null, assigneeId: text(body.assigneeId) || null, dueAt: text(body.dueAt) ? new Date(text(body.dueAt)) : null }).returning()
      await audit(organizationId, actorId, 'task.created', created.id)
      return res.status(201).json({ ok: true, data: created })
    }

    if (!id) return fail(res, 422, 'VALIDATION_ERROR', 'Task id is required.')
    const [existing] = await db.select().from(tasks).where(and(eq(tasks.organizationId, organizationId), eq(tasks.id, id))).limit(1)
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Task not found.')

    if (req.method === 'PATCH') {
      requirePermission(context, 'tasks.update')
      const patch: Record<string, unknown> = { updatedAt: new Date() }
      if (body.title !== undefined) { const title = text(body.title); if (!title || title.length > 240) return fail(res, 422, 'VALIDATION_ERROR', 'Invalid task title.'); patch.title = title }
      if (body.priority !== undefined) { const priority = text(body.priority); if (!['low', 'medium', 'high', 'urgent'].includes(priority)) return fail(res, 422, 'VALIDATION_ERROR', 'Invalid task priority.'); patch.priority = priority }
      if (body.status !== undefined) { const status = text(body.status); if (!['todo', 'in_progress', 'done', 'cancelled'].includes(status)) return fail(res, 422, 'VALIDATION_ERROR', 'Invalid task status.'); patch.status = status }
      if (body.dueAt !== undefined) patch.dueAt = text(body.dueAt) ? new Date(text(body.dueAt)) : null
      const [updated] = await db.update(tasks).set(patch).where(and(eq(tasks.organizationId, organizationId), eq(tasks.id, id))).returning()
      await audit(organizationId, actorId, 'task.updated', id)
      return res.status(200).json({ ok: true, data: updated })
    }

    if (req.method === 'DELETE') {
      requirePermission(context, 'tasks.delete')
      const [deleted] = await db.update(tasks).set({ status: 'cancelled', updatedAt: new Date() }).where(and(eq(tasks.organizationId, organizationId), eq(tasks.id, id))).returning()
      await audit(organizationId, actorId, 'task.cancelled', id)
      return res.status(200).json({ ok: true, data: deleted })
    }
    return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Unsupported task operation.')
  } catch (error) {
    if (error instanceof AuthError) return authFailure(res, error)
    console.error('[tasks] request failed', error)
    return fail(res, 500, 'TASK_OPERATION_FAILED', 'Task data could not be saved.')
  }
}
