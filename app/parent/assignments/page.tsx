'use client'

import { ChildSwitcher } from '@/components/parent/ChildSwitcher'
import { useChildData } from '@/hooks/useParentData'

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  SUBMITTED: 'bg-amber-100 text-amber-700',
  REVIEWED: 'bg-purple-100 text-purple-700',
  RELEASED: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

function getEncouragement(score: number | null) {
  if (score === null) return 'Feedback will appear after review.'
  if (score >= 80) return '🌟 Excellent work!'
  if (score >= 60) return '👍 Good effort — keep it up!'
  return '💪 Keep practising!'
}

function renderFeedback(value: unknown) {
  if (!value) return 'No feedback released yet.'
  if (typeof value === 'string') return value

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return 'Feedback available.'
  }
}

export default function AssignmentsPage() {
  const {
    children,
    selectedChildId,
    setSelectedChildId,
    childData,
    loading,
    error,
  } = useChildData<{
    classAssignments?: Array<{
      id: string
      title: string
      subject: string
      teacher: string
      dueDate: string | null
      status: string
      feedback: unknown
      score: number | null
      submittedAt: string | null
    }>
    selfAssignments?: Array<{
      id: string
      subject: string
      topic: string
      score: number | null
      date: string
    }>
  }>('assignments')

  const classAssignments = childData?.classAssignments ?? []
  const selfAssignments = childData?.selfAssignments ?? []

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assignments</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Class assignments with status and feedback, plus self-generated assignments</p>
      </div>

      <ChildSwitcher children={children} selectedChildId={selectedChildId} onChange={setSelectedChildId} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-700" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Class Assignments</h2>
              <span className="text-sm text-gray-400">{classAssignments.length} items</span>
            </div>

            {classAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400">
                No class assignments yet.
              </div>
            ) : (
              <div className="space-y-4">
                {classAssignments.map((assignment) => (
                  <article key={assignment.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{assignment.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{assignment.subject} · {assignment.teacher}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-IN') : 'No due date'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[assignment.status] ?? STATUS_COLORS.NOT_STARTED}`}>
                          {assignment.status.split('_').join(' ')}
                        </span>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {assignment.score === null ? 'Pending' : `${Math.round(assignment.score)}%`}
                        </span>
                      </div>
                    </div>

                    <details className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200">View Feedback</summary>
                      <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-gray-600 dark:text-gray-300">{renderFeedback(assignment.feedback)}</pre>
                      <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">{getEncouragement(assignment.score)}</p>
                    </details>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Self-Generated Assignments</h2>
              <span className="text-sm text-gray-400">{selfAssignments.length} items</span>
            </div>

            {selfAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400">
                No self-generated assignments yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {selfAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{assignment.subject}</p>
                    <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">{assignment.topic}</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{new Date(assignment.date).toLocaleDateString('en-IN')}</p>
                    <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Score: {assignment.score === null ? 'Pending' : `${Math.round(assignment.score)}%`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}