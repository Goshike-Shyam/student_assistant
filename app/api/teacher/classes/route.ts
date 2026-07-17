import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'
import { hashToken } from '@/lib/admin-auth'
import { getAcademicYear, type Board } from '@/lib/academic-year'

/** GET /api/teacher/classes — list all classes for logged-in teacher */
export async function GET() {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const classes = await prisma.teacherClass.findMany({
    where: { teacherId: BigInt(session.teacherId) },
    include: {
      subjects: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(
    classes.map((c) => ({
      id: c.id.toString(),
      className: c.className,
      grade: c.grade,
      board: c.board,
      academicYear: c.academicYear,
      subjects: c.subjects.map((s) => s.subjectName),
      studentCount: c._count.enrollments,
      createdAt: c.createdAt,
    })),
  )
}

/** POST /api/teacher/classes — create a new class */
export async function POST(request: NextRequest) {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { className, grade, board, subjects } = await request.json()

    if (!className?.trim() || !grade || !board || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: 'className, grade, board, and at least one subject are required' },
        { status: 400 },
      )
    }

    const teacherId = BigInt(session.teacherId)

    // Compute academic year from board — never use hardcoded default
    const academicYear = getAcademicYear(board as Board)

    const created = await prisma.$transaction(async (tx) => {
      const cls = await tx.teacherClass.create({
        data: {
          teacherId,
          className: className.trim(),
          grade: grade.toString(),
          board,
          academicYear,
        },
      })

      await tx.teacherClassSubject.createMany({
        data: (subjects as string[]).map((s) => ({
          teacherId,
          classId: cls.id,
          subjectName: s.trim(),
        })),
        skipDuplicates: true,
      })

      return cls
    })

    return NextResponse.json({ id: created.id.toString(), className: created.className }, { status: 201 })
  } catch (err: any) {
    console.error('[teacher/classes POST]', err)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}
