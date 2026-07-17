import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'
import { sendDueDateExtensionEmail } from '@/lib/email'

/** PATCH /api/teacher/assignments/[id] — extend due date */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { id } = await params
    const assignmentId = BigInt(id)
    const teacherId = BigInt(session.teacherId)
    const { newDueDate, childIds } = await request.json()

    if (!newDueDate) {
      return NextResponse.json({ error: 'newDueDate is required' }, { status: 400 })
    }

    const assignment = await prisma.teacherAssignment.findFirst({
      where: { id: assignmentId, teacherId },
    })
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    const newDate = new Date(newDueDate)
    if (newDate <= new Date()) {
      return NextResponse.json({ error: 'New due date must be in the future' }, { status: 400 })
    }

    // Update assignment due date
    await prisma.teacherAssignment.update({
      where: { id: assignmentId },
      data: { dueDate: newDate },
    })

    // Send notifications to affected parents
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } })
    if (teacher) {
      // Determine which students to notify
      const submissionsQuery = childIds?.length
        ? { teacherAssignmentId: assignmentId, childId: { in: childIds as string[] } }
        : { teacherAssignmentId: assignmentId }

      const submissions = await prisma.teacherAssignmentSubmission.findMany({
        where: submissionsQuery,
        include: { child: { select: { name: true, parentEmail: true, email: true } } },
      })

      for (const sub of submissions) {
        const parentEmail = sub.child.parentEmail ?? sub.child.email
        if (!parentEmail) continue
        await sendDueDateExtensionEmail({
          parentEmail,
          childName: sub.child.name,
          teacherName: teacher.name,
          subject: assignment.subject,
          topic: assignment.topic,
          newDueDate: newDate,
        }).catch(() => {})
      }
    }

    return NextResponse.json({ ok: true, newDueDate: newDate })
  } catch (err: any) {
    console.error('[teacher/assignments PATCH]', err)
    return NextResponse.json({ error: 'Failed to extend due date' }, { status: 500 })
  }
}

/** PATCH /api/teacher/assignments/[id]/publish — publish a draft */
export async function PUT(
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
    if (assignment.isPublished) return NextResponse.json({ message: 'Already published' })

    await prisma.$transaction(async (tx) => {
      await tx.teacherAssignment.update({
        where: { id: assignmentId },
        data: { isPublished: true },
      })

      // Create NOT_STARTED rows for all enrolled students
      const enrollments = await tx.classEnrollment.findMany({
        where: { classId: assignment.classId },
        select: { childId: true },
      })

      if (enrollments.length > 0) {
        await tx.teacherAssignmentSubmission.createMany({
          data: enrollments.map((e) => ({
            teacherAssignmentId: assignmentId,
            childId: e.childId,
            status: 'NOT_STARTED',
          })),
          skipDuplicates: true,
        })
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[teacher/assignments PUT]', err)
    return NextResponse.json({ error: 'Failed to publish assignment' }, { status: 500 })
  }
}
