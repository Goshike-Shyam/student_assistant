'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, UserPlus, Trash2, LayoutDashboard, ClipboardList, Users, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface Student {
  childId: string
  name: string
  email: string
  parentEmail: string | null
  grade: number | null
  curriculum: string | null
  enrolledAt: string
  submissions: Array<{
    assignmentId: string
    status: string
    score: number | null
    submittedAt: string | null
  }>
}

interface ClassInfo {
  id: string
  className: string
  grade: string
  board: string
}

interface Assignment {
  id: string
  topic: string
  subject: string
  dueDate: string
}

const STATUS_STYLES: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  SUBMITTED: 'bg-amber-100 text-amber-800',
  REVIEWED: 'bg-purple-100 text-purple-800',
  RELEASED: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
}

export default function ClassStudentsPage() {
  const params  = useParams()
  const classId = params.classId as string

  const [data,          setData]          = useState<{ class: ClassInfo; students: Student[]; assignments: Assignment[] } | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [searchEmail,   setSearchEmail]   = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string }[]>([])
  const [enrolling,     setEnrolling]     = useState(false)
  const [removing,      setRemoving]      = useState<string | null>(null)
  // Success state after enrollment
  const [enrollSuccess,        setEnrollSuccess]        = useState(false)
  const [enrolledStudentName,  setEnrolledStudentName]  = useState('')

  useEffect(() => {
    fetchStudents()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId])

  async function fetchStudents() {
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/students`)
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setData(d)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  async function searchStudents() {
    if (!searchEmail.trim()) return
    const res = await fetch(`/api/teacher/students/search?q=${encodeURIComponent(searchEmail)}`)
    const d = await res.json()
    if (res.ok) setSearchResults(d)
  }

  async function enrollStudent(childId: string, studentName: string) {
    setEnrolling(true)
    const res = await fetch(`/api/teacher/classes/${classId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId }),
    })
    if (res.ok) {
      setSearchResults([])
      setSearchEmail('')
      setEnrolledStudentName(studentName)
      setEnrollSuccess(true)
      fetchStudents()
    }
    setEnrolling(false)
  }

  async function removeStudent(childId: string) {
    if (!confirm('Remove this student from the class?')) return
    setRemoving(childId)
    await fetch(`/api/teacher/classes/${classId}/students`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId }),
    })
    fetchStudents()
    setRemoving(null)
  }

  if (loading) {
    return <div className="p-8 animate-pulse" aria-busy="true" aria-label="Loading students"><div className="h-8 bg-gray-200 rounded w-48" /></div>
  }

  const className = data?.class.className ?? 'Class'

  return (
    <main className="p-8 max-w-7xl mx-auto">
      {/* Back to class dashboard */}
      <Link
        href={`/teacher/classes/${classId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600
          hover:text-gray-900 mb-4 min-h-[44px]
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[#006e2f] focus-visible:ring-offset-2 rounded-sm"
        aria-label={`Back to ${className}`}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to {className}
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{className}</h1>
        <p className="text-gray-600 text-sm">
          Grade {data?.class.grade} · {data?.class.board} · {data?.students.length ?? 0} students
        </p>
      </div>

      {error && <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      {/* Post-enroll success card */}
      {enrollSuccess && (
        <div
          className="rounded-xl border border-green-200 bg-green-50 p-6 mb-6"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl" aria-hidden="true">✅</span>
            <div>
              <p className="font-semibold text-green-900">
                {enrolledStudentName} enrolled successfully in {className}!
              </p>
              <p className="text-sm text-green-700 mt-0.5">What would you like to do next?</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* PRIMARY CTA */}
            <Link
              href={`/teacher/classes/${classId}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0058be] text-white
                rounded-lg text-sm font-medium hover:bg-[#003da8] min-h-[44px]
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[#0058be] focus-visible:ring-offset-2"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Go to Class Dashboard
            </Link>

            {/* SECONDARY CTA */}
            <Link
              href={`/teacher/assignments/create?classId=${classId}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border
                border-gray-300 text-gray-700 rounded-lg text-sm font-medium
                hover:bg-gray-50 min-h-[44px]
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[#0058be] focus-visible:ring-offset-2"
            >
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              Create Assignment for Class
            </Link>

            {/* TERTIARY CTA */}
            <button
              onClick={() => {
                setEnrollSuccess(false)
                setSearchEmail('')
                setSearchResults([])
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border
                border-gray-300 text-gray-700 rounded-lg text-sm font-medium
                hover:bg-gray-50 min-h-[44px]
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[#0058be] focus-visible:ring-offset-2"
              aria-label="Enroll another student"
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              Enroll Another Student
            </button>
          </div>
        </div>
      )}

      {/* Add student */}
      {!enrollSuccess && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Add Student</h2>
          <div className="flex gap-2">
            <label htmlFor="student-search" className="sr-only">Search by student email or name</label>
            <input
              id="student-search"
              type="search"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
              placeholder="Search by email or name…"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
              aria-label="Search students by email or name"
            />
            <button
              onClick={searchStudents}
              className="min-h-[44px] px-4 py-2 bg-[#006e2f] text-white font-medium rounded-lg text-sm hover:bg-[#005828] transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            >
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <ul className="mt-3 border border-gray-200 rounded-lg overflow-hidden" role="listbox" aria-label="Search results">
              {searchResults.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-0"
                  role="option"
                  aria-selected="false"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                  <button
                    onClick={() => enrollStudent(student.id, student.name)}
                    disabled={enrolling}
                    aria-label={`Enroll ${student.name}`}
                    className="flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 bg-[#006e2f] text-white text-sm rounded-lg hover:bg-[#005828] transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none disabled:opacity-60"
                  >
                    <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                    Enroll
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Students table */}
      {!data || data.students.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No students enrolled yet. Use the search above to add students.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
          <table className="w-full text-sm" role="grid" aria-label="Enrolled students">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Student</th>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Grade</th>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Enrolled</th>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Submissions</th>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((student) => (
                <tr key={student.childId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{student.grade ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {new Date(student.enrolledAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {student.submissions.slice(0, 3).map((sub) => (
                        <span
                          key={sub.assignmentId}
                          className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[sub.status] ?? 'bg-gray-100 text-gray-700'}`}
                          aria-label={`Submission status: ${sub.status}`}
                        >
                          {sub.status.replace('_', ' ')}
                        </span>
                      ))}
                      {student.submissions.length > 3 && (
                        <span className="text-xs text-gray-500">+{student.submissions.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeStudent(student.childId)}
                      disabled={removing === student.childId}
                      aria-label={`Remove ${student.name} from class`}
                      className="min-h-[36px] px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none disabled:opacity-60"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

