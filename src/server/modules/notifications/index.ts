import type { EntityRecord } from '../contracts'
export interface Notification extends EntityRecord { userId: string; title: string; body: string; readAt?: string }
export interface NotificationService { list(userId: string, organizationId: string): Promise<Notification[]>; markRead(id: string, userId: string): Promise<void> }
export const notificationsModule = { name: 'notifications' } as const
