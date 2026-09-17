import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getSubjectLabel } from '@/lib/subjects/config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const childId =
    request.nextUrl.searchParams.get('userId') ||
    request.headers.get('x-user-id')

  if (!childId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const submissions = await prisma.teacherAssignmentSubmission.findMany({
      where: { childId },
      include: {
        assignment: {
          include: {
            teacher: { select: { name: true } },
            class: { select: { className: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const now = new Date()

    const assignments = submissions.map((s) => {
      const isSubmitted = ['SUBMITTED', 'REVIEWED', 'RELEASED'].includes(s.status)
      const isOverdue = !isSubmitted && s.assignment.dueDate < now

      return {
        id: s.id.toString(),
        assignmentId: s.assignment.id.toString(),
        topic: s.assignment.topic,
        subject: getSubjectLabel(s.assignment.subject) ?? s.assignment.subject,
        subjectId: s.assignment.subject,
        status: s.status,
        createdAt: s.createdAt,
        dueDate: s.assignment.dueDate,
        submittedAt: s.submittedAt,
        score: s.score !== null ? Number(s.score) : null,
        isOverdue,
        isSubmitted,
        canSubmit: !isSubmitted,
        questions: Array.isArray(s.assignment.questionsJson)
          ? s.assignment.questionsJson
          : [],
        submission: s.answersJson ?? null,
        feedback: s.teacherFeedbackJson ?? s.aiFeedbackJson ?? null,
        teacherName: s.assignment.teacher.name,
        className: s.assignment.class.className,
        totalMarks: s.assignment.totalMarks,
      }
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('[GET /api/assignments/history] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
