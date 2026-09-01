import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

const FEATURE_KEY = 'gamification_disabled'
const PARENT_ROLE = 'PARENT'

function readParentId(request: NextRequest): string | null {
  return (
    request.nextUrl.searchParams.get('parentId') ||
    request.nextUrl.searchParams.get('userId') ||
    request.headers.get('x-user-id')
  )
}

export async function GET(request: NextRequest) {
  const parentId = readParentId(request)
  if (!parentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const row = await prisma.userFeatureAccess.findUnique({
    where: {
      uq_user_feature: {
        userId: parentId,
        userRole: PARENT_ROLE,
        feature: FEATURE_KEY,
      },
    },
    select: { isEnabled: true },
  }).catch(() => null)

  return NextResponse.json({ gamificationDisabled: row?.isEnabled ?? false })
}

export async function POST(request: NextRequest) {
  const parentId = readParentId(request)
  if (!parentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as { gamificationDisabled?: boolean }
  if (typeof body.gamificationDisabled !== 'boolean') {
    return NextResponse.json({ error: 'gamificationDisabled must be boolean' }, { status: 400 })
  }

  await prisma.userFeatureAccess.upsert({
    where: {
      uq_user_feature: {
        userId: parentId,
        userRole: PARENT_ROLE,
        feature: FEATURE_KEY,
      },
    },
    create: {
      userId: parentId,
      userRole: PARENT_ROLE,
      feature: FEATURE_KEY,
      isEnabled: body.gamificationDisabled,
    },
    update: {
      isEnabled: body.gamificationDisabled,
    },
  })

  return NextResponse.json({ ok: true, gamificationDisabled: body.gamificationDisabled })
}
