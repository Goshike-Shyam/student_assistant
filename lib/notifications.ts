import { prisma } from '@/lib/prismaClient'

export type NotificationUserRole = 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'
export type NotifPriority = 'high' | 'medium' | 'low'
export type NotifCategory =
  | 'assignment'
  | 'feedback'
  | 'reminder'
  | 'submission'
  | 'payment'
  | 'report'
  | 'system'
  | 'progress'

interface CreateNotifParams {
  userId: string
  userRole: NotificationUserRole
  title: string
  body: string
  href?: string
  priority?: NotifPriority
  category?: NotifCategory
}

export async function createNotification(p: CreateNotifParams) {
  return prisma.notification.create({
    data: {
      userId: p.userId,
      userRole: p.userRole,
      title: p.title,
      body: p.body,
      href: p.href ?? null,
      priority: p.priority ?? 'medium',
      category: p.category ?? 'system',
      isRead: false,
    },
  })
}

export async function createBulkNotifications(items: CreateNotifParams[]) {
  if (items.length === 0) return { count: 0 }

  return prisma.notification.createMany({
    data: items.map((p) => ({
      userId: p.userId,
      userRole: p.userRole,
      title: p.title,
      body: p.body,
      href: p.href ?? null,
      priority: p.priority ?? 'medium',
      category: p.category ?? 'system',
      isRead: false,
    })),
  })
}

export async function getUserNotifications(userId: string, userRole: NotificationUserRole) {
  return prisma.notification.findMany({
    where: { userId, userRole },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
}
