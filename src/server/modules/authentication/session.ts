import { eq } from 'drizzle-orm'
import { db } from '../../persistence/drizzle'
import { memberships, permissions, rolePermissions, roles } from '../../persistence/schema'

export type ProtectedRequest = {
  headers?: Record<string, string | string[] | undefined>
}

export type OrganizationContext = {
  userId: string
  organizationId: string
  roles: string[]
  permissions: string[]
}

export class AuthError extends Error {
  readonly status: 400 | 401 | 403 | 404 | 500
  readonly code: string

  constructor(status: 400 | 401 | 403 | 404 | 500, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

const header = (request: ProtectedRequest, name: string) => {
  const value = request.headers?.[name] ?? request.headers?.[name.toLowerCase()]
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

const cookieHeader = (request: ProtectedRequest) => header(request, 'cookie')

async function fetchVerifiedSession(request: ProtectedRequest) {
  const baseUrl = process.env.NEON_AUTH_BASE_URL
  if (!baseUrl) throw new AuthError(500, 'AUTH_NOT_CONFIGURED', 'Authentication is not configured.')
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/auth/get-session`, {
    headers: { cookie: cookieHeader(request), origin: process.env.VITE_NEON_AUTH_URL || baseUrl },
    cache: 'no-store',
  })
  if (!response.ok) return null
  const payload = await response.json() as { user?: { id?: string }; session?: { userId?: string; activeOrganizationId?: string } }
  if (!payload.user?.id) return null
  return payload
}

export async function requireOrganizationContext(request: ProtectedRequest): Promise<OrganizationContext> {
  const session = await fetchVerifiedSession(request)
  const userId = session?.user?.id
  if (!userId) throw new AuthError(401, 'UNAUTHENTICATED', 'Sign in to continue.')

  const memberRows = await db.select({ organizationId: memberships.organizationId, roleId: memberships.roleId, roleName: roles.name })
    .from(memberships)
    .leftJoin(roles, eq(memberships.roleId, roles.id))
    .where(eq(memberships.userId, userId))
  if (!memberRows.length) throw new AuthError(403, 'NO_ORGANIZATION_ACCESS', 'You are not a member of an organization.')

  const requestedActiveOrg = session.session?.activeOrganizationId
  const membership = requestedActiveOrg
    ? memberRows.find((row) => row.organizationId === requestedActiveOrg)
    : memberRows.length === 1 ? memberRows[0] : undefined
  if (!membership) throw new AuthError(403, 'ACTIVE_ORGANIZATION_REQUIRED', 'Choose an active organization in your authenticated session.')

  const permissionRows = membership.roleId
    ? await db.select({ key: permissions.key }).from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, membership.roleId))
    : []
  return {
    userId,
    organizationId: membership.organizationId,
    roles: membership.roleName ? [membership.roleName] : [],
    permissions: permissionRows.map((row) => row.key),
  }
}

export function requirePermission(context: OrganizationContext, permission: string) {
  if (!context.permissions.includes(permission)) throw new AuthError(403, 'FORBIDDEN', 'You do not have permission for this operation.')
}

export function authFailure(res: { status: (code: number) => { json: (body: unknown) => unknown } }, error: unknown) {
  if (error instanceof AuthError) return res.status(error.status).json({ ok: false, error: { code: error.code, message: error.message } })
  console.error('[auth] request failed', error)
  return res.status(500).json({ ok: false, error: { code: 'AUTHORIZATION_FAILED', message: 'The request could not be authorized.' } })
}
