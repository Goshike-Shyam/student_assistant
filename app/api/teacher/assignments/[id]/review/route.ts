/**
 * SUBMISSION FEEDBACK CONTRACT
 * ai_feedback_json  → AI raw feedback, NEVER sent to student
 * teacher_feedback_json → teacher reviewed, sent on RELEASE
 * Student sees feedback ONLY when status = RELEASED
 * AI feedback stored immediately on student submit
 * Teacher release sets teacher_released_at timestamp
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'
import { createNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/** GET /api/teacher/assignments/[id]/review — list SUBMITTED submissions */
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
      where: {
        teacherAssignmentId: assignmentId,
        status: { in: ['SUBMITTED', 'REVIEWED', 'RELEASED'] },
      },
      include: {
        child: { select: { id: true, name: true, email: true } },
      },
      orderBy: { submittedAt: 'asc' },
    })

    return NextResponse.json({
      assignment: {
        id: assignment.id.toString(),
        topic: assignment.topic,
        subject: assignment.subject,
        questionsJson: assignment.questionsJson,
        totalMarks: assignment.totalMarks,
        dueDate: assignment.dueDate,
      },
      submissions: submissions.map((s) => ({
        submissionId: s.id.toString(),
        childId: s.child.id,
        childName: s.child.name,
        childEmail: s.child.email,
        status: s.status,
        score: s.score ? Number(s.score) : null,
        submittedAt: s.submittedAt,
        reviewedAt: s.teacherReviewedAt,
        releasedAt: s.teacherReleasedAt,
        answersJson: s.answersJson,
        aiFeedbackJson: s.aiFeedbackJson,        // Teacher sees AI feedback for review
        teacherFeedbackJson: s.teacherFeedbackJson,
      })),
    })
  } catch (err: any) {
    console.error('[teacher/assignments/review GET]', err)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

/** POST /api/teacher/assignments/[id]/review — save teacher feedback */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { id } = await params
    const assignmentId = BigInt(id)
    const teacherId = BigInt(session.teacherId)
    const { submissionId, teacherFeedbackJson, score, releaseNow } = await request.json()

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 })
    }

    // Verify teacher owns the assignment
    const assignment = await prisma.teacherAssignment.findFirst({
      where: { id: assignmentId, teacherId },
    })
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    const now = new Date()
    const updated = await prisma.teacherAssignmentSubmission.update({
      where: { id: BigInt(submissionId) },
      data: {
        teacherFeedbackJson: teacherFeedbackJson ?? undefined,
        score: score != null ? score : undefined,
        teacherReviewedAt: now,
        teacherReleasedAt: releaseNow ? now : null,
        status: releaseNow ? 'RELEASED' : 'REVIEWED',
      },
      include: {
        child: { select: { id: true, name: true, parentEmail: true } },
      },
    })

    if (releaseNow) {
      await createNotification({
        userId: updated.childId,
        userRole: 'STUDENT',
        title: 'Feedback ready to view',
        body: `Your teacher released feedback for "${assignment.topic}" in ${assignment.subject}.`,
        href: '/assignments?tab=class',
        priority: 'high',
        category: 'feedback',
      })

      if (updated.child.parentEmail) {
        const parent = await prisma.user.findFirst({
          where: { email: updated.child.parentEmail },
          select: { id: true },
        })

        if (parent) {
          await createNotification({
            userId: parent.id,
            userRole: 'PARENT',
            title: `Feedback ready for ${updated.child.name}`,
            body: `Teacher released feedback for "${assignment.topic}" (${assignment.subject}).`,
            href: `/parent/children/${updated.child.id}/assignments`,
            priority: 'medium',
            category: 'feedback',
          })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[teacher/assignments/review POST]', err)
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}
