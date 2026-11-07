import type { EntityRecord } from '../contracts'
export interface IntegrationConnection extends EntityRecord { provider: string; status: 'connected' | 'disconnected' | 'error'; lastSyncAt?: string }
export interface IntegrationService { list(organizationId: string): Promise<IntegrationConnection[]>; startConnect(provider: string, organizationId: string): Promise<{ authorizationUrl: string }> }
export const integrationsModule = { name: 'integrations', credentialsManagedByProvider: true } as const
