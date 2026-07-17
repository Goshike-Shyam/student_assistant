import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { generateInviteToken, hashToken } from '@/lib/admin-auth'
import { sendTeacherVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailNorm = email.toLowerCase().trim()

    // Always return the same message to prevent email enumeration
    const genericResponse = NextResponse.json({
      message: 'If that email exists and is unverified, a new verification link has been sent.',
    })

    const teacher = await prisma.teacher.findUnique({ where: { email: emailNorm } })
    if (!teacher || teacher.emailVerified) {
      return genericResponse
    }

    // Invalidate all existing unused tokens
    await prisma.teacherVerificationToken.updateMany({
      where: { teacherId: teacher.id },
      data: { expiresAt: new Date(0) }, // expire immediately
    })

    // Generate new token
    const rawToken = generateInviteToken()
    const tokenHash = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.teacherVerificationToken.create({
      data: { teacherId: teacher.id, tokenHash, expiresAt },
    })

    await sendTeacherVerificationEmail(teacher.email, teacher.name, rawToken)
    console.log('[resend-verification] New token sent to:', emailNorm)

    return genericResponse
  } catch (err: any) {
    console.error('[teacher/resend-verification]', err)
    // Return generic success to prevent enumeration even on error
    return NextResponse.json({
      message: 'If that email exists and is unverified, a new verification link has been sent.',
    })
  }
}
