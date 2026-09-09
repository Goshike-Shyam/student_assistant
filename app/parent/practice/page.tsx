'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSubjectLabel } from '@/lib/subjects/config'

function getTone(score: number) {
  if (score >= 75) {
    return { dot: 'bg-green-500', badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
  }
  if (score >= 50) {
    return { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' }
  }
  return { dot: 'bg-red-400', badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
}

export default function PracticePage() {
  const params = useSearchParams()
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([])
  const [selectedChild, setSelectedChild] = useState('')
  const [attempts, setAttempts] = useState<Array<{ id: string; subject: string; score: number; totalQuestions: number; createdAt: string; timeTakenSecs: number }>>([])
  const [selectedSubject, setSelectedSubject] = useState('all')
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
        console.error('[parent/practice] dashboard fetch failed', error)
      })
  }, [params])

  useEffect(() => {
    if (!selectedChild) return

    setLoading(true)
    fetch(`/api/parent/child/${selectedChild}/practice`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => {
        setAttempts(payload.attempts ?? [])
      })
      .catch((error) => {
        console.error('[parent/practice] practice fetch failed', error)
        setAttempts([])
      })
      .finally(() => setLoading(false))
  }, [selectedChild])

  const filteredAttempts = useMemo(() => {
    if (selectedSubject === 'all') return attempts
    return attempts.filter((attempt) => attempt.subject === selectedSubject)
  }, [attempts, selectedSubject])

  const subjectOptions = useMemo(() => Array.from(new Set(attempts.map((attempt) => attempt.subject))), [attempts])
  const averageScore = filteredAttempts.length
    ? filteredAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / filteredAttempts.length
    : 0

  const selectedChildName = children.find((child) => child.id === selectedChild)?.name ?? 'Your child'

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Practice Tests</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Latest attempt history for {selectedChildName}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
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

          {subjectOptions.length > 0 && (
            <select
              value={selectedSubject}
              onChange={(event) => setSelectedSubject(event.target.value)}
              className="min-h-[44px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100"
              aria-label="Filter by subject"
            >
              <option value="all">All subjects</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {getSubjectLabel(subject) ?? subject}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-gray-100 p-6 text-sm text-gray-500 dark:bg-slate-700 dark:text-gray-400">
          Loading practice attempts…
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400">
          No practice tests found for this selection.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            {averageScore >= 75
              ? `🌟 ${selectedChildName} is excelling this month!`
              : averageScore >= 50
                ? `📈 ${selectedChildName} is making good progress!`
                : `💪 ${selectedChildName} is working hard — keep going!`}
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Date</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Subject</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Score</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Rating</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Questions</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map((attempt) => {
                    const tone = getTone(attempt.score)

                    return (
                      <tr key={attempt.id} className="border-t border-gray-200 dark:border-slate-700">
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                          {new Date(attempt.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                          {getSubjectLabel(attempt.subject) ?? attempt.subject}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} aria-hidden="true" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.round(attempt.score)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone.badge}`}>
                            {attempt.score >= 75 ? 'Excellent' : attempt.score >= 50 ? 'Good' : 'Needs Practice'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{attempt.totalQuestions}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                          {Math.max(1, Math.round(attempt.timeTakenSecs / 60))} min
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
