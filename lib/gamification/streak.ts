import { prisma } from '@/lib/prismaClient'
import { awardXP } from './xp'

function normalizeChildId(childId: bigint | string): string {
  return typeof childId === 'bigint' ? childId.toString() : childId
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function updateLoginStreak(childId: bigint | string): Promise<void> {
  const normalizedChildId = normalizeChildId(childId)

  void (async () => {
    try {
      const today = toDateKey(new Date())
      const rows = (await prisma.$queryRawUnsafe(
        `
        SELECT id, login_streak, last_login_date, longest_streak
        FROM children
        WHERE id = $1
        LIMIT 1
        `,
        normalizedChildId,
      )) as Array<{
        id: string
        login_streak: number
        last_login_date: Date | null
        longest_streak: number
      }>

      const child = rows[0]
      if (!child) return

      const last = child.last_login_date ? toDateKey(new Date(child.last_login_date)) : null
      if (last === today) return

      const yesterday = toDateKey(new Date(Date.now() - 86400000))
      const newStreak = last === yesterday ? Number(child.login_streak || 0) + 1 : 1
      const longest = Math.max(newStreak, Number(child.longest_streak || 0))

      await prisma.$executeRawUnsafe(
        `
        UPDATE children
        SET login_streak = $1,
            last_login_date = $2,
            longest_streak = $3
        WHERE id = $4
        `,
        newStreak,
        new Date(),
        longest,
        normalizedChildId,
      )

      await awardXP(normalizedChildId, 'DAILY_LOGIN')
      if (newStreak === 7) await awardXP(normalizedChildId, 'STREAK_7_DAY')
      if (newStreak === 30) await awardXP(normalizedChildId, 'STREAK_30_DAY')
      if (newStreak === 100) await awardXP(normalizedChildId, 'STREAK_100_DAY')
    } catch (err) {
      console.error('[Streak] update failed:', err)
    }
  })()
}
