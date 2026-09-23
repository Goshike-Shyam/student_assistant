'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Calendar } from 'lucide-react'
import { formatAcademicYearEnd } from '@/lib/session-config'

export default function RenewPage() {
  const [board, setBoard] = useState('CBSE')

  useEffect(() => {
    let active = true

    const loadBoard = async () => {
      try {
        const response = await fetch('/api/student/profile', {
          credentials: 'include',
        })
        if (!response.ok) return

        const data = (await response.json()) as { board?: string }
        if (active && data.board) {
          setBoard(data.board)
        }
      } catch {
        // Keep the default board label if the profile request is unavailable.
      }
    }

    void loadBoard()

    return () => {
      active = false
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.replace('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-3xl border border-white/70 bg-white/90 p-8 shadow-2xl shadow-slate-200/60 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-black/30 md:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Calendar size={30} aria-hidden="true" />
          </div>

          <div className="text-center">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <BookOpen size={14} aria-hidden="true" />
              Academic year renewal required
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
              Your current academic year has ended
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
              Access for {board} ended on {formatAcademicYearEnd(board)}. Renew your subscription to continue using Student Assistant for the new academic year.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            Contact your school or parent to renew access. Once renewed, sign in again and your dashboard will reopen automatically.
          </div>

          <div className="mt-8 space-y-3">
            <a
              href="/subscribe"
              className="block w-full rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Renew Subscription
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}