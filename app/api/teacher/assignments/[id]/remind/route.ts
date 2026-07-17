import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'
import { sendAssignmentReminderEmail } from '@/lib/email'

/** POST /api/teacher/assignments/[id]/remind */
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
    const { childIds } = await request.json()

    if (!Array.isArray(childIds) || childIds.length === 0) {
      return NextResponse.json({ error: 'childIds array is required' }, { status: 400 })
    }

    const assignment = await prisma.teacherAssignment.findFirst({
      where: { id: assignmentId, teacherId },
      include: { class: true },
    })
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    // Fetch teacher info
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } })
    if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    const now = new Date()
    // Only remind for assignments not yet overdue
    if (assignment.dueDate <= now) {
      return NextResponse.json({ error: 'Assignment is already past due', sent: 0 })
    }

    const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const submissions = await prisma.teacherAssignmentSubmission.findMany({
      where: {
        teacherAssignmentId: assignmentId,
        childId: { in: childIds as string[] },
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
      },
      include: {
        child: { select: { id: true, name: true, parentEmail: true, email: true } },
      },
    })

    let sent = 0
    for (const sub of submissions) {
      // Skip if reminder sent in last 24 hrs
      if (sub.reminderSentAt && sub.reminderSentAt > cutoff24h) continue

      const parentEmail = sub.child.parentEmail ?? sub.child.email
      if (!parentEmail) continue

      try {
        await sendAssignmentReminderEmail({
          parentEmail,
          childName: sub.child.name,
          teacherName: teacher.name,
          subject: assignment.subject,
          topic: assignment.topic,
          dueDate: assignment.dueDate,
        })

        // Log reminder
        await prisma.assignmentReminder.create({
          data: {
            teacherAssignmentId: assignmentId,
            childId: sub.child.id,
            parentEmail,
            channel: 'EMAIL',
          },
        })

        // Update submission
        await prisma.teacherAssignmentSubmission.update({
          where: { id: sub.id },
          data: { reminderSentAt: now },
        })

        // Log in communication log
        await prisma.parentCommunicationLog.create({
          data: {
            teacherId,
            childId: sub.child.id,
            parentEmail,
            messageType: 'REMINDER',
            subject: `Assignment reminder: ${assignment.subject} — ${assignment.topic}`,
          },
        })

        sent++
      } catch (emailErr) {
        console.error(`[remind] Failed to send to ${parentEmail}:`, emailErr)
      }
    }

    return NextResponse.json({ ok: true, sent })
  } catch (err: any) {
    console.error('[teacher/assignments/remind POST]', err)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
