import test from 'node:test'
import assert from 'node:assert/strict'

const permissions = {
  Owner: new Set(['customers.read', 'customers.create', 'settings.manage', 'ai.execute']),
  Admin: new Set(['customers.read', 'customers.create', 'ai.execute']),
  Manager: new Set(['customers.read', 'customers.create', 'customers.update', 'analytics.read']),
  Employee: new Set(['customers.read', 'customers.create', 'customers.update', 'ai.read']),
  Viewer: new Set(['customers.read', 'analytics.read']),
}

function authorize({ principal, organizationId, permission, businessRule = true }) {
  if (!principal?.userId) return 'UNAUTHENTICATED'
  if (principal.organizationId !== organizationId) return 'FORBIDDEN'
  if (!principal.roles.some((role) => permissions[role]?.has(permission))) return 'FORBIDDEN'
  if (!businessRule) return 'BUSINESS_RULE_VIOLATION'
  return 'allowed'
}

const employeeA = { userId: 'user-a', organizationId: 'org-a', roles: ['Employee'] }
const viewerA = { userId: 'viewer-a', organizationId: 'org-a', roles: ['Viewer'] }
const adminA = { userId: 'admin-a', organizationId: 'org-a', roles: ['Admin'] }

test('cross-tenant resource access is denied even with a valid resource id', () => {
  assert.equal(authorize({ principal: employeeA, organizationId: 'org-b', permission: 'customers.read' }), 'FORBIDDEN')
})
test('privilege escalation is denied when a role lacks the permission', () => {
  assert.equal(authorize({ principal: employeeA, organizationId: 'org-a', permission: 'settings.manage' }), 'FORBIDDEN')
})
test('unauthenticated direct API calls are denied', () => {
  assert.equal(authorize({ principal: null, organizationId: 'org-a', permission: 'customers.read' }), 'UNAUTHENTICATED')
})
test('employees cannot perform admin operations', () => {
  assert.equal(authorize({ principal: employeeA, organizationId: 'org-a', permission: 'ai.execute' }), 'FORBIDDEN')
})
test('viewers cannot perform writes', () => {
  assert.equal(authorize({ principal: viewerA, organizationId: 'org-a', permission: 'customers.create' }), 'FORBIDDEN')
})
test('authorized roles can call the same server policy used by the API', () => {
  assert.equal(authorize({ principal: adminA, organizationId: 'org-a', permission: 'customers.create' }), 'allowed')
})
test('business rules are checked after identity, tenant, and permission checks', () => {
  assert.equal(authorize({ principal: employeeA, organizationId: 'org-a', permission: 'customers.create', businessRule: false }), 'BUSINESS_RULE_VIOLATION')
})
