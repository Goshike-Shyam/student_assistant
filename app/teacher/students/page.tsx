'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, Search } from 'lucide-react'

interface StudentData {
  id: string
  name: string
  email: string
  parentEmail: string | null
  grade: number | null
  curriculum: string | null
  className: string
  classId: string
  enrolledAt: string
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      const res = await fetch('/api/teacher/students')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStudents(data)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return <div className="p-8 animate-pulse" aria-busy="true"><div className="h-8 bg-gray-200 rounded w-40" /></div>
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
        <p className="text-gray-600 text-sm mt-1">{students.length} students across all classes</p>
      </div>

      {error && <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <label htmlFor="student-search-all" className="sr-only">Search students</label>
        <input
          id="student-search-all"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-500">No students found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
          <table className="w-full text-sm" aria-label="All students">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Student</th>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Class</th>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Grade</th>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Parent Email</th>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={`${s.id}-${s.classId}`} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.className}</td>
                  <td className="px-4 py-3 text-gray-700">{s.grade ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.parentEmail ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {new Date(s.enrolledAt).toLocaleDateString()}
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
