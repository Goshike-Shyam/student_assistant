/**
 * XP HELPER CONTRACT
 * awardXP() is fire-and-forget - never throws,
 * never blocks the calling request.
 * Checks gamification enabled for child + parent.
 * Checks badge triggers after every XP award.
 * All values from config.ts - never hardcoded.
 */

import { prisma } from '@/lib/prismaClient'
import { XP_ACTIONS, type XPAction, BADGES, GAMIFICATION_ENABLED } from './config'

function currentMonthYear(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function normalizeChildId(childId: bigint | string): string {
  return typeof childId === 'bigint' ? childId.toString() : childId
}

async function parentGamificationDisabled(childId: string): Promise<boolean> {
  try {
    const rows = (await prisma.$queryRawUnsafe(
      `
      SELECT p.gamification_disabled
      FROM children c
      JOIN parents p ON p.id = c.parent_id
      WHERE c.id = $1
      LIMIT 1
      `,
      childId,
    )) as Array<{ gamification_disabled: boolean | number | null }>

    if (rows.length) {
      const value = rows[0].gamification_disabled
      return value === true || value === 1
    }

    // Fallback for current app schema: parent-level preference in userFeatureAccess.
    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { parentEmail: true },
    })
    if (!child?.parentEmail) return false

    const parent = await prisma.user.findFirst({
      where: { email: child.parentEmail },
      select: { id: true },
    })
    if (!parent) return false

    const feature = await prisma.userFeatureAccess.findUnique({
      where: {
        uq_user_feature: {
          userId: parent.id,
          userRole: 'PARENT',
          feature: 'gamification_disabled',
        },
      },
      select: { isEnabled: true },
    })

    return feature?.isEnabled === true
  } catch {
    return false
  }
}

async function isGamificationEnabled(childId: string): Promise<boolean> {
  if (!GAMIFICATION_ENABLED) return false

  try {
    const prefs = await prisma.studentPreferences.findUnique({
      where: { childId },
      select: { gamificationOn: true },
    })
    if (prefs && !prefs.gamificationOn) return false

    if (await parentGamificationDisabled(childId)) return false

    return true
  } catch {
    return false
  }
}

export async function awardXP(
  childId: bigint | string,
  action: XPAction,
  referenceId?: string,
): Promise<void> {
  const normalizedChildId = normalizeChildId(childId)

  // Fire and forget - never blocks request:
  void (async () => {
    try {
      if (!(await isGamificationEnabled(normalizedChildId))) return

      const xp = XP_ACTIONS[action]
      const monthYear = currentMonthYear()

      await prisma.studentXpLog.create({
        data: {
          childId: normalizedChildId,
          action,
          xpEarned: xp,
          referenceId: referenceId ?? null,
          monthYear,
        },
      })

      await checkBadges(normalizedChildId, action)

      console.log(`[XP] +${xp} for child ${normalizedChildId} - ${action}`)
    } catch (err) {
      console.error('[XP] Award failed:', err)
    }
  })()
}

export async function getMonthlyXP(childId: bigint | string): Promise<number> {
  const normalizedChildId = normalizeChildId(childId)
  try {
    const result = await prisma.studentXpLog.aggregate({
      where: {
        childId: normalizedChildId,
        monthYear: currentMonthYear(),
      },
      _sum: { xpEarned: true },
    })
    return result._sum.xpEarned ?? 0
  } catch {
    return 0
  }
}

async function checkBadges(childId: string, action: XPAction): Promise<void> {
  const triggered = BADGES.filter((b) => b.trigger === action)
  if (triggered.length === 0) return

  for (const badge of triggered) {
    const existing = await prisma.studentBadge.findUnique({
      where: {
        uq_child_badge: {
          childId,
          badgeId: badge.id,
        },
      },
    })
    if (existing) continue

    const count = await prisma.studentXpLog.count({
      where: { childId, action },
    })

    if (count >= badge.threshold) {
      await prisma.studentBadge.create({
        data: { childId, badgeId: badge.id },
      })
      console.log(`[Badge] ${badge.id} awarded to child ${childId}`)
    }
  }
}
