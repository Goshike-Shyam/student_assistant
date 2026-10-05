import Link from 'next/link'
import { getDaysRemaining } from '@/lib/trial'

type TrialBannerProps = {
  trialEndsAt?: Date | string | null
  subscriptionStatus?: string | null
}

export function TrialBanner({ trialEndsAt, subscriptionStatus }: TrialBannerProps) {
  if (subscriptionStatus !== 'TRIAL') return null
  const daysLeft = getDaysRemaining(trialEndsAt)
  if (daysLeft <= 0 || daysLeft > 3) return null

  const message =
    daysLeft === 1
      ? 'Your trial ends today. Subscribe now to avoid losing access.'
      : `${daysLeft} days left in your free trial.`

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
        <p className="text-sm font-medium">{message}</p>
        <Link
          href="/subscribe"
          className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          Subscribe
        </Link>
      </div>
    </div>
  )
}
