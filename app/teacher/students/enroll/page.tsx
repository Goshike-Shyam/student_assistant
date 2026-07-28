'use client'

import { useEffect, useMemo, useState } from 'react'
import { UserPlus } from 'lucide-react'

interface TeacherClass {
  id: string
  className: string
  grade: string
  board: string
}

interface SearchStudent {
  id: string
  name: string
  email: string
}

export default function TeacherEnrollStudentPage() {
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchStudent[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [searching, setSearching] = useState(false)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadClasses() {
      setLoadingClasses(true)
      try {
        const res = await fetch('/api/teacher/classes', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to load classes')

        if (!cancelled) {
          setClasses(Array.isArray(data) ? data : [])
          setSelectedClassId(Array.isArray(data) && data[0] ? data[0].id : '')
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load classes')
        }
      } finally {
        if (!cancelled) setLoadingClasses(false)
      }
    }

    void loadClasses()
    return () => {
      cancelled = true
    }
  }, [])

  async function searchStudents() {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      return
    }

    setSearching(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/teacher/students/search?q=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to search students')
      setResults(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to search students')
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  async function enrollStudent(student: SearchStudent) {
    if (!selectedClassId) {
      setError('Please select a class first')
      return
    }

    setEnrollingId(student.id)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/teacher/classes/${selectedClassId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: student.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Enrollment failed')

      setSuccess(`${student.name} enrolled successfully`)
      setResults((prev) => prev.filter((s) => s.id !== student.id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Enrollment failed')
    } finally {
      setEnrollingId(null)
    }
  }

  const selectedClassLabel = useMemo(() => {
    const cls = classes.find((c) => c.id === selectedClassId)
    return cls ? `${cls.className} (Grade ${cls.grade} - ${cls.board})` : ''
  }, [classes, selectedClassId])

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enroll Student</h1>
        <p className="text-sm text-gray-600 mt-1">Choose a class, search students, and enroll them.</p>
      </div>

      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <label htmlFor="class-select" className="block text-sm font-semibold text-gray-800 mb-1.5">
            Class
          </label>
          <select
            id="class-select"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full md:w-[420px] px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            disabled={loadingClasses || classes.length === 0}
          >
            {classes.length === 0 && <option value="">No classes available</option>}
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.className} (Grade {cls.grade} - {cls.board})
              </option>
            ))}
          </select>
          {selectedClassLabel && (
            <p className="text-xs text-gray-500 mt-1">Selected: {selectedClassLabel}</p>
          )}
        </div>

        <div>
          <label htmlFor="student-query" className="block text-sm font-semibold text-gray-800 mb-1.5">
            Student Search
          </label>
          <div className="flex gap-2">
            <input
              id="student-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void searchStudents()
                }
              }}
              placeholder="Type student name or email"
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={() => void searchStudents()}
              disabled={searching || query.trim().length < 2 || !selectedClassId}
              className="min-h-[44px] px-4 py-2 bg-[#006e2f] text-white text-sm font-semibold rounded-lg hover:bg-[#005828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Matching Students</h2>
        </div>

        {results.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">
            Search with at least 2 characters to view students.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {results.map((student) => (
              <li key={student.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void enrollStudent(student)}
                  disabled={!selectedClassId || enrollingId === student.id}
                  className="min-h-[40px] px-3 py-2 text-sm rounded-lg bg-[#006e2f] text-white hover:bg-[#005828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none inline-flex items-center gap-1.5"
                  aria-label={`Enroll ${student.name}`}
                >
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  {enrollingId === student.id ? 'Enrolling...' : 'Enroll'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
