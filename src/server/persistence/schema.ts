import { bigint, boolean, char, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  ...timestamps,
})

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id'),
  name: text('name').notNull(),
  ...timestamps,
})

export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull(),
  description: text('description').notNull().default(''),
  ...timestamps,
})

export const memberships = pgTable('memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  userId: uuid('user_id').notNull(),
  roleId: uuid('role_id'),
  ...timestamps,
})

export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid('role_id').notNull(),
  permissionId: uuid('permission_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  ...timestamps,
})

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  status: text('status').notNull().default('active'),
  ...timestamps,
})

export const deals = pgTable('deals', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  customerId: uuid('customer_id'),
  leadId: uuid('lead_id'),
  name: text('name').notNull(),
  amountMinor: bigint('amount_minor', { mode: 'number' }).notNull().default(0),
  currency: char('currency', { length: 3 }).notNull().default('USD'),
  stage: text('stage').notNull().default('lead'),
  ...timestamps,
})

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  customerId: uuid('customer_id'),
  number: text('number').notNull(),
  status: text('status').notNull().default('draft'),
  currency: char('currency', { length: 3 }).notNull().default('USD'),
  totalMinor: bigint('total_minor', { mode: 'number' }).notNull().default(0),
  dueAt: timestamp('due_at', { withTimezone: true }),
  ...timestamps,
})

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  projectId: uuid('project_id'),
  assigneeId: uuid('assignee_id'),
  title: text('title').notNull(),
  status: text('status').notNull().default('todo'),
  priority: text('priority').notNull().default('medium'),
  dueAt: timestamp('due_at', { withTimezone: true }),
  ...timestamps,
})

export const aiRuns = pgTable('ai_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  conversationId: uuid('conversation_id'),
  actorId: uuid('actor_id'),
  requestedMode: text('requested_mode'),
  prompt: text('prompt'),
  model: text('model').notNull(),
  input: jsonb('input').notNull().default({}),
  output: jsonb('output'),
  groundedSources: jsonb('grounded_sources'),
  status: text('status').notNull().default('queued'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

export const aiActions = pgTable('ai_actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  runId: uuid('run_id'),
  organizationId: uuid('organization_id').notNull(),
  actorId: uuid('actor_id'),
  createdBy: uuid('created_by'),
  toolName: text('tool_name'),
  actionType: text('action_type').notNull(),
  permissionLevel: text('permission_level'),
  status: text('status').notNull().default('proposed'),
  input: jsonb('input'),
  payload: jsonb('payload').notNull().default({}),
  output: jsonb('output'),
  approvalRequired: boolean('approval_required'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  executedAt: timestamp('executed_at', { withTimezone: true }),
  idempotencyKey: text('idempotency_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  actorId: uuid('actor_id'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id'),
  aiRunId: uuid('ai_run_id'),
  aiActionId: uuid('ai_action_id'),
  beforeData: jsonb('before_data'),
  afterData: jsonb('after_data'),
  requestId: text('request_id').notNull(),
  ...timestamps,
})

export type CustomerRow = typeof customers.$inferSelect
export type NewCustomerRow = typeof customers.$inferInsert
export type DealRow = typeof deals.$inferSelect
export type InvoiceRow = typeof invoices.$inferSelect
export type TaskRow = typeof tasks.$inferSelect
