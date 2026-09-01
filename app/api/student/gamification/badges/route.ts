import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

function resolveChildId(request: NextRequest): string | null {
  return (
    request.nextUrl.searchParams.get('childId') ||
    request.nextUrl.searchParams.get('userId') ||
    request.headers.get('x-user-id')
  )
}

export async function GET(request: NextRequest) {
  const childId = resolveChildId(request)
  if (!childId) return Response.json({ badges: [] })

  const badges = await prisma.studentBadge.findMany({
    where: { childId },
    select: { badgeId: true, awardedAt: true },
    orderBy: { awardedAt: 'desc' },
  })

  return Response.json({ badges })
}
