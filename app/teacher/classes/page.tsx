'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Users, BookOpen, Copy, Check } from 'lucide-react'
import { getSubjectsByBoardAndGrade } from '@/lib/subjects-seed'
import { getAcademicYearLabel, type Board } from '@/lib/academic-year'

interface ClassData {
  id: string
  className: string
  grade: string
  board: string
  academicYear: string
  subjects: string[]
  studentCount: number
}

const GRADE_OPTIONS = ['1','2','3','4','5','6','7','8','9','10','11','12']
const BOARD_OPTIONS = ['CBSE','ICSE','STATE_BOARD','COMMON_CORE','OTHER']

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    className: '',
    grade: '',
    board: '',
    subjects: [] as string[],
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (form.grade && form.board) {
      setAvailableSubjects(getSubjectsByBoardAndGrade(form.board, Number(form.grade)))
      setForm((f) => ({ ...f, subjects: [] }))
    }
  }, [form.grade, form.board])

  async function fetchClasses() {
    try {
      const res = await fetch('/api/teacher/classes')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClasses(data)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault()
    if (!form.className.trim() || !form.grade || !form.board || form.subjects.length === 0) {
      setFormError('All fields including at least one subject are required')
      return
    }
    setSubmitting(true)
    setFormError('')

    const res = await fetch('/api/teacher/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setFormError(data.error ?? 'Failed to create class')
      setSubmitting(false)
      return
    }

    setShowForm(false)
    setForm({ className: '', grade: '', board: '', subjects: [] })
    fetchClasses()
    setSubmitting(false)
  }

  async function handleGenerateInvite(classId: string) {
    const res = await fetch(`/api/teacher/classes/${classId}/invite-token`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      await navigator.clipboard.writeText(data.url)
      setCopiedId(classId)
      setTimeout(() => setCopiedId(null), 3000)
    }
  }

  function toggleSubject(subject: string) {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(subject)
        ? f.subjects.filter((s) => s !== subject)
        : [...f.subjects, subject],
    }))
  }

  if (loading) {
    return (
      <div className="p-8 animate-pulse" aria-busy="true" aria-label="Loading classes">
        <div className="h-8 bg-gray-200 rounded w-32 mb-6" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-40 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600 text-sm mt-1">{classes.length} class{classes.length !== 1 ? 'es' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#006e2f] text-white font-semibold rounded-xl hover:bg-[#005828] transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
          aria-expanded={showForm}
          aria-controls="create-class-form"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Create New Class
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Create class form */}
      {showForm && (
        <div
          id="create-class-form"
          className="mb-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          aria-label="Create new class form"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Class</h2>

          {formError && (
            <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateClass} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="cc-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Class Name <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  id="cc-name"
                  type="text"
                  value={form.className}
                  onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
                  placeholder="e.g. Grade 7A"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="cc-grade" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Grade <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <select
                  id="cc-grade"
                  value={form.grade}
                  onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
                  disabled={submitting}
                >
                  <option value="">Select grade</option>
                  {GRADE_OPTIONS.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="cc-board" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Board <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <select
                  id="cc-board"
                  value={form.board}
                  onChange={(e) => setForm((f) => ({ ...f, board: e.target.value }))}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
                  disabled={submitting}
                >
                  <option value="">Select board</option>
                  {BOARD_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {/* Academic year — auto-detected from board */}
            {form.board && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Academic Year
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm">
                  {getAcademicYearLabel(form.board as Board)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-detected based on selected curriculum
                </p>
              </div>
            )}

            {/* Subjects multi-select */}
            {availableSubjects.length > 0 && (
              <fieldset>
                <legend className="block text-sm font-semibold text-gray-700 mb-2">
                  Subjects <span aria-hidden="true" className="text-red-500">*</span>
                  <span className="text-gray-500 font-normal ml-1">(select all you teach)</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      aria-pressed={form.subjects.includes(s)}
                      className={`min-h-[36px] px-3 py-1 rounded-full border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none
                        ${form.subjects.includes(s)
                          ? 'bg-[#006e2f] text-white border-[#006e2f]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#006e2f]'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[44px] px-6 py-2.5 bg-[#006e2f] text-white font-semibold rounded-xl hover:bg-[#005828] transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none disabled:opacity-60"
              >
                {submitting ? 'Creating…' : 'Create Class'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="min-h-[44px] px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes grid */}
      {classes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-500 font-medium">No classes yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Create New Class" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list" aria-label="Class list">
          {classes.map((cls) => (
            <article
              key={cls.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3"
              role="listitem"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg leading-tight">{cls.className}</h2>
                  <p className="text-gray-600 text-sm mt-0.5">Grade {cls.grade} · {cls.board}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium shrink-0">
                  {cls.academicYear}
                </span>
              </div>

              {/* Subject pills */}
              <div className="flex flex-wrap gap-1.5" aria-label="Subjects">
                {cls.subjects.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                    {s}
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" aria-hidden="true" />
                <span aria-label={`${cls.studentCount} students enrolled`}>
                  {cls.studentCount} student{cls.studentCount !== 1 ? 's' : ''}
                </span>
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-gray-100">
                <Link
                  href={`/teacher/classes/${cls.id}/students`}
                  className="flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
                >
                  <Users className="w-4 h-4" aria-hidden="true" />
                  Manage Students
                </Link>
                <Link
                  href={`/teacher/assignments/create?classId=${cls.id}`}
                  className="flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  Create Assignment
                </Link>
                <button
                  onClick={() => handleGenerateInvite(cls.id)}
                  aria-label={copiedId === cls.id ? 'Invite link copied' : `Generate invite link for ${cls.className}`}
                  className="flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
                >
                  {copiedId === cls.id ? (
                    <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
                  ) : (
                    <Copy className="w-4 h-4" aria-hidden="true" />
                  )}
                  {copiedId === cls.id ? 'Link Copied!' : 'Generate Invite Link'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
