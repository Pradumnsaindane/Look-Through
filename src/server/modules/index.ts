export * as auth from './authentication/index.js'
export * as organizations from './organizations/index.js'
export * as authorization from './authorization/index.js'
export * as customers from './customers/index.js'
export * as sales from './sales/index.js'
export * as finance from './finance/index.js'
export * as tasks from './tasks/index.js'
export * as activities from './activities/index.js'
export * as notifications from './notifications/index.js'
export * as ai from './ai/index.js'
export * as integrations from './integrations/index.js'
export * as audit from './audit/index.js'

export interface ModuleContext {
  requestId: string
  organizationId: string
  actorId: string
}

export interface Repository<TEntity, TCreate, TUpdate = Partial<TCreate>> {
  findById(id: string, context: ModuleContext): Promise<TEntity | null>
  list(context: ModuleContext): Promise<TEntity[]>
  create(input: TCreate, context: ModuleContext): Promise<TEntity>
  update(id: string, input: TUpdate, context: ModuleContext): Promise<TEntity>
}
