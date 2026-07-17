import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { sendAssignmentReminderEmail } from '@/lib/email'

/**
 * Cron job — runs daily at 8am UTC (configured in vercel.json)
 * Sends reminders for:
 *   - Published assignments that are 3+ days old
 *   - Not yet overdue (due_date > NOW)
 *   - Student status: NOT_STARTED or IN_PROGRESS
 *   - Reminder not sent in last 3 days
 * Protected by Authorization: Bearer {CRON_SECRET}
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const threeDaysCutoff = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    // Find assignments that are: published, not overdue, created 3+ days ago
    const assignments = await prisma.teacherAssignment.findMany({
      where: {
        isPublished: true,
        dueDate: { gt: now },
        createdAt: { lte: threeDaysAgo },
      },
      include: {
        teacher: { select: { id: true, name: true } },
      },
    })

    if (assignments.length === 0) {
      return NextResponse.json({ message: 'No assignments to process', sent: 0 })
    }

    let totalSent = 0

    for (const assignment of assignments) {
      // Find submissions that haven't been reminded recently
      const submissions = await prisma.teacherAssignmentSubmission.findMany({
        where: {
          teacherAssignmentId: assignment.id,
          status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
          OR: [
            { reminderSentAt: null },
            { reminderSentAt: { lt: threeDaysCutoff } },
          ],
        },
        include: {
          child: { select: { id: true, name: true, parentEmail: true, email: true } },
        },
      })

      for (const sub of submissions) {
        const parentEmail = sub.child.parentEmail ?? sub.child.email
        if (!parentEmail) continue

        try {
          await sendAssignmentReminderEmail({
            parentEmail,
            childName: sub.child.name,
            teacherName: assignment.teacher.name,
            subject: assignment.subject,
            topic: assignment.topic,
            dueDate: assignment.dueDate,
          })

          await prisma.assignmentReminder.create({
            data: {
              teacherAssignmentId: assignment.id,
              childId: sub.child.id,
              parentEmail,
              channel: 'EMAIL',
            },
          })

          await prisma.teacherAssignmentSubmission.update({
            where: { id: sub.id },
            data: { reminderSentAt: now },
          })

          totalSent++
        } catch (emailErr) {
          console.error(`[cron/reminders] Failed to send to ${parentEmail}:`, emailErr)
        }
      }
    }

    console.log(`[cron/assignment-reminders] Sent ${totalSent} reminders`)
    return NextResponse.json({ message: 'Reminders processed', sent: totalSent })
  } catch (err: any) {
    console.error('[cron/assignment-reminders]', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
