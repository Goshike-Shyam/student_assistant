import { NextRequest, NextResponse } from 'next/server'
import { getParentSession } from '@/lib/parent-auth'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ childId: string }> },
) {
  const { childId } = await params
  const session = await getParentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parent = await prisma.user.findUnique({
    where: { id: session.parentId },
    select: { id: true, email: true },
  })

  if (!parent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const child = await prisma.user.findFirst({
    where: {
      id: childId,
      role: 'STUDENT',
      parentEmail: parent.email,
    },
    select: { id: true },
  })

  if (!child) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
      text: warning.query,
      reason: warning.flagReason ?? 'Sensitive content blocked',
      createdAt: warning.createdAt.toISOString(),
    })),
  })
}
