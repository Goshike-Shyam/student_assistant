import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { cookies } from 'next/headers'
import { verifyProfileToken } from '@/lib/profile/verify-token'
import { validateSubjectIds } from '@/lib/subjects/config'
import { hashPassword } from '@/lib/admin-auth'
import { invalidateStudentCache } from '@/lib/cache/session-cache'

async function resolveUserFromCookie() {
  const jar = await cookies()
  const c = jar.get('sa-user-session')?.value
  if (!c) return null
  try {
    const parsed = JSON.parse(c)
    return String(parsed.userId)
  } catch {
    return null
  }
}

export async function GET() {
  const userId = await resolveUserFromCookie()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const childSubjects = await prisma.childSubject.findMany({ where: { childId: userId }, select: { subjectName: true } })
  const subjects = childSubjects.map((s) => s.subjectName)

  return NextResponse.json({
    childId: user.id,
    name: user.name,
    schoolName: user.location ?? '',
    grade: user.grade?.toString() ?? '10',
    board: user.curriculum ?? 'CBSE',
    subjects,
  })
}

export async function PUT(req: NextRequest) {
  const userId = await resolveUserFromCookie()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, schoolName, subjects, newPassword, verifyToken } = body

  try {
    await verifyProfileToken(verifyToken, 'STUDENT', userId)
  } catch (err: any) {
    return NextResponse.json({ error: 'Password verification expired. Please try again.' }, { status: 401 })
  }

  if (!name || !name.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  const validSubjects = Array.isArray(subjects) && subjects.length ? validateSubjectIds(subjects, 'CBSE', Number(body.grade ?? 10)) : []
  if (!validSubjects.length) return NextResponse.json({ error: 'At least one valid subject required' }, { status: 400 })

  const updateData: any = {
    name: name.trim(),
    location: schoolName?.trim() ?? '',
  }

  if (newPassword) {
    if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    updateData.password = await hashPassword(newPassword)
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: updateData })
    // Replace subjects
    await tx.childSubject.deleteMany({ where: { childId: userId } })
    if (validSubjects.length) {
      await tx.childSubject.createMany({ data: validSubjects.map((s) => ({ childId: userId, subjectName: s })) })
    }
  })

  invalidateStudentCache(userId).catch(console.error)

  return NextResponse.json({ ok: true })
}
