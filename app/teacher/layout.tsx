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
import { TeacherTopBar } from '@/components/teacher/TeacherTopBar'
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

  const isPublic = !pathname || PUBLIC_TEACHER_PATHS.some((p) => pathname.startsWith(p))

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

  console.log(
    '[TeacherLayout] session:',
    JSON.stringify({
      teacherId: session.teacherId,
      name: session.name,
      email: session.email,
    }),
  )

  const teacher = await prisma.teacher.findUnique({
    where: { id: BigInt(session.teacherId) },
    select: { schoolName: true },
  })

  const dynamicLabels: Record<string, string> = {
    create: 'Create Class',
    enroll: 'Enroll Student',
    students: 'Students',
    assignments: 'Assignments',
  }

  const segments = pathname.split('/').filter(Boolean)
  const classIdSegment =
    segments[0] === 'teacher' && segments[1] === 'classes' ? segments[2] : null

  if (classIdSegment && /^\d+$/.test(classIdSegment)) {
    try {
      const cls = await prisma.teacherClass.findFirst({
        where: {
          id: BigInt(classIdSegment),
          teacherId: BigInt(session.teacherId),
        },
        select: { className: true },
      })
      dynamicLabels[classIdSegment] = cls?.className ?? 'Class'
    } catch {
      dynamicLabels[classIdSegment] = 'Class'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-[#0058be] focus:underline"
      >
        Skip to main content
      </a>
      <TeacherSidebar
        teacherName={session.name ?? 'Teacher'}
        schoolName={teacher?.schoolName ?? ''}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TeacherTopBar
          teacherName={session.name ?? 'Teacher'}
          teacherEmail={session.email ?? ''}
        />
        {/* Page content */}
        <main className="flex-1 overflow-auto" id="main-content">
          <div className="p-6 pb-0">
            <TeacherBreadcrumbs dynamicLabels={dynamicLabels} />
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
