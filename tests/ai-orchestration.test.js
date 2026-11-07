import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../src/server/modules/ai/orchestrator.ts', import.meta.url), 'utf8')
const migration = fs.readFileSync(new URL('../migrations/0003_ai_orchestration.sql', import.meta.url), 'utf8')

test('AI tools are explicit and bounded to approved domain operations', () => {
  for (const toolName of ['get_business_summary', 'get_customer', 'get_overdue_invoices', 'get_sales_pipeline', 'get_expense_summary', 'get_tasks', 'get_recent_activity', 'create_task', 'prepare_invoice', 'prepare_customer_message']) {
    assert.match(source, new RegExp(`${toolName}: tool`))
  }
  assert.doesNotMatch(source, /db\.query\s*\(/)
})

test('write-oriented tools are prepare-only and approval is persisted', () => {
  assert.match(source, /'PREPARE'/)
  assert.match(source, /requiresApproval: true/)
  assert.match(migration, /create table if not exists ai_actions/)
  assert.match(migration, /approval_required boolean not null default true/)
})

test('AI persistence is organization scoped and auditable', () => {
  assert.match(migration, /organization_id uuid not null references organizations\(id\)/)
  assert.match(source, /auditLogs/)
  assert.match(source, /organizationId: context\.organizationId/)
})
