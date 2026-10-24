'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'

type Tab = 'RESEARCH' | 'PRACTICE'
type ViewMode = 'list' | 'grid'

type LibraryItem = {
  id: string
  itemType: Tab
  grade: string
  board: string
  subjectId: string
  subjectLabel: string
  topic: string
  isFeatured: boolean
  isImported: boolean
  importFileName?: string | null
  importFileUrl?: string | null
  viewCount: number
  createdAt: string
  content: {
    query?: string
    response?: string
    preview?: string
    questionCount?: number
    totalMarks?: number
    questions?: Array<Record<string, unknown>>
  }
}

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>('RESEARCH')
  const [view, setView] = useState<ViewMode>('list')
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [items, setItems] = useState<LibraryItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [childId, setChildId] = useState('')
  const [debouncedSearch] = useDebounce(search, 350)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = window.localStorage.getItem('userId') || ''
    if (!id) {
      window.location.href = '/login'
      return
    }
    setChildId(id)
  }, [])

  const subjectOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      if (!map.has(item.subjectId)) map.set(item.subjectId, item.subjectLabel)
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }))
  }, [items])

  const loadItems = useCallback(async () => {
    if (!childId) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        tab,
        page: String(page),
      })
      if (subject) params.set('subject', subject)
      if (debouncedSearch) params.set('search', debouncedSearch)

      const response = await fetch(`/api/student/library?${params.toString()}`, {
        headers: { 'x-user-id': childId },
      })
      const data = await response.json()

      if (response.ok) {
        setItems(data.items || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [childId, tab, page, subject, debouncedSearch])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  useEffect(() => {
    setPage(1)
    setExpandedId(null)
  }, [tab, subject, debouncedSearch])

  async function onToggleExpand(itemId: string) {
    setExpandedId((prev) => (prev === itemId ? null : itemId))
    if (!childId) return

    fetch(`/api/student/library/${itemId}/view`, {
      method: 'POST',
      headers: { 'x-user-id': childId },
    }).catch(() => {})
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <header className="mb-5 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-4 md:p-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Study Library</h1>
        <p className="mt-1 text-sm text-slate-700">Shared, anonymised research and practice references curated for your board and grade.</p>
      </header>

      <section className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="library-search" className="sr-only">Search topics</label>
        <input
          id="library-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by topic"
          aria-label="Search library topics"
          className="min-h-[44px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-amber-400/40 placeholder:text-slate-400 focus:ring-2"
        />

        <select
          aria-label="Filter by subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-400/40"
        >
          <option value="">All subjects</option>
          {subjectOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>

        <div role="group" aria-label="View mode" className="inline-flex overflow-hidden rounded-xl border border-slate-300">
          <button
            type="button"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
            className={`min-h-[44px] min-w-[60px] px-3 text-sm font-semibold ${view === 'list' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500`}
          >
            List
          </button>
          <button
            type="button"
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
            className={`min-h-[44px] min-w-[60px] px-3 text-sm font-semibold ${view === 'grid' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500`}
          >
            Grid
          </button>
        </div>
      </section>

      <section className="mb-5 border-b border-slate-200" role="tablist" aria-label="Library tabs">
        {(['RESEARCH', 'PRACTICE'] as Tab[]).map((candidate) => (
          <button
            key={candidate}
            type="button"
            role="tab"
            aria-selected={tab === candidate}
            onClick={() => setTab(candidate)}
            className={`min-h-[44px] border-b-2 px-4 text-sm font-semibold ${tab === candidate ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500`}
          >
            {candidate === 'RESEARCH' ? 'Research' : 'Practice'}
          </button>
        ))}
      </section>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500" aria-busy="true">Loading library...</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No {tab.toLowerCase()} items found.
        </div>
      ) : (
        <section className={view === 'grid' ? 'grid grid-cols-1 gap-3 md:grid-cols-2' : 'space-y-3'}>
          {items.map((item) => {
            const expanded = expandedId === item.id
            return (
              <article
                key={item.id}
                className={`rounded-xl border bg-white ${item.isFeatured ? 'border-amber-300' : 'border-slate-200'} shadow-sm`}
              >
                <button
                  type="button"
                  onClick={() => onToggleExpand(item.id)}
                  aria-expanded={expanded}
                  className="flex min-h-[44px] w-full items-start justify-between gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <div>
                    <div className="mb-1 flex flex-wrap gap-1">
                      {item.isFeatured ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Featured</span> : null}
                      {item.isImported ? <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">Imported</span> : null}
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 md:text-base">{item.topic}</h2>
                    <p className="mt-1 text-xs text-slate-500">{item.subjectLabel} · Grade {item.grade} · {item.board} · Views {item.viewCount}</p>
                    {!expanded && tab === 'RESEARCH' && item.content.preview ? (
                      <p className="mt-2 text-xs leading-5 text-slate-600">{item.content.preview}</p>
                    ) : null}
                    {!expanded && tab === 'PRACTICE' ? (
                      <p className="mt-2 text-xs leading-5 text-slate-600">{item.content.questionCount || 0} questions · {item.content.totalMarks || 0} marks</p>
                    ) : null}
                  </div>
                  <span aria-hidden="true" className={`text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {expanded ? (
                  <div className="border-t border-slate-100 bg-slate-50 p-4">
                    {tab === 'RESEARCH' ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Query</p>
                          <p className="mt-1 rounded-lg bg-white p-3 text-sm italic text-slate-700">{item.content.query || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI response</p>
                          <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-3 text-sm leading-6 text-slate-700">{item.content.response || '-'}</p>
                        </div>
                        {item.importFileUrl ? (
                          <a
                            href={item.importFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-[44px] items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                          >
                            Open imported file
                          </a>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Practice paper</p>
                        {(item.content.questions || []).map((question, index) => {
                          const options = Array.isArray(question.options) ? question.options : []
                          const correctAnswer = String(question.correctAnswer || '')
                          return (
                            <div key={String(question.id || index)} className="rounded-lg border border-slate-200 bg-white p-3">
                              <p className="text-sm font-semibold text-slate-900">Q{index + 1}. {String(question.question || '')}</p>
                              <div className="mt-2 space-y-1">
                                {options.map((option, optionIndex) => {
                                  const label = String.fromCharCode(65 + optionIndex)
                                  const optionText = String(option)
                                  const isCorrect = optionText === correctAnswer || label === correctAnswer
                                  return (
                                    <p key={`${label}-${optionIndex}`} className={`rounded-md px-2 py-1 text-xs ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                                      {label}. {optionText}
                                    </p>
                                  )
                                })}
                              </div>
                              {question.explanation ? <p className="mt-2 text-xs text-slate-600">Explanation: {String(question.explanation)}</p> : null}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            )
          })}
        </section>
      )}

      {totalPages > 1 ? (
        <nav className="mt-5 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Prev
          </button>
          <span className="text-sm text-slate-600">{page} / {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Next
          </button>
        </nav>
      ) : null}
    </main>
  )
}
