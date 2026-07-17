'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer, Legend, Cell,
} from 'recharts'
import { Download, Users, BookOpen, BarChart3, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface Analytics {
  overview: {
    totalStudents: number
    totalClasses: number
    totalAssignments: number
    avgClassScore: number
    submissionRate: number
    pendingReviews: number
  }
  assignmentCompletion: Array<{ assignmentTopic: string; submitted: number; total: number; avgScore: number }>
  subjectPerformance: Array<{ subject: string; avgScore: number; attempts: number }>
  studentLeaderboard: Array<{ childName: string; avgScore: number; submittedCount: number; grade: number | null }>
  scoreDistribution: Array<{ range: string; count: number }>
  weeklySubmissions: Array<{ week: string; submitted: number }>
  atRiskStudents: Array<{ childName: string; parentEmail: string; notStartedCount: number }>
}

const SCORE_DIST_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e']

const TOOLTIP_STYLE = {
  contentStyle: { color: '#111827', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 },
}

const AXIS_TICK = { fill: '#374151', fontSize: 12 }

const KPI = [
  { key: 'totalStudents', label: 'Total Students', icon: Users, colour: 'text-blue-600 bg-blue-50' },
  { key: 'totalClasses', label: 'Classes', icon: BookOpen, colour: 'text-green-600 bg-green-50' },
  { key: 'totalAssignments', label: 'Assignments', icon: BarChart3, colour: 'text-purple-600 bg-purple-50' },
  { key: 'avgClassScore', label: 'Avg Score', icon: CheckCircle, colour: 'text-amber-600 bg-amber-50', fmt: (v: number) => `${v}%` },
  { key: 'submissionRate', label: 'Submission Rate', icon: Clock, colour: 'text-teal-600 bg-teal-50', fmt: (v: number) => `${v}%` },
  { key: 'pendingReviews', label: 'Pending Reviews', icon: AlertTriangle, colour: 'text-red-600 bg-red-50' },
]

export default function TeacherAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/teacher/analytics')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch((e) => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  function exportPdf() {
    alert('PDF export is not available yet. Install html2canvas and jspdf packages to enable it.')
  }

  if (loading) {
    return <div className="p-8 animate-pulse" aria-busy="true"><div className="h-8 bg-gray-200 rounded w-48" /></div>
  }

  if (error) {
    return <div className="p-8"><div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div></div>
  }

  if (!data) return null

  const hasData = data.overview.totalAssignments > 0

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 text-sm mt-1">Your class performance overview</p>
        </div>
        <button
          onClick={exportPdf}
          aria-label="Export analytics as PDF"
          className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Export PDF
        </button>
      </div>

      <div className="space-y-8">
        {/* Section 1: KPI Overview */}
        <section aria-label="Overview statistics">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {KPI.map((k) => {
              const Icon = k.icon
              const val = data.overview[k.key as keyof typeof data.overview] as number
              return (
                <div key={k.key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.colour}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">{k.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900" aria-label={`${k.label}: ${k.fmt ? k.fmt(val) : val}`}>
                    {k.fmt ? k.fmt(val) : val}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {!hasData ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-gray-500 font-medium">No assignment data yet</p>
            <p className="text-gray-400 text-sm">Charts will appear once you create and publish assignments.</p>
          </div>
        ) : (
          <>
            {/* Section 2: Assignment Completion */}
            {data.assignmentCompletion.length > 0 && (
              <section aria-label="Assignment completion bar chart" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Assignment Completion</h2>
                <div
                  role="img"
                  aria-label="Bar chart showing assignment completion percentages. X-axis shows assignment topics, Y-axis shows submission percentage."
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.assignmentCompletion} margin={{ top: 4, right: 16, bottom: 40, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="assignmentTopic" tick={AXIS_TICK} angle={-30} textAnchor="end" interval={0} />
                      <YAxis tick={AXIS_TICK} unit="%" domain={[0, 100]} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={((val: number, name: string) => [`${val.toFixed(1)}%`, 'Completion']) as any} />
                      <Bar
                        dataKey={(row) => row.total > 0 ? Math.round((row.submitted / row.total) * 100) : 0}
                        name="Completion %"
                        fill="#2563EB"
                        radius={[4, 4, 0, 0]}
                        aria-label="Assignment completion rate"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Section 3: Subject Performance */}
            {data.subjectPerformance.length > 0 && (
              <section aria-label="Subject performance bar chart" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Subject Performance</h2>
                <div role="img" aria-label="Bar chart showing average scores per subject.">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.subjectPerformance} margin={{ top: 4, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="subject" tick={AXIS_TICK} />
                      <YAxis tick={AXIS_TICK} unit="%" domain={[0, 100]} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={((val: number) => [`${val.toFixed(1)}%`, 'Avg Score']) as any} />
                      <Bar dataKey="avgScore" name="Avg Score %" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Section 4: Score Distribution */}
            {data.scoreDistribution.some((d) => d.count > 0) && (
              <section aria-label="Score distribution bar chart" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Score Distribution</h2>
                <div role="img" aria-label="Bar chart showing number of students in each score range.">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.scoreDistribution} margin={{ top: 4, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="range" tick={AXIS_TICK} />
                      <YAxis tick={AXIS_TICK} allowDecimals={false} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={((val: number) => [val, 'Students']) as any} />
                      <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                        {data.scoreDistribution.map((_, i) => (
                          <Cell key={i} fill={SCORE_DIST_COLORS[i % SCORE_DIST_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-2 justify-center flex-wrap" aria-label="Legend">
                  {data.scoreDistribution.map((d, i) => (
                    <div key={d.range} className="flex items-center gap-1.5 text-xs text-gray-700">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: SCORE_DIST_COLORS[i % SCORE_DIST_COLORS.length] }} aria-hidden="true" />
                      {d.range}%
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 5: Weekly Submissions */}
            {data.weeklySubmissions.some((w) => w.submitted > 0) && (
              <section aria-label="Weekly submissions line chart" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Weekly Submissions</h2>
                <div role="img" aria-label="Line chart showing number of submissions received each week.">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data.weeklySubmissions} margin={{ top: 4, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="week" tick={AXIS_TICK} />
                      <YAxis tick={AXIS_TICK} allowDecimals={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Line type="monotone" dataKey="submitted" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Submissions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Section 6: Student Leaderboard */}
            {data.studentLeaderboard.length > 0 && (
              <section aria-label="Student leaderboard" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Student Leaderboard</h2>
                <div className="overflow-auto">
                  <table className="w-full text-sm" aria-label="Top 10 students by average score">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Rank</th>
                        <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Student</th>
                        <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Avg Score</th>
                        <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Submitted</th>
                        <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.studentLeaderboard.map((s, i) => (
                        <tr key={s.childName} className="border-b border-gray-50">
                          <td className="px-4 py-2.5 font-bold text-gray-900">#{i + 1}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-900">{s.childName}</td>
                          <td className="px-4 py-2.5 text-gray-700">{s.avgScore.toFixed(1)}%</td>
                          <td className="px-4 py-2.5 text-gray-700">{s.submittedCount}</td>
                          <td className="px-4 py-2.5 text-gray-700">{s.grade ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Section 7: At Risk Students */}
            {data.atRiskStudents.length > 0 && (
              <section aria-label="At risk students" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  At Risk Students
                </h2>
                <div className="overflow-auto">
                  <table className="w-full text-sm" aria-label="Students with multiple assignments not started">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Student</th>
                        <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Not Started</th>
                        <th scope="col" className="text-left px-4 py-2.5 font-semibold text-gray-700">Parent Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.atRiskStudents.map((s) => (
                        <tr key={s.childName} className="border-b border-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-900">{s.childName}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              {s.notStartedCount}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-600 text-xs">{s.parentEmail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
