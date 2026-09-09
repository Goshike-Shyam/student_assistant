import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as {
      name?: string
      email?: string
      mobile?: string | null
      password?: string
    }

    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const mobileRaw = typeof body.mobile === 'string' ? body.mobile.trim() : ''

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      )
    }

    if (mobileRaw && !/^\d{10}$/.test(mobileRaw)) {
      return NextResponse.json(
        { error: 'Mobile number must be a 10-digit value' },
        { status: 400 },
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Account already exists with this email' },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: 'PARENT',
        location: mobileRaw || null,
      },
      select: { id: true },
    })

    return NextResponse.json(
      { ok: true, message: 'Account created' },
      { status: 201 },
    )
  } catch (error) {
    console.error('[parent/register]', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 },
    )
  }
}
