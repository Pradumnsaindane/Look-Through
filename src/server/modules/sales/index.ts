import type { EntityRecord } from '../contracts'
export interface Deal extends EntityRecord { customerId: string; stage: string; amountMinor: number; currency: string }
export interface SalesService { listDeals(organizationId: string): Promise<Deal[]>; moveStage(id: string, stage: string, organizationId: string): Promise<Deal> }
export const salesModule = { name: 'sales' } as const
