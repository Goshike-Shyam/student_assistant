import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prismaClient'
import { getFeatureAccessList, setFeatureAccess } from '@/lib/feature-access'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
    },
    select: {
      id: true,
      name: true,
      grade: true,
      curriculum: true,
      parentEmail: true,
    },
    orderBy: { name: 'asc' },
  })

  const teachers = await prisma.teacher.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      schoolName: true,
      isActive: true,
    },
    orderBy: { name: 'asc' },
  })

  const [studentAccess, teacherAccess] = await Promise.all([
    getFeatureAccessList('PODCAST', 'STUDENT'),
    getFeatureAccessList('PODCAST', 'TEACHER'),
  ])

  const studentMap = new Map(studentAccess.map((entry) => [entry.userId.toString(), entry]))
  const teacherMap = new Map(teacherAccess.map((entry) => [entry.userId.toString(), entry]))

  return NextResponse.json({
    students: students.map((student) => ({
      id: student.id,
      name: student.name,
      grade: student.grade ? String(student.grade) : undefined,
      board: student.curriculum ?? undefined,
      parentName: '—',
      parentEmail: student.parentEmail ?? '—',
      podcastEnabled: studentMap.get(student.id)?.isEnabled ?? false,
      enabledAt: studentMap.get(student.id)?.enabledAt ?? null,
      notes: studentMap.get(student.id)?.notes ?? '',
    })),
    teachers: teachers.map((teacher) => ({
      id: teacher.id.toString(),
      name: teacher.name,
      email: teacher.email,
      schoolName: teacher.schoolName,
      isActive: teacher.isActive,
      podcastEnabled: teacherMap.get(teacher.id.toString())?.isEnabled ?? false,
      enabledAt: teacherMap.get(teacher.id.toString())?.enabledAt ?? null,
      notes: teacherMap.get(teacher.id.toString())?.notes ?? '',
    })),
  })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, userRole, isEnabled, notes } = await req.json()

  if (!userId || !userRole || isEnabled === undefined) {
    return NextResponse.json(
      { error: 'userId, userRole, isEnabled required' },
      { status: 400 },
    )
  }

  if (!['STUDENT', 'TEACHER'].includes(userRole)) {
    return NextResponse.json({ error: 'Invalid userRole' }, { status: 400 })
  }

  await setFeatureAccess(
    String(userId),
    userRole,
    'PODCAST',
    Boolean(isEnabled),
    BigInt(session.adminId),
    notes ?? null,
  )

  console.log(
    `[Admin] Podcast ${isEnabled ? 'enabled' : 'disabled'} for ${userRole} ${userId} by admin ${session.adminId}`,
  )

  return NextResponse.json({
    ok: true,
    message: `Podcast ${isEnabled ? 'enabled' : 'disabled'} successfully`,
  })
}
