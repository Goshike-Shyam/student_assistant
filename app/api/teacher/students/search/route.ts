import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'

/** GET /api/teacher/students/search?q=... — search existing students to enroll */
export async function GET(request: NextRequest) {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      OR: [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, email: true, grade: true },
    take: 10,
  })

  return NextResponse.json(students)
}
