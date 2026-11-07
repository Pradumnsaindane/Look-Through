import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.NEON_DATABASE_URL
  )
}

let poolInstance: Pool | null = null
let drizzleInstance: ReturnType<typeof drizzle> | null = null
const dbOverrides: Record<string, unknown> = {}

export function getPool(): Pool {
  if (!poolInstance) {
    const url = getDatabaseUrl()
    if (!url) {
      throw new Error('DATABASE_URL is required by the server database client.')
    }
    const isLocal = url.includes('localhost') || url.includes('127.0.0.1')
    poolInstance = new Pool({
      connectionString: url,
      max: 10,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
    })
  }
  return poolInstance
}

export function getDb(): ReturnType<typeof drizzle> {
  if (!drizzleInstance) {
    drizzleInstance = drizzle(getPool())
  }
  return drizzleInstance
}

export const pool = new Proxy({} as Pool, {
  get(_target, prop: string | symbol) {
    const p = getPool() as unknown as Record<string | symbol, unknown>
    const value = p[prop]
    if (typeof value === 'function') {
      return value.bind(p)
    }
    return value
  },
})

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop: string | symbol) {
    if (typeof prop === 'string' && prop in dbOverrides) {
      return dbOverrides[prop]
    }
    const instance = getDb() as unknown as Record<string | symbol, unknown>
    const value = instance[prop]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  },
  set(_target, prop: string | symbol, value: unknown) {
    if (typeof prop === 'string') {
      dbOverrides[prop] = value
    }
    return true
  },
})

export async function withTransaction<T>(
  operation: Parameters<ReturnType<typeof drizzle>['transaction']>[0]
): Promise<T> {
  return (await getDb().transaction(operation)) as T
}
