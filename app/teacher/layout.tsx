/**
 * TEACHER LAYOUT CONTRACT
 * Reads sa-teacher-session ONLY via getTeacherSession()
 * NEVER calls useSession() or getServerSession()
 * Public pages (login, register, verify-email, classes/join) render without sidebar
 * Protected pages redirect to /teacher/login if no valid session
 * x-pathname header forwarded by middleware to detect public paths
 * Always provide fallback values for all session fields
 * Child components must never receive undefined name/email/school
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

  const teacherName = session.name ?? session.email ?? 'Teacher'
  const teacherEmail = session.email ?? ''
  const teacherId = session.teacherId ?? ''

  console.log(
    '[TeacherLayout] session:',
    JSON.stringify({
      teacherId,
      name: teacherName,
      email: teacherEmail,
    }),
  )

  const teacher = /^\d+$/.test(teacherId)
    ? await prisma.teacher.findUnique({
        where: { id: BigInt(teacherId) },
        select: { schoolName: true },
      })
    : null
  const teacherSchool = teacher?.schoolName ?? ''

  const dynamicLabels: Record<string, string> = {
    create: 'Create Class',
    enroll: 'Enroll Student',
    students: 'Students',
    assignments: 'Assignments',
  }

  const segments = pathname.split('/').filter(Boolean)
  const classIdSegment =
    segments[0] === 'teacher' && segments[1] === 'classes' ? segments[2] : null

  if (classIdSegment && /^\d+$/.test(classIdSegment) && /^\d+$/.test(teacherId)) {
    try {
      const cls = await prisma.teacherClass.findFirst({
        where: {
          id: BigInt(classIdSegment),
          teacherId: BigInt(teacherId),
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
        teacherName={teacherName}
        schoolName={teacherSchool}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TeacherTopBar
          teacherName={teacherName}
          teacherEmail={teacherEmail}
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
