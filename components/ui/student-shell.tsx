'use client'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'

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
]

/**
 * Wraps student pages with the persistent sidebar.
 * Non-student routes (login, signup, teacher, admin, parent, landing) pass through unchanged.
 */
export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = STUDENT_SIDEBAR_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )

  if (!showSidebar) return <>{children}</>

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  )
}
