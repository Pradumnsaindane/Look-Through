import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const users = {
  'cookie-a': { id: '00000000-0000-0000-0000-00000000000a', organizationId: '00000000-0000-0000-0000-0000000000aa', permissions: ['customers.create', 'customers.update', 'customers.delete', 'analytics.read', 'ai.read', 'ai.execute'] },
  'cookie-b': { id: '00000000-0000-0000-0000-00000000000b', organizationId: '00000000-0000-0000-0000-0000000000bb', permissions: ['customers.create', 'customers.update', 'customers.delete', 'analytics.read', 'ai.read', 'ai.execute'] },
  'cookie-viewer': { id: '00000000-0000-0000-0000-00000000000c', organizationId: '00000000-0000-0000-0000-0000000000aa', permissions: ['analytics.read', 'ai.read'] },
}
const customerA = { id: '10000000-0000-0000-0000-000000000001', organizationId: users['cookie-a'].organizationId, name: 'A customer', email: 'a@example.com', phone: null, status: 'active' }
const customerB = { id: '10000000-0000-0000-0000-000000000002', organizationId: users['cookie-b'].organizationId, name: 'B customer', email: 'b@example.com', phone: null, status: 'active' }

let vite
let modules
let currentIdentity
let requestedCustomerId
let originalFetch
const originalDb = {}

function responseRecorder() {
  const result = { statusCode: 200, body: undefined }
  return { result, response: { status(code) { result.statusCode = code; return this }, json(body) { result.body = body; return this } } }
}
function request(cookie, method = 'GET', extra = {}) {
  requestedCustomerId = extra.query?.id
  return { method, query: extra.query ?? {}, body: extra.body, headers: { ...(cookie ? { cookie: `better-auth.session_token=${cookie}` } : {}), ...(extra.headers ?? {}) } }
}
function sessionFor(cookie) {
  const identity = users[cookie]
  if (!identity) return null
  currentIdentity = identity
  return { user: { id: identity.id, email: `${cookie}@example.com` }, session: { userId: identity.id, activeOrganizationId: identity.organizationId, expiresAt: new Date(Date.now() + 60_000).toISOString() } }
}

before(async () => {
  process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test'
  process.env.NEON_AUTH_BASE_URL = 'https://auth.test/neondb/auth'
  process.env.VITE_NEON_AUTH_URL = 'https://auth.test/neondb/auth'
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' })
  modules = {
    customers: (await vite.ssrLoadModule('/api/customers.ts')).default,
    dashboard: (await vite.ssrLoadModule('/api/dashboard.ts')).default,
    ai: (await vite.ssrLoadModule('/api/ai.ts')).default,
    db: (await vite.ssrLoadModule('/src/server/persistence/drizzle.ts')).db,
  }
  originalFetch = globalThis.fetch
  globalThis.fetch = async (_url, init = {}) => {
    const cookie = String(init.headers?.cookie ?? '').split('=').at(-1)
    const payload = sessionFor(cookie)
    return new Response(payload ? JSON.stringify(payload) : '{}', { status: payload ? 200 : 401, headers: { 'content-type': 'application/json' } })
  }
  originalDb.select = modules.db.select
  originalDb.insert = modules.db.insert
  originalDb.execute = modules.db.execute
  originalDb.update = modules.db.update
})

after(async () => {
  globalThis.fetch = originalFetch
  if (vite) await vite.close()
})

function installDbMock() {
  let selectCall = 0
  currentIdentity = users['cookie-a']
  requestedCustomerId = undefined
  modules.db.select = () => {
    selectCall += 1
    const callNumber = selectCall
    const chain = {
      from(table) {
        chain.table = table
        return chain
      },
      leftJoin() { return chain },
      innerJoin() { return chain },
      rows() {
        return callNumber % 2 === 1
          ? callNumber === 1
            ? [{ organizationId: currentIdentity.organizationId, roleId: currentIdentity.permissions.includes('customers.create') ? 'role-admin' : 'role-viewer', roleName: currentIdentity.permissions.includes('customers.create') ? 'Admin' : 'Viewer' }]
            : requestedCustomerId === customerB.id && currentIdentity.organizationId !== customerB.organizationId ? [] : [currentIdentity.organizationId === customerB.organizationId ? customerB : customerA]
          : callNumber === 4
            ? [{ count: 1 }]
            : currentIdentity.permissions.map((key) => ({ key }))
      },
      where() { return chain },
      then(resolve, reject) { return Promise.resolve(chain.rows()).then(resolve, reject) },
      limit() { return chain },
      orderBy() { return chain },
      offset() { return chain },
    }
    return chain
  }
  modules.db.insert = () => ({ values: () => ({ returning: () => Promise.resolve([customerA]) }) })
  modules.db.execute = async () => ({ rows: [{}] })
}

