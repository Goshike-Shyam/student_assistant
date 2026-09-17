'use client'

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
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChildData } from '@/hooks/useParentData'
import { ChildSwitcher } from '@/components/parent/ChildSwitcher'

const LIGHT_COLORS = {
  green: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    bar: '#10B981',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    bar: '#F59E0B',
    badge: 'bg-amber-100 text-amber-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    bar: '#EF4444',
    badge: 'bg-red-100 text-red-800',
  },
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp size={15} className="text-green-500" aria-label="Improving" />
  if (trend === 'down') return <TrendingDown size={15} className="text-red-400" aria-label="Declining" />
  return <Minus size={15} className="text-gray-400" aria-label="Stable" />
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-600 dark:bg-slate-700">
      <p className="font-bold text-gray-900 dark:text-gray-100">{payload[0].value}%</p>
    </div>
  )
}

export default function ProgressPage() {
  const {
    children,
    selectedChildId,
    setSelectedChildId,
    childData,
    loading,
    error,
  } = useChildData<{
    subjects?: Array<{
      subjectId: string
      subjectLabel?: string
      avg: number
      trend: string
      trafficLight: 'green' | 'amber' | 'red'
      encouragement?: string
      scores: Array<{ score: number }>
    }>
  }>('progress')

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Progress Report</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Last 5 practice test scores per subject
        </p>
      </div>

      <ChildSwitcher children={children} selectedChildId={selectedChildId} onChange={setSelectedChildId} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-52 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-700" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {(childData?.subjects ?? []).length === 0 ? (
            <div className="py-16 text-center text-gray-400 dark:text-gray-500">
              No practice test data yet
            </div>
          ) : (
            (childData?.subjects ?? []).map((subject) => {
              const colors = LIGHT_COLORS[subject.trafficLight] ?? LIGHT_COLORS.green

              return (
                <div key={subject.subjectId} className={cn('rounded-2xl border p-5', colors.bg, colors.border)}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {subject.subjectLabel ?? subject.subjectId}
                      </h2>
                      <TrendIcon trend={subject.trend} />
                    </div>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', colors.badge)}>
                      Avg {subject.avg}%
                    </span>
                  </div>

                  {subject.scores?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart
                        data={subject.scores.map((entry, index) => ({ name: `T${index + 1}`, score: entry.score }))}
                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {subject.scores.map((_, index) => (
                            <Cell key={`${subject.subjectId}-${index}`} fill={colors.bar} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-4 text-center text-sm text-gray-400">No tests taken yet</p>
                  )}

                  <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {subject.encouragement ?? 'Keep going!'}
                  </p>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
