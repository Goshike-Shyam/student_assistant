'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'

function truncateText(value: string, maxLength = 100) {
  if (!value) return ''
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}…` : value
}

export default function WarningsPage() {
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([])
  const [selectedChild, setSelectedChild] = useState('')
  const [warnings, setWarnings] = useState<Array<{ id: string; text: string; reason: string; createdAt: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/parent/dashboard', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        const kids = data.children ?? []
        setChildren(kids)
        setSelectedChild(kids[0]?.id ?? '')
      })
      .catch((error) => {
        console.error('[parent/warnings] dashboard fetch failed', error)
      })
  }, [])

  useEffect(() => {
    if (!selectedChild) return

    setLoading(true)
    fetch(`/api/parent/child/${selectedChild}/warnings`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => {
        setWarnings(payload.warnings ?? [])
      })
      .catch((error) => {
        console.error('[parent/warnings] warnings fetch failed', error)
        setWarnings([])
      })
      .finally(() => setLoading(false))
  }, [selectedChild])

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Warnings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Our AI filters blocked harmful responses. Your child did not receive any harmful content. We flag these for your awareness.
          </p>
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
          Loading warnings…
        </div>
      ) : warnings.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mx-auto">
            <CheckCircle size={32} className="text-green-500" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">All Clear! 🎉</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No content warnings this month. Your child is using the platform responsibly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {warnings.map((warning) => (
            <article key={warning.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/40">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">
                <span>{new Date(warning.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="rounded-full bg-amber-200 px-2 py-1 font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                  {warning.reason}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200">{truncateText(warning.text, 100)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
