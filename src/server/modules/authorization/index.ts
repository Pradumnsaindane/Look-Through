import { AppError } from '../../../shared/errors/AppError'
export * from './policy'
export * from './guard'
export type Permission = 'read' | 'write' | 'approve' | 'admin'
export interface AuthorizationService { can(subjectId: string, organizationId: string, permission: Permission, resource?: string): Promise<boolean> }
export function assertPermission(allowed: boolean, permission: Permission): void { if (!allowed) throw new AppError('FORBIDDEN', `Permission required: ${permission}`, 403) }
export const authorizationModule = { name: 'authorization' } as const
