import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

function getDateKey(d: Date): string {
  return d.toISOString().split('T')[0]
}

function toDayLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export async function GET(request: NextRequest) {
  const childId = request.nextUrl.searchParams.get('userId') || request.headers.get('x-user-id')
  if (!childId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const daysRaw = Number(request.nextUrl.searchParams.get('days') ?? '30')
  const days = Number.isFinite(daysRaw) ? Math.max(7, Math.min(180, Math.trunc(daysRaw))) : 30

  try {
    const now = new Date()
    const since = new Date(now)
    since.setHours(0, 0, 0, 0)
    since.setDate(since.getDate() - (days - 1))

    const [practiceAttempts, assignments, sessions] = await Promise.all([
      prisma.practiceAttempt.findMany({
        where: {
          childId,
          completedAt: { not: null, gte: since },
        },
        select: {
          score: true,
          completedAt: true,
          marksAwarded: true,
          marksPossible: true,
          timeTakenSecs: true,
          test: { select: { subject: true, topic: true } },
        },
        orderBy: { completedAt: 'asc' },
      }),
      prisma.teacherAssignmentSubmission.findMany({
        where: {
          childId,
          createdAt: { gte: since },
        },
        select: {
          status: true,
          createdAt: true,
          submittedAt: true,
          assignment: { select: { subject: true, topic: true } },
        },
      }),
      prisma.studentSession.findMany({
        where: {
          childId,
          startedAt: { gte: since },
          endedAt: { not: null },
        },
        select: {
          startedAt: true,
          durationSecs: true,
          pageViews: true,
        },
      }),
    ])

    const totalTestsTaken = new Set(
      practiceAttempts.map((a) => `${a.test.subject}::${a.test.topic}`),
    ).size

    const totalAttempts = practiceAttempts.length
    const avgScore =
      totalAttempts > 0
        ? Number(
            (
              practiceAttempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / totalAttempts
            ).toFixed(1),
          )
        : 0

    const completedAssignmentStatuses = new Set(['SUBMITTED', 'REVIEWED', 'RELEASED'])
    const assignmentsCompleted = assignments.filter((a) => completedAssignmentStatuses.has(a.status)).length
    const assignmentsTotal = assignments.length

    const validSessionDurations = sessions
      .map((s) => s.durationSecs ?? null)
      .filter((secs): secs is number => typeof secs === 'number' && Number.isFinite(secs) && secs > 0)

    const validAttemptDurations = practiceAttempts
      .map((a) => a.timeTakenSecs ?? null)
      .filter((secs): secs is number => typeof secs === 'number' && Number.isFinite(secs) && secs > 0)

    // Fallback for tracked sessions with missing duration: estimate active time from pageViews.
    // Assumption: ~45 seconds active time per page view, minimum 2 minutes for a non-empty session.
    const estimatedSessionDurations = sessions
      .filter((s) => !s.durationSecs || s.durationSecs <= 0)
      .map((s) => {
        const pv = Math.max(0, s.pageViews ?? 0)
        if (pv <= 0) return 0
        return Math.max(120, pv * 45)
      })
      .filter((secs) => secs > 0)

    const durationPool = [...validSessionDurations, ...validAttemptDurations, ...estimatedSessionDurations]

    const avgTimeSpentMinutes =
      durationPool.length > 0
        ? Number((durationPool.reduce((sum, secs) => sum + secs, 0) / durationPool.length / 60).toFixed(1))
        : 0

    const streakDateSet = new Set(
      practiceAttempts
        .filter((a) => a.completedAt)
        .map((a) => getDateKey(a.completedAt as Date)),
    )
    let streak = 0
    const check = new Date()
    check.setHours(0, 0, 0, 0)
    if (!streakDateSet.has(getDateKey(check))) {
      check.setDate(check.getDate() - 1)
    }
    while (streakDateSet.has(getDateKey(check))) {
      streak += 1
      check.setDate(check.getDate() - 1)
    }

    const subjectAgg = new Map<string, { attempts: number; scoreSum: number; best: number }>()
    for (const attempt of practiceAttempts) {
      const subject = attempt.test.subject
      const current = subjectAgg.get(subject) ?? { attempts: 0, scoreSum: 0, best: 0 }
      current.attempts += 1
      current.scoreSum += attempt.score ?? 0
      current.best = Math.max(current.best, attempt.score ?? 0)
      subjectAgg.set(subject, current)
    }

    const subjectBreakdown = Array.from(subjectAgg.entries())
      .map(([subject, data]) => ({
        subject,
        attempts: data.attempts,
        avgScore: Number((data.scoreSum / data.attempts).toFixed(1)),
        bestScore: Number(data.best.toFixed(1)),
      }))
      .sort((a, b) => b.avgScore - a.avgScore)

    const weakTopics = subjectBreakdown
      .filter((s) => s.avgScore < 70)
      .map((s) => ({
        subject: s.subject,
        avgScore: s.avgScore,
        recommendation: `Focus on ${s.subject} fundamentals and complete 2 targeted practice tests.`,
      }))

    const trendMap = new Map<string, { scoreSum: number; count: number }>()
    for (const attempt of practiceAttempts) {
      if (!attempt.completedAt) continue
      const key = getDateKey(attempt.completedAt)
      const cur = trendMap.get(key) ?? { scoreSum: 0, count: 0 }
      cur.scoreSum += attempt.score ?? 0
      cur.count += 1
      trendMap.set(key, cur)
    }

    const scoreTrend: Array<{ date: string; avgScore: number }> = []
    for (let i = 0; i < days; i++) {
      const d = new Date(since)
      d.setDate(since.getDate() + i)
      const key = getDateKey(d)
      const rec = trendMap.get(key)
      scoreTrend.push({
        date: toDayLabel(d),
        avgScore: rec ? Number((rec.scoreSum / rec.count).toFixed(1)) : 0,
      })
    }

    const heatMap = new Map<string, number>()
    for (const attempt of practiceAttempts) {
      if (!attempt.completedAt) continue
      const k = getDateKey(attempt.completedAt)
      heatMap.set(k, (heatMap.get(k) ?? 0) + 1)
    }
    for (const session of sessions) {
      const k = getDateKey(session.startedAt)
      heatMap.set(k, (heatMap.get(k) ?? 0) + Math.max(1, Math.floor((session.pageViews ?? 0) / 3)))
    }

    const activityHeatmap: Array<{ date: string; intensity: number }> = []
    for (let i = 0; i < days; i++) {
      const d = new Date(since)
      d.setDate(since.getDate() + i)
      const key = getDateKey(d)
      activityHeatmap.push({
        date: key,
        intensity: Math.min(4, heatMap.get(key) ?? 0),
      })
    }

    const weeklyActivity = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - (6 - idx))
      const key = getDateKey(d)
      const dayAttempts = practiceAttempts.filter((a) => a.completedAt && getDateKey(a.completedAt) === key).length
      const dayAssignments = assignments.filter((a) => getDateKey(a.createdAt) === key).length
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        activity: dayAttempts + dayAssignments,
      }
    })

    return NextResponse.json({
      rangeDays: days,
      metrics: {
        testsTaken: totalTestsTaken,
        avgScore,
        totalAttempts,
        currentStreak: streak,
        assignmentsCompleted,
        assignmentsTotal,
        avgTimeSpentMinutes,
      },
      charts: {
        scoreTrend,
        subjectBreakdown,
        completionDonut: {
          completed: assignmentsCompleted,
          pending: Math.max(0, assignmentsTotal - assignmentsCompleted),
        },
        activityHeatmap,
      },
      weeklyActivity,
      weakTopics,
      links: {
        assignmentHistory: '/assignments/history',
        practice: '/practice',
      },
    })
  } catch (error) {
    console.error('[student/progress GET]', error)
    return NextResponse.json({ error: 'Failed to load progress data' }, { status: 500 })
  }
}
