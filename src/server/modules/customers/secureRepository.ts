import { and, asc, eq } from 'drizzle-orm'
import { db } from '../../persistence/drizzle'
import { customers, type CustomerRow } from '../../persistence/schema'
import { authorize, assertResourceOwnership } from '../authorization'
import type { AuthenticatedPrincipal } from '../authentication'

export const secureCustomerRepository = {
  async list(principal: AuthenticatedPrincipal, organizationId: string): Promise<CustomerRow[]> {
    authorize({ principal, organizationId, permission: 'customers.read' })
    return db.select().from(customers).where(eq(customers.organizationId, organizationId)).orderBy(asc(customers.name))
  },
  async get(principal: AuthenticatedPrincipal, organizationId: string, id: string): Promise<CustomerRow | null> {
    authorize({ principal, organizationId, permission: 'customers.read' })
    const [customer] = await db.select().from(customers).where(and(eq(customers.organizationId, organizationId), eq(customers.id, id))).limit(1)
    if (customer) assertResourceOwnership(principal, customer.organizationId)
    return customer ?? null
  },
}
