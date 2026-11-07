import { AppError } from '../../../shared/errors/AppError'
import type { AuthenticatedPrincipal } from '../authentication'
import { hasPermission, hasResourceScope, isBusinessRuleSatisfied, type PermissionKey } from './policy'

export interface AuthorizationRequest {
  principal?: AuthenticatedPrincipal | null
  organizationId: string
  permission: PermissionKey
  businessRule?: boolean
}

export function authorize(request: AuthorizationRequest): AuthenticatedPrincipal {
  const principal = request.principal
  if (!principal?.userId) throw new AppError('UNAUTHENTICATED', 'Authentication is required.', 401)
  if (!hasResourceScope(principal.organizationId, request.organizationId)) throw new AppError('FORBIDDEN', 'Organization access is not permitted.', 403)
  if (!hasPermission(principal.roles, request.permission)) throw new AppError('FORBIDDEN', 'You do not have permission for this operation.', 403)
  if (request.businessRule !== undefined && !isBusinessRuleSatisfied(request.businessRule)) throw new AppError('BUSINESS_RULE_VIOLATION', 'This operation is not allowed by current business rules.', 422)
  return principal
}

export function assertResourceOwnership(principal: AuthenticatedPrincipal, resourceOrganizationId: string): void {
  if (!hasResourceScope(principal.organizationId, resourceOrganizationId)) throw new AppError('FORBIDDEN', 'Resource access is not permitted.', 403)
}
