import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { createNotification, getUserNotifications } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const childId = request.nextUrl.searchParams.get('userId') || request.headers.get('x-user-id')
  if (!childId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const pending = await prisma.teacherAssignmentSubmission.findMany({
      where: {
        childId,
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
        assignment: {
          dueDate: {
            gt: new Date(),
            lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        assignment: {
          select: { topic: true, subject: true, dueDate: true },
        },
      },
      take: 5,
      orderBy: { assignment: { dueDate: 'asc' } },
    })

    for (const sub of pending) {
      const href = `/assignments?tab=class&open=${sub.id.toString()}`
      const exists = await prisma.notification.findFirst({
        where: {
          userId: childId,
          userRole: 'STUDENT',
          href,
          isRead: false,
        },
      })

      if (!exists) {
        await createNotification({
          userId: childId,
          userRole: 'STUDENT',
          title: 'Assignment due soon',
          body: `${sub.assignment.subject}: "${sub.assignment.topic}" is due on ${new Date(sub.assignment.dueDate).toLocaleDateString()}`,
          href,
          priority: 'high',
          category: 'assignment',
        })
      }
    }

    const rows = await getUserNotifications(childId, 'STUDENT')
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
    console.error('[student/notifications GET]', err)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}
