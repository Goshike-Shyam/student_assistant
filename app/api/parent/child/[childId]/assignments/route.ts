import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOwnedChildAccess } from '@/lib/parent-child-guard'
import { getSubjectLabel } from '@/lib/subjects/config'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ childId: string }> },
) {
  const { childId } = await params
  const access = await getOwnedChildAccess(childId)

  if (access.unauthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const child = access.child

  if (!child) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const classAssignments = await prisma.teacherAssignmentSubmission.findMany({
    where: { childId: child.id },
    include: {
      assignment: {
        select: {
          subject: true,
          topic: true,
          dueDate: true,
          teacher: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 30,
  })

  const selfAssignments = await prisma.generatedAssignment.findMany({
    where: { childId: child.id },
    select: {
      id: true,
      subject: true,
      topic: true,
      score: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  return NextResponse.json({
    classAssignments: classAssignments.map((submission) => ({
      id: submission.id.toString(),
      title: submission.assignment.topic,
      subject: getSubjectLabel(submission.assignment.subject) ?? submission.assignment.subject,
      teacher: submission.assignment.teacher.name,
      dueDate: submission.assignment.dueDate?.toISOString() ?? null,
      status: submission.status,
      feedback: submission.teacherReleasedAt || submission.status === 'RELEASED'
        ? submission.teacherFeedbackJson
        : null,
      score: submission.score === null ? null : Number(submission.score),
      submittedAt: submission.submittedAt?.toISOString() ?? null,
    })),
    selfAssignments: selfAssignments.map((assignment) => ({
      id: assignment.id,
      subject: getSubjectLabel(assignment.subject) ?? assignment.subject,
      topic: assignment.topic,
      score: assignment.score,
      date: assignment.createdAt.toISOString(),
    })),
  })
}