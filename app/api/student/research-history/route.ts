import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export const dynamic = 'force-dynamic';

function parseSourceMeta(meta: string) {
  try {
    const parsed = JSON.parse(meta);
    return {
      title: String(parsed?.title || 'Source'),
      publisher: String(parsed?.publisher || 'Website'),
      type: parsed?.type === 'article' || parsed?.type === 'textbook' || parsed?.type === 'video'
        ? parsed.type
        : 'website',
    };
  } catch {
    return {
      title: meta || 'Source',
      publisher: 'Website',
      type: 'website' as const,
    };
  }
}

export async function GET(request: NextRequest) {
  const childId = request.nextUrl.searchParams.get('userId') || request.headers.get('x-user-id');
  if (!childId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const limitRaw = Number(request.nextUrl.searchParams.get('limit') ?? '30');
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(50, Math.trunc(limitRaw))) : 30;

  try {
    const searches = await prisma.searchQuery.findMany({
      where: { studentId: childId },
      include: {
        responses: {
          select: {
            response: true,
            resourceLinks: true,
            sourceLinks: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const queries = searches.map((search) => {
      const latestResponse = search.responses[0];
      const sourceLinks = latestResponse?.sourceLinks || [];
      const metaLinks = latestResponse?.resourceLinks || [];
      const sources = sourceLinks.map((url, index) => {
        const meta = parseSourceMeta(metaLinks[index] || '');
        return {
          title: meta.title,
          url,
          publisher: meta.publisher,
          type: meta.type,
        };
      });

      return {
        id: search.id,
        subject: search.subject || 'General',
        queryText: search.query,
        response: latestResponse?.response || '',
        sources,
        createdAt: search.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ queries });
  } catch (error) {
    console.error('[GET /api/student/research-history] error:', error);
    return NextResponse.json({ queries: [] });
  }
}
