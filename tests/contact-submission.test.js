import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

let vite
let modules
let originalInsert
let databaseUrl

function responseRecorder() {
  const result = { statusCode: 200, body: undefined }
  return {
    result,
    response: {
      status(code) {
        result.statusCode = code
        return this
      },
      json(body) {
        result.body = body
        return this
      },
      setHeader() {},
    },
  }
}

function request(method = 'POST', body = {}, headers = {}) {
  return {
    method,
    body,
    headers: {
      host: 'look-through.test',
      origin: 'https://look-through.test',
      'content-type': 'application/json',
      ...headers,
    },
  }
}

const validBody = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines',
  topic: 'sales',
  message: 'We would like to evaluate Look Through for our delivery teams.',
}

before(async () => {
  process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test'
  databaseUrl = process.env.DATABASE_URL
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' })
  modules = {
    contact: (await vite.ssrLoadModule('/api/contact.ts')).default,
    db: (await vite.ssrLoadModule('/src/server/persistence/drizzle.ts')).db,
  }
  originalInsert = modules.db.insert
})

after(async () => {
  modules.db.insert = originalInsert
  process.env.DATABASE_URL = databaseUrl
  if (vite) await vite.close()
})

function installInsertMock(reference = '9b1f2a44-0000-4000-8000-000000000001') {
  let captured
  modules.db.insert = () => ({
    values(payload) {
      captured = payload
      return {
        returning: async () => [{ id: reference }],
      }
    },
  })
  return () => captured
}

test('contact endpoint only accepts POST', async () => {
  const result = responseRecorder()
  await modules.contact(request('GET'), result.response)
  assert.equal(result.result.statusCode, 405)
  assert.equal(result.result.body.error.code, 'METHOD_NOT_ALLOWED')
})

test('contact endpoint validates the payload before touching storage', async () => {
  const captured = installInsertMock()
  const cases = [
    { ...validBody, email: 'not-an-email' },
    { ...validBody, message: 'too short' },
    { ...validBody, topic: 'unknown-topic' },
    { ...validBody, name: 'A' },
  ]
  for (const body of cases) {
    const result = responseRecorder()
    await modules.contact(request('POST', body), result.response)
    assert.equal(result.result.statusCode, 422)
    assert.equal(result.result.body.error.code, 'VALIDATION_ERROR')
  }
  assert.equal(captured(), undefined)
})

test('contact endpoint rejects cross-origin and honeypot submissions', async () => {
  const captured = installInsertMock()
  const crossOrigin = responseRecorder()
  await modules.contact(request('POST', validBody, { origin: 'https://evil.example' }), crossOrigin.response)
  assert.equal(crossOrigin.result.statusCode, 403)

  const spam = responseRecorder()
  await modules.contact(request('POST', { ...validBody, website: 'http://spam.example' }), spam.response)
  assert.equal(spam.result.statusCode, 422)

  assert.equal(captured(), undefined)
})

test('contact endpoint stores a valid submission and returns a reference', async () => {
  const captured = installInsertMock()
  const result = responseRecorder()
  await modules.contact(request('POST', validBody), result.response)
  assert.equal(result.result.statusCode, 201)
  assert.equal(result.result.body.ok, true)
  assert.equal(result.result.body.data.reference, '9b1f2a44-0000-4000-8000-000000000001')
  const stored = captured()
  assert.equal(stored.name, validBody.name)
  assert.equal(stored.email, validBody.email)
  assert.equal(stored.topic, validBody.topic)
  assert.equal(stored.source, 'landing-contact')
})

test('contact endpoint reports an unconfigured inbox instead of pretending success', async () => {
  const captured = installInsertMock()
  delete process.env.DATABASE_URL
  try {
    const result = responseRecorder()
    await modules.contact(request('POST', validBody), result.response)
    assert.equal(result.result.statusCode, 503)
    assert.equal(result.result.body.error.code, 'CONTACT_DELIVERY_UNAVAILABLE')
    assert.match(result.result.body.error.message, /nothing was sent/i)
    assert.equal(captured(), undefined)
  } finally {
    process.env.DATABASE_URL = databaseUrl
  }
})
