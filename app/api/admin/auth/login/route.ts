import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { comparePassword } from '@/lib/admin-auth'

const RATE_LIMIT_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

// Simple in-memory rate limiter (in production, use Redis)
const failedAttempts: Map<string, { count: number; resetAt: number }> = new Map()

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempt = failedAttempts.get(ip)

  if (!attempt || now > attempt.resetAt) {
    // First attempt or window expired
    failedAttempts.set(ip, { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (attempt.count >= RATE_LIMIT_ATTEMPTS) {
    return false
  }

  return true
}

function recordFailedAttempt(ip: string) {
  const attempt = failedAttempts.get(ip)
  if (attempt) {
    attempt.count++
  }
}

function clearFailedAttempts(ip: string) {
  failedAttempts.delete(ip)
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Find admin by email (case-insensitive)
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Generic error message to not reveal email existence
    if (!admin || !admin.isActive) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, admin.passwordHash)

    if (!isPasswordValid) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Successful login
    clearFailedAttempts(ip)

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    })

    // Create admin session cookie
    const sessionData = JSON.stringify({
      adminId: admin.id.toString(),
      role: admin.role,
      name: admin.name,
      email: admin.email,
    })

    const response = NextResponse.json(
      {
        message: 'Login successful',
        admin: {
          id: admin.id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 200 }
    )

    // Set secure admin session cookie
    response.cookies.set('sa-admin-session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[POST /api/admin/auth/login] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
