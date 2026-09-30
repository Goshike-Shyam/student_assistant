'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Sidebar } from './sidebar'
import { ThemeApplier } from '@/components/gamification/ThemeApplier'
import { StickyFooterBar } from '@/components/shared/StickyFooterBar'
import { startSession, trackPageView } from '@/lib/session-tracker'

/** Paths that show the student sidebar */
const STUDENT_SIDEBAR_PATHS = [
  '/dashboard',
  '/assignments',
  '/practice',
  '/resources',
  '/profile',
  '/ai-tutor',
  '/chat',
  '/progress',
  '/settings',
]

/**
 * Wraps student pages with the persistent sidebar.
 * Non-student routes (login, signup, teacher, admin, parent, landing) pass through unchanged.
 */
export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)
  const showSidebar = STUDENT_SIDEBAR_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )

  useEffect(() => {
    if (!showSidebar) return

    const childId = window.localStorage.getItem('userId')?.trim() ?? ''
    if (!childId) return

    startSession(childId).catch(() => {})
  }, [showSidebar])

  useEffect(() => {
    if (!showSidebar || !pathname) return

    if (lastTrackedPath.current === null) {
      lastTrackedPath.current = pathname
      return
    }

    if (lastTrackedPath.current !== pathname) {
      trackPageView()
      lastTrackedPath.current = pathname
    }
  }, [pathname, showSidebar])

  if (!showSidebar) return <>{children}</>

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <ThemeApplier />
      <Sidebar />
      <div className="flex min-h-[calc(100vh-64px)] flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
        <StickyFooterBar />
      </div>
    </div>
  )
}
