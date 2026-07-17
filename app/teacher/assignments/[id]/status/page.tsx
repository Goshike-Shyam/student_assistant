'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Download, RefreshCw } from 'lucide-react'

interface StudentStatus {
  submissionId: string
  childId: string
  childName: string
  parentEmail: string
  status: string
  score: number | null
  submittedAt: string | null
  reviewedAt: string | null
  releasedAt: string | null
  reminderSentAt: string | null
}

interface AssignmentInfo {
  id: string
  topic: string
  subject: string
  dueDate: string
  totalMarks: number
  isPublished: boolean
}

interface Summary {
  total: number
  notStarted: number
  overdue: number
  inProgress: number
  submitted: number
  reviewed: number
  released: number
  pendingReview: number
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  NOT_STARTED: { label: 'Not Started', cls: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-100 text-blue-800' },
  SUBMITTED:   { label: 'Submitted',   cls: 'bg-amber-100 text-amber-800' },
  REVIEWED:    { label: 'Reviewed',    cls: 'bg-purple-100 text-purple-800' },
  RELEASED:    { label: 'Released',    cls: 'bg-green-100 text-green-800' },
  OVERDUE:     { label: 'Overdue',     cls: 'bg-red-100 text-red-800' },
}

export default function AssignmentStatusPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<AssignmentInfo | null>(null)
  const [students, setStudents] = useState<StudentStatus[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)
  const [sentMsg, setSentMsg] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const data = await fetch(`/api/teacher/assignments/${assignmentId}/status`).then((r) => r.json())
      if (data.error) throw new Error(data.error)
      setAssignment(data.assignment)
      setStudents(data.students)
      setSummary(data.summary)
      setLastUpdated(new Date())
    } catch (e: any) {
      setError(e.message ?? 'Failed to load')
    } finally {
      setLoading(false)
      if (isManual) setRefreshing(false)
    }
  }, [assignmentId])

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(() => fetchData(), 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchData])

  function toggleSelect(childId: string, status: string) {
    if (!['NOT_STARTED', 'IN_PROGRESS', 'OVERDUE'].includes(status)) return
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(childId)) next.delete(childId)
      else next.add(childId)
      return next
    })
  }

  function selectAllPending() {
    const pendingIds = students
      .filter((s) => ['NOT_STARTED', 'IN_PROGRESS', 'OVERDUE'].includes(s.status))
      .map((s) => s.childId)
    setSelected(new Set(pendingIds))
  }

  async function sendReminders() {
    if (selected.size === 0) return
    setSending(true)
    setSentMsg('')

    const res = await fetch(`/api/teacher/assignments/${assignmentId}/remind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childIds: Array.from(selected) }),
    })
    const data = await res.json()
    setSentMsg(
      res.ok
        ? `✓ ${data.sent} reminder${data.sent !== 1 ? 's' : ''} sent successfully`
        : data.error ?? 'Failed to send reminders',
    )
    setSending(false)
    setSelected(new Set())

    // Refresh data
    await fetchData()
  }

  function exportCsv() {
    const header = ['Student', 'Status', 'Score', 'Submitted At', 'Released At']
    const rows = students.map((s) => [
      s.childName,
      s.status,
      s.score !== null ? `${s.score}/${assignment?.totalMarks}` : '',
      s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '',
      s.releasedAt ? new Date(s.releasedAt).toLocaleString() : '',
    ])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assignment?.topic ?? 'assignment'}_status.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="p-8 animate-pulse" aria-busy="true"><div className="h-8 bg-gray-200 rounded w-48" /></div>
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} aria-label="Go back" className="p-2 rounded-lg hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none">
          <ArrowLeft className="w-5 h-5 text-gray-600" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{assignment?.topic}</h1>
          <p className="text-gray-600 text-sm">{assignment?.subject} · Due {assignment ? new Date(assignment.dueDate).toLocaleDateString() : ''} · {assignment?.totalMarks} marks</p>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
      {sentMsg && <div role="status" aria-live="polite" className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">{sentMsg}</div>}

      {/* Summary row */}
      {summary && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6" aria-label="Submission summary">
          {[
            { label: 'Not Started', value: summary.notStarted, cls: 'bg-gray-100 text-gray-700' },
            { label: 'In Progress', value: summary.inProgress, cls: 'bg-blue-100 text-blue-800' },
            { label: 'Submitted', value: summary.submitted, cls: 'bg-amber-100 text-amber-800' },
            { label: 'Reviewed', value: summary.reviewed, cls: 'bg-purple-100 text-purple-800' },
            { label: 'Released', value: summary.released, cls: 'bg-green-100 text-green-800' },
            { label: 'Overdue', value: summary.overdue, cls: 'bg-red-100 text-red-800' },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl px-4 py-3 text-center ${item.cls}`}>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs font-medium mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={selectAllPending}
          className="min-h-[40px] px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
          aria-label="Select all pending students"
        >
          Select All Pending
        </button>
        {selected.size > 0 && (
          <button
            onClick={sendReminders}
            disabled={sending}
            className="flex items-center gap-2 min-h-[40px] px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none disabled:opacity-60"
            aria-label={`Send reminder to ${selected.size} selected student${selected.size !== 1 ? 's' : ''}`}
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            {sending ? 'Sending…' : `Send ${selected.size} Reminder${selected.size !== 1 ? 's' : ''}`}
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto">
          {lastUpdated && (
            <p className="text-xs text-gray-500" aria-live="polite">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 min-h-[40px] px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none disabled:opacity-60"
            aria-label="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 min-h-[40px] px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            aria-label="Export status as CSV"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Status table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
        <table className="w-full text-sm" role="grid" aria-label="Student submission status">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700 sticky left-0 bg-gray-50">
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700 sticky left-8 bg-gray-50">Student</th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Score</th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Submitted</th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Released</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const cfg = STATUS_CONFIG[student.status] ?? STATUS_CONFIG.NOT_STARTED
              const canSelect = ['NOT_STARTED', 'IN_PROGRESS', 'OVERDUE'].includes(student.status)
              const isSelected = selected.has(student.childId)

              return (
                <tr
                  key={student.childId}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3 sticky left-0 bg-inherit">
                    {canSelect && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(student.childId, student.status)}
                        aria-label={`Select ${student.childName} for reminder`}
                        className="w-4 h-4 accent-[#006e2f] cursor-pointer"
                      />
                    )}
                  </td>
                  <th scope="row" className="px-4 py-3 text-left sticky left-8 bg-inherit">
                    <p className="font-medium text-gray-900">{student.childName}</p>
                    <p className="text-xs text-gray-500">{student.parentEmail}</p>
                  </th>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.cls}`}
                      aria-label={`Status: ${cfg.label}`}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {student.score !== null
                      ? `${student.score}/${assignment?.totalMarks}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {student.submittedAt
                      ? new Date(student.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {student.releasedAt
                      ? new Date(student.releasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
