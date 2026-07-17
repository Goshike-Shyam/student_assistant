'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users, BookOpen, BarChart3, CheckCircle, AlertTriangle, Clock,
  ClipboardList, UserPlus, Bell,
} from 'lucide-react'

interface Overview {
  totalStudents: number
  totalClasses: number
  totalAssignments: number
  avgClassScore: number
  submissionRate: number
  pendingReviews: number
}

const KPI_CARDS = [
  {
    key: 'totalStudents',
    label: 'Total Students',
    icon: Users,
    colour: 'bg-blue-50 text-blue-600',
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalClasses',
    label: 'Active Classes',
    icon: BookOpen,
    colour: 'bg-green-50 text-green-600',
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalAssignments',
    label: 'Assignments Created',
    icon: BarChart3,
    colour: 'bg-purple-50 text-purple-600',
    format: (v: number) => v.toString(),
  },
  {
    key: 'avgClassScore',
    label: 'Avg Class Score',
    icon: CheckCircle,
    colour: 'bg-amber-50 text-amber-600',
    format: (v: number) => `${v.toFixed(1)}%`,
  },
  {
    key: 'submissionRate',
    label: 'Submission Rate',
    icon: Clock,
    colour: 'bg-teal-50 text-teal-600',
    format: (v: number) => `${v.toFixed(1)}%`,
  },
  {
    key: 'pendingReviews',
    label: 'Pending Reviews',
    icon: AlertTriangle,
    colour: 'bg-red-50 text-red-600',
    format: (v: number) => v.toString(),
  },
]

interface ActivityItem {
  type:      'SUBMISSION' | 'ENROLLMENT' | 'REMINDER'
  childName: string
  detail:    string
  timeAgo:   string
  timestamp: string
}

export default function TeacherDashboard() {
  const [overview,       setOverview]       = useState<Overview | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/teacher/analytics').then((r) => r.json()),
    ])
      .then(([analytics]) => {
        if (analytics.error) {
          setError(analytics.error)
          return
        }
        setOverview(analytics.overview)
        setRecentActivity(analytics.recentActivity ?? [])
      })
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8" aria-busy="true" aria-label="Loading dashboard">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">Welcome back! Here&apos;s your class overview.</p>
      </div>

      {error && (
        <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Pending reviews alert */}
      {overview && overview.pendingReviews > 0 && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
          <span className="text-amber-800 font-medium">
            {overview.pendingReviews} submission{overview.pendingReviews !== 1 ? 's' : ''} waiting
            for your review.
          </span>
          <Link
            href="/teacher/assignments"
            className="ml-auto text-sm text-amber-700 underline hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none rounded"
          >
            Review now →
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      {overview && (
        <section aria-label="Key performance indicators">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {KPI_CARDS.map((card) => {
              const Icon = card.icon
              const value = overview[card.key as keyof Overview] as number
              return (
                <div
                  key={card.key}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.colour}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900" aria-label={`${card.label}: ${card.format(value)}`}>
                    {card.format(value)}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section aria-labelledby="quick-actions-heading" className="mb-8">
        <h2 id="quick-actions-heading" className="text-lg font-semibold text-gray-900 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Create Assignment',
              href:  '/teacher/assignments/create',
              icon:  <ClipboardList className="h-6 w-6" aria-hidden="true" />,
              color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
            },
            {
              label: 'Add Student',
              href:  '/teacher/students',
              icon:  <UserPlus className="h-6 w-6" aria-hidden="true" />,
              color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
            },
            {
              label: 'View Analytics',
              href:  '/teacher/analytics',
              icon:  <BarChart3 className="h-6 w-6" aria-hidden="true" />,
              color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
            },
            {
              label: 'My Classes',
              href:  '/teacher/classes',
              icon:  <Users className="h-6 w-6" aria-hidden="true" />,
              color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
            },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl
                border font-medium text-sm text-center min-h-[80px] transition-colors
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[#006e2f] focus-visible:ring-offset-2
                ${action.color}`}
              aria-label={action.label}
            >
              {action.icon}
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent submissions / activity placeholder */}
      {recentActivity.length > 0 && (
        <section aria-labelledby="activity-heading" className="mb-8">
          <h2 id="activity-heading" className="text-lg font-semibold text-gray-900 mb-3">
            Recent Activity
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <span className="text-lg mt-0.5" aria-hidden="true">
                  {item.type === 'SUBMISSION' ? '📝' : item.type === 'ENROLLMENT' ? '🎓' : '🔔'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.childName}</p>
                  <p className="text-sm text-gray-600">{item.detail}</p>
                </div>
                <time
                  className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0"
                  dateTime={item.timestamp}
                >
                  {item.timeAgo}
                </time>
              </div>
            ))}
          </div>
        </section>
      )}

      {recentActivity.length === 0 && !loading && (
        <section aria-labelledby="activity-heading-empty" className="mb-8">
          <h2 id="activity-heading-empty" className="text-lg font-semibold text-gray-900 mb-3">
            Recent Activity
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-gray-500">
              No recent activity. Create your first assignment to get started.
            </p>
          </div>
        </section>
      )}
    </main>
  )
}
