'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Clock, CheckCircle, BookOpen, Eye } from 'lucide-react'

interface AssignmentData {
  id: string
  subject: string
  topic: string
  complexity: string
  dueDate: string
  isPublished: boolean
  isPast: boolean
  className: string
  grade: string
  totalStudents: number
  submittedCount: number
  reviewedCount: number
  releasedCount: number
}

type Tab = 'active' | 'past' | 'drafts'

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('active')

  useEffect(() => {
    fetch('/api/teacher/assignments')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setAssignments(data)
      })
      .catch((e) => setError(e.message ?? 'Failed to load assignments'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = assignments.filter((a) => {
    if (tab === 'drafts') return !a.isPublished
    if (tab === 'past') return a.isPublished && a.isPast
    return a.isPublished && !a.isPast
  })

  const tabCounts = {
    active: assignments.filter((a) => a.isPublished && !a.isPast).length,
    past: assignments.filter((a) => a.isPublished && a.isPast).length,
    drafts: assignments.filter((a) => !a.isPublished).length,
  }

  if (loading) {
    return <div className="p-8 animate-pulse" aria-busy="true"><div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-40 mb-4" /></div>
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Assignments</h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">{assignments.length} total</p>
        </div>
        <Link
          href="/teacher/assignments/create"
          className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#006e2f] text-white font-semibold rounded-xl hover:bg-[#005828] transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Create Assignment
        </Link>
      </div>

      {error && <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      {/* Tabs */}
      <div role="tablist" aria-label="Assignment filters" className="flex gap-1 mb-6 border-b border-gray-200 dark:border-slate-700">
        {(['active', 'past', 'drafts'] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none capitalize
              ${tab === t
                ? 'border-[#006e2f] text-[#006e2f]'
                : 'border-transparent text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100'
              }`}
          >
            {t} <span className="ml-1 text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-full">{tabCounts[t]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-500 dark:text-slate-300">No {tab} assignments</p>
          {tab === 'active' && (
            <Link href="/teacher/assignments/create" className="mt-3 inline-block text-[#006e2f] font-medium hover:underline">
              Create your first assignment →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label={`${tab} assignments`}>
          {filtered.map((a) => {
            const submissionPct = a.totalStudents > 0 ? (a.submittedCount / a.totalStudents) * 100 : 0
            return (
              <article
                key={a.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-3"
                role="listitem"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-slate-100">{a.topic}</h2>
                    <p className="text-gray-600 dark:text-slate-300 text-sm">{a.subject} · {a.className} (Grade {a.grade})</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                    a.complexity === 'Easy' ? 'bg-green-50 text-green-700' :
                    a.complexity === 'Hard' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {a.complexity}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                    <span>Submissions</span>
                    <span aria-label={`${a.submittedCount} of ${a.totalStudents} submitted`}>
                      {a.submittedCount}/{a.totalStudents}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={submissionPct} aria-valuemin={0} aria-valuemax={100} aria-label={`${Math.round(submissionPct)}% submitted`}>
                    <div
                      className="h-full bg-[#006e2f] rounded-full"
                      style={{ width: `${submissionPct}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  Due: {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>

                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/teacher/assignments/${a.id}/status`}
                    className="flex-1 min-h-[36px] text-center py-2 text-sm font-medium border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
                  >
                    View Status
                  </Link>
                  {/* Review button: only shown when there are submissions to action */}
                  {a.releasedCount > 0 && a.submittedCount === 0 && a.reviewedCount === 0 ? (
                    <span className="flex-1 min-h-[36px] flex items-center justify-center gap-1.5 text-sm font-medium bg-green-50 text-green-700 rounded-lg">
                      <CheckCircle className="w-4 h-4" aria-hidden="true" />
                      Released
                    </span>
                  ) : a.submittedCount > 0 ? (
                    <Link
                      href={`/teacher/assignments/${a.id}/review`}
                      className="flex-1 min-h-[36px] text-center py-2 text-sm font-medium bg-[#eff4ff] text-[#0058be] rounded-lg hover:bg-[#e0eaff] transition-colors focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:outline-none flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      Review ({a.submittedCount})
                    </Link>
                  ) : a.reviewedCount > 0 ? (
                    <Link
                      href={`/teacher/assignments/${a.id}/review`}
                      className="flex-1 min-h-[36px] text-center py-2 text-sm font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                    >
                      Release ({a.reviewedCount})
                    </Link>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
