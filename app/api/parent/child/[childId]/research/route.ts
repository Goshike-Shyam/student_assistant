import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOwnedChildAccess } from '@/lib/parent-child-guard'
import { getSubjectLabel } from '@/lib/subjects/config'

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

  const queries = await prisma.searchQuery.findMany({
    where: { studentId: child.id },
    select: {
      id: true,
      query: true,
      subject: true,
      isFlagged: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({
    queries: queries.map((query) => ({
      id: query.id,
      text: query.query,
      subject: getSubjectLabel(query.subject ?? '') ?? query.subject,
      isFlagged: query.isFlagged,
      date: query.createdAt.toISOString(),
    })),
  })
}