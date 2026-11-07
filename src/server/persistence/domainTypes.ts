export type UUID = string

export interface Organization { id: UUID; name: string; createdAt: Date; updatedAt: Date }
export interface User { id: UUID; email: string; displayName: string; createdAt: Date; updatedAt: Date }
export interface Customer { id: UUID; organizationId: UUID; name: string; email: string | null; phone: string | null; status: 'active' | 'inactive' | 'prospect'; createdAt: Date; updatedAt: Date }
export interface Deal { id: UUID; organizationId: UUID; customerId: UUID | null; leadId: UUID | null; name: string; amountMinor: number; currency: string; stage: 'lead' | 'qualified' | 'proposal' | 'won' | 'lost'; createdAt: Date; updatedAt: Date }
export interface Invoice { id: UUID; organizationId: UUID; customerId: UUID | null; number: string; status: 'draft' | 'sent' | 'paid' | 'void' | 'overdue'; currency: string; totalMinor: number; dueAt: Date | null; createdAt: Date; updatedAt: Date }
export interface Task { id: UUID; organizationId: UUID; projectId: UUID | null; assigneeId: UUID | null; title: string; status: 'todo' | 'in_progress' | 'done' | 'cancelled'; priority: 'low' | 'medium' | 'high' | 'urgent'; dueAt: Date | null; createdAt: Date; updatedAt: Date }

export interface TenantScopedRepository<T> {
  list(organizationId: UUID): Promise<readonly T[]>
  get(organizationId: UUID, id: UUID): Promise<T | null>
}
