export interface EntityRecord {
  id: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface ModuleHealth {
  name: string
  configured: boolean
  reason?: string
}

export function unconfiguredModule(name: string, reason: string): ModuleHealth {
  return { name, configured: false, reason }
}
