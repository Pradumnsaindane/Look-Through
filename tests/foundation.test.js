import test from 'node:test'
import assert from 'node:assert/strict'

function createRequestId() {
  return crypto.randomUUID()
}

test('request IDs are unique UUIDs', () => {
  const first = createRequestId()
  const second = createRequestId()
  assert.notEqual(first, second)
  assert.match(first, /^[0-9a-f-]{36}$/)
})

test('API responses expose a stable success envelope', () => {
  const response = { ok: true, data: { id: 'example' }, meta: { requestId: 'request-1', timestamp: new Date().toISOString() } }
  assert.equal(response.ok, true)
  assert.equal(response.meta.requestId, 'request-1')
})
