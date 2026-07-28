import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { getAdminSession } from '@/lib/admin-auth';

/**
 * ADMIN AUTH CONTRACT
 * ONLY getAdminSession() - reads sa-admin-session
 * NEVER getServerSession() - reads student cookie
 * Cross-tab student login must NOT affect admin
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        curriculum: true,
        grade: true,
        subscriptionPlan: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        childSubjects: {
          select: {
            id: true,
            subjectName: true,
            createdAt: true
          }
        },
        generatedAssignments: {
          select: {
            id: true,
            subject: true,
            title: true,
            createdAt: true,
            score: true,
            totalMarks: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      board: user.curriculum || 'CBSE',
      grade: user.grade,
      plan: user.subscriptionPlan || 'FREE',
      location: user.location,
      joined: user.createdAt.toISOString().split('T')[0],
      subjects: user.childSubjects.map(s => s.subjectName),
      recent_assignments: user.generatedAssignments.map(a => ({
        title: a.title,
        subject: a.subject,
        score: a.score,
        total: a.totalMarks,
        date: a.createdAt.toISOString().split('T')[0]
      }))
    });
  } catch (error) {
    console.error('[GET /api/admin/users/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
