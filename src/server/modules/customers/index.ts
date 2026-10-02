import type { EntityRecord } from '../contracts'
export interface Customer extends EntityRecord { name: string; email?: string }
export interface CustomerService { list(organizationId: string): Promise<Customer[]>; get(id: string, organizationId: string): Promise<Customer | null> }
export { customerRepository } from './repository'
export { secureCustomerRepository } from './secureRepository'
export const customersModule = { name: 'customers' } as const
