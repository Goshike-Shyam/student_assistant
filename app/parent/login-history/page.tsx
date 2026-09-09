'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function LoginHistoryPage() {
  const params = useSearchParams()
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([])
  const [selectedChild, setSelectedChild] = useState('')
  const [history, setHistory] = useState<{ logins: Array<{ date: string; active: boolean }>; currentStreak: number; longestStreak: number; activeDayCount: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/parent/dashboard', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        const kids = data.children ?? []
        setChildren(kids)
        const childFromParam = params.get('child')
        setSelectedChild(childFromParam ?? kids[0]?.id ?? '')
      })
      .catch((error) => {
        console.error('[parent/login-history] dashboard fetch failed', error)
      })
  }, [params])

  useEffect(() => {
    if (!selectedChild) return

    setLoading(true)
    fetch(`/api/parent/child/${selectedChild}/login-history`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => {
        setHistory(payload)
      })
      .catch((error) => {
        console.error('[parent/login-history] login history fetch failed', error)
        setHistory(null)
      })
      .finally(() => setLoading(false))
  }, [selectedChild])

  const consistencyMessage =
    (history?.activeDayCount ?? 0) >= 20
      ? 'Amazing consistency!'
      : (history?.activeDayCount ?? 0) >= 10
        ? 'Great habit forming!'
        : 'Building the daily habit — every day counts!'

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Login History</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Last 30 days of learning activity</p>
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
        <div className="rounded-2xl bg-gray-100 p-6 text-sm text-gray-500 dark:bg-slate-700 dark:text-gray-400">
          Loading activity calendar…
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Current streak</p>
              <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">{history?.currentStreak ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Longest streak</p>
              <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">{history?.longestStreak ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Active days</p>
              <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">{history?.activeDayCount ?? 0}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Past 30 days</h2>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{consistencyMessage}</span>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {history?.logins.map((entry) => {
                const date = new Date(entry.date)
                const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                return (
                  <div key={entry.date} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{label}</span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                        entry.active
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-gray-300 bg-gray-100 text-gray-400 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-500'
                      }`}
                      aria-label={entry.active ? `Active on ${label}` : `Inactive on ${label}`}
                    >
                      {entry.active ? '●' : '○'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
