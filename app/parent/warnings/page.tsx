'use client'

import { CheckCircle } from 'lucide-react'
import { useChildData } from '@/hooks/useParentData'
import { ChildSwitcher } from '@/components/parent/ChildSwitcher'

function truncateText(value: string, maxLength = 100) {
  if (!value) return ''
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value
}

export default function WarningsPage() {
  const {
    children,
    selectedChildId,
    setSelectedChildId,
    childData,
    loading,
    error,
  } = useChildData<{
    warnings?: Array<{ id: string; queryText: string; flagReason: string; date: string }>
    totalCount?: number
  }>('warnings')

  const warnings = childData?.warnings ?? []

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Warnings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Alerts from the AI safety system for your awareness.</p>
      </div>

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          🛡️ Our AI safety system automatically blocked any harmful responses. Your child did not receive harmful content. These alerts are for your awareness only.
        </p>
      </div>

      <ChildSwitcher children={children} selectedChildId={selectedChildId} onChange={setSelectedChildId} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      ) : loading ? (
        <div className="rounded-2xl bg-gray-100 p-6 text-sm text-gray-500 dark:bg-slate-700 dark:text-gray-400">
          Loading warnings…
        </div>
      ) : warnings.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <CheckCircle size={32} className="text-green-500" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">All Clear!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No content warnings this month. Your child is using the platform responsibly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {warnings.map((warning) => (
            <article key={warning.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/40">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">
                <span>{new Date(warning.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="rounded-full bg-amber-200 px-2 py-1 font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                  {warning.flagReason}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200">{truncateText(warning.queryText, 100)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
