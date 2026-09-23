import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import bcrypt from 'bcryptjs'
import { COOKIE_NAMES, getDailySessionExpiresAt, getDailySessionMaxAge } from '@/lib/session-config'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string }
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        grade: true,
        curriculum: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Safety: ensure password field is hashed. If plaintext detected, reject and ask to run migration.
    const stored = (user as any).password
    if (!stored || typeof stored !== 'string' || !stored.startsWith('$2')) {
      console.error('[Signin] Unhashed password detected for user id:', user.id)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, stored)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          grade: user.grade,
          curriculum: user.curriculum,
        },
      },
      { status: 200 },
    )

    response.cookies.set(COOKIE_NAMES.student, JSON.stringify({
      userId: user.id,
      role: 'STUDENT',
      board: user.curriculum ?? 'CBSE',
      exp: getDailySessionExpiresAt(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: getDailySessionMaxAge(),
    })

    return response
  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[Signin] Error:', e?.message ?? err)
    return NextResponse.json(
      { error: 'Sign in failed. Please try again.' },
      { status: 500 },
    )
  }
}
