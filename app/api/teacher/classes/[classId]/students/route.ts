import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'

/** GET /api/teacher/classes/[classId]/students */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { classId: classIdStr } = await params
    const classId = BigInt(classIdStr)
    const teacherId = BigInt(session.teacherId)

    const cls = await prisma.teacherClass.findFirst({ where: { id: classId, teacherId } })
    if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            email: true,
            parentEmail: true,
            grade: true,
            curriculum: true,
          },
        },
      },
      orderBy: { enrolledAt: 'asc' },
    })

    const assignments = await prisma.teacherAssignment.findMany({
      where: { classId, isPublished: true },
      select: { id: true, topic: true, subject: true, dueDate: true },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch all submissions for this class
    const assignmentIds = assignments.map((a) => a.id)
    const submissions = assignmentIds.length
      ? await prisma.teacherAssignmentSubmission.findMany({
          where: { teacherAssignmentId: { in: assignmentIds } },
          select: {
            teacherAssignmentId: true,
            childId: true,
            status: true,
            score: true,
            submittedAt: true,
          },
        })
      : []

    const subMap = new Map<string, Map<string, (typeof submissions)[0]>>()
    for (const sub of submissions) {
      const key = sub.teacherAssignmentId.toString()
      if (!subMap.has(key)) subMap.set(key, new Map())
      subMap.get(key)!.set(sub.childId, sub)
    }

    return NextResponse.json({
      class: {
        id: cls.id.toString(),
        className: cls.className,
        grade: cls.grade,
        board: cls.board,
      },
      assignments: assignments.map((a) => ({
        id: a.id.toString(),
        topic: a.topic,
        subject: a.subject,
        dueDate: a.dueDate,
      })),
      students: enrollments.map((e) => ({
        childId: e.child.id,
        name: e.child.name,
        email: e.child.email,
        parentEmail: e.child.parentEmail,
        grade: e.child.grade,
        curriculum: e.child.curriculum,
        enrolledAt: e.enrolledAt,
        submissions: assignments.map((a) => {
          const sub = subMap.get(a.id.toString())?.get(e.child.id)
          return {
            assignmentId: a.id.toString(),
            status: sub?.status ?? 'NOT_STARTED',
            score: sub?.score ?? null,
            submittedAt: sub?.submittedAt ?? null,
          }
        }),
      })),
    })
  } catch (err: any) {
    console.error('[teacher/classes/students GET]', err)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

/** DELETE /api/teacher/classes/[classId]/students — remove enrollment */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { classId: classIdStr } = await params
    const classId = BigInt(classIdStr)
    const teacherId = BigInt(session.teacherId)
    const { childId } = await request.json()

    const cls = await prisma.teacherClass.findFirst({ where: { id: classId, teacherId } })
    if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

    await prisma.classEnrollment.deleteMany({
      where: { classId, childId },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[teacher/classes/students DELETE]', err)
    return NextResponse.json({ error: 'Failed to remove student' }, { status: 500 })
  }
}
