import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prismaClient'
import { createParentSession } from '@/lib/parent-auth'

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const parent = await prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        role: 'PARENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    })

    if (!parent) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const passwordHash = parent.password ?? ''
    const isValid = passwordHash.startsWith('$2')
      ? await bcrypt.compare(password, passwordHash)
      : passwordHash === password

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    await prisma.parentSession.create({
      data: {
        parentId: parent.id,
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent') ?? null,
      },
    }).catch((error) => {
      console.error('[parent/login] session log failed:', error)
    })

    await createParentSession({
      id: parent.id,
      name: parent.name,
      email: parent.email,
    })

    return NextResponse.json({ ok: true, name: parent.name, email: parent.email })
  } catch (error) {
    console.error('[parent/login]', error)
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
