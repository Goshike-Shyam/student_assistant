/**
 * FEATURE ACCESS CONTRACT
 * Single source of truth for premium feature checks.
 * PODCAST is the first premium feature.
 * All checks go through this helper.
 * Returns false on DB error.
 */
import { prisma } from './prismaClient'

export type PremiumFeature = 'PODCAST'
export type FeatureUserRole = 'STUDENT' | 'TEACHER'

export async function hasFeatureAccess(
  userId: string,
  userRole: FeatureUserRole,
  feature: PremiumFeature
): Promise<boolean> {
  try {
    const row = await prisma.userFeatureAccess.findUnique({
      where: {
        uq_user_feature: { userId, userRole, feature },
      },
      select: { isEnabled: true },
    })

    return row?.isEnabled ?? false
  } catch (err) {
    console.error('[FeatureAccess] check failed:', err)
    return false
  }
}

export async function setFeatureAccess(
  userId: string,
  userRole: FeatureUserRole,
  feature: PremiumFeature,
  isEnabled: boolean,
  enabledBy: bigint,
  notes?: string | null
): Promise<void> {
  await prisma.userFeatureAccess.upsert({
    where: {
      uq_user_feature: { userId, userRole, feature },
    },
    create: {
      userId,
      userRole,
      feature,
      isEnabled,
      enabledBy,
      enabledAt: isEnabled ? new Date() : null,
      notes: notes ?? null,
    },
    update: {
      isEnabled,
      enabledBy,
      enabledAt: isEnabled ? new Date() : null,
      notes: notes ?? null,
    },
  })
}

export async function getFeatureAccessList(
  feature: PremiumFeature,
  userRole: FeatureUserRole
) {
  return prisma.userFeatureAccess.findMany({
    where: { feature, userRole },
    orderBy: { updatedAt: 'desc' },
  })
}
