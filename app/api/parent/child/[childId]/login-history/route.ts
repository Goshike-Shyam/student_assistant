import { NextRequest, NextResponse } from 'next/server'
import { getParentSession } from '@/lib/parent-auth'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function longestStreak(dates: Set<string>): number {
  const ordered = Array.from(dates).sort()
  if (!ordered.length) return 0

  let best = 1
  let current = 1

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = new Date(ordered[index - 1])
    const currentDate = new Date(ordered[index])
    const diff = Math.round((currentDate.getTime() - previous.getTime()) / 86400000)

    if (diff === 1) {
      current += 1
      best = Math.max(best, current)
    } else {
      current = 1
    }
  }

  return best
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ childId: string }> },
) {
  const { childId } = await params
  const session = await getParentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parent = await prisma.user.findUnique({
    where: { id: session.parentId },
    select: { id: true, email: true },
  })

  if (!parent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const child = await prisma.user.findFirst({
    where: {
      id: childId,
      role: 'STUDENT',
      parentEmail: parent.email,
    },
    select: { id: true },
  })

  if (!child) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 29)

  const sessions = await prisma.studentSession.findMany({
    where: {
      childId: child.id,
      startedAt: { gte: start },
    },
    select: { startedAt: true },
    orderBy: { startedAt: 'asc' },
  })

  const activeDates = new Set(sessions.map((session) => dateKey(session.startedAt)))
  const thirtyDays = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return dateKey(date)
  })

  const activeDayCount = thirtyDays.filter((day) => activeDates.has(day)).length
  const currentStreak = (() => {
    let streak = 0
    const cursor = new Date()
    cursor.setHours(0, 0, 0, 0)

    while (activeDates.has(dateKey(cursor))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    return streak
  })()

  return NextResponse.json({
    logins: thirtyDays.map((day) => ({ date: day, active: activeDates.has(day) })),
    currentStreak,
    longestStreak: longestStreak(activeDates),
    activeDayCount,
  })
}
