import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

/**
 * PRACTICE ROUTE CONTRACT
 * Prisma models: prisma.practiceTest (@@map "practice_tests")
 * NEVER use: prisma.generatedPracticeTest
 */

export async function GET(request: NextRequest) {
  try {
    const childId = request.nextUrl.searchParams.get('childId');
    const subject = request.nextUrl.searchParams.get('subject');
    const complexity = request.nextUrl.searchParams.get('complexity');
    const query = request.nextUrl.searchParams.get('query');

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 });
    }

    const where: Record<string, any> = { childId };
    if (subject && subject !== 'all') where.subject = subject;
    if (complexity && complexity !== 'all') where.complexity = complexity;
    if (query && query.trim()) {
      where.topic = { contains: query.trim(), mode: 'insensitive' };
    }

    const tests = await prisma.practiceTest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        subject: true,
        topic: true,
        complexity: true,
        totalMarks: true,
        durationMins: true,
        createdAt: true,
        attempts: {
          where: { childId, completedAt: { not: null } },
          select: { score: true },
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    const results = tests.map((t) => {
      const scores = t.attempts.map((a) => a.score ?? 0);
      return {
        id: t.id,
        subject: t.subject,
        topic: t.topic,
        complexity: t.complexity,
        totalMarks: t.totalMarks,
        durationMins: t.durationMins,
        createdAt: t.createdAt.toISOString(),
        attemptCount: t.attempts.length,
        bestScore: scores.length > 0 ? Math.max(...scores) : null,
        lastScore: scores.length > 0 ? scores[0] : null,
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[GET /api/practice/search] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
