import { AppError } from '../../shared/errors/AppError'

export interface DatabaseClient {
  query<T>(sql: string, parameters?: readonly unknown[]): Promise<T[]>
  transaction<T>(operation: (client: DatabaseClient) => Promise<T>): Promise<T>
}

export function createDatabaseClient(databaseUrl?: string): DatabaseClient {
  if (!databaseUrl) {
    throw new AppError('DATABASE_NOT_CONFIGURED', 'DATABASE_URL is required before server persistence is enabled.', 503)
  }
  throw new AppError('DATABASE_ADAPTER_NOT_CONFIGURED', 'Configure a server-side database adapter before enabling persistence.', 501)
}
