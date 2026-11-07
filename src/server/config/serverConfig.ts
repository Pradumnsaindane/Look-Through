export type RuntimeEnvironment = 'development' | 'preview' | 'production'

export interface ServerConfig {
  environment: RuntimeEnvironment
  databaseUrl?: string
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export function loadServerConfig(env: Record<string, string | undefined>): ServerConfig {
  const environment = (env.NODE_ENV ?? 'development') as RuntimeEnvironment
  if (!['development', 'preview', 'production'].includes(environment)) {
    throw new Error(`Unsupported NODE_ENV: ${environment}`)
  }

  return {
    environment,
    databaseUrl: env.DATABASE_URL,
    logLevel: (env.LOG_LEVEL as ServerConfig['logLevel'] | undefined) ?? 'info',
  }
}
