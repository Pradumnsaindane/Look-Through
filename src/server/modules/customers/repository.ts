import { and, asc, eq } from 'drizzle-orm'
import { db } from '../../persistence/drizzle'
import { customers, type CustomerRow } from '../../persistence/schema'

export interface CustomerRepository {
  list(organizationId: string): Promise<CustomerRow[]>
  get(organizationId: string, id: string): Promise<CustomerRow | null>
}

export const customerRepository: CustomerRepository = {
  async list(organizationId) {
    return db.select().from(customers).where(eq(customers.organizationId, organizationId)).orderBy(asc(customers.name))
  },
  async get(organizationId, id) {
    const [customer] = await db.select().from(customers).where(and(eq(customers.organizationId, organizationId), eq(customers.id, id))).limit(1)
    return customer ?? null
  },
}
