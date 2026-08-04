'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts'
import { useTheme } from '@/lib/theme'

interface ProgressResponse {
  rangeDays: number
  metrics: {
    testsTaken: number
    avgScore: number
    totalAttempts: number
    currentStreak: number
    assignmentsCompleted: number
    assignmentsTotal: number
    avgTimeSpentMinutes: number
  }
  charts: {
    scoreTrend: Array<{ date: string; avgScore: number }>
    subjectBreakdown: Array<{
      subject: string
      attempts: number
      avgScore: number
      bestScore: number
    }>
    completionDonut: { completed: number; pending: number }
    activityHeatmap: Array<{ date: string; intensity: number }>
  }
  weeklyActivity: Array<{ day: string; activity: number }>
  weakTopics: Array<{ subject: string; avgScore: number; recommendation: string }>
  links: {
    assignmentHistory: string
    practice: string
  }
}

function heatColor(intensity: number, isDark: boolean): string {
  if (isDark) {
    if (intensity <= 0) return 'bg-slate-800'
    if (intensity === 1) return 'bg-cyan-900'
    if (intensity === 2) return 'bg-cyan-700'
    if (intensity === 3) return 'bg-cyan-500'
    return 'bg-cyan-300'
  }

  if (intensity <= 0) return 'bg-slate-100'
  if (intensity === 1) return 'bg-blue-200'
  if (intensity === 2) return 'bg-blue-300'
  if (intensity === 3) return 'bg-blue-500'
  return 'bg-blue-700'
}

export default function ProgressPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState<30 | 60 | 90>(30)
  const [data, setData] = useState<ProgressResponse | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      window.location.href = '/login'
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/student/progress?days=${days}&userId=${encodeURIComponent(userId)}`, {
      headers: { 'x-user-id': userId },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load progress')
        return r.json()
      })
      .then((payload: ProgressResponse) => {
        if (!cancelled) setData(payload)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your progress right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [days])

  const completionPct = useMemo(() => {
    if (!data || data.metrics.assignmentsTotal === 0) return 0
    return Math.round((data.metrics.assignmentsCompleted / data.metrics.assignmentsTotal) * 100)
  }, [data])

  const csvHref = useMemo(() => {
    if (!data) return '#'
    const rows = [
      ['Metric', 'Value'],
      ['Tests Taken', String(data.metrics.testsTaken)],
      ['Average Score', `${data.metrics.avgScore}%`],
      ['Total Attempts', String(data.metrics.totalAttempts)],
      ['Current Streak', `${data.metrics.currentStreak} days`],
      ['Assignments Completed', String(data.metrics.assignmentsCompleted)],
      ['Assignments Total', String(data.metrics.assignmentsTotal)],
      ['Average Time Spent (min)', String(data.metrics.avgTimeSpentMinutes)],
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
  }, [data])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Progress Hub</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              All-in-one analytics for your learning performance and consistency.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value) as 30 | 60 | 90)}
              className="h-10 rounded-lg border border-slate-300 dark:border-slate-600 px-3 text-sm bg-white dark:bg-slate-900 dark:text-slate-200"
              aria-label="Select analytics date range"
            >
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>

            <Link
              href="/practice"
              className="h-10 inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Start practice test
            </Link>
            <Link
              href="/assignments/history"
              className="h-10 inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              View assignment history
            </Link>
            <a
              href={csvHref}
              download="student-progress-report.csv"
              className="h-10 inline-flex items-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Download report
            </a>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-busy="true">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Tests Taken', value: data.metrics.testsTaken },
                { label: 'Avg Score', value: `${data.metrics.avgScore}%` },
                { label: 'Total Attempts', value: data.metrics.totalAttempts },
                { label: 'Current Streak', value: `${data.metrics.currentStreak} days` },
                { label: 'Assignments Completed', value: `${data.metrics.assignmentsCompleted}/${data.metrics.assignmentsTotal}` },
                { label: 'Weekly Activity', value: data.weeklyActivity.reduce((s, d) => s + d.activity, 0) },
                { label: 'Avg Time Spent', value: `${data.metrics.avgTimeSpentMinutes} min` },
                { label: 'Completion Rate', value: `${completionPct}%` },
              ].map((item) => (
                <article key={item.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{item.value}</p>
                </article>
              ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <article className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Score trend over time</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.charts.scoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                    <XAxis dataKey="date" tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }} />
                    <Tooltip
                      formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Avg score']}
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        borderColor: isDark ? '#334155' : '#e2e8f0',
                        color: isDark ? '#e2e8f0' : '#0f172a',
                      }}
                    />
                    <Line type="monotone" dataKey="avgScore" stroke={isDark ? '#22d3ee' : '#2563eb'} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </article>

              <article className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Completion donut</h2>
                <div className="h-[220px] flex flex-col items-center justify-center gap-2">
                  <div
                    className="h-36 w-36 rounded-full"
                    style={{
                      background: `conic-gradient(${isDark ? '#22d3ee' : '#2563eb'} ${completionPct}%, ${isDark ? '#334155' : '#e2e8f0'} ${completionPct}% 100%)`,
                    }}
                    aria-label={`Assignment completion ${completionPct}%`}
                  >
                    <div className="h-full w-full rounded-full scale-[0.72] bg-white dark:bg-slate-900 flex items-center justify-center text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {completionPct}%
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {data.metrics.assignmentsCompleted} completed, {Math.max(0, data.metrics.assignmentsTotal - data.metrics.assignmentsCompleted)} pending
                  </p>
                </div>
              </article>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <article className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Subject comparison bars</h2>
                {data.charts.subjectBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.charts.subjectBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                      <XAxis dataKey="subject" tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }} />
                      <Tooltip
                        formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Avg score']}
                        contentStyle={{
                          backgroundColor: isDark ? '#0f172a' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#e2e8f0',
                          color: isDark ? '#e2e8f0' : '#0f172a',
                        }}
                      />
                      <Bar dataKey="avgScore" fill={isDark ? '#22d3ee' : '#2563eb'} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400 py-16 text-center">No subject performance data yet.</p>
                )}
              </article>

              <article className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm" id="weak-topics">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Open weak topics</h2>
                {data.weakTopics.length === 0 ? (
                  <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                    Great work. No weak topics detected in this period.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.weakTopics.map((t) => (
                      <div key={t.subject} className="rounded-lg border border-amber-200 dark:border-amber-900/70 bg-amber-50 dark:bg-amber-950/35 p-3">
                        <p className="text-sm font-semibold text-amber-900">{t.subject} ({t.avgScore}%)</p>
                        <p className="text-xs text-amber-800 mt-1">{t.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Heatmap calendar (last {data.rangeDays} days)</h2>
              <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-30 gap-1">
                {data.charts.activityHeatmap.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date}: activity ${d.intensity}`}
                    className={`h-4 rounded ${heatColor(d.intensity, isDark)}`}
                    aria-label={`${d.date} activity ${d.intensity}`}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
