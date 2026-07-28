import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'
import { createNotification, getUserNotifications } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const teacherId = BigInt(session.teacherId)

    const newSubmissions = await prisma.teacherAssignmentSubmission.findMany({
      where: {
        assignment: { teacherId },
        status: 'SUBMITTED',
      },
      include: {
        child: { select: { name: true } },
        assignment: { select: { topic: true, subject: true } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 20,
    })

    for (const sub of newSubmissions) {
      const href = `/teacher/assignments/${sub.teacherAssignmentId.toString()}/review`
      const exists = await prisma.notification.findFirst({
        where: {
          userId: session.teacherId,
          userRole: 'TEACHER',
          href,
          title: `${sub.child.name} submitted`,
          isRead: false,
        },
      })

      if (!exists) {
        await createNotification({
          userId: session.teacherId,
          userRole: 'TEACHER',
          title: `${sub.child.name} submitted`,
          body: `${sub.assignment.subject}: "${sub.assignment.topic}" is awaiting your review and feedback.`,
          href,
          priority: 'high',
          category: 'submission',
        })
      }
    }

    const dueSoon = await prisma.teacherAssignment.findMany({
      where: {
        teacherId,
        isPublished: true,
        dueDate: {
          gt: new Date(),
          lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        submissions: {
          some: { status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } },
        },
      },
      select: {
        id: true,
        topic: true,
        subject: true,
        dueDate: true,
      },
      take: 20,
    })

    for (const assignment of dueSoon) {
      const href = `/teacher/assignments/${assignment.id.toString()}/status`
      const exists = await prisma.notification.findFirst({
        where: {
          userId: session.teacherId,
          userRole: 'TEACHER',
          category: 'reminder',
          href,
          isRead: false,
        },
      })

      if (!exists) {
        await createNotification({
          userId: session.teacherId,
          userRole: 'TEACHER',
          title: 'Assignment due soon',
          body: `"${assignment.topic}" (${assignment.subject}) is due on ${new Date(assignment.dueDate).toLocaleDateString()}.`,
          href,
          priority: 'medium',
          category: 'reminder',
        })
      }
    }

    const rows = await getUserNotifications(session.teacherId, 'TEACHER')
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
    console.error('[teacher/notifications GET]', err)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}
