export * as auth from './authentication'
export * as organizations from './organizations'
export * as authorization from './authorization'
export * as customers from './customers'
export * as sales from './sales'
export * as finance from './finance'
export * as tasks from './tasks'
export * as activities from './activities'
export * as notifications from './notifications'
export * as ai from './ai'
export * as integrations from './integrations'
export * as audit from './audit'

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
