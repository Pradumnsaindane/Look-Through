import type { EntityRecord } from '../contracts'
export interface Organization extends EntityRecord { name: string }
export interface OrganizationService { get(id: string): Promise<Organization | null>; update(id: string, input: Pick<Organization, 'name'>): Promise<Organization> }
export const organizationsModule = { name: 'organizations' } as const
