import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { hashToken } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    const tokenHash = hashToken(token)

    const record = await prisma.teacherVerificationToken.findUnique({
      where: { tokenHash },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Verification link is invalid or has already been used.' },
        { status: 400 },
      )
    }

    if (record.expiresAt < new Date()) {
      await prisma.teacherVerificationToken.delete({ where: { tokenHash } })
      return NextResponse.json(
        { error: 'Verification link has expired. Please register again.' },
        { status: 400 },
      )
    }

    await prisma.$transaction([
      prisma.teacher.update({
        where: { id: record.teacherId },
        data: { emailVerified: true },
      }),
      prisma.teacherVerificationToken.delete({ where: { tokenHash } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[teacher/verify-email]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
