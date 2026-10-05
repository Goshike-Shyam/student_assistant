export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED'

export function isTrialActive(trialEndsAt: Date | string | null | undefined): boolean {
  if (!trialEndsAt) return false
  return new Date() < new Date(trialEndsAt)
}

export function isSubscriptionActive(
  status: string | null | undefined,
  trialEndsAt: Date | string | null | undefined,
): boolean {
  if (status === 'ACTIVE') return true
  if (status === 'TRIAL') {
    return isTrialActive(trialEndsAt)
  }
  return false
}

export function getDaysRemaining(trialEndsAt: Date | string | null | undefined): number {
  if (!trialEndsAt) return 0
  const ms = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export function getTrialBannerMessage(trialEndsAt: Date | string | null | undefined): string | null {
  const days = getDaysRemaining(trialEndsAt)
  if (days <= 0) return null
  if (days === 1) return 'Your free trial ends today. Subscribe to keep access.'
  if (days <= 3) return `${days} days left in your free trial.`
  return null
}
