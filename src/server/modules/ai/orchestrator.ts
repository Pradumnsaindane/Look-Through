import { tool, type ToolSet } from 'ai'
import { z } from 'zod'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '../../persistence/drizzle'
import { aiActions, aiRuns, auditLogs, customers, deals, invoices, tasks } from '../../persistence/schema'
import { authorize } from '../authorization'
import type { AuthenticatedPrincipal } from '../authentication'
import { AppError } from '../../../shared/errors/AppError'

export const permissionLevels = ['READ', 'SUGGEST', 'PREPARE', 'APPROVE', 'EXECUTE', 'AUTONOMOUS'] as const
export type PermissionLevel = (typeof permissionLevels)[number]

export interface OrchestratorContext {
  principal: AuthenticatedPrincipal
  organizationId: string
  runId: string
}

const readCustomer = z.object({ customerId: z.string().uuid() })
const dateRange = z.object({ from: z.string().datetime().optional(), to: z.string().datetime().optional() })
const taskInput = z.object({ title: z.string().trim().min(1).max(200), customerId: z.string().uuid().optional(), priority: z.enum(['low', 'medium', 'high']).default('medium'), dueAt: z.string().datetime().optional() })
const invoiceInput = z.object({ customerId: z.string().uuid(), amountMinor: z.number().int().positive(), currency: z.string().length(3).default('USD'), dueAt: z.string().datetime().optional() })
const messageInput = z.object({ customerId: z.string().uuid(), message: z.string().trim().min(1).max(4000) })

function requireAccess(context: OrchestratorContext, permission: Parameters<typeof authorize>[0]['permission']) {
  authorize({ principal: context.principal, organizationId: context.organizationId, permission })
}

async function recordAction(context: OrchestratorContext, toolName: string, permissionLevel: PermissionLevel, input: unknown, output: unknown, status = 'prepared') {
  const [action] = await db.insert(aiActions).values({ runId: context.runId, organizationId: context.organizationId, actorId: context.principal.userId, toolName, permissionLevel, status, input: input as Record<string, unknown>, output: output as Record<string, unknown> }).returning()
  await db.insert(auditLogs).values({ organizationId: context.organizationId, actorId: context.principal.userId, action: `ai.${toolName}.${status}`, entityType: 'ai_action', entityId: action.id, requestId: context.runId })
  return output
}