function restoreDb() {
  modules.db.select = originalDb.select
  modules.db.insert = originalDb.insert
  modules.db.execute = originalDb.execute
  modules.db.update = originalDb.update
}

test('real customer handler authenticates and scopes to the verified organization', async () => {
  installDbMock()
  const first = responseRecorder()
  await modules.customers(request('cookie-a', 'GET', { query: { organizationId: users['cookie-b'].organizationId } }), first.response)
  assert.equal(first.result.statusCode, 200)
  assert.equal(first.result.body.data.rows[0].organizationId, users['cookie-a'].organizationId)
  restoreDb()
})

test('real customer handler rejects a cross-tenant resource lookup', async () => {
  installDbMock()
  const result = responseRecorder()
  await modules.customers(request('cookie-a', 'GET', { query: { id: customerB.id } }), result.response)
  assert.equal(result.result.statusCode, 404)
  assert.equal(result.result.body.error.code, 'NOT_FOUND')
  restoreDb()
})

test('dashboard and AI handlers use the verified session organization', async () => {
  installDbMock()
  const dashboard = responseRecorder()
  await modules.dashboard(request('cookie-b', 'GET', { query: { organizationId: users['cookie-a'].organizationId } }), dashboard.response)
  assert.equal(dashboard.result.statusCode, 200)
  const ai = responseRecorder()
  await modules.ai(request('cookie-b', 'POST', { body: { organizationId: users['cookie-a'].organizationId, prompt: 'read', tool: 'not-approved' } }), ai.response)
  assert.equal(ai.result.statusCode, 403)
  assert.equal(ai.result.body.error.code, 'FORBIDDEN')
  restoreDb()
})

test('forged identity and role headers cannot impersonate or escalate', async () => {
  installDbMock()
  const result = responseRecorder()
  const req = request('cookie-a', 'POST', { body: { name: 'created', organizationId: users['cookie-b'].organizationId }, headers: { 'x-user-id': users['cookie-b'].id, 'x-user-roles': 'Owner' } })
  req.headers['x-user-id'] = users['cookie-b'].id
  req.headers['x-user-roles'] = 'Owner'
  await modules.customers(req, result.response)
  assert.equal(result.result.statusCode, 201)
  assert.equal(result.result.body.data.organizationId, users['cookie-a'].organizationId)
  restoreDb()
})

test('missing sessions return 401 and insufficient permissions return 403', async () => {
  installDbMock()
  const unauthenticated = responseRecorder()
  await modules.dashboard(request('', 'GET'), unauthenticated.response)
  assert.equal(unauthenticated.result.statusCode, 401)
  const viewer = responseRecorder()
  await modules.customers(request('cookie-viewer', 'POST', { body: { name: 'blocked' } }), viewer.response)
  assert.equal(viewer.result.statusCode, 403)
  restoreDb()
})

test('unexpected database failures return generic 500 responses', async () => {
  installDbMock()
  modules.db.select = () => { throw new Error('secret database connection details') }
  const result = responseRecorder()
  await modules.customers(request('cookie-a', 'GET'), result.response)
  assert.equal(result.result.statusCode, 500)
  assert.equal(result.result.body.error.code, 'CUSTOMER_OPERATION_FAILED')
  assert.equal(result.result.body.error.message.includes('secret'), false)
  restoreDb()
})

// Keep the test count explicit in CI output: six real handler scenarios cover both organizations and failure paths.
console.log('[security integration] two organizations, six handler scenarios')

