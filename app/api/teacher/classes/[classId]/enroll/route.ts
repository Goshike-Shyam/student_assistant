import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'
import { hashToken } from '@/lib/admin-auth'

/** POST /api/teacher/classes/[classId]/enroll */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { classId: classIdStr } = await params
    const classId = BigInt(classIdStr)
    const teacherId = BigInt(session.teacherId)

    // Verify teacher owns this class
    const cls = await prisma.teacherClass.findFirst({ where: { id: classId, teacherId } })
    if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

    const body = await request.json()
    let childId: string | null = null

    if (body.childId) {
      childId = body.childId as string
    } else if (body.inviteToken) {
      const tokenHash = hashToken(body.inviteToken as string)
      const invite = await prisma.classInviteToken.findFirst({
        where: { classId, tokenHash, isUsed: false },
      })
      if (!invite || invite.expiresAt < new Date()) {
        return NextResponse.json({ error: 'Invalid or expired invite token' }, { status: 400 })
      }
      // Token used — mark it (for class-invite one-per-use model we keep it open for multi-enroll)
      childId = body.childIdForToken as string ?? null
    }

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 })
    }

    // Verify student exists
    const student = await prisma.user.findUnique({ where: { id: childId } })
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    // Enroll in a transaction — also create NOT_STARTED submission rows
    await prisma.$transaction(async (tx) => {
      const enrollment = await tx.classEnrollment.upsert({
        where: { uq_enrollment: { classId, childId: childId! } },
        create: { classId, childId: childId! },
        update: {},
      })

      // Auto-create submission rows for ALL existing published assignments
      // skipDuplicates ensures re-enrollment is safe
      const assignments = await tx.teacherAssignment.findMany({
        where: { classId, isPublished: true },
        select: { id: true, topic: true },
      })

      console.log(
        `[Enroll] Found ${assignments.length} published assignments for class ${classId}`,
      )

      if (assignments.length > 0) {
        const created = await tx.teacherAssignmentSubmission.createMany({
          data: assignments.map((a) => ({
            teacherAssignmentId: a.id,
            childId: childId!,
            status: 'NOT_STARTED',
          })),
          skipDuplicates: true,
        })
        console.log(`[Enroll] Created ${created.count} submission rows for child ${childId}`)
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[teacher/classes/enroll POST]', err)
    return NextResponse.json({ error: 'Enrollment failed' }, { status: 500 })
  }
}
