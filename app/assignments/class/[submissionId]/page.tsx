'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'

interface Question {
  id: number
  type: string
  question: string
  options: string[] | null
  marks: number
}

interface AssignmentData {
  submissionId: string
  assignmentId: string
  topic: string
  subject: string
  teacherName: string
  className: string
  dueDate: string
  totalMarks: number
  questions: Question[]
  feedback: any | null
  status: string
  score: number | null
}

export default function ClassAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const submissionId = params.submissionId as string

  const [assignment, setAssignment] = useState<AssignmentData | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const uid = localStorage.getItem('userId')
    if (!uid) {
      router.push('/login')
      return
    }
    setUserId(uid)

    const loadAssignment = async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await fetch(`/api/student/teacher-assignments?userId=${uid}`)
          if (r.status === 404 && attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 400))
            continue
          }
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          const data = await r.json()
          if (!Array.isArray(data)) {
            throw new Error(data?.error ?? 'Unexpected response')
          }
          const found = data.find((a: any) => a.submissionId === submissionId)
          if (found) {
            setAssignment(found)
          } else {
            console.error(
              '[ClassAssignPage] submissionId not found:',
              submissionId,
              'available:',
              data.map((a: any) => a.submissionId),
            )
            setError('Assignment not found. Please select it from your class assignments list.')
          }
          return
        } catch (err) {
          if (attempt === 1) {
            console.error('[ClassAssignPage] fetch error:', err)
            setError('Failed to load assignment')
          }
        }
      }
    }

    loadAssignment().finally(() => setLoading(false))
  }, [submissionId, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!assignment || !userId) return
    setSubmitting(true)
    setError('')

    const answersArray = (assignment.questions ?? []).map((q) => ({
      questionId: q.id,
      answer: answers[q.id] ?? '',
    }))

    const res = await fetch(
      `/api/student/teacher-assignments/${submissionId}/submit?userId=${userId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray }),
      },
    )
    const data = await res.json()

    if (res.ok) {
      setSubmitted(true)
    } else {
      setError(data.error ?? 'Submission failed')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center" aria-busy="true" aria-label="Loading assignment">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your teacher will review and share feedback soon.
          </p>
          <button
            onClick={() => router.push('/assignments')}
            className="min-h-[44px] px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center px-4">
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error || 'Assignment not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/assignments')}
          aria-label="Back to assignments"
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Assignments
        </button>

        {/* Assignment header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{assignment.topic}</h1>
          <p className="text-slate-600 text-sm">
            {assignment.subject} · {assignment.className} · Teacher: {assignment.teacherName}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Due: {new Date(assignment.dueDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' · '}{assignment.totalMarks} marks
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Teacher feedback (if released) */}
        {assignment.status === 'RELEASED' && assignment.feedback && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl">
            <h2 className="text-sm font-semibold text-green-800 mb-1">Teacher Feedback</h2>
            <p className="text-sm text-green-900">{(assignment.feedback as any)?.overall_feedback}</p>
            <p className="text-sm font-medium text-green-800 mt-2">
              Score: {assignment.score}/{assignment.totalMarks}
            </p>
          </div>
        )}

        {/* Under review message */}
        {(assignment.status === 'SUBMITTED' || assignment.status === 'REVIEWED') && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-sm text-amber-800 italic">
              Your submission is under review by your teacher. You'll see feedback once it's released.
            </p>
          </div>
        )}

        {/* Questions form */}
        {(assignment.status === 'NOT_STARTED' || assignment.status === 'IN_PROGRESS') && assignment.questions && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {assignment.questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <p className="font-medium text-slate-900">
                    Q{i + 1}. {q.question}
                  </p>
                  <span className="text-xs text-slate-500 shrink-0">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                </div>

                {q.type === 'MCQ' || q.type === 'TRUE_FALSE' ? (
                  <fieldset>
                    <legend className="sr-only">Select your answer for Question {i + 1}</legend>
                    <div className="space-y-2">
                      {(q.type === 'TRUE_FALSE' ? ['True', 'False'] : (q.options ?? [])).map((opt, oi) => (
                        <label
                          key={oi}
                          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-colors"
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                            className="accent-blue-600"
                            aria-label={opt}
                          />
                          <span className="text-sm text-slate-800">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : q.type === 'FILL_BLANK' ? (
                  <div>
                    <label htmlFor={`fill-${q.id}`} className="sr-only">Your answer for Question {i + 1}</label>
                    <input
                      id={`fill-${q.id}`}
                      type="text"
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                      placeholder="Fill in the blank…"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor={`ans-${q.id}`} className="sr-only">Your answer for Question {i + 1}</label>
                    <textarea
                      id={`ans-${q.id}`}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      rows={q.type === 'LONG_ANSWER' ? 5 : 3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none resize-none"
                      placeholder="Write your answer…"
                    />
                  </div>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 min-h-[48px] bg-blue-600 text-white font-semibold rounded-xl py-3 hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-60"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              {submitting ? 'Submitting…' : 'Submit Assignment'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
