import { NextRequest, NextResponse } from 'next/server'
import { getParentSession } from '@/lib/parent-auth'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

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

  const attempts = await prisma.practiceAttempt.findMany({
    where: {
      childId: child.id,
      completedAt: { not: null },
    },
    orderBy: { completedAt: 'desc' },
    take: 200,
    include: {
      test: {
        select: { subject: true },
      },
    },
  })

  const perSubject = new Map<string, number[]>()

  for (const attempt of attempts) {
    const subject = attempt.test?.subject ?? 'Unknown'
    const score = typeof attempt.score === 'number' ? attempt.score : 0
    const list = perSubject.get(subject) ?? []
    list.push(score)
    perSubject.set(subject, list)
  }

  const subjects = Array.from(perSubject.entries())
    .map(([subjectId, scores]) => {
      const ordered = [...scores].slice(0, 5).reverse()
      const average = ordered.length
        ? ordered.reduce((sum, value) => sum + value, 0) / ordered.length
        : 0

      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (ordered.length >= 2) {
        const last = ordered[ordered.length - 1]
        const previous = ordered[ordered.length - 2]
        if (last > previous) trend = 'up'
        else if (last < previous) trend = 'down'
      }

      return {
        subjectId,
        avg: Number(average.toFixed(1)),
        trend,
        scores: ordered.map((score) => ({ score: Number(score.toFixed(1)) })),
      }
    })
    .sort((a, b) => b.avg - a.avg)

  return NextResponse.json({ subjects })
}
