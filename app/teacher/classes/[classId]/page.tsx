'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Users, ClipboardList, BarChart3, UserPlus,
  BookOpen, Bell, ChevronLeft,
} from 'lucide-react'
import { TeacherBreadcrumbs } from '@/components/teacher/TeacherBreadcrumbs'

interface ClassInfo {
  id:           string
  className:    string
  grade:        string
  board:        string
  academicYear: string
  subjects:     string[]
  studentCount: number
}

interface Student {
  childId:   string
  name:      string
  email:     string
  grade:     number | null
  enrolledAt: string
  submissions: Array<{ status: string }>
}

interface Assignment {
  id:         string
  topic:      string
  subject:    string
  dueDate:    string | null
  totalMarks: number
  submittedCount: number
  totalCount:     number
}

type TabId = 'students' | 'assignments'

export default function ClassDashboardPage() {
  const params  = useParams()
  const classId = params.classId as string

  const [classInfo,   setClassInfo]   = useState<ClassInfo | null>(null)
  const [students,    setStudents]    = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [activeTab,   setActiveTab]   = useState<TabId>('students')
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => {
    async function fetchAll() {
      try {
        const [classRes, studentsRes, assignmentsRes] = await Promise.all([
          fetch(`/api/teacher/classes`),
          fetch(`/api/teacher/classes/${classId}/students`),
          fetch(`/api/teacher/assignments?classId=${classId}`),
        ])

        const [allClasses, studentsData, assignmentsData] = await Promise.all([
          classRes.json(),
          studentsRes.json(),
          assignmentsRes.json(),
        ])

        if (!classRes.ok)       throw new Error(allClasses.error ?? 'Failed to load class')
        if (!studentsRes.ok)    throw new Error(studentsData.error ?? 'Failed to load students')

        const found = Array.isArray(allClasses)
          ? allClasses.find((c: ClassInfo) => c.id === classId)
          : null

        setClassInfo(found ?? studentsData.class ?? null)
        setStudents(studentsData.students ?? [])
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load class')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [classId])

  if (loading) {
    return (
      <div className="p-8 animate-pulse" aria-busy="true" aria-label="Loading class dashboard">
        <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-48" />
      </div>
    )
  }

  const className = classInfo?.className ?? 'Class'

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <TeacherBreadcrumbs dynamicLabels={{ [classId]: className }} />

      {/* Back link */}
      <Link
        href="/teacher/classes"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600
          hover:text-gray-900 mb-4 min-h-[44px] focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-[#006e2f]
          focus-visible:ring-offset-2 rounded-sm"
        aria-label="Back to all classes"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to My Classes
      </Link>

      {error && (
        <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Class header */}
      {classInfo && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{classInfo.className}</h1>
              <p className="text-gray-600 text-sm mt-1">
                Grade {classInfo.grade} · {classInfo.board} · {classInfo.academicYear}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Subjects">
                {classInfo.subjects.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>{classInfo.studentCount} student{classInfo.studentCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-3"
            aria-label="Class quick actions"
          >
            <Link
              href={`/teacher/classes/${classId}/students`}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2
                bg-[#006e2f] text-white text-sm font-semibold rounded-xl
                hover:bg-[#005828] transition-colors
                focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Enroll Student
            </Link>
            <Link
              href={`/teacher/assignments/create?classId=${classId}`}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2
                bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl
                hover:bg-gray-50 transition-colors
                focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            >
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              Create Assignment
            </Link>
            <Link
              href={`/teacher/analytics`}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2
                bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl
                hover:bg-gray-50 transition-colors
                focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              View Analytics
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 border-b border-gray-200 mb-6"
        role="tablist"
        aria-label="Class sections"
      >
        {([
          { id: 'students' as TabId,    label: 'Students',    icon: Users },
          { id: 'assignments' as TabId, label: 'Assignments', icon: BookOpen },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium
              border-b-2 transition-colors min-h-[44px]
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-[#006e2f] focus-visible:ring-inset
              ${activeTab === id
                ? 'border-[#0058be] text-[#0058be]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Students tab */}
      <div
        id="panel-students"
        role="tabpanel"
        aria-labelledby="tab-students"
        hidden={activeTab !== 'students'}
      >
        {students.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" aria-hidden="true" />
            <p className="text-gray-500">No students enrolled yet.</p>
            <Link
              href={`/teacher/classes/${classId}/students`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-[#0058be] hover:underline
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Enroll first student
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
            <table className="w-full text-sm" role="grid" aria-label="Students">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Student</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Grade</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Enrolled</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">Submissions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.childId} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.grade ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(s.enrolledAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {s.submissions.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignments tab */}
      <div
        id="panel-assignments"
        role="tabpanel"
        aria-labelledby="tab-assignments"
        hidden={activeTab !== 'assignments'}
      >
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" aria-hidden="true" />
            <p className="text-gray-500">No assignments created yet.</p>
            <Link
              href={`/teacher/assignments/create?classId=${classId}`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-[#0058be] hover:underline
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]"
            >
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              Create first assignment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => {
              const pct = a.totalCount > 0
                ? Math.round((a.submittedCount / a.totalCount) * 100)
                : 0
              return (
                <div
                  key={a.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{a.topic}</p>
                      <p className="text-sm text-gray-600">{a.subject}</p>
                    </div>
                    {a.dueDate && (
                      <span className="text-xs text-gray-500 shrink-0">
                        Due {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Submissions</span>
                      <span>{a.submittedCount}/{a.totalCount} ({pct}%)</span>
                    </div>
                    <div
                      className="h-2 bg-gray-100 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${a.topic} submission progress: ${pct}%`}
                    >
                      <div
                        className="h-full bg-[#006e2f] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Notification reminder for pending reviews */}
      <div className="mt-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Bell className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />
        <p className="text-sm text-amber-800">
          Check the{' '}
          <Link
            href="/teacher/assignments"
            className="font-semibold underline hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            Assignments page
          </Link>
          {' '}for submissions awaiting review.
        </p>
      </div>
    </main>
  )
}
