import { createAiRun, createBusinessTools, type PermissionLevel } from '../src/server/modules/ai/orchestrator'
import type { AuthenticatedPrincipal } from '../src/server/modules/authentication'
import { db } from '../src/server/persistence/drizzle'
import { aiRuns } from '../src/server/persistence/schema'
import { eq } from 'drizzle-orm'
import { AuthError, authFailure, requireOrganizationContext, requirePermission } from '../src/server/modules/authentication/session'

type Request = { method?: string; body?: unknown; headers?: Record<string, string | string[] | undefined> }
type Response = { status: (code: number) => Response; json: (body: unknown) => Response }

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'POST is required.' } })
  const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {}
  const prompt = text(body.prompt)
  const toolName = text(body.tool)
  if (!prompt || !toolName) return res.status(400).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'prompt and an approved tool are required.' } })
  try {
    const context = await requireOrganizationContext(req)
    requirePermission(context, text(body.mode).toUpperCase() === 'WRITE' ? 'ai.execute' : 'ai.read')
    const principal: AuthenticatedPrincipal = { userId: context.userId, organizationId: context.organizationId, roles: context.roles, permissions: context.permissions }
    const run = await createAiRun({ principal, organizationId: context.organizationId }, prompt, (text(body.mode) || 'READ') as PermissionLevel)
    const tools = createBusinessTools(run)
    const selected = tools[toolName]
    if (!selected || typeof selected.execute !== 'function') return res.status(404).json({ ok: false, error: { code: 'TOOL_NOT_FOUND', message: 'The requested AI tool is not approved.' } })
    const result = await selected.execute(body.input ?? {}, { toolCallId: `api-${run.runId}` } as never)
    await db.update(aiRuns).set({ status: 'completed', completedAt: new Date() }).where(eq(aiRuns.id, run.runId))
    return res.status(200).json({ ok: true, data: { runId: run.runId, tool: toolName, result, grounded: true } })
  } catch (error) {
    if (error instanceof AuthError) return authFailure(res, error)
    console.error('[ai] request failed', error)
    return res.status(500).json({ ok: false, error: { code: 'AI_ACTION_FAILED', message: 'The AI request could not be completed.' } })
  }
}
