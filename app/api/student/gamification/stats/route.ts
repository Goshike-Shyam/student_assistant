import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getMonthlyXP } from '@/lib/gamification/xp'

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
  if (!childId) {
    return NextResponse.json({ monthlyXP: 0, streak: 0, enabled: true })
  }

  const prefs = await prisma.studentPreferences.findUnique({
    where: { childId },
    select: { gamificationOn: true },
  }).catch(() => null)

  if (prefs?.gamificationOn === false) {
    return NextResponse.json({ monthlyXP: 0, streak: 0, enabled: false })
  }

  const child = await prisma.user.findUnique({
    where: { id: childId },
    select: { parentEmail: true },
  }).catch(() => null)

  if (child?.parentEmail) {
    const parent = await prisma.user.findFirst({
      where: { email: child.parentEmail },
      select: { id: true },
    }).catch(() => null)

    if (parent?.id) {
      const flag = await prisma.userFeatureAccess.findUnique({
        where: {
          uq_user_feature: {
            userId: parent.id,
            userRole: 'PARENT',
            feature: 'gamification_disabled',
          },
        },
        select: { isEnabled: true },
      }).catch(() => null)

      if (flag?.isEnabled === true) {
        return NextResponse.json({ monthlyXP: 0, streak: 0, enabled: false })
      }
    }
  }

  const monthlyXP = await getMonthlyXP(childId).catch(() => 0)

  const streakRow = await prisma.$queryRawUnsafe(
    `
    SELECT login_streak
    FROM children
    WHERE id = $1
    LIMIT 1
    `,
    childId,
  ).catch(() => []) as Array<{ login_streak: number | null }>

  const streak = Number(streakRow[0]?.login_streak ?? 0)

  return NextResponse.json({ monthlyXP, streak, enabled: true })
}
