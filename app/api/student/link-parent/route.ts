import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prismaClient'
import { linkChildToParent } from '@/lib/family-code'
import { cacheExpire, cacheIncr, KEY } from '@/lib/cache/provider'

const LIMIT = 5
const WINDOW_SECS = 60 * 60

async function resolveUserFromCookie() {
  const jar = await cookies()
  const c = jar.get('sa-user-session')?.value
  if (!c) return null
  try {
    const parsed = JSON.parse(c)
    return String(parsed.userId)
  } catch {
    return null
  }
}

async function checkLinkRateLimit(childId: string) {
  const key = KEY.rlChild('FAMILY_LINK', childId)
  const count = await cacheIncr(key)

  if (count === 0) {
    return { allowed: true }
  }

  if (count === 1) {
    await cacheExpire(key, WINDOW_SECS).catch(() => {})
  }

  return { allowed: count <= LIMIT, count }
}

export async function POST(req: NextRequest) {
  const userId = await resolveUserFromCookie()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const student = await prisma.user.findFirst({
    where: { id: userId, role: 'STUDENT' },
    select: { id: true, parentEmail: true },
  })

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const limit = await checkLinkRateLimit(student.id)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many link attempts. Please try again in about an hour.' },
      { status: 429 },
    )
  }

  const body = await req.json().catch(() => ({})) as { familyCode?: string }
  const familyCode = String(body.familyCode ?? '').trim()

  if (!familyCode) {
    return NextResponse.json({ error: 'Family code is required' }, { status: 400 })
  }

  const result = await linkChildToParent(student.id, familyCode)

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Link failed' }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    parentName: result.parentName,
    message: `Successfully linked to ${result.parentName ?? 'your parent'}'s account!`,
  })
}