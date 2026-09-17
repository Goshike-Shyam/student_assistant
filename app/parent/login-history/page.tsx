'use client'

import { cn } from '@/lib/utils'
import { useChildData } from '@/hooks/useParentData'
import { ChildSwitcher } from '@/components/parent/ChildSwitcher'

export default function LoginHistoryPage() {
  const {
    children,
    selectedChildId,
    setSelectedChildId,
    childData,
    loading,
    error,
  } = useChildData<{
    loginDates?: string[]
    currentStreak?: number
    longestStreak?: number
    lastLogin?: string | null
    activeDaysThisMonth?: number
  }>('login-history')

  const activeDays = childData?.activeDaysThisMonth ?? 0
  const last30Days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - index))
    return date.toISOString().slice(0, 10)
  })
  const loginSet = new Set(childData?.loginDates ?? [])

  const consistencyMessage =
    activeDays >= 20 ? 'Amazing consistency!' : activeDays >= 10 ? 'Great habit forming!' : 'Building the daily habit!'

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Login History</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Last 30 days of learning activity</p>
      </div>

      <ChildSwitcher children={children} selectedChildId={selectedChildId} onChange={setSelectedChildId} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      ) : loading ? (
        <div className="rounded-2xl bg-gray-100 p-6 text-sm text-gray-500 dark:bg-slate-700 dark:text-gray-400">
          Loading activity calendar…
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Current streak</p>
              <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">{childData?.currentStreak ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Longest streak</p>
              <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">{childData?.longestStreak ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Active days</p>
              <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">{activeDays}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Past 30 days</h2>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{consistencyMessage}</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {last30Days.map((date) => (
                <div
                  key={date}
                  title={date}
                  aria-label={`${date}: ${loginSet.has(date) ? 'active' : 'inactive'}`}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium',
                    loginSet.has(date) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 dark:bg-slate-700',
                  )}
                >
                  {new Date(date).getDate()}
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Last login: {childData?.lastLogin ? new Date(childData.lastLogin).toLocaleDateString('en-IN') : 'No login recorded yet'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
