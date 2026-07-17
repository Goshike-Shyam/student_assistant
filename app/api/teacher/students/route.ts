import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'

/** GET /api/teacher/students — all students across all teacher's classes */
export async function GET() {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const teacherId = BigInt(session.teacherId)

  const classes = await prisma.teacherClass.findMany({
    where: { teacherId },
    include: {
      enrollments: {
        include: {
          child: {
            select: { id: true, name: true, email: true, parentEmail: true, grade: true, curriculum: true },
          },
        },
      },
    },
  })

  const results = classes.flatMap((cls) =>
    cls.enrollments.map((e) => ({
      id: e.child.id,
      name: e.child.name,
      email: e.child.email,
      parentEmail: e.child.parentEmail,
      grade: e.child.grade,
      curriculum: e.child.curriculum,
      className: cls.className,
      classId: cls.id.toString(),
      enrolledAt: e.enrolledAt,
    })),
  )

  return NextResponse.json(results)
}
