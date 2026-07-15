import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

/**
 * PRACTICE ROUTE CONTRACT
 * Reads from: prisma.childSubject (child_subjects table)
 * childId: UUID string from User.id — no conversion needed
 */

export async function GET(request: NextRequest) {
  try {
    const childId = request.nextUrl.searchParams.get('childId');
    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 });
    }

    const subjects = await prisma.childSubject.findMany({
      where: { childId },
      select: { subjectName: true },
      orderBy: { subjectName: 'asc' },
    });

    return NextResponse.json({ subjects: subjects.map((s) => s.subjectName) });
  } catch (error) {
    console.error('[GET /api/practice/subjects] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
