import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

/**
 * PRACTICE ROUTE CONTRACT
 * Prisma models: prisma.practiceAttempt (@@map "practice_attempts")
 * NEVER use: prisma.generatedPracticeAttempt
 */

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const childId = request.nextUrl.searchParams.get('childId');
    const pageParam = request.nextUrl.searchParams.get('page');

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 });
    }

    const page = Math.max(1, parseInt(pageParam ?? '1', 10));
    const skip = (page - 1) * PAGE_SIZE;

    const [attempts, total] = await Promise.all([
      prisma.practiceAttempt.findMany({
        where: { childId, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        skip,
        take: PAGE_SIZE,
        select: {
          id: true,
          practiceTestId: true,
          score: true,
          marksAwarded: true,
          marksPossible: true,
          timeTakenSecs: true,
          completedAt: true,
          feedbackJson: true,
          test: {
            select: {
              subject: true,
              topic: true,
              complexity: true,
              totalMarks: true,
            },
          },
        },
      }),
      prisma.practiceAttempt.count({
        where: { childId, completedAt: { not: null } },
      }),
    ]);

    const items = attempts.map((a) => {
      const fb = a.feedbackJson ? (() => {
        try { return JSON.parse(a.feedbackJson!); } catch { return null; }
      })() : null;

      return {
        id: a.id,
        practiceTestId: a.practiceTestId,
        score: a.score,
        marksAwarded: a.marksAwarded,
        marksPossible: a.marksPossible,
        timeTakenSecs: a.timeTakenSecs,
        completedAt: a.completedAt?.toISOString() ?? null,
        gradeLabel: fb?.grade_label ?? null,
        gradeEmoji: fb?.grade_emoji ?? null,
        feedbackJson: a.feedbackJson,
        test: a.test,
      };
    });

    return NextResponse.json({
      attempts: items,
      total,
      page,
      pageSize: PAGE_SIZE,
      hasMore: skip + attempts.length < total,
    });
  } catch (error) {
    console.error('[GET /api/practice/history] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
