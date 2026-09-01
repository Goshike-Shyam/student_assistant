'use client'

import { useEffect, useState } from 'react'
import { AvatarSVG, DEFAULT_AVATAR } from './AvatarBuilder'

interface LeaderEntry {
  rank: number
  name: string
  xp: number
  avatarJson: any
  isCurrentUser: boolean
}

export function ClassLeaderboard({ classId }: { classId: string }) {
  const [entries, setEntries] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/student/gamification/leaderboard?classId=${encodeURIComponent(classId)}`)
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [classId])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Class XP Leaderboard - This Month
        </h3>
      </div>
      {loading ? (
        <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-400">No data yet - start earning XP!</div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-slate-700">
          {entries.map((e) => (
            <div
              key={`${e.rank}-${e.name}`}
              className={`flex items-center gap-3 px-4 py-3 ${e.isCurrentUser ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
              aria-current={e.isCurrentUser ? 'true' : undefined}
            >
              <span className="w-6 text-center text-sm flex-shrink-0" aria-label={`Rank ${e.rank}`}>
                {medals[e.rank - 1] ?? e.rank}
              </span>
              <div className="flex-shrink-0">
                <AvatarSVG config={e.avatarJson ?? DEFAULT_AVATAR} size={32} />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {e.isCurrentUser ? 'You' : e.name}
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                {e.xp} XP
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
