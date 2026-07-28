'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BOARD_OPTIONS = ['CBSE', 'ICSE', 'STATE_BOARD', 'INTERNATIONAL'] as const
const SUBJECT_OPTIONS = [
  'English',
  'Mathematics',
  'Science',
  'Social Studies',
  'Hindi',
  'Computer Science',
]

export default function CreateClassPage() {
  const router = useRouter()
  const [className, setClassName] = useState('')
  const [grade, setGrade] = useState('')
  const [board, setBoard] = useState<typeof BOARD_OPTIONS[number]>('CBSE')
  const [subjects, setSubjects] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function toggleSubject(subject: string) {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!className.trim() || !grade.trim() || subjects.length === 0) {
      setError('Class name, grade, and at least one subject are required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: className.trim(),
          grade: grade.trim(),
          board,
          subjects,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to create class')

      const createdId = (data as { id?: string }).id
      if (createdId) {
        router.push(`/teacher/classes/${createdId}`)
        return
      }
      router.push('/teacher/classes')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create class')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Class</h1>
        <p className="text-sm text-gray-600 mb-6">Set up a new class and add the subjects you teach.</p>

        {error && (
          <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" aria-label="Create class form">
          <div>
            <label htmlFor="class-name" className="block text-sm font-semibold text-gray-800 mb-1.5">
              Class Name
            </label>
            <input
              id="class-name"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. 8th Class Science"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="grade" className="block text-sm font-semibold text-gray-800 mb-1.5">
                Grade
              </label>
              <input
                id="grade"
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. 8"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
              />
            </div>

            <div>
              <label htmlFor="board" className="block text-sm font-semibold text-gray-800 mb-1.5">
                Board
              </label>
              <select
                id="board"
                value={board}
                onChange={(e) => setBoard(e.target.value as typeof BOARD_OPTIONS[number])}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
              >
                {BOARD_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="block text-sm font-semibold text-gray-800 mb-2">Subjects</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUBJECT_OPTIONS.map((subject) => {
                const checked = subjects.includes(subject)
                return (
                  <label
                    key={subject}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${checked ? 'border-[#006e2f] bg-green-50 text-green-800' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSubject(subject)}
                      className="accent-[#006e2f]"
                    />
                    <span>{subject}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] px-5 py-2.5 bg-[#006e2f] text-white rounded-xl font-semibold text-sm hover:bg-[#005828] transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
          >
            {submitting ? 'Creating...' : 'Create Class'}
          </button>
        </form>
      </div>
    </main>
  )
}
