import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'

export async function GET() {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const teacherId = BigInt(session.teacherId)

    // Count pending reviews (SUBMITTED but not yet REVIEWED)
    const pendingReviews = await prisma.teacherAssignmentSubmission.count({
      where: {
        assignment: { teacherId },
        status: 'SUBMITTED',
      },
    })

    // Recent submissions in last 24 hours
    const recentSubmissions = await prisma.teacherAssignmentSubmission.findMany({
      where: {
        assignment: { teacherId },
        status: 'SUBMITTED',
        submittedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      include: {
        child:      { select: { name: true } },
        assignment: { select: { topic: true, subject: true, id: true } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      pendingReviews,
      recentSubmissions: recentSubmissions.map((s) => ({
        id:                    s.id.toString(),
        teacherAssignmentId:   s.teacherAssignmentId.toString(),
        childName:             s.child.name,
        topic:                 s.assignment.topic,
        subject:               s.assignment.subject,
        submittedAt:           s.submittedAt,
      })),
      total: pendingReviews,
    })
  } catch (err) {
    console.error('[teacher/notifications GET]', err)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}
