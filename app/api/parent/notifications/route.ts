import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { createNotification, getUserNotifications } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const parentId = request.nextUrl.searchParams.get('userId') || request.headers.get('x-user-id')
  if (!parentId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      select: { id: true, email: true },
    })
    if (!parent) return NextResponse.json({ notifications: [] })

    const releasedFeedback = await prisma.teacherAssignmentSubmission.findMany({
      where: {
        child: { parentEmail: parent.email },
        status: 'RELEASED',
        teacherReleasedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        child: { select: { id: true, name: true } },
        assignment: { select: { topic: true, subject: true } },
      },
      orderBy: { teacherReleasedAt: 'desc' },
      take: 10,
    })

    for (const item of releasedFeedback) {
      const href = `/parent/children/${item.child.id}/assignments`
      const exists = await prisma.notification.findFirst({
        where: {
          userId: parentId,
          userRole: 'PARENT',
          href,
          title: `Feedback ready for ${item.child.name}`,
          isRead: false,
        },
      })

      if (!exists) {
        await createNotification({
          userId: parentId,
          userRole: 'PARENT',
          title: `Feedback ready for ${item.child.name}`,
          body: `Teacher released feedback for "${item.assignment.topic}" (${item.assignment.subject})`,
          href,
          priority: 'medium',
          category: 'feedback',
        })
      }
    }

    const monthlyReports = await prisma.parentReport.findMany({
      where: {
        parentId,
        weekEndDate: {
          gte: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { weekEndDate: 'desc' },
      take: 1,
    })

    if (monthlyReports.length > 0) {
      const report = monthlyReports[0]
      const reportHref = report.reportUrl ?? '/parent/reports/assignments'
      const reportExists = await prisma.notification.findFirst({
        where: {
          userId: parentId,
          userRole: 'PARENT',
          href: reportHref,
          category: 'report',
          isRead: false,
        },
      })

      if (!reportExists) {
        await createNotification({
          userId: parentId,
          userRole: 'PARENT',
          title: 'Progress report ready',
          body: `A new progress report is ready for week ending ${new Date(report.weekEndDate).toLocaleDateString()}.`,
          href: reportHref,
          priority: 'low',
          category: 'report',
        })
      }
    }

    const pendingOld = await prisma.teacherAssignmentSubmission.findMany({
      where: {
        child: { parentEmail: parent.email },
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
        createdAt: {
          lte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        child: { select: { id: true, name: true } },
        assignment: { select: { topic: true, subject: true } },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    })

    for (const pending of pendingOld) {
      const href = `/parent/children/${pending.child.id}/assignments`
      const exists = await prisma.notification.findFirst({
        where: {
          userId: parentId,
          userRole: 'PARENT',
          href,
          title: `Pending work for ${pending.child.name}`,
          isRead: false,
        },
      })

      if (!exists) {
        await createNotification({
          userId: parentId,
          userRole: 'PARENT',
          title: `Pending work for ${pending.child.name}`,
          body: `${pending.assignment.subject}: "${pending.assignment.topic}" has been pending for over 3 days.`,
          href,
          priority: 'high',
          category: 'assignment',
        })
      }
    }

    const rows = await getUserNotifications(parentId, 'PARENT')
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
    console.error('[parent/notifications GET]', err)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}
