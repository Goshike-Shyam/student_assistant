'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Award, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSubjectLabel } from '@/lib/subjects/config'

function getLight(avg: number) {
  if (avg >= 75) {
    return {
      color: 'green',
      label: 'Excellent',
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      encouragement: '🌟 Outstanding performance! Keep up this brilliant work.',
      barColor: '#10B981',
    }
  }

  if (avg >= 50) {
    return {
      color: 'amber',
      label: 'Good',
      bg: 'bg-amber-50 dark:bg-amber-950',
      border: 'border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      encouragement: '👍 Good progress! A little more practice will make a big difference.',
      barColor: '#F59E0B',
    }
  }

  return {
    color: 'red',
    label: 'Needs Practice',
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    encouragement: '💪 Every expert was once a beginner! More practice will show results soon.',
    barColor: '#EF4444',
  }
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') {
    return <TrendingUp size={16} className="text-green-500" aria-label="Improving" />
  }
  if (trend === 'down') {
    return <TrendingDown size={16} className="text-red-400" aria-label="Declining" />
  }
  return <Minus size={16} className="text-gray-400" aria-label="Stable" />
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-600 dark:bg-slate-700">
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-bold text-gray-900 dark:text-gray-100">{payload[0].value}%</p>
    </div>
  )
}

export default function ProgressPage() {
  const params = useSearchParams()
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([])
  const [selectedChild, setSelectedChild] = useState('')
  const [progress, setProgress] = useState<{ subjects?: Array<{ subjectId: string; avg: number; trend: string; scores: Array<{ score: number }> }> } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetch('/api/parent/dashboard', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return
        const kids = data.children ?? []
        setChildren(kids)
        const childFromParam = params.get('child')
        setSelectedChild(childFromParam ?? kids[0]?.id ?? '')
      })
      .catch((error) => {
        console.error('[parent/progress] dashboard load failed', error)
      })

    return () => {
      active = false
    }
  }, [params])

  useEffect(() => {
    if (!selectedChild) return

    setLoading(true)
    fetch(`/api/parent/child/${selectedChild}/progress`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => {
        setProgress(payload)
      })
      .catch((error) => {
        console.error('[parent/progress] child progress failed', error)
        setProgress({ subjects: [] })
      })
      .finally(() => setLoading(false))
  }, [selectedChild])

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Progress Report</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Last 5 practice test scores per subject</p>
        </div>

        {children.length > 1 && (
          <select
            value={selectedChild}
            onChange={(event) => setSelectedChild(event.target.value)}
            className="min-h-[44px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100"
            aria-label="Select child"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-700" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {progress?.subjects?.length ? (
            progress.subjects.map((subject) => {
              const light = getLight(subject.avg)

              return (
                <div key={subject.subjectId} className={cn('rounded-2xl border p-5', light.bg, light.border)}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Award size={18} className="text-gray-500" aria-hidden="true" />
                      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {getSubjectLabel(subject.subjectId) ?? subject.subjectId}
                      </h2>
                      <TrendIcon trend={subject.trend} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', light.badge)}>
                        {light.label}
                      </span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Avg: {Math.round(subject.avg)}%</span>
                    </div>
                  </div>

                  {subject.scores?.length > 0 ? (
                    <div aria-label={`Score trend for ${subject.subjectId}`}>
                      <ResponsiveContainer width="100%" height={140}>
                        <BarChart
                          data={subject.scores.map((entry, index) => ({ name: `Test ${index + 1}`, score: entry.score }))}
                          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                            {subject.scores.map((_, index) => (
                              <Cell key={`${subject.subjectId}-${index}`} fill={light.barColor} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-gray-400">No practice tests yet for this subject</p>
                  )}

                  <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">{light.encouragement}</p>
                </div>
              )
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400">
              No progress data available for this child yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
