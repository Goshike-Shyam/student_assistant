/**
 * TEACHER BREADCRUMBS CONTRACT
 * Renders breadcrumb trail from /teacher/* pathname segments.
 * Returns null when only one crumb exists (top-level pages).
 * Accepts dynamicLabels to override UUID segments with human-readable names.
 * WCAG 2.1 AA: aria-label on nav, aria-current="page" on last crumb,
 *   min-h-[44px] on all interactive elements.
 * NEVER modify student, parent, or admin breadcrumb logic here.
 */
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const SEGMENT_LABELS: Record<string, string> = {
  teacher:     'Home',
  dashboard:   'Dashboard',
  classes:     'My Classes',
  students:    'Students',
  assignments: 'Assignments',
  analytics:   'Analytics',
  create:      'Create',
  review:      'Review Submissions',
  status:      'Status',
  enroll:      'Enroll Students',
  settings:    'Settings',
  performance: 'Performance',
  'question-bank': 'Question Bank',
  reminders:   'Reminders',
  join:        'Join Class',
  register:    'Register',
}

interface BreadcrumbItem {
  label: string
  href:  string | null // null = current page (no link)
}

interface Props {
  /** Override raw path segments (e.g. numeric IDs) with human-readable labels */
  dynamicLabels?: Record<string, string>
}

export function TeacherBreadcrumbs({ dynamicLabels = {} }: Props) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const crumbs: BreadcrumbItem[] = []
  let builtPath = ''

  segments.forEach((seg, index) => {
    builtPath += `/${seg}`
    const isLast = index === segments.length - 1
    const label =
      dynamicLabels[seg] ??
      SEGMENT_LABELS[seg] ??
      // Capitalise raw segment as fallback
      seg.charAt(0).toUpperCase() + seg.slice(1)

    crumbs.push({ label, href: isLast ? null : builtPath })
  })

  // Don't render if at a top-level page (≤1 crumb)
  if (crumbs.length <= 1) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-sm text-gray-600 mb-4 flex-wrap"
    >
      <Link
        href="/teacher/dashboard"
        className="flex items-center gap-1 hover:text-[#0058be] transition-colors
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[#0058be] focus-visible:ring-offset-2
          rounded-sm min-h-[44px] px-1"
        aria-label="Go to Teacher Dashboard"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
      </Link>

      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-[#0058be] hover:underline transition-colors
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[#0058be] focus-visible:ring-offset-2
                rounded-sm capitalize min-h-[44px] flex items-center px-1"
            >
              {crumb.label}
            </Link>
          ) : (
            <span
              className="text-gray-900 font-medium capitalize"
              aria-current="page"
            >
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
