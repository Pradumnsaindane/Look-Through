export type AppEnvironment = 'development' | 'preview' | 'production'

const environment = (import.meta.env.MODE ?? 'development') as AppEnvironment

export const appConfig = {
  environment,
  isDevelopment: environment === 'development',
  isPreview: environment === 'preview',
  isProduction: environment === 'production',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  appVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
} as const

export function requireClientEnvironment(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (!value) throw new Error(`Missing required client environment variable: ${name}`)
  return value
}

export function getEnvironmentSummary() {
  return {
    environment: appConfig.environment,
    apiBaseUrl: appConfig.apiBaseUrl,
    appVersion: appConfig.appVersion,
  }
}
