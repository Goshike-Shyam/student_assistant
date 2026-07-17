/**
 * TEACHER LAYOUT CONTRACT
 * Reads sa-teacher-session ONLY via getTeacherSession()
 * NEVER calls useSession() or getServerSession()
 * Public pages (login, register, verify-email, classes/join) render without sidebar
 * Protected pages redirect to /teacher/login if no valid session
 * x-pathname header forwarded by middleware to detect public paths
 */
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTeacherSession } from '@/lib/teacher-auth'
import { prisma } from '@/lib/prismaClient'
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar'
import { TeacherBreadcrumbs } from '@/components/teacher/TeacherBreadcrumbs'
import { NotificationBell } from '@/components/teacher/NotificationBell'
import { ClassSwitcher } from '@/components/teacher/ClassSwitcher'
import { ReactNode } from 'react'

const PUBLIC_TEACHER_PATHS = [
  '/teacher/login',
  '/teacher/register',
  '/teacher/verify-email',
  '/teacher/classes/join',
]

interface TeacherLayoutProps {
  children: ReactNode
}

export default async function TeacherLayout({ children }: TeacherLayoutProps) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  const isPublic = PUBLIC_TEACHER_PATHS.some((p) => pathname.startsWith(p))

  // Public pages render without sidebar
  if (isPublic) {
    return (
      <>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-[#0058be] focus:underline"
        >
          Skip to main content
        </a>
        <div id="main-content">{children}</div>
      </>
    )
  }

  const session = await getTeacherSession()
  if (!session) redirect('/teacher/login')

  const teacher = await prisma.teacher.findUnique({
    where: { id: BigInt(session.teacherId) },
    select: { schoolName: true },
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-[#0058be] focus:underline"
      >
        Skip to main content
      </a>
      <TeacherSidebar
        teacherName={session.name}
        schoolName={teacher?.schoolName ?? ''}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar with class switcher and notification bell */}
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <ClassSwitcher />
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-auto" id="main-content">
          <div className="p-6 pb-0">
            <TeacherBreadcrumbs />
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
