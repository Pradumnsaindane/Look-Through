import type { EntityRecord } from '../contracts.js'
export interface Customer extends EntityRecord { name: string; email?: string }
export interface CustomerService { list(organizationId: string): Promise<Customer[]>; get(id: string, organizationId: string): Promise<Customer | null> }
export { customerRepository } from './repository.js'
export { secureCustomerRepository } from './secureRepository.js'
export const customersModule = { name: 'customers' } as const
