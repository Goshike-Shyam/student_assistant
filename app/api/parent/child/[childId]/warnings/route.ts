import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOwnedChildAccess } from '@/lib/parent-child-guard'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ childId: string }> },
) {
  const { childId } = await params
  const access = await getOwnedChildAccess(childId)

  if (access.unauthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const child = access.child

  if (!child) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const warnings = await prisma.searchQuery.findMany({
    where: {
      studentId: child.id,
      isFlagged: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      query: true,
      flagReason: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    warnings: warnings.map((warning) => ({
      id: warning.id,
      queryText: warning.query.slice(0, 80) + (warning.query.length > 80 ? '...' : ''),
      flagReason: warning.flagReason ?? 'Sensitive content blocked',
      date: warning.createdAt.toISOString(),
    })),
    totalCount: warnings.length,
  })
}
