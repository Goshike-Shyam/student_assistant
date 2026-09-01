import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prismaClient'

type SignupBody = {
  name?: string
  email?: string
  parentEmail?: string
  password?: string
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
  phone?: string
  grade?: number
  board?: 'CBSE' | 'ICSE' | 'STATE_BOARD' | 'INTERNATIONAL'
  subjects?: string[]
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SignupBody

    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password' },
        { status: 400 },
      )
    }

    const role = body.role ?? 'STUDENT'
    const board = body.board ?? 'CBSE'
    const grade = Number.isFinite(body.grade) ? Number(body.grade) : 9
    const parentEmail = body.parentEmail ? String(body.parentEmail).trim().toLowerCase() : null
    const subjects = Array.isArray(body.subjects)
      ? body.subjects
          .map((s) => String(s).trim())
          .filter((s) => s.length > 0)
      : []

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      )
    }

    const created = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
        grade,
        curriculum: board,
        parentEmail,
        location: body.phone ? String(body.phone) : null,
      },
      select: { id: true, email: true, name: true },
    })

    if (subjects.length > 0) {
      await prisma.childSubject.createMany({
        data: subjects.map((subjectName) => ({
          childId: created.id,
          subjectName,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'Account created',
        user: {
          id: created.id,
          email: created.email,
          name: created.name,
        },
      },
      { status: 201 },
    )
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string; stack?: string }
    console.error('[Signup] Error:', {
      message: e?.message,
      code: e?.code,
      stack: e?.stack?.split('\n')[0],
    })

    if (e?.code === 'P1001') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 503 },
      )
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 },
    )
  }
}
