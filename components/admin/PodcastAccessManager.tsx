'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'students' | 'teachers'

type Role = 'STUDENT' | 'TEACHER'

interface UserRow {
  id: string
  name: string
  grade?: string
  board?: string
  parentName?: string
  parentEmail?: string
  email?: string
  schoolName?: string
  isActive?: boolean
  podcastEnabled: boolean
  enabledAt: string | null
  notes: string
}

interface AccessPayload {
  students: UserRow[]
  teachers: UserRow[]
}

export function PodcastAccessManager() {
  const [tab, setTab] = useState<Tab>('students')
  const [students, setStudents] = useState<UserRow[]>([])
  const [teachers, setTeachers] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    let mounted = true

    fetch('/api/admin/features/podcast')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load access list')
        return (await res.json()) as AccessPayload
      })
      .then((data) => {
        if (!mounted) return

        const nextStudents = data.students ?? []
        const nextTeachers = data.teachers ?? []
        setStudents(nextStudents)
        setTeachers(nextTeachers)

        const nextNotes: Record<string, string> = {}
        ;[...nextStudents, ...nextTeachers].forEach((user) => {
          nextNotes[user.id] = user.notes ?? ''
        })
        setNotes(nextNotes)
      })
      .catch((err) => {
        console.error('[PodcastAccessManager]', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const toggle = async (userId: string, userRole: Role, current: boolean) => {
    setSaving(userId)
    try {
      const res = await fetch('/api/admin/features/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userRole,
          isEnabled: !current,
          notes: notes[userId] ?? '',
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update access')
      }

      const updateRow = (row: UserRow): UserRow =>
        row.id === userId
          ? {
              ...row,
              podcastEnabled: !current,
              enabledAt: !current ? new Date().toISOString() : null,
              notes: notes[userId] ?? '',
            }
          : row

      if (userRole === 'STUDENT') {
        setStudents((prev) => prev.map(updateRow))
      } else {
        setTeachers((prev) => prev.map(updateRow))
      }
    } catch (err) {
      console.error('[PodcastAccessManager] toggle failed:', err)
      window.alert('Failed to update. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  const currentList = tab === 'students' ? students : teachers

  const filtered = useMemo(() => {
    const needle = search.toLowerCase().trim()
    if (!needle) return currentList

    return currentList.filter((user) => {
      const email = (user.parentEmail ?? user.email ?? '').toLowerCase()
      return user.name.toLowerCase().includes(needle) || email.includes(needle)
    })
  }, [currentList, search])

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: 'Students with Podcast',
            value: students.filter((item) => item.podcastEnabled).length,
            total: students.length,
            color: 'bg-blue-600',
          },
          {
            label: 'Teachers with Podcast',
            value: teachers.filter((item) => item.podcastEnabled).length,
            total: teachers.length,
            color: 'bg-indigo-600',
          },
          {
            label: 'Total Students',
            value: students.length,
            color: 'bg-slate-600',
          },
          {
            label: 'Total Teachers',
            value: teachers.length,
            color: 'bg-slate-600',
          },
        ].map((stat) => (
          <div key={stat.label} className={cn('rounded-xl p-4 text-white', stat.color)}>
            <p className="mb-1 text-xs text-white/80">{stat.label}</p>
            <p className="text-2xl font-bold">
              {stat.value}
              {typeof stat.total === 'number' && (
                <span className="ml-1 text-sm font-normal text-white/70">/ {stat.total}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-2" role="tablist" aria-label="Podcast access user tabs">
        {(['students', 'teachers'] as Tab[]).map((nextTab) => (
          <button
            key={nextTab}
            type="button"
            role="tab"
            aria-selected={tab === nextTab}
            onClick={() => {
              setTab(nextTab)
              setSearch('')
            }}
            className={cn(
              'min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              tab === nextTab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600',
            )}
          >
            {nextTab}
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            tab === 'students'
              ? 'Search by name or parent email...'
              : 'Search by name or email...'
          }
          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100"
          aria-label="Search users"
        />
      </div>

      {loading ? (
        <div
          className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
          aria-live="polite"
          aria-busy="true"
        >
          Loading users...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
          <table className="w-full text-sm" aria-label={`${tab} podcast access`}>
            <thead>
              <tr className="bg-slate-800">
                {(tab === 'students'
                  ? ['Name', 'Board', 'Parent Email', 'Notes', 'Podcast Access', 'Since']
                  : ['Name', 'School', 'Email', 'Notes', 'Podcast Access', 'Since']
                ).map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:divide-slate-700 dark:bg-slate-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No {tab} found
                  </td>
                </tr>
              )}

              {filtered.map((user, index) => (
                <tr
                  key={user.id}
                  className={
                    index % 2 === 0
                      ? 'bg-white dark:bg-slate-800'
                      : 'bg-gray-50 dark:bg-slate-700/60'
                  }
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                    {tab === 'students' && user.grade && (
                      <span className="ml-1 text-xs text-gray-400">Gr.{user.grade}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">
                    {tab === 'students' ? user.board ?? '—' : user.schoolName ?? '—'}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    {tab === 'students' ? user.parentEmail ?? '—' : user.email ?? '—'}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={notes[user.id] ?? ''}
                      onChange={(event) =>
                        setNotes((prev) => ({
                          ...prev,
                          [user.id]: event.target.value,
                        }))
                      }
                      placeholder="Billing ref, reason..."
                      className="w-full min-w-[140px] rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100"
                      aria-label={`Notes for ${user.name}`}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        toggle(
                          user.id,
                          tab === 'students' ? 'STUDENT' : 'TEACHER',
                          user.podcastEnabled,
                        )
                      }
                      disabled={saving === user.id}
                      aria-pressed={user.podcastEnabled}
                      aria-label={
                        user.podcastEnabled
                          ? `Disable podcast for ${user.name}`
                          : `Enable podcast for ${user.name}`
                      }
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                        'disabled:opacity-50',
                        user.podcastEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
                          user.podcastEnabled ? 'translate-x-6' : 'translate-x-1',
                        )}
                      />
                      <span className="sr-only">{user.podcastEnabled ? 'Enabled' : 'Disabled'}</span>
                    </button>
                    <span
                      className={cn(
                        'ml-2 text-xs font-medium',
                        user.podcastEnabled
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400 dark:text-gray-500',
                      )}
                    >
                      {saving === user.id ? 'Saving...' : user.podcastEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                    {user.enabledAt
                      ? new Date(user.enabledAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Use the notes field to record billing reference or reason before toggling. Changes take effect immediately.
      </p>
    </div>
  )
}
