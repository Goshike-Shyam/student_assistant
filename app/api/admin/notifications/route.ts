import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getAdminSession } from '@/lib/admin-auth'
import { createNotification, getUserNotifications } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const adminId = session.adminId
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: since24h },
        role: { not: 'ADMIN' },
      },
    })

    if (newUsers > 0) {
      const exists = await prisma.notification.findFirst({
        where: {
          userId: adminId,
          userRole: 'ADMIN',
          href: '/admin/users',
          title: `${newUsers} new registration${newUsers !== 1 ? 's' : ''} today`,
          isRead: false,
        },
      })
      if (!exists) {
        await createNotification({
          userId: adminId,
          userRole: 'ADMIN',
          title: `${newUsers} new registration${newUsers !== 1 ? 's' : ''} today`,
          body: `${newUsers} account${newUsers !== 1 ? 's' : ''} registered in the last 24 hours.`,
          href: '/admin/users',
          priority: 'low',
          category: 'system',
        })
      }
    }

    const spendToday = await prisma.aiCreditLog.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      _sum: { costUsd: true },
    })

    const totalSpend = Number(spendToday._sum.costUsd ?? 0)
    if (totalSpend > 10) {
      const exists = await prisma.notification.findFirst({
        where: {
          userId: adminId,
          userRole: 'ADMIN',
          href: '/admin/credits',
          category: 'system',
          title: 'High AI credit spend detected',
          isRead: false,
        },
      })

      if (!exists) {
        await createNotification({
          userId: adminId,
          userRole: 'ADMIN',
          title: 'High AI credit spend detected',
          body: `AI credit usage today is ${totalSpend.toFixed(2)} USD.`,
          href: '/admin/credits',
          priority: totalSpend > 25 ? 'high' : 'medium',
          category: 'system',
        })
      }
    }

    const rows = await getUserNotifications(adminId, 'ADMIN')
    return NextResponse.json({
      notifications: rows.map((n) => ({
        id: n.id.toString(),
        title: n.title,
        body: n.body,
        href: n.href,
        priority: n.priority,
        category: n.category,
        timestamp: n.createdAt.toISOString(),
        isRead: n.isRead,
      })),
    })
  } catch (err) {
    console.error('[admin/notifications GET]', err)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}
