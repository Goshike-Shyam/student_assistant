/**
 * TEACHER SIDEBAR CONTRACT
 * Nav items: Dashboard, My Classes, Students,
 *   Assignments, Question Bank, Analytics, Settings
 * NEVER include: Research, Practice (student features)
 * Active state: check pathname === href OR pathname.startsWith(href)
 * Uses sa-teacher-session via /api/teacher/auth/logout for sign out
 * NEVER calls useSession() or next-auth
 * WCAG 2.1 AA: min-h-[44px] on all buttons/links,
 *   aria-current="page" on active leaf links,
 *   aria-expanded on collapsible items.
 */
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users, BarChart3,
  GraduationCap, LogOut, Settings, ClipboardList,
  ChevronDown, ChevronRight as ChevronR,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AppLogo } from '@/components/ui/app-logo'

interface ChildNavItem {
  label: string
  href:  string
}

interface NavItem {
  id:       string
  label:    string
  href:     string
  icon:     React.ReactNode
  children?: ChildNavItem[]
}

const NAV_ITEMS: NavItem[] = [
  {
    id:    'classes',
    label: 'My Classes',
    href:  '/teacher/classes',
    icon:  <GraduationCap className="w-5 h-5 shrink-0" aria-hidden="true" />,
    children: [
      { label: 'All Classes',   href: '/teacher/classes' },
      { label: 'Create Class',  href: '/teacher/classes/create' },
    ],
  },
  {
    id:    'assignments',
    label: 'Assignments',
    href:  '/teacher/assignments',
    icon:  <ClipboardList className="w-5 h-5 shrink-0" aria-hidden="true" />,
    children: [
      { label: 'All Assignments',   href: '/teacher/assignments' },
      { label: 'Create Assignment', href: '/teacher/assignments/create' },
    ],
  },
  {
    id:    'students',
    label: 'Manage Students',
    href:  '/teacher/students',
    icon:  <Users className="w-5 h-5 shrink-0" aria-hidden="true" />,
    children: [
      { label: 'All Students',   href: '/teacher/students' },
      { label: 'Enroll Student', href: '/teacher/students/enroll' },
    ],
  },
  {
    id:    'analytics',
    label: 'Analytics',
    href:  '/teacher/analytics',
    icon:  <BarChart3 className="w-5 h-5 shrink-0" aria-hidden="true" />,
  },
  {
    id:    'settings',
    label: 'Settings',
    href:  '/teacher/settings',
    icon:  <Settings className="w-5 h-5 shrink-0" aria-hidden="true" />,
  },
]

interface TeacherSidebarProps {
  teacherName: string
  schoolName:  string
}

export function TeacherSidebar({ teacherName, schoolName }: TeacherSidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>([])

  const toggleExpand = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const isActive = (href: string) =>
    pathname === href ||
    (href !== '/teacher/dashboard' && pathname.startsWith(href))

  async function handleLogout() {
    // 1. Clear ALL auth cookies server-side
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Non-critical — continue logout
    }
    if (typeof window !== 'undefined') {
      // 2. Clear ALL client-side storage
      localStorage.clear()
      sessionStorage.clear()
      // 3. Clear document cookies client-side too
      document.cookie.split(';').forEach(c => {
        document.cookie = c.trim().split('=')[0] +
          '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/'
      })
    }
    // 4. Hard redirect — not router.push — forces complete
    //    page unload with no React state cache
    window.location.replace('/teacher/login')
  }

  return (
    <aside
      className="w-60 shrink-0 bg-white border-r border-blue-100 min-h-screen sticky top-0 flex flex-col py-6 px-4"
      aria-label="Teacher navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <AppLogo
          size={40}
          alt="Veda AI logo"
          className="rounded-xl bg-white p-1 flex-shrink-0"
        />
        <div>
          <p className="font-bold text-[17px] text-[#006e2f] leading-none">Teacher Portal</p>
          <p className="text-gray-500 text-[11px] mt-0.5 truncate max-w-[120px]" title={schoolName}>
            {schoolName}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          const isExpanded = expanded.includes(item.id)

          if (item.children) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => toggleExpand(item.id)}
                  aria-expanded={isExpanded}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]',
                    'focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none',
                    active
                      ? 'bg-[#eff4ff] text-[#0058be] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    : <ChevronR className="w-4 h-4" aria-hidden="true" />
                  }
                </button>
                {isExpanded && (
                  <div className="ml-8 mt-0.5 flex flex-col gap-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        aria-current={pathname === child.href ? 'page' : undefined}
                        className={cn(
                          'block px-3 py-2 rounded-xl text-sm min-h-[40px] flex items-center',
                          'focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none',
                          pathname === child.href
                            ? 'bg-[#0058be] text-white font-semibold'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]',
                'focus-visible:ring-2 focus-visible:ring-[#006e2f] focus-visible:outline-none',
                active
                  ? 'bg-[#eff4ff] text-[#0058be] font-semibold border-l-4 border-[#0058be] pl-2'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <p className="px-3 text-xs font-semibold text-gray-700 truncate" aria-label={`Logged in as ${teacherName}`}>
          {teacherName}
        </p>
        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none min-h-[44px]"
          aria-label="Sign out of teacher portal"
        >
          <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
