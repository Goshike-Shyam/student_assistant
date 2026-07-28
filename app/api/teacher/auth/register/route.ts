import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { hashPassword, validatePasswordStrength, generateInviteToken, hashToken } from '@/lib/admin-auth'
import { sendTeacherVerificationEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, schoolName, mobile } = body

    // Input validation
    if (!name?.trim() || !email?.trim() || !password || !schoolName?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, password, and school name are required' },
        { status: 400 },
      )
    }

    const emailNorm = email.toLowerCase().trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const pwStrength = validatePasswordStrength(password)
    if (!pwStrength.valid) {
      return NextResponse.json({ error: pwStrength.errors[0] }, { status: 400 })
    }

    // Check uniqueness
    const existing = await prisma.teacher.findUnique({ where: { email: emailNorm } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      )
    }

    const passwordHash = await hashPassword(password)
    const verifyToken = generateInviteToken()
    const tokenHash = hashToken(verifyToken)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create teacher and verification token in transaction
    const teacher = await prisma.$transaction(async (tx) => {
      const t = await tx.teacher.create({
        data: {
          name: name.trim(),
          email: emailNorm,
          passwordHash,
          schoolName: schoolName.trim(),
          mobile: mobile?.trim() ?? null,
          isActive: true,
          emailVerified: false,
        },
      })

      await tx.teacherVerificationToken.create({
        data: {
          teacherId: t.id,
          tokenHash,
          expiresAt,
        },
      })

      return t
    })

    const superAdmin = await prisma.admin.findFirst({
      where: { role: 'SUPER_ADMIN', isActive: true },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    })
    if (superAdmin) {
      await createNotification({
        userId: superAdmin.id.toString(),
        userRole: 'ADMIN',
        title: 'New user registered',
        body: `${name.trim()} signed up as a teacher account.`,
        href: '/admin/users',
        priority: 'low',
        category: 'system',
      })
    }

    // Send verification email — isolated so account creation is never rolled back on email failure
    let emailSent = false
    try {
      await sendTeacherVerificationEmail(emailNorm, name.trim(), verifyToken)
      emailSent = true
      console.log('[teacher/register] Verification email sent to:', emailNorm)
    } catch (emailErr) {
      console.error('[teacher/register] Email send FAILED (account still created):', emailErr)
    }

    return NextResponse.json(
      {
        message: emailSent
          ? 'Check your email to verify your account'
          : 'Account created. Verification email could not be sent — use "Resend Verification Email" on the login page.',
        emailSent,
      },
      { status: 201 },
    )
  } catch (err: any) {
    console.error('[teacher/register]', err)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
