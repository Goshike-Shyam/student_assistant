import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'

export const dynamic = 'force-dynamic'

/** GET /api/teacher/assignments/[id]/status — submission matrix */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { id } = await params
    const assignmentId = BigInt(id)
    const teacherId = BigInt(session.teacherId)

    const assignment = await prisma.teacherAssignment.findFirst({
      where: { id: assignmentId, teacherId },
    })
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    const submissions = await prisma.teacherAssignmentSubmission.findMany({
      where: { teacherAssignmentId: assignmentId },
      include: {
        child: { select: { id: true, name: true, email: true, parentEmail: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const now = new Date()
    const isOverdue = assignment.dueDate < now

    const students = submissions.map((s) => {
      let displayStatus = s.status
      if (s.status === 'NOT_STARTED' && isOverdue) displayStatus = 'OVERDUE'

      return {
        submissionId: s.id.toString(),
        childId: s.child.id,
        childName: s.child.name,
        parentEmail: s.child.parentEmail ?? s.child.email,
        status: displayStatus,
        score: s.score ? Number(s.score) : null,
        submittedAt: s.submittedAt,
        reviewedAt: s.teacherReviewedAt,
        releasedAt: s.teacherReleasedAt,
        reminderSentAt: s.reminderSentAt,
      }
    })

    const summary = {
      total: students.length,
      notStarted: students.filter((s) => s.status === 'NOT_STARTED').length,
      overdue: students.filter((s) => s.status === 'OVERDUE').length,
      inProgress: students.filter((s) => s.status === 'IN_PROGRESS').length,
      submitted: students.filter((s) => s.status === 'SUBMITTED').length,
      reviewed: students.filter((s) => s.status === 'REVIEWED').length,
      released: students.filter((s) => s.status === 'RELEASED').length,
      pendingReview: students.filter((s) => s.status === 'SUBMITTED').length,
    }

    return NextResponse.json({
      assignment: {
        id: assignment.id.toString(),
        topic: assignment.topic,
        subject: assignment.subject,
        dueDate: assignment.dueDate,
        totalMarks: assignment.totalMarks,
        isPublished: assignment.isPublished,
      },
      students,
      summary,
    })
  } catch (err: any) {
    console.error('[teacher/assignments/status GET]', err)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}
