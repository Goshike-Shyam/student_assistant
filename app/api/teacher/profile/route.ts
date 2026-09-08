import { NextRequest, NextResponse } from 'next/server'
import { getTeacherSession } from '@/lib/teacher-auth'
import { prisma } from '@/lib/prismaClient'
import { verifyProfileToken } from '@/lib/profile/verify-token'
import { hashPassword } from '@/lib/admin-auth'
import { invalidateTeacherCache } from '@/lib/cache/session-cache'
import { decryptMobile, encryptMobile } from '@/lib/crypto/mobile'

export async function GET() {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const teacherId = BigInt(session.teacherId)
  const t = await prisma.teacher.findUnique({ where: { id: teacherId } })
  if (!t) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  let mobile: string | null = null
  try {
    if (t.mobile) mobile = decryptMobile(t.mobile)
  } catch {
    mobile = t.mobile ?? null
  }

  return NextResponse.json({ name: t.name, email: t.email, schoolName: t.schoolName, board: '', mobile })
}

export async function PUT(req: NextRequest) {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const teacherId = session.teacherId

  const body = await req.json()
  const { name, schoolName, mobile, newPassword, verifyToken } = body

  try {
    await verifyProfileToken(verifyToken, 'TEACHER', teacherId)
  } catch (err: any) {
    return NextResponse.json({ error: 'Password verification expired. Please try again.' }, { status: 401 })
  }

  if (!name || !name.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const updateData: any = { name: name.trim(), schoolName: schoolName?.trim() ?? '' }
  if (mobile) {
    try {
      updateData.mobile = encryptMobile(String(mobile))
    } catch (e) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }
  }

  if (newPassword) {
    if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    updateData.passwordHash = await hashPassword(newPassword)
  }

  await prisma.teacher.update({ where: { id: BigInt(teacherId) }, data: updateData })
  invalidateTeacherCache(teacherId).catch(console.error)

  return NextResponse.json({ ok: true })
}
