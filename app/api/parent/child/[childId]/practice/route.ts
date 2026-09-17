import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSubjectLabel } from '@/lib/subjects/config'
import { getOwnedChildAccess } from '@/lib/parent-child-guard'

export const dynamic = 'force-dynamic'

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

  const attempts = await prisma.practiceAttempt.findMany({
    where: { childId: child.id },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      test: {
        select: { subject: true, totalMarks: true },
      },
    },
  })

  const normalized = attempts.map((attempt) => {
    let totalQuestions = 0
    try {
      const parsed = JSON.parse(attempt.answersJson ?? '[]')
      totalQuestions = Array.isArray(parsed) ? parsed.length : 0
    } catch {
      totalQuestions = 0
    }

    return {
      id: attempt.id,
      subject: getSubjectLabel(attempt.test?.subject ?? 'Unknown') ?? attempt.test?.subject ?? 'Unknown',
      score: typeof attempt.score === 'number' ? attempt.score : 0,
      totalQuestions,
      createdAt: attempt.createdAt.toISOString(),
      timeTakenSecs: attempt.timeTakenSecs ?? 0,
    }
  })

  const bySubject: Record<string, number[]> = {}
  for (const attempt of attempts) {
    const subject = attempt.test?.subject ?? 'Unknown'
    if (!bySubject[subject]) {
      bySubject[subject] = []
    }
    if (bySubject[subject].length < 5) {
      bySubject[subject].push(typeof attempt.score === 'number' ? attempt.score : 0)
    }
  }

  const subjectTrends = Object.entries(bySubject).map(([subjectId, scores]) => {
    const avg = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0
    const trend = scores.length >= 2
      ? scores[0] > scores[scores.length - 1]
        ? 'up'
        : scores[0] < scores[scores.length - 1]
          ? 'down'
          : 'stable'
      : 'stable'

    return {
      subjectId,
      subjectLabel: getSubjectLabel(subjectId) ?? subjectId,
      scores,
      avg: Math.round(avg),
      trend,
      trafficLight: avg >= 75 ? 'green' : avg >= 50 ? 'amber' : 'red',
    }
  })

  return NextResponse.json({ attempts: normalized, subjectTrends })
}
