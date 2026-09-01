import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

function monthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function safeParseAvatarJson(value: string | null): any {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const classIdRaw = request.nextUrl.searchParams.get('classId')
  const currentUserId = request.nextUrl.searchParams.get('userId') || request.headers.get('x-user-id')
  if (!classIdRaw) return Response.json({ entries: [] })

  let classId: bigint
  try {
    classId = BigInt(classIdRaw)
  } catch {
    return Response.json({ entries: [] })
  }

  const month = monthKey()

  const enrollments = await prisma.classEnrollment.findMany({
    where: { classId },
    select: {
      childId: true,
      child: { select: { name: true } },
    },
  })

  const entries = await Promise.all(
    enrollments.map(async (e) => {
      const [xpAgg, prefs] = await Promise.all([
        prisma.studentXpLog.aggregate({
          where: { childId: e.childId, monthYear: month },
          _sum: { xpEarned: true },
        }),
        prisma.studentPreferences.findUnique({
          where: { childId: e.childId },
          select: { avatarJson: true },
        }),
      ])

      return {
        childId: e.childId,
        name: e.child.name,
        xp: xpAgg._sum.xpEarned ?? 0,
        avatarJson: safeParseAvatarJson(prefs?.avatarJson ?? null),
      }
    }),
  )

  const ranked = entries
    .sort((a, b) => b.xp - a.xp)
    .map((e, i) => ({
      rank: i + 1,
      name: e.name,
      xp: e.xp,
      avatarJson: e.avatarJson,
      isCurrentUser: currentUserId ? e.childId === currentUserId : false,
    }))

  return Response.json({ entries: ranked })
}
