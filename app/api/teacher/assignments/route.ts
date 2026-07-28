import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'

/** GET /api/teacher/assignments — list all assignments for teacher */
export async function GET() {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const teacherId = BigInt(session.teacherId)

  const assignments = await prisma.teacherAssignment.findMany({
    where: { teacherId },
    include: {
      class: { select: { className: true, grade: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get submission counts by status
  const assignmentIds = assignments.map((a) => a.id)
  const statusCounts =
    assignmentIds.length > 0
      ? await prisma.teacherAssignmentSubmission.groupBy({
          by: ['teacherAssignmentId', 'status'],
          where: {
            teacherAssignmentId: { in: assignmentIds },
          },
          _count: { id: true },
        })
      : []

  // Build per-assignment maps: submittedCount, reviewedCount, releasedCount
  const submittedMap = new Map<string, number>()
  const reviewedMap  = new Map<string, number>()
  const releasedMap  = new Map<string, number>()
  for (const s of statusCounts) {
    const key = s.teacherAssignmentId.toString()
    if (s.status === 'SUBMITTED')  submittedMap.set(key, (submittedMap.get(key) ?? 0) + s._count.id)
    if (s.status === 'REVIEWED')   reviewedMap.set(key,  (reviewedMap.get(key)  ?? 0) + s._count.id)
    if (s.status === 'RELEASED')   releasedMap.set(key,  (releasedMap.get(key)  ?? 0) + s._count.id)
  }

  const now = new Date()
  return NextResponse.json(
    assignments.map((a) => ({
      id: a.id.toString(),
      subject: a.subject,
      topic: a.topic,
      complexity: a.complexity,
      dueDate: a.dueDate,
      isPublished: a.isPublished,
      isPast: a.dueDate < now,
      className: a.class.className,
      grade: a.class.grade,
      totalStudents: a._count.submissions,
      submittedCount: submittedMap.get(a.id.toString()) ?? 0,
      reviewedCount:  reviewedMap.get(a.id.toString())  ?? 0,
      releasedCount:  releasedMap.get(a.id.toString())  ?? 0,
      createdAt: a.createdAt,
    })),
  )
}
