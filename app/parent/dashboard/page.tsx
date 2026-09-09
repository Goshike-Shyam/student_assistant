'use client'

import { AlertTriangle, BookOpen, ClipboardCheck, Flame, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getSubjectLabel } from '@/lib/subjects/config'

interface ChildStat {
  id: string
  name: string
  grade: string
  board: string
  subjects?: string[]
  loginStreak?: number
  lastLogin?: string | null
  queryCount?: number
  practiceCount?: number
  avgScore?: number
  flaggedCount?: number
}

function trafficLight(score: number) {
  if (score >= 75) {
    return {
      bg: 'bg-green-100 dark:bg-green-950',
      text: 'text-green-800 dark:text-green-200',
      dot: 'bg-green-500',
      msg: 'Excellent work! Performing very well.',
    }
  }
  if (score >= 50) {
    return {
      bg: 'bg-amber-100 dark:bg-amber-950',
      text: 'text-amber-800 dark:text-amber-200',
      dot: 'bg-amber-500',
      msg: 'Good progress! Keep practising.',
    }
  }
  return {
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-800 dark:text-red-200',
    dot: 'bg-red-400',
    msg: 'Needs more practice — you can do it!',
  }
}

function ChildCard({ child }: { child: ChildStat }) {
  const averageScore = child.avgScore ?? 0
  const queryCount = child.queryCount ?? 0
  const practiceCount = child.practiceCount ?? 0
  const flaggedCount = child.flaggedCount ?? 0
  const loginStreak = child.loginStreak ?? 0
  const subjects = child.subjects ?? []
  const light = trafficLight(averageScore)
  const hasWarning = flaggedCount > 0

  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md', hasWarning ? 'border-amber-300 dark:border-amber-700' : 'border-gray-200 dark:border-slate-700')}>
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{child.name}</h2>
          <p className="text-sm text-emerald-100 mt-0.5">Grade {child.grade} · {child.board}</p>
        </div>

        <div className="flex items-center gap-2">
          {hasWarning && (
            <a
              href={`/parent/warnings?child=${child.id}`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 text-amber-900 text-xs font-semibold hover:bg-amber-300 transition-colors"
              aria-label={`${child.flaggedCount} warnings for ${child.name}`}
            >
              <AlertTriangle size={13} aria-hidden="true" />
              {flaggedCount} Warning{flaggedCount > 1 ? 's' : ''}
            </a>
          )}

          {loginStreak > 0 && (
            <div className="flex items-center gap-1 text-amber-300" title={`${loginStreak} day streak`} aria-label={`${loginStreak} day login streak`}>
              <Flame size={16} aria-hidden="true" />
              <span className="text-sm font-bold">{loginStreak}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-700 border-b border-gray-100 dark:border-slate-700">
        {[
          { icon: MessageSquare, value: queryCount, label: 'Queries' },
          { icon: ClipboardCheck, value: practiceCount, label: 'Tests' },
          { icon: TrendingUp, value: averageScore > 0 ? `${Math.round(averageScore)}%` : '—', label: 'Avg Score' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center py-3 px-2">
            <Icon size={15} className="text-gray-400 mb-1" aria-hidden="true" />
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</span>
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Performance by Subject</p>

        {subjects.length === 0 ? (
          <p className="text-sm text-gray-400">No subjects registered</p>
        ) : (
          <div className="space-y-2">
            {subjects.slice(0, 4).map((subId) => (
              <div key={subId} className={cn('flex items-center justify-between px-3 py-2 rounded-lg text-sm', light.bg)}>
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', light.dot)} aria-hidden="true" />
                  <span className={cn('font-medium', light.text)}>{getSubjectLabel(subId) ?? subId}</span>
                </div>
                <span className={cn('text-xs', light.text)}>{light.msg}</span>
              </div>
            ))}
          </div>
        )}

        <a
          href={`/parent/progress?child=${child.id}`}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
        >
          <BookOpen size={14} aria-hidden="true" />
          View Full Progress Report
        </a>
      </div>
    </div>
  )
}

export default function ParentDashboardPage() {
  const [data, setData] = useState<{ parentName: string; children: ChildStat[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/parent/dashboard', { cache: 'no-store' })
      .then((response) => {
        if (response.status === 401) {
          window.location.replace('/parent/login')
          return null
        }
        return response.json()
      })
      .then((payload) => {
        if (payload) setData(payload)
      })
      .catch(() => setError('Failed to load. Refresh.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-80 rounded-2xl bg-gray-100 dark:bg-slate-700 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">{error}</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome, {data?.parentName}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Here is how your {data?.children?.length === 1 ? 'child is' : 'children are'} doing this month
        </p>
      </div>

      {data?.children?.length === 0 ? (
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <Users size={32} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">No Children Linked Yet</h2>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Your account has been created successfully. Please contact your school administrator to link your child's account to this parent portal.
          </p>
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            Once linked, you will see your child's progress, practice tests, and learning activity here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {data?.children?.map((child) => <ChildCard key={child.id} child={child} />)}
        </div>
      )}
    </div>
  )
}
