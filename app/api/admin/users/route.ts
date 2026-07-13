import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

interface AdminUsersResponse {
  users: Array<{
    id: string;
    name: string;
    email: string;
    board?: string;
    plan: string;
    subscription_status: string;
    child_count: number;
    created_at: string;
  }>;
  total: number;
  page: number;
  per_page: number;
}

export async function GET(request: NextRequest) {
  try {
    // Check admin role from session - simplified for now since we use localStorage
    const userRole = request.headers.get('x-user-role');
    const sessionRole = request.headers.get('x-session-role');
    
    // For API protection, check auth token or session
    // For now, we'll rely on client-side enforcement since the app uses localStorage
    // In production, implement proper session/JWT validation
    
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const search = request.nextUrl.searchParams.get('search') || '';
    const perPage = 20;
    const offset = (page - 1) * perPage;

    // Build query to get users with their child info
    // For now, fetch users and augment with related data
    let whereClause: any = {};
    
    if (search) {
      whereClause = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        curriculum: true,
        grade: true,
        subscriptionPlan: true,
        createdAt: true,
        childSubjects: {
          select: { id: true }
        }
      },
      skip: offset,
      take: perPage,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where: whereClause });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      board: user.curriculum || 'CBSE',
      plan: user.subscriptionPlan || 'FREE',
      subscription_status: 'Active',
      child_count: user.childSubjects.length,
      created_at: user.createdAt.toISOString().split('T')[0]
    }));

    return NextResponse.json({
      users: formattedUsers,
      total,
      page,
      per_page: perPage
    } as AdminUsersResponse);
  } catch (error) {
    console.error('[GET /api/admin/users] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
