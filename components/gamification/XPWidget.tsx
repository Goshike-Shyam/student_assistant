'use client'

import { useEffect, useState } from 'react'
import { getLevel, getLevelProgress, getNextLevel } from '@/lib/gamification/config'

export function XPWidget() {
  const [xp, setXP] = useState(0)
  const [streak, setStreak] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const childId = localStorage.getItem('userId')
    const url = childId
      ? `/api/student/gamification/stats?childId=${encodeURIComponent(childId)}`
      : '/api/student/gamification/stats'

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setXP(d.monthlyXP ?? 0)
        setStreak(d.streak ?? 0)
        setEnabled(d.enabled !== false)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div
        className="h-16 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse mx-3 mb-3"
        aria-hidden="true"
      />
    )

  if (!enabled) return null

  const level = getLevel(xp)
  const nextLvl = getNextLevel(xp)
  const progress = getLevelProgress(xp)

  const r = 24
  const circ = 2 * Math.PI * r
  const dash = (progress / 100) * circ

  return (
    <div className="mx-3 mb-3 p-3 rounded-xl bg-white/10 border border-white/20">
      <div className="flex items-center gap-3">
        <div
          className="relative flex-shrink-0"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Level ${level.level} - ${progress}% to next`}
        >
          <svg width="58" height="58" viewBox="0 0 58 58">
            <circle
              cx="29"
              cy="29"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="5"
            />
            <circle
              cx="29"
              cy="29"
              r={r}
              fill="none"
              stroke="#818cf8"
              strokeWidth="5"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 29 29)"
            />
            <text x="29" y="26" textAnchor="middle" fontSize="11" fontWeight="500" fill="white">
              Lv{level.level}
            </text>
            <text x="29" y="38" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)">
              {level.label.slice(0, 6)}
            </text>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/90">{xp} XP this month</span>
            {streak > 0 && (
              <span className="text-xs text-amber-300 font-medium" aria-label={`${streak} day streak`}>
                🔥{streak}
              </span>
            )}
          </div>
          {nextLvl ? (
            <p className="text-xs text-white/50 mt-0.5 truncate">
              {nextLvl.minXP - xp} XP to {nextLvl.label}
            </p>
          ) : (
            <p className="text-xs text-amber-300 mt-0.5">Max level reached! 🏆</p>
          )}
        </div>
      </div>
    </div>
  )
}
