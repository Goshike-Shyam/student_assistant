/**
 * CREDIT USER RESOLUTION CONTRACT — DO NOT BREAK
 * userId in ai_credit_logs is a User.id UUID (from students using the app)
 * We resolve names/emails by querying the User table with those UUIDs.
 * Never use ?? 'User' or ?? 'unknown@example.com' as fallbacks.
 * Use ?? `ID:${userId}` and ?? '—' to expose missing data clearly.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { getAdminSession } from '@/lib/admin-auth';

/**
 * ADMIN AUTH CONTRACT
 * ONLY getAdminSession() - reads sa-admin-session
 * NEVER getServerSession() - reads student cookie
 * Cross-tab student login must NOT affect admin
 */

export async function GET(request: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startDateStr = request.nextUrl.searchParams.get('startDate');
    const endDateStr = request.nextUrl.searchParams.get('endDate');
    const userId = request.nextUrl.searchParams.get('userId');
    const feature = request.nextUrl.searchParams.get('feature');
    const exportFormat = request.nextUrl.searchParams.get('export');

    // Parse dates
    const startDate = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    // Build where clause
    let whereClause: any = {
      summaryDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (userId) {
      whereClause.userId = userId;
    }

    if (feature) {
      whereClause.feature = feature;
    }

    // Fetch daily summaries
    const summaries = await prisma.aiCreditDailySummary.findMany({
      where: whereClause,
      orderBy: { summaryDate: 'asc' },
    });

    // Calculate aggregates
    const totalCalls = summaries.reduce((sum, s) => sum + s.callCount, 0);
    const totalTokens = summaries.reduce((sum, s) => sum + Number(s.totalTokens), 0);
    const totalCostUsd = summaries.reduce((sum, s) => sum + Number(s.totalCostUsd), 0);
    const avgCostPerCall = totalCalls > 0 ? totalCostUsd / totalCalls : 0;

    // Group by user (with placeholder names — resolved below)
    const byUserMap = new Map<string, any>();
    summaries.forEach(s => {
      if (!byUserMap.has(s.userId)) {
        byUserMap.set(s.userId, {
          userId: s.userId,
          userName: `ID:${s.userId}`,
          userEmail: '—',
          userRole: s.userRole,
          calls: 0,
          tokens: 0,
          costUsd: 0,
        });
      }
      const user = byUserMap.get(s.userId)!;
      user.calls += s.callCount;
      user.tokens += Number(s.totalTokens);
      user.costUsd += Number(s.totalCostUsd);
    });

    // Resolve real names/emails from the User table
    const uniqueUserIds = Array.from(byUserMap.keys());
    if (uniqueUserIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: uniqueUserIds } },
        select: { id: true, name: true, email: true },
      });
      users.forEach(u => {
        const entry = byUserMap.get(u.id);
        if (entry) {
          entry.userName = u.name;
          entry.userEmail = u.email;
        }
      });
    }

    // Group by feature
    const byFeatureMap = new Map<string, any>();
    summaries.forEach(s => {
      if (!byFeatureMap.has(s.feature)) {
        byFeatureMap.set(s.feature, {
          feature: s.feature,
          calls: 0,
          tokens: 0,
          costUsd: 0,
        });
      }
      const f = byFeatureMap.get(s.feature)!;
      f.calls += s.callCount;
      f.tokens += Number(s.totalTokens);
      f.costUsd += Number(s.totalCostUsd);
    });

    // Group by date
    const byDateMap = new Map<string, any>();
    summaries.forEach(s => {
      const dateStr = s.summaryDate.toISOString().split('T')[0];
      if (!byDateMap.has(dateStr)) {
        byDateMap.set(dateStr, {
          date: dateStr,
          calls: 0,
          tokens: 0,
          costUsd: 0,
        });
      }
      const d = byDateMap.get(dateStr)!;
      d.calls += s.callCount;
      d.tokens += Number(s.totalTokens);
      d.costUsd += Number(s.totalCostUsd);
    });

    // Format response
    if (exportFormat === 'csv') {
      // Generate CSV export
      const headers = ['Date', 'Feature', 'Calls', 'Tokens', 'Cost (USD)'];
      const rows = summaries.map(s => [
        s.summaryDate.toISOString().split('T')[0],
        s.feature,
        s.callCount,
        s.totalTokens,
        s.totalCostUsd,
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const now = new Date().toISOString().split('T')[0];

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="credits_report_${now}.csv"`,
        },
      });
    }

    // JSON response
    return NextResponse.json({
      summary: {
        totalCalls,
        totalTokens,
        totalCostUsd: Number(totalCostUsd.toFixed(6)),
        avgCostPerCall: Number(avgCostPerCall.toFixed(6)),
      },
      byUser: Array.from(byUserMap.values()),
      byFeature: Array.from(byFeatureMap.values()),
      byDate: Array.from(byDateMap.values()),
    });
  } catch (error) {
    console.error('[GET /api/admin/credits] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}
