import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

/**
 * PRACTICE ROUTE CONTRACT
 * Prisma models: prisma.practiceTest    (@@map "practice_tests")
 *                prisma.practiceAttempt (@@map "practice_attempts")
 * NEVER use: prisma.generatedPracticeTest / prisma.generatedPracticeAttempt
 */

/** Returns consecutive-day streak for a child based on completed attempts */
function calculateStreak(attempts: Array<{ completedAt: Date | null }>): number {
  if (attempts.length === 0) return 0;

  const dateSet = new Set(
    attempts
      .filter((a) => a.completedAt)
      .map((a) => a.completedAt!.toISOString().split('T')[0]),
  );

  if (dateSet.size === 0) return 0;

  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);

  // Allow today or yesterday as the streak starting point (handles timezone edge)
  // Check today first; if not practiced today, check if yesterday was the last day
  const todayStr = check.toISOString().split('T')[0];
  if (!dateSet.has(todayStr)) {
    check.setDate(check.getDate() - 1);
  }

  while (true) {
    const dateStr = check.toISOString().split('T')[0];
    if (dateSet.has(dateStr)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function GET(request: NextRequest) {
  try {
    const childId = request.nextUrl.searchParams.get('childId');
    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 });
    }

    // Fetch all completed attempts with test subject info
    const allAttempts = await prisma.practiceAttempt.findMany({
      where: { childId, completedAt: { not: null } },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        practiceTestId: true,
        score: true,
        marksAwarded: true,
        marksPossible: true,
        completedAt: true,
        test: { select: { subject: true, topic: true } },
      },
    });

    // Aggregate stats
    const totalAttempts = allAttempts.length;
    const averageScore =
      totalAttempts > 0
        ? (allAttempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / totalAttempts).toFixed(1)
        : '0.0';

    // Unique tests
    const uniqueTests = new Set(allAttempts.map((a) => a.practiceTestId)).size;

    // Subject breakdown
    const subjectMap = new Map<
      string,
      { attempts: number; totalScore: number; bestScore: number }
    >();
    for (const a of allAttempts) {
      const subj = a.test.subject;
      if (!subjectMap.has(subj)) subjectMap.set(subj, { attempts: 0, totalScore: 0, bestScore: 0 });
      const entry = subjectMap.get(subj)!;
      entry.attempts++;
      entry.totalScore += a.score ?? 0;
      entry.bestScore = Math.max(entry.bestScore, a.score ?? 0);
    }
    const subjectBreakdown = Array.from(subjectMap.entries())
      .map(([subject, data]) => ({
        subject,
        attempts: data.attempts,
        avg_score: data.attempts > 0 ? Number((data.totalScore / data.attempts).toFixed(1)) : 0,
        best_score: Number(data.bestScore.toFixed(1)),
      }))
      .sort((a, b) => b.avg_score - a.avg_score);

    // Recent 10 for trend chart (reverse to chronological order)
    const recentAttempts = allAttempts.slice(0, 10).reverse().map((a) => ({
      score: a.score ?? 0,
      completedAt: a.completedAt!.toISOString(),
      test: { subject: a.test.subject, topic: a.test.topic },
    }));

    const streak = calculateStreak(allAttempts);

    return NextResponse.json({
      totalAttempts,
      averageScore,
      totalTests: uniqueTests,
      subjectBreakdown,
      recentAttempts,
      streak,
    });
  } catch (error) {
    console.error('[GET /api/practice/metrics] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
