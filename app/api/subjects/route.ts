import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { getSubjectsByBoardAndGrade } from '@/lib/subjects-seed';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const board = searchParams.get('board');
    const grade = searchParams.get('grade');

    // If userId is provided, fetch user-specific registered subjects from DB
    if (userId) {
      try {
        const childSubjects = await prisma.childSubject.findMany({
          where: { childId: userId },
          select: { subjectName: true },
          orderBy: { subjectName: 'asc' },
        });

        const subjects = childSubjects.map((cs) => cs.subjectName);
        
        // Return subjects from DB (may be empty if not registered yet)
        return NextResponse.json({
          subjects: subjects,
          source: 'database',
        });
      } catch (dbError) {
        // Log the database error for debugging
        console.error('[GET /api/subjects] Database error:', dbError);
        
        // Return empty subjects instead of error (graceful degradation)
        // This prevents 500 errors from blocking the UI
        return NextResponse.json({
          subjects: [],
          source: 'error',
          message: 'Could not fetch subjects from database',
        }, { status: 200 });
      }
    }

    // If board and grade are provided, fetch curriculum subjects from seed data
    if (!board || !grade) {
      return NextResponse.json(
        { error: 'Missing board or grade parameter' },
        { status: 400 }
      );
    }

    const gradeNum = parseInt(grade, 10);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      return NextResponse.json(
        { error: 'Invalid grade number. Must be between 1 and 12' },
        { status: 400 }
      );
    }

    const subjects = getSubjectsByBoardAndGrade(board, gradeNum);

    if (subjects.length === 0) {
      return NextResponse.json(
        { error: 'No subjects found for the given board and grade' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      board,
      grade: gradeNum,
      subjects,
      source: 'curriculum',
    });
  } catch (error) {
    console.error('[GET /api/subjects] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
