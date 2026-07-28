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

  const byStudent = new Map<string, {
    id: string
    name: string
    email: string
    parentEmail: string
    grade: number | null
    curriculum: string | null
    classNames: string[]
    classIds: string[]
    enrolledAt: Date
  }>()

  for (const cls of classes) {
    for (const e of cls.enrollments) {
      const key = e.child.id
      const existing = byStudent.get(key)

      if (!existing) {
        byStudent.set(key, {
          id: e.child.id,
          name: e.child.name,
          email: e.child.email,
          // Schema currently stores parent contact on User.parentEmail.
          parentEmail: e.child.parentEmail ?? e.child.email,
          grade: e.child.grade,
          curriculum: e.child.curriculum,
          classNames: [cls.className],
          classIds: [cls.id.toString()],
          enrolledAt: e.enrolledAt,
        })
        continue
      }

      if (!existing.classIds.includes(cls.id.toString())) {
        existing.classIds.push(cls.id.toString())
        existing.classNames.push(cls.className)
      }
      if (e.enrolledAt < existing.enrolledAt) {
        existing.enrolledAt = e.enrolledAt
      }
    }
  }

  const results = Array.from(byStudent.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      parentEmail: s.parentEmail,
      grade: s.grade,
      curriculum: s.curriculum,
      className: s.classNames.join(', '),
      classId: s.classIds.join(','),
      enrolledAt: s.enrolledAt,
    }))

  return NextResponse.json(results)
}
