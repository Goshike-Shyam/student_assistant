/**
 * CLASS ASSIGNMENTS API CONTRACT
 * All id fields returned as strings — BigInt replacer prevents serialisation crash.
 * childId: UUID string from User.id (matches TeacherAssignmentSubmission.childId VarChar(36))
 * Returns [] on no results — never returns 404 to student so UI shows empty state.
 * ai_feedback_json is NEVER returned to the student.
 * Student only sees teacher_feedback_json when status = RELEASED.
 * export const dynamic = 'force-dynamic' — no caching
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

/** GET /api/student/teacher-assignments — fetch class assignments for student */
export async function GET(request: NextRequest) {
  // Student auth uses localStorage — userId passed as query param or header
  const childId =
    request.nextUrl.searchParams.get('userId') ||
    request.headers.get('x-user-id')
  if (!childId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (process.env.NODE_ENV !== 'production') {
    console.info('[student/teacher-assignments GET] hit', {
      pathname: request.nextUrl.pathname,
      search: request.nextUrl.search,
      hasUserIdQuery: Boolean(request.nextUrl.searchParams.get('userId')),
      hasUserIdHeader: Boolean(request.headers.get('x-user-id')),
    })
  }

  try {
    const submissions = await prisma.teacherAssignmentSubmission.findMany({
      where: { childId },
      include: {
        assignment: {
          include: {
            teacher: { select: { name: true, schoolName: true } },
            class: { select: { className: true, grade: true, board: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const now = new Date()

    const payload = submissions.map((s) => {
      const isReleased = s.status === 'RELEASED'
      const isOverdue = s.status === 'NOT_STARTED' && s.assignment.dueDate < now

      return {
        // All ID fields explicitly serialised as strings — prevents BigInt crash
        submissionId: s.id.toString(),
        assignmentId: s.assignment.id.toString(),
        subject: s.assignment.subject,
        topic: s.assignment.topic,
        teacherName: s.assignment.teacher.name,
        schoolName: s.assignment.teacher.schoolName,
        className: s.assignment.class.className,
        dueDate: s.assignment.dueDate,
        status: isOverdue ? 'OVERDUE' : s.status,
        score: isReleased && s.score !== null ? Number(s.score) : null,
        totalMarks: s.assignment.totalMarks,
        submittedAt: s.submittedAt,
        // Questions only shown when NOT_STARTED or IN_PROGRESS
        questions:
          !isReleased && s.status !== 'SUBMITTED' && s.status !== 'REVIEWED'
            ? (s.assignment.questionsJson as any[])?.map((q: any) => {
                const { correct_answer, brief_explanation, ...rest } = q
                return rest
              }) ?? null
            : null,
        // Student answers shown when submitted or beyond
        answersJson:
          ['SUBMITTED', 'REVIEWED', 'RELEASED'].includes(s.status) ? s.answersJson : null,
        // Teacher feedback ONLY when released
        feedback: isReleased ? s.teacherFeedbackJson : null,
      }
    })

    // Use custom BigInt replacer to prevent "Do not know how to serialize a BigInt" crash
    return new Response(
      JSON.stringify(payload, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[student/teacher-assignments GET] failed', {
        message: err instanceof Error ? err.message : String(err),
      })
    }
    console.error('[student/teacher-assignments GET]', err)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}
