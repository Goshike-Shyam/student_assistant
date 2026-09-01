'use client'

import { useEffect, useState } from 'react'
import { BADGES } from '@/lib/gamification/config'

interface EarnedBadge {
  badgeId: string
}

interface Props {
  childId?: string
  compact?: boolean
}

export function BadgeShelf({ childId, compact = false }: Props) {
  const [earned, setEarned] = useState<EarnedBadge[]>([])

  useEffect(() => {
    const url = childId
      ? `/api/student/gamification/badges?childId=${encodeURIComponent(childId)}`
      : '/api/student/gamification/badges'

    fetch(url)
      .then((r) => r.json())
      .then((d) => setEarned(d.badges ?? []))
      .catch(() => {})
  }, [childId])

  const earnedIds = new Set(earned.map((e) => e.badgeId))

  if (compact)
    return (
      <div className="flex flex-wrap gap-1 px-3 pb-2">
        {BADGES.filter((b) => earnedIds.has(b.id))
          .slice(0, 5)
          .map((b) => (
            <span key={b.id} title={`${b.label}: ${b.desc}`} className="text-base" aria-label={b.label}>
              {b.emoji}
            </span>
          ))}
      </div>
    )

  return (
    <div className="grid grid-cols-5 gap-3">
      {BADGES.map((badge) => {
        const isEarned = earnedIds.has(badge.id)
        return (
          <div
            key={badge.id}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all ${
              isEarned
                ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'
                : 'bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 opacity-40'
            }`}
            title={badge.desc}
            aria-label={isEarned ? `${badge.label} - earned` : `${badge.label} - locked`}
          >
            <span className="text-2xl" aria-hidden="true">
              {isEarned ? badge.emoji : '🔒'}
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
              {badge.label}
            </span>
            {!isEarned && (
              <span className="text-xs text-gray-400 dark:text-gray-500 leading-tight">{badge.desc}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
