'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, ChevronUp, Send, Save } from 'lucide-react'

interface Submission {
  submissionId: string
  childId: string
  childName: string
  status: string
  score: number | null
  submittedAt: string | null
  answersJson: any[] | null
  aiFeedbackJson: any | null
  teacherFeedbackJson: any | null
}

interface AssignmentInfo {
  id: string
  topic: string
  subject: string
  questionsJson: any[]
  totalMarks: number
  dueDate: string
}

export default function ReviewSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<AssignmentInfo | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [feedbackEdits, setFeedbackEdits] = useState<Record<string, { overallFeedback: string; score: string }>>({})
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetch(`/api/teacher/assignments/${assignmentId}/review`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setAssignment(data.assignment)
        setSubmissions(data.submissions)

        // Pre-populate editable fields from existing teacher feedback or AI feedback
        const edits: Record<string, { overallFeedback: string; score: string }> = {}
        data.submissions.forEach((s: Submission) => {
          const tfb = s.teacherFeedbackJson as any
          const aifb = s.aiFeedbackJson as any
          edits[s.submissionId] = {
            overallFeedback: tfb?.overall_feedback ?? aifb?.overall_feedback ?? '',
            score: (s.score ?? aifb?.total_score ?? '').toString(),
          }
        })
        setFeedbackEdits(edits)
      })
      .catch((e) => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [assignmentId])

  async function saveReview(submissionId: string, releaseNow: boolean) {
    setSaving(submissionId)
    setSuccessMsg('')

    const edit = feedbackEdits[submissionId]
    const submission = submissions.find((s) => s.submissionId === submissionId)
    const aifb = submission?.aiFeedbackJson as any

    const teacherFeedbackJson = {
      overall_feedback: edit?.overallFeedback ?? '',
      total_score: parseFloat(edit?.score ?? '0') || 0,
      questions: aifb?.questions ?? [],
    }

    const res = await fetch(`/api/teacher/assignments/${assignmentId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        teacherFeedbackJson,
        score: parseFloat(edit?.score ?? '0') || null,
        releaseNow,
      }),
    })

    const data = await res.json()
    if (res.ok) {
      setSuccessMsg(releaseNow ? '✓ Feedback released to student' : '✓ Draft saved')
      // Refresh submissions
      const refreshed = await fetch(`/api/teacher/assignments/${assignmentId}/review`).then((r) => r.json())
      if (!refreshed.error) setSubmissions(refreshed.submissions)
    } else {
      setError(data.error ?? 'Save failed')
    }
    setSaving(null)
  }

  if (loading) {
    return <div className="p-8 animate-pulse" aria-busy="true"><div className="h-8 bg-gray-200 rounded w-48" /></div>
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} aria-label="Go back" className="p-2 rounded-lg hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none">
          <ArrowLeft className="w-5 h-5 text-gray-600" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Submissions</h1>
          <p className="text-gray-600 text-sm">{assignment?.topic} · {assignment?.subject} · {submissions.length} submissions</p>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
      {successMsg && <div role="status" aria-live="polite" className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">{successMsg}</div>}

      {submissions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">No submissions to review yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isExpanded = expanded === sub.submissionId
            const aiFeedback = sub.aiFeedbackJson as any
            const edit = feedbackEdits[sub.submissionId] ?? { overallFeedback: '', score: '' }

            return (
              <div
                key={sub.submissionId}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : sub.submissionId)}
                  aria-expanded={isExpanded}
                  aria-controls={`sub-panel-${sub.submissionId}`}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{sub.childName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {sub.submittedAt
                          ? `Submitted ${new Date(sub.submittedAt).toLocaleDateString()}`
                          : 'Not submitted'}
                        {sub.score !== null && ` · ${sub.score}/${assignment?.totalMarks}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      sub.status === 'RELEASED' ? 'bg-green-100 text-green-800' :
                      sub.status === 'REVIEWED' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" aria-hidden="true" /> : <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />}
                </button>

                {/* Expanded panel */}
                {isExpanded && (
                  <div id={`sub-panel-${sub.submissionId}`} className="px-5 pb-5 border-t border-gray-100">
                    {/* AI feedback summary */}
                    {aiFeedback && (
                      <div className="my-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 mb-1">AI Evaluation Summary</p>
                        <p className="text-sm text-blue-900">{aiFeedback.overall_feedback}</p>
                      </div>
                    )}

                    {/* Per-question review */}
                    {assignment?.questionsJson && sub.answersJson && (
                      <div className="space-y-3 mb-4">
                        <h3 className="text-sm font-semibold text-gray-700">Answers & AI Feedback</h3>
                        {assignment.questionsJson.map((q: any, i: number) => {
                          const answer = sub.answersJson?.[i]?.answer ?? '—'
                          const qFb = aiFeedback?.questions?.find((qf: any) => qf.id === q.id)
                          return (
                            <div key={q.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <p className="text-sm font-medium text-gray-900 mb-1">Q{q.id}. {q.question}</p>
                              <p className="text-sm text-gray-700 mb-1"><strong>Answer:</strong> {answer}</p>
                              {qFb && (
                                <p className="text-xs text-gray-600">
                                  <strong>AI:</strong> {qFb.brief_explanation} ({qFb.marks_awarded}/{qFb.marks_possible} marks)
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Teacher editable feedback */}
                    <div className="space-y-3">
                      <div>
                        <label htmlFor={`fb-overall-${sub.submissionId}`} className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Overall Feedback (visible to student after release)
                        </label>
                        <textarea
                          id={`fb-overall-${sub.submissionId}`}
                          value={edit.overallFeedback}
                          onChange={(e) =>
                            setFeedbackEdits((prev) => ({
                              ...prev,
                              [sub.submissionId]: { ...prev[sub.submissionId], overallFeedback: e.target.value },
                            }))
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none resize-none"
                          placeholder="Write your feedback for this student…"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div>
                          <label htmlFor={`fb-score-${sub.submissionId}`} className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Score (out of {assignment?.totalMarks})
                          </label>
                          <input
                            id={`fb-score-${sub.submissionId}`}
                            type="number"
                            value={edit.score}
                            onChange={(e) =>
                              setFeedbackEdits((prev) => ({
                                ...prev,
                                [sub.submissionId]: { ...prev[sub.submissionId], score: e.target.value },
                              }))
                            }
                            min={0}
                            max={assignment?.totalMarks}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
                            aria-label={`Score for ${sub.childName}`}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => saveReview(sub.submissionId, false)}
                          disabled={saving === sub.submissionId}
                          className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none disabled:opacity-60"
                        >
                          <Save className="w-4 h-4" aria-hidden="true" />
                          Save Draft
                        </button>
                        <button
                          onClick={() => saveReview(sub.submissionId, true)}
                          disabled={saving === sub.submissionId}
                          className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#006e2f] text-white font-semibold rounded-xl hover:bg-[#005828] transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none disabled:opacity-60"
                        >
                          <Send className="w-4 h-4" aria-hidden="true" />
                          {saving === sub.submissionId ? 'Saving…' : 'Release to Student'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
