import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required by the server database client.')
}

export const pool = new Pool({ connectionString: databaseUrl, max: 10 })
export const db = drizzle(pool)

export async function withTransaction<T>(operation: Parameters<typeof db.transaction<T>>[0]): Promise<T> {
  return db.transaction(operation)
}
