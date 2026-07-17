import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { comparePassword } from '@/lib/admin-auth'
import { createTeacherSession } from '@/lib/teacher-auth'

const RATE_LIMIT_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

const failedAttempts = new Map<string, { count: number; resetAt: number }>()

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempt = failedAttempts.get(ip)
  if (!attempt || now > attempt.resetAt) {
    failedAttempts.set(ip, { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  return attempt.count < RATE_LIMIT_ATTEMPTS
}

function recordFail(ip: string): void {
  const attempt = failedAttempts.get(ip)
  if (attempt) attempt.count++
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again in 15 minutes.' },
      { status: 429 },
    )
  }

  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      recordFail(ip)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!teacher || !teacher.isActive) {
      recordFail(ip)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await comparePassword(password, teacher.passwordHash)
    if (!valid) {
      recordFail(ip)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!teacher.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in.' },
        { status: 403 },
      )
    }

    // Clear failed attempts on success
    failedAttempts.delete(ip)

    await prisma.teacher.update({
      where: { id: teacher.id },
      data: { lastLogin: new Date() },
    })

    await createTeacherSession({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
    })

    return NextResponse.json({ name: teacher.name, email: teacher.email })
  } catch (err: any) {
    console.error('[teacher/login]', err)
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