export function createBusinessTools(context: OrchestratorContext): ToolSet {
  return {
    get_business_summary: tool({ description: 'Read a grounded summary of business customers, deals, invoices, and tasks for the current organization.', inputSchema: dateRange, execute: async () => {
      requireAccess(context, 'analytics.read')
      const [customerCount, dealSummary, invoiceSummary, taskSummary] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(customers).where(eq(customers.organizationId, context.organizationId)),
        db.select({ count: sql<number>`count(*)`, amount: sql<number>`coalesce(sum(amount_minor), 0)` }).from(deals).where(eq(deals.organizationId, context.organizationId)),
        db.select({ count: sql<number>`count(*)`, amount: sql<number>`coalesce(sum(total_minor), 0)` }).from(invoices).where(eq(invoices.organizationId, context.organizationId)),
        db.select({ count: sql<number>`count(*)` }).from(tasks).where(eq(tasks.organizationId, context.organizationId)),
      ])
      return recordAction(context, 'get_business_summary', 'READ', {}, { grounded: true, source: 'organization aggregates', customers: customerCount[0]?.count ?? 0, deals: dealSummary[0] ?? {}, invoices: invoiceSummary[0] ?? {}, tasks: taskSummary[0]?.count ?? 0 }, 'completed')
    }, }),
    get_customer: tool({ description: 'Read one customer and only organization-scoped related records.', inputSchema: readCustomer, execute: async ({ customerId }) => {
      requireAccess(context, 'customers.read')
      const [customer] = await db.select().from(customers).where(and(eq(customers.organizationId, context.organizationId), eq(customers.id, customerId))).limit(1)
      if (!customer) throw new AppError('NOT_FOUND', 'Customer not found.', 404)
      const [relatedDeals, relatedInvoices] = await Promise.all([
        db.select().from(deals).where(and(eq(deals.organizationId, context.organizationId), eq(deals.customerId, customerId))).orderBy(desc(deals.updatedAt)),
        db.select().from(invoices).where(and(eq(invoices.organizationId, context.organizationId), eq(invoices.customerId, customerId))).orderBy(desc(invoices.updatedAt)),
      ])
      return recordAction(context, 'get_customer', 'READ', { customerId }, { grounded: true, customer, deals: relatedDeals, invoices: relatedInvoices }, 'completed')
    }, }),
    get_overdue_invoices: tool({ description: 'Read overdue invoices in the current organization.', inputSchema: z.object({ limit: z.number().int().min(1).max(100).default(25) }), execute: async ({ limit }) => { requireAccess(context, 'invoices.read'); const rows = await db.select().from(invoices).where(and(eq(invoices.organizationId, context.organizationId), eq(invoices.status, 'overdue'))).orderBy(asc(invoices.dueAt)).limit(limit); return recordAction(context, 'get_overdue_invoices', 'READ', { limit }, { grounded: true, invoices: rows }, 'completed') } }),
    get_sales_pipeline: tool({ description: 'Read current organization sales pipeline by deal stage.', inputSchema: z.object({}), execute: async () => { requireAccess(context, 'deals.read'); const rows = await db.select().from(deals).where(eq(deals.organizationId, context.organizationId)).orderBy(desc(deals.updatedAt)); return recordAction(context, 'get_sales_pipeline', 'READ', {}, { grounded: true, deals: rows }, 'completed') } }),
    get_expense_summary: tool({ description: 'Read expense summary from the organization expense ledger.', inputSchema: dateRange, execute: async ({ from, to }) => { requireAccess(context, 'expenses.read'); const rows = await db.execute(sql`select count(*)::int as count, coalesce(sum(amount_minor), 0)::bigint as total_minor from expenses where organization_id = ${context.organizationId} ${from ? sql`and created_at >= ${from}` : sql``} ${to ? sql`and created_at <= ${to}` : sql``}`); return recordAction(context, 'get_expense_summary', 'READ', { from, to }, { grounded: true, summary: rows.rows[0] ?? { count: 0, total_minor: 0 } }, 'completed') } }),
    get_tasks: tool({ description: 'Read tasks for the current organization.', inputSchema: z.object({ status: z.string().optional(), limit: z.number().int().min(1).max(100).default(50) }), execute: async ({ status, limit }) => { requireAccess(context, 'tasks.read'); const rows = await db.execute(sql`select * from tasks where organization_id = ${context.organizationId} ${status ? sql`and status = ${status}` : sql``} order by due_at asc nulls last limit ${limit}`); return recordAction(context, 'get_tasks', 'READ', { status, limit }, { grounded: true, tasks: rows.rows }, 'completed') } }),
    get_recent_activity: tool({ description: 'Read recent audit activity for the current organization.', inputSchema: z.object({ limit: z.number().int().min(1).max(100).default(25) }), execute: async ({ limit }) => { requireAccess(context, 'analytics.read'); const rows = await db.select().from(auditLogs).where(eq(auditLogs.organizationId, context.organizationId)).orderBy(desc(auditLogs.createdAt)).limit(limit); return recordAction(context, 'get_recent_activity', 'READ', { limit }, { grounded: true, activity: rows }, 'completed') } }),
    create_task: tool({ description: 'Prepare a task creation. This never writes the task until separately approved and executed.', inputSchema: taskInput, execute: async (input) => { requireAccess(context, 'tasks.create'); return recordAction(context, 'create_task', 'PREPARE', input, { grounded: true, action: 'create_task', input, requiresApproval: true }) } }),
    prepare_invoice: tool({ description: 'Prepare an invoice draft. This never sends or posts an invoice.', inputSchema: invoiceInput, execute: async (input) => { requireAccess(context, 'invoices.create'); return recordAction(context, 'prepare_invoice', 'PREPARE', input, { grounded: true, action: 'prepare_invoice', input, requiresApproval: true }) } }),
    prepare_customer_message: tool({ description: 'Prepare a customer message for human review. This never sends a message.', inputSchema: messageInput, execute: async (input) => { requireAccess(context, 'customers.read'); return recordAction(context, 'prepare_customer_message', 'PREPARE', input, { grounded: true, action: 'prepare_customer_message', input, requiresApproval: true }) } }),
  }
}

export async function createAiRun(context: Omit<OrchestratorContext, 'runId'>, prompt: string, requestedMode: PermissionLevel = 'READ') {
  if (!permissionLevels.includes(requestedMode)) throw new AppError('VALIDATION_ERROR', 'Invalid AI permission level.', 400)
  authorize({ principal: context.principal, organizationId: context.organizationId, permission: 'ai.read' })
  const [run] = await db.insert(aiRuns).values({ organizationId: context.organizationId, actorId: context.principal.userId, requestedMode, prompt, status: 'started' }).returning()
  return { ...context, runId: run.id }
}
