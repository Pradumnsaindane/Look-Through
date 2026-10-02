export const roles = ['Owner', 'Admin', 'Manager', 'Employee', 'Viewer'] as const
export type Role = (typeof roles)[number]

export const permissions = [
  'customers.read', 'customers.create', 'customers.update', 'customers.delete',
  'leads.read', 'leads.create', 'leads.update', 'leads.delete',
  'deals.read', 'deals.create', 'deals.update', 'deals.delete',
  'invoices.read', 'invoices.create', 'invoices.update', 'invoices.delete',
  'expenses.read', 'expenses.create', 'expenses.update', 'expenses.approve',
  'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
  'analytics.read', 'ai.read', 'ai.execute', 'settings.manage',
] as const
export type PermissionKey = (typeof permissions)[number]

const read = (resource: string) => `${resource}.read` as PermissionKey
const write = (resource: string) => [`${resource}.create`, `${resource}.update`] as PermissionKey[]

export const rolePermissions: Record<Role, readonly PermissionKey[]> = {
  Owner: permissions,
  Admin: permissions.filter((permission) => permission !== 'settings.manage'),
  Manager: [...['customers.read', 'customers.create', 'customers.update', 'leads.read', 'leads.create', 'leads.update', 'deals.read', 'deals.create', 'deals.update', 'invoices.read', 'invoices.create', 'invoices.update', 'expenses.read', 'expenses.update', 'expenses.approve', 'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete', 'analytics.read', 'ai.read', 'ai.execute'] as PermissionKey[]],
  Employee: [read('customers'), ...write('customers'), read('leads'), ...write('leads'), read('deals'), ...write('deals'), read('invoices'), ...write('invoices'), read('expenses'), 'expenses.update', read('tasks'), ...write('tasks'), 'analytics.read', 'ai.read'] as PermissionKey[],
  Viewer: ['customers.read', 'leads.read', 'deals.read', 'invoices.read', 'expenses.read', 'tasks.read', 'analytics.read', 'ai.read'],
}

export function hasPermission(userRoles: readonly string[], permission: PermissionKey): boolean {
  return userRoles.some((role) => roles.includes(role as Role) && rolePermissions[role as Role].includes(permission))
}

export function hasResourceScope(expectedOrganizationId: string, requestedOrganizationId: string): boolean {
  return Boolean(expectedOrganizationId && requestedOrganizationId && expectedOrganizationId === requestedOrganizationId)
}

export function isBusinessRuleSatisfied(condition: boolean): boolean {
  return condition === true
}

export const authorizationPolicy = { roles, permissions, rolePermissions } as const

// Keep these aliases explicit so policy review is easy and resource names cannot be interpolated from requests.
export const resourceWritePermissions = { customers: write('customers'), leads: write('leads'), deals: write('deals'), invoices: write('invoices'), tasks: write('tasks') } as const
export const resourceReadPermissions = { customers: read('customers'), leads: read('leads'), deals: read('deals'), invoices: read('invoices'), expenses: read('expenses'), tasks: read('tasks') } as const
