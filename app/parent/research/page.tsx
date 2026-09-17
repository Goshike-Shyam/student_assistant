'use client'

import { useState } from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChildData } from '@/hooks/useParentData'
import { ChildSwitcher } from '@/components/parent/ChildSwitcher'

export default function ResearchPage() {
  const {
    children,
    selectedChildId,
    setSelectedChildId,
    childData,
    loading,
    error,
  } = useChildData<{
    queries?: Array<{ id: string; text: string; subject: string; isFlagged: boolean; date: string }>
  }>('research')
  const [search, setSearch] = useState('')

  const queries = (childData?.queries ?? []).filter((query) => {
    const term = search.toLowerCase()
    return !term || query.text.toLowerCase().includes(term) || (query.subject ?? '').toLowerCase().includes(term)
  })

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Research Prompts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Questions your child has asked the AI tutor</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search queries..."
            className="min-h-[44px] w-56 rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100"
            aria-label="Search queries"
          />
        </div>
      </div>

      <ChildSwitcher children={children} selectedChildId={selectedChildId} onChange={setSelectedChildId} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-700" />
          ))}
        </div>
      ) : queries.length === 0 ? (
        <div className="py-16 text-center text-gray-400 dark:text-gray-500">No research queries yet</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          {queries.map((query, index) => (
            <div
              key={query.id}
              className={cn(
                'flex items-start gap-4 px-5 py-4',
                index > 0 && 'border-t border-gray-100 dark:border-slate-700',
                query.isFlagged && 'bg-amber-50 dark:bg-amber-950',
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm text-gray-900 dark:text-gray-100">{query.text}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400 dark:bg-slate-700">{query.subject || 'General'}</span>
                  <span className="text-xs text-gray-400">{new Date(query.date).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              {query.isFlagged ? (
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" aria-label="Flagged content" />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}