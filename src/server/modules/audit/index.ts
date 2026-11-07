import type { EntityRecord } from '../contracts'
export interface AuditEvent extends EntityRecord { actorId?: string; action: string; entityType: string; entityId: string; requestId: string; before?: unknown; after?: unknown }
export interface AuditService { record(event: Omit<AuditEvent, keyof EntityRecord>): Promise<void>; list(organizationId: string): Promise<AuditEvent[]> }
export const auditModule = { name: 'audit', immutable: true } as const
