import { eq } from 'drizzle-orm'
import { db } from '../src/server/persistence/drizzle.js'
import { organizationSettings, organizations } from '../src/server/persistence/schema.js'
import { AuthError, authFailure, requireOrganizationContext, requirePermission } from '../src/server/modules/authentication/session.js'

type Request = { method?: string; body?: unknown; headers?: Record<string, string | string[] | undefined> }
type Response = { status: (code: number) => Response; json: (body: unknown) => Response }
type SettingsInput = { organizationName?: unknown; gstNumber?: unknown; aiAutonomyLevel?: unknown; reminderThresholdMinor?: unknown }

const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const fail = (res: Response, code: number, error: string, message: string) => res.status(code).json({ ok: false, error: { code, message } })

export default async function handler(req: Request, res: Response) {
  try {
    const context = await requireOrganizationContext(req)
    if (req.method === 'GET') {
      const [organization] = await db.select({ name: organizations.name }).from(organizations).where(eq(organizations.id, context.organizationId)).limit(1)
      const [settings] = await db.select().from(organizationSettings).where(eq(organizationSettings.organizationId, context.organizationId)).limit(1)
      return res.status(200).json({ ok: true, data: { organizationName: organization?.name ?? '', gstNumber: settings?.gstNumber ?? '', aiAutonomyLevel: settings?.aiAutonomyLevel ?? 'Level 4 (Ask Approval Before Execution)', reminderThresholdMinor: settings?.reminderThresholdMinor ?? 5000000 } })
    }
    if (req.method !== 'PATCH') return fail(res, 405, 'METHOD_NOT_ALLOWED', 'PATCH required')
    requirePermission(context, 'organization.update')
    const input = (req.body && typeof req.body === 'object' ? req.body : {}) as SettingsInput
    const organizationName = text(input.organizationName, 160)
    const gstNumber = text(input.gstNumber, 32)
    const aiAutonomyLevel = text(input.aiAutonomyLevel, 100)
    const reminderThresholdMinor = Number(input.reminderThresholdMinor)
    if (!organizationName || !aiAutonomyLevel || !Number.isSafeInteger(reminderThresholdMinor) || reminderThresholdMinor < 0) return fail(res, 422, 'VALIDATION_ERROR', 'Settings values are invalid.')
    await db.update(organizations).set({ name: organizationName, updatedAt: new Date() }).where(eq(organizations.id, context.organizationId))
    const [saved] = await db.insert(organizationSettings).values({ organizationId: context.organizationId, gstNumber, aiAutonomyLevel, reminderThresholdMinor, updatedAt: new Date() }).onConflictDoUpdate({ target: organizationSettings.organizationId, set: { gstNumber, aiAutonomyLevel, reminderThresholdMinor, updatedAt: new Date() } }).returning()
    return res.status(200).json({ ok: true, data: { organizationName, gstNumber: saved.gstNumber, aiAutonomyLevel: saved.aiAutonomyLevel, reminderThresholdMinor: saved.reminderThresholdMinor } })
  } catch (error) {
    if (error instanceof AuthError) return authFailure(res, error)
    console.error('[settings] request failed', error)
    return fail(res, 500, 'SETTINGS_OPERATION_FAILED', 'Settings could not be saved.')
  }
}
