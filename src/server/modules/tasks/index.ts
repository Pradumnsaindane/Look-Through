import type { EntityRecord } from '../contracts'
export interface Task extends EntityRecord { title: string; status: string; assigneeId?: string; dueAt?: string }
export interface TaskService { list(organizationId: string): Promise<Task[]>; complete(id: string, organizationId: string): Promise<Task> }
export const tasksModule = { name: 'tasks' } as const
