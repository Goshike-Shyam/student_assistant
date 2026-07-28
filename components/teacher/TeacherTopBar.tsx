'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { NotificationPanel } from '@/components/shared/NotificationPanel'
import { AppLogo } from '@/components/ui/app-logo'

interface TeacherTopBarProps {
  teacherName: string
  teacherEmail: string
}

function getInitials(teacherName: string): string {
  const initials = teacherName
    ? teacherName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : ''
  return initials || 'T'
}

export function TeacherTopBar({ teacherName, teacherEmail }: TeacherTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = getInitials(teacherName)

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Continue client-side logout fallback.
    }

    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(';').forEach((cookiePart) => {
        const key = cookiePart.trim().split('=')[0]
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
      })
      window.location.replace('/teacher/login')
    }
  }

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-40">
      <Link
        href="/teacher/dashboard"
        className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:ring-offset-2"
        aria-label="Student Assistant - teacher home"
      >
        <AppLogo
          size={36}
          alt=""
          className="rounded-lg bg-white p-0.5 flex-shrink-0"
          priority
          ariaHidden
        />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">Student Assistant</p>
          <p className="text-xs text-gray-400 leading-tight">Teacher Portal</p>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <NotificationPanel
          fetchUrl="/api/teacher/notifications"
          markReadUrl="/api/teacher/notifications/read"
          emptyMessage="No submissions awaiting review"
          role="teacher"
        />
        <div className="relative" data-user-menu>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={`User menu - ${teacherName || 'Teacher'}`}
            aria-expanded={menuOpen}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {initials}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1"
              role="menu"
            >
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{teacherName || 'Teacher'}</p>
                <p className="text-xs text-gray-500 truncate">{teacherEmail}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                role="menuitem"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
