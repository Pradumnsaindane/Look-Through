import type { ModuleContext } from '..'

export interface AuthenticatedPrincipal { userId: string; organizationId: string; roles: string[] }
export interface AuthenticationService { authenticate(request: Request): Promise<AuthenticatedPrincipal>; signOut(context: ModuleContext): Promise<void> }
export const authenticationModule = { name: 'authentication', requiresExternalProvider: true } as const
