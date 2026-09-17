import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOwnedChildAccess } from '@/lib/parent-child-guard'
import { getSubjectLabel } from '@/lib/subjects/config'

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

  console.log('[Progress] Child:', child.name, 'subjects:', child.subjects)

  try {
    const practiceAttempts = await prisma.practiceAttempt.findMany({
      where: {
        childId: child.id,
        completedAt: { not: null },
      },
      select: {
        score: true,
        createdAt: true,
        completedAt: true,
        test: {
          select: {
            subject: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 100,
    })

    console.log('[Progress] Practice attempts:', practiceAttempts.length)

    const teacherScores = await prisma.teacherAssignmentSubmission.findMany({
      where: { childId: child.id },
      select: {
        score: true,
        updatedAt: true,
        assignment: {
          select: { subject: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })

    console.log('[Progress] Teacher scores:', teacherScores.length)

    const selfAssignments = await prisma.generatedAssignment.findMany({
      where: { childId: child.id },
      select: {
        subject: true,
        score: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const subjectMap: Record<string, { score: number; date: Date }[]> = {}

    const addScore = (subject: string | null | undefined, score: number, date: Date) => {
      const subjectId = String(subject ?? '').trim()
      if (!subjectId) return

      if (!subjectMap[subjectId]) {
        subjectMap[subjectId] = []
      }

      subjectMap[subjectId].push({ score, date })
    }

    for (const attempt of practiceAttempts) {
      addScore(
        attempt.test?.subject,
        attempt.score ?? 0,
        attempt.completedAt ?? attempt.createdAt,
      )
    }

    for (const submission of teacherScores) {
      if (submission.score == null) continue
      addScore(
        submission.assignment.subject,
        Number(submission.score),
        submission.updatedAt,
      )
    }

    for (const assignment of selfAssignments) {
      addScore(
        assignment.subject,
        assignment.score ?? 0,
        assignment.createdAt,
      )
    }

    const allSubjectIds = new Set<string>([
      ...Object.keys(subjectMap),
      ...(child.subjects ?? []),
    ])

    const subjects = Array.from(allSubjectIds)
      .map((subjectId) => {
        const last5 = [...(subjectMap[subjectId] ?? [])]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5)
          .reverse()

        const avg = last5.length
          ? last5.reduce((sum, entry) => sum + entry.score, 0) / last5.length
          : 0

        const trend = last5.length >= 2
          ? last5[last5.length - 1].score > last5[0].score
            ? 'up'
            : last5[last5.length - 1].score < last5[0].score
              ? 'down'
              : 'stable'
          : 'stable'

        return {
          subjectId,
          subjectLabel: getSubjectLabel(subjectId) ?? subjectId,
          scores: last5.map((entry) => ({
            score: Number(entry.score.toFixed(1)),
            date: entry.date.toISOString(),
          })),
          avg: Math.round(avg),
          trend,
          trafficLight: avg >= 75 ? 'green' : avg >= 50 ? 'amber' : 'red',
          encouragement:
            avg >= 75
              ? '🌟 Outstanding! Keep shining!'
              : avg >= 50
                ? '👍 Good progress — keep going!'
                : last5.length === 0
                  ? '📚 No tests yet — start practising!'
                  : '💪 More practice = better results!',
          hasData: last5.length > 0,
        }
      })
      .sort((a, b) => Number(b.hasData) - Number(a.hasData))

    console.log(
      '[Progress] Subjects total:',
      subjects.length,
      'with data:',
      subjects.filter((subject) => subject.hasData).length,
    )

    return NextResponse.json({ childName: child.name, subjects })
  } catch (error: any) {
    console.error('[Progress] Error:', error)
    return NextResponse.json(
      {
        error: 'Progress failed to load',
        code: error?.code,
        hint:
          error?.code === 'P2024'
            ? 'Connection pool issue. Verify DATABASE_URL connection_limit is at least 5.'
            : undefined,
      },
      { status: 500 },
    )
  }
}
