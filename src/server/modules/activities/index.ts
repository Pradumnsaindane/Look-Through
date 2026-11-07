import type { EntityRecord } from '../contracts'
export interface Activity extends EntityRecord { actorId?: string; type: string; summary: string; entityType?: string; entityId?: string }
export interface ActivityService { list(organizationId: string, limit?: number): Promise<Activity[]> }
export const activitiesModule = { name: 'activities' } as const
