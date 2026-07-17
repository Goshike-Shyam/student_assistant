'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Sparkles, Send } from 'lucide-react'
import { getSubjectsByBoardAndGrade } from '@/lib/subjects-seed'

interface ClassData {
  id: string
  className: string
  grade: string
  board: string
  subjects: string[]
}

interface GeneratedQuestion {
  id: number
  type: string
  question: string
  options: string[] | null
  marks: number
}

interface GeneratedResult {
  assignmentId: string
  title: string
  questions: GeneratedQuestion[]
  totalMarks: number
  dueDate: string
  enrolledCount: number
  isPublished: boolean
}

const COMPLEXITY_OPTIONS = ['Easy', 'Medium', 'Hard', 'Mixed']

export default function CreateAssignmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClassId = searchParams.get('classId') ?? ''

  const [classes, setClasses] = useState<ClassData[]>([])
  const [form, setForm] = useState({
    classId: preselectedClassId,
    subject: '',
    topic: '',
    complexity: 'Medium',
    dueDate: '',
    instructions: '',
    isDraft: false,
  })
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<GeneratedResult | null>(null)
  const [error, setError] = useState('')

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 16)

  useEffect(() => {
    fetch('/api/teacher/classes')
      .then((r) => r.json())
      .then((data) => setClasses(data ?? []))
  }, [])

  useEffect(() => {
    const cls = classes.find((c) => c.id === form.classId)
    if (cls) {
      const subjects = cls.subjects.length > 0
        ? cls.subjects
        : getSubjectsByBoardAndGrade(cls.board, Number(cls.grade))
      setAvailableSubjects(subjects)
      if (!subjects.includes(form.subject)) {
        setForm((f) => ({ ...f, subject: subjects[0] ?? '' }))
      }
    }
  }, [form.classId, classes])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.classId || !form.subject || !form.topic.trim() || !form.dueDate) {
      setError('Class, subject, topic, and due date are required')
      return
    }
    setError('')
    setGenerating(true)
    setGenerated(null)

    try {
      const res = await fetch('/api/teacher/assignments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setGenerated(data)
    } catch (e: any) {
      setError(e.message ?? 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  if (generated) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <button
          onClick={() => setGenerated(null)}
          aria-label="Back to form"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none rounded"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to edit
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{generated.title}</h1>
              <p className="text-gray-600 text-sm mt-1">
                {generated.totalMarks} marks · {generated.enrolledCount} students · Due{' '}
                {new Date(generated.dueDate).toLocaleDateString()}
              </p>
            </div>
            {generated.isPublished ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Published
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                Draft
              </span>
            )}
          </div>

          <div className="space-y-4">
            {generated.questions.map((q) => (
              <div
                key={q.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    Q{q.id}. {q.question}
                  </p>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full shrink-0">
                    {q.marks} mark{q.marks !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{q.type}</p>
                {q.options && (
                  <ul className="space-y-1">
                    {q.options.map((opt, i) => (
                      <li key={i} className="text-sm text-gray-700 pl-4">
                        {String.fromCharCode(65 + i)}. {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {!generated.isPublished && (
            <button
              onClick={async () => {
                await fetch(`/api/teacher/assignments/${generated.assignmentId}`, { method: 'PUT' })
                router.push('/teacher/assignments')
              }}
              className="flex items-center gap-2 min-h-[44px] px-6 py-3 bg-[#006e2f] text-white font-semibold rounded-xl hover:bg-[#005828] transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              Publish to {generated.enrolledCount} Students
            </button>
          )}
          <button
            onClick={() => router.push('/teacher/assignments')}
            className="min-h-[44px] px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none"
          >
            {generated.isPublished ? 'View Assignments' : 'Save as Draft'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none rounded"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Assignment</h1>

      {error && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        {/* Class */}
        <div>
          <label htmlFor="ca-class" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Class <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <select
            id="ca-class"
            value={form.classId}
            onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
            required
            aria-required="true"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
          >
            <option value="">Select class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className} (Grade {c.grade} · {c.board})
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="ca-subject" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Subject <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <select
            id="ca-subject"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            required
            aria-required="true"
            disabled={!form.classId}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none disabled:opacity-60"
          >
            <option value="">Select subject…</option>
            {availableSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Topic */}
        <div>
          <label htmlFor="ca-topic" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Topic <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="ca-topic"
            type="text"
            value={form.topic}
            onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
            required
            aria-required="true"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            placeholder="e.g. Photosynthesis, Fractions, World War II"
          />
        </div>

        {/* Complexity */}
        <fieldset>
          <legend className="block text-sm font-semibold text-gray-700 mb-1.5">
            Complexity <span aria-hidden="true" className="text-red-500">*</span>
          </legend>
          <div className="flex gap-2">
            {COMPLEXITY_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, complexity: c }))}
                aria-pressed={form.complexity === c}
                className={`min-h-[36px] px-4 py-1.5 rounded-full border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none
                  ${form.complexity === c
                    ? 'bg-[#006e2f] text-white border-[#006e2f]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#006e2f]'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Due Date */}
        <div>
          <label htmlFor="ca-due" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Due Date <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="ca-due"
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            required
            aria-required="true"
            min={minDate}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
          />
        </div>

        {/* Instructions */}
        <div>
          <label htmlFor="ca-instructions" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Instructions <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <textarea
            id="ca-instructions"
            value={form.instructions}
            onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none resize-none"
            placeholder="Any specific instructions for students…"
          />
        </div>

        {/* Draft toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isDraft}
            onChange={(e) => setForm((f) => ({ ...f, isDraft: e.target.checked }))}
            className="w-4 h-4 accent-[#006e2f]"
            aria-label="Save as draft (do not publish to students yet)"
          />
          <span className="text-sm text-gray-700">Save as draft — don&apos;t publish to students yet</span>
        </label>

        <button
          type="submit"
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 min-h-[44px] bg-[#006e2f] text-white font-semibold rounded-xl py-3 hover:bg-[#005828] transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none disabled:opacity-60"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          {generating ? 'Generating with AI…' : 'Generate Assignment'}
        </button>
      </form>
    </main>
  )
}
