import { db, getDatabaseUrl } from '../src/server/persistence/drizzle'
import { contactSubmissions } from '../src/server/persistence/schema'

type Request = { method?: string; body?: unknown; headers?: Record<string, string | string[] | undefined> }
type Response = { status: (code: number) => Response; json: (body: unknown) => Response; setHeader?: (name: string, value: string) => void }

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isEmail = (value: string): boolean => {
  if (value.length < 5 || value.length > 254 || value.includes(String.fromCharCode(32))) return false
  const at = value.indexOf(String.fromCharCode(64))
  if (at <= 0 || at !== value.lastIndexOf(String.fromCharCode(64))) return false
  const domain = value.slice(at + 1)
  const dot = domain.lastIndexOf(String.fromCharCode(46))
  return dot > 0 && dot < domain.length - 1
}
const topics = new Set(['sales', 'learning', 'support', 'partnership', 'other'])
const fail = (res: Response, status: number, code: string, message: string) => res.status(status).json({ ok: false, error: { code, message } })
const header = (req: Request, name: string) => {
  const value = req.headers?.[name]
  return Array.isArray(value) ? value[0] : value
}

function bodyOf(req: Request): Record<string, unknown> {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>
  if (typeof req.body === 'string') {
    try {
      const parsed: unknown = JSON.parse(req.body)
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>
    } catch {
      return {}
    }
  }
  return {}
}

/** Same-origin guard for the public form; skipped when the platform omits the headers. */
function isSameOrigin(req: Request): boolean {
  const origin = text(header(req, 'origin'))
  const host = text(header(req, 'host'))
  if (!origin || origin === 'null' || !host) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export default async function handler(req: Request, res: Response) {
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8')
  if (req.method !== 'POST') {
    return fail(res, 405, 'METHOD_NOT_ALLOWED', 'POST is required.')
  }
  if (!isSameOrigin(req)) {
    return fail(res, 403, 'FORBIDDEN', 'This form only accepts submissions from the Look Through site.')
  }

  const body = bodyOf(req)
  const name = text(body.name)
  const email = text(body.email)
  const company = text(body.company)
  const topic = text(body.topic)
  const message = text(body.message)

  if (text(body.website)) {
    return fail(res, 422, 'VALIDATION_ERROR', 'This submission was rejected as automated. Nothing was sent.')
  }
  if (name.length < 2 || name.length > 120) {
    return fail(res, 422, 'VALIDATION_ERROR', 'A name between 2 and 120 characters is required.')
  }
  if (!isEmail(email)) {
    return fail(res, 422, 'VALIDATION_ERROR', 'A valid email address is required.')
  }
  if (company.length > 160) {
    return fail(res, 422, 'VALIDATION_ERROR', 'Company must be 160 characters or fewer.')
  }
  if (!topics.has(topic)) {
    return fail(res, 422, 'VALIDATION_ERROR', 'Choose one of the supported contact topics.')
  }
  if (message.length < 20 || message.length > 3000) {
    return fail(res, 422, 'VALIDATION_ERROR', 'A message between 20 and 3000 characters is required.')
  }

  if (!getDatabaseUrl()) {
    return fail(
      res,
      503,
      'CONTACT_DELIVERY_UNAVAILABLE',
      'The contact inbox is not configured for this environment, so nothing was sent. Please try again once delivery is set up.'
    )
  }

  try {
    const [created] = await db
      .insert(contactSubmissions)
      .values({ name, email, company: company || null, topic, message, source: 'landing-contact' })
      .returning({ id: contactSubmissions.id })

    return res.status(201).json({
      ok: true,
      data: { reference: created?.id, receivedAt: new Date().toISOString() },
    })
  } catch (error) {
    console.error('[contact] submission failed', error)
    return fail(
      res,
      500,
      'CONTACT_SUBMISSION_FAILED',
      'The message could not be stored, so nothing was delivered. Please try again shortly.'
    )
  }
}
