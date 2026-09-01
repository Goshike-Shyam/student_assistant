'use client'

import { useEffect, useState } from 'react'

interface Props {
  compact?: boolean
}

export function StreakCounter({ compact = false }: Props) {
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/gamification/stats')
      .then((r) => r.json())
      .then((d) => setStreak(d.streak ?? 0))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="h-10 w-24 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse" aria-hidden="true" />
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-300" aria-label={`${streak} day streak`}>
        🔥 {streak}
      </span>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
      <p className="text-xs text-amber-700 dark:text-amber-300">Daily Streak</p>
      <p className="text-lg font-semibold text-amber-800 dark:text-amber-200" aria-label={`${streak} day streak`}>
        🔥 {streak} {streak === 1 ? 'day' : 'days'}
      </p>
    </div>
  )
}
