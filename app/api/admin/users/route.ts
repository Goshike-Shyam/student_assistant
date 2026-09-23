import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { getAdminSession } from '@/lib/admin-auth';
import { RATE_LIMITS, getRateLimitUsage } from '@/lib/rate-limit';

/**
 * ADMIN AUTH CONTRACT
 * ONLY getAdminSession() - reads sa-admin-session
 * NEVER getServerSession() - reads student cookie
 * Cross-tab student login must NOT affect admin
 */

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
    rate_limit_usage: {
      RESEARCH: { childCount: number; ipCount: number; childLimit: number; ipLimit: number };
      PODCAST: { childCount: number; ipCount: number; childLimit: number; ipLimit: number };
    };
  }>;
  total: number;
  page: number;
  per_page: number;
}

export async function GET(request: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const search = request.nextUrl.searchParams.get('search') || '';
    const perPage = 20;
    const offset = (page - 1) * perPage;

    // Build query to get users with their child info
    // For now, fetch users and augment with related data
    let whereClause: any = {
      role: { not: 'ADMIN' },
    };
    
    if (search) {
      whereClause = {
        role: { not: 'ADMIN' },
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

    const formattedUsers = await Promise.all(users.map(async (user) => {
      const [researchUsage, podcastUsage] = await Promise.all([
        getRateLimitUsage('RESEARCH', user.id, request),
        getRateLimitUsage('PODCAST', user.id, request),
      ]);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        board: user.curriculum || 'CBSE',
        plan: user.subscriptionPlan || 'FREE',
        subscription_status: 'Active',
        child_count: user.childSubjects.length,
        created_at: user.createdAt.toISOString().split('T')[0],
        rate_limit_usage: {
          RESEARCH: {
            ...researchUsage,
            childLimit: RATE_LIMITS.RESEARCH.perChild,
            ipLimit: RATE_LIMITS.RESEARCH.perIp,
          },
          PODCAST: {
            ...podcastUsage,
            childLimit: RATE_LIMITS.PODCAST.perChild,
            ipLimit: RATE_LIMITS.PODCAST.perIp,
          },
        },
      };
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
