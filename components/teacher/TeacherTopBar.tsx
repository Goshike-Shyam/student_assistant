'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { NotificationPanel } from '@/components/shared/NotificationPanel'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
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
  const menuRef = useRef<HTMLDivElement>(null)
  const initials = getInitials(teacherName)

  /**
   * USER MENU CLOSE CONTRACT
   * Closes on: outside mousedown, Escape key,
   *   any menu item click, page scroll
   * menuRef must wrap BOTH button AND panel
   * useEffect deps: [menuOpen] - re-registers
   *   listener each time menu opens/closes
   * mousedown preferred over click -
   *   fires before other click handlers
   * Each menu item calls setMenuOpen(false)
   *   before its own action
   */
  useEffect(() => {
    if (!menuOpen) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    const handleScroll = () => {
      setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('scroll', handleScroll)
    }
  }, [menuOpen])

  const toggleMenu = useCallback(() => {
    setMenuOpen((o) => !o)
  }, [])

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
    <header className="h-14 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-40">
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
          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight">Student Assistant</p>
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
        <div ref={menuRef} className="relative" data-user-menu>
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={`User menu - ${teacherName || 'Teacher'}`}
            aria-expanded={menuOpen}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 dark:bg-cyan-600 text-white text-sm font-bold hover:bg-blue-700 dark:hover:bg-cyan-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {initials}
          </button>

          {menuOpen && (
            <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-50 p-1"
              role="menu"
            >
                <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-700 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{teacherName || 'Teacher'}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{teacherEmail}</p>
              </div>

                <div onClick={() => setMenuOpen(false)}>
                  <ThemeToggle className="px-3 py-2" />
                </div>

              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false)
                  await handleLogout()
                }}
                role="menuitem"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
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
