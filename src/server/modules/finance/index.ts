import type { EntityRecord } from '../contracts'
export interface Invoice extends EntityRecord { customerId: string; totalMinor: number; currency: string; status: string }
export interface FinanceService { listInvoices(organizationId: string): Promise<Invoice[]>; sendReminder(id: string, organizationId: string): Promise<void> }
export const financeModule = { name: 'finance', monetaryValuesUseMinorUnits: true } as const
