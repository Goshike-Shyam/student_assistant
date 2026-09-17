import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOwnedChildAccess } from '@/lib/parent-child-guard'

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
  const access = await getOwnedChildAccess(childId)

  if (access.unauthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const child = access.child

  if (!child) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const xpLogs = await prisma.studentXpLog.findMany({
    where: {
      childId: child.id,
      action: 'DAILY_LOGIN',
    },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 60,
  })

  const loginDates = Array.from(new Set(xpLogs.map((log) => dateKey(log.createdAt))))
  const activeDates = new Set(loginDates)
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
    loginDates,
    currentStreak,
    longestStreak: longestStreak(activeDates),
    lastLogin: xpLogs[0]?.createdAt?.toISOString() ?? null,
    activeDaysThisMonth: loginDates.filter((day) => day.startsWith(new Date().toISOString().slice(0, 7))).length,
  })
}
