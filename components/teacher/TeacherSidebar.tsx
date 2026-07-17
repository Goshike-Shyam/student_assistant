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
  LayoutDashboard, Users, BookOpen, BarChart3,
  GraduationCap, LogOut, Settings, ClipboardList,
  ChevronDown, ChevronRight as ChevronR,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
    id:    'dashboard',
    label: 'Dashboard',
    href:  '/teacher/dashboard',
    icon:  <LayoutDashboard className="w-5 h-5 shrink-0" aria-hidden="true" />,
  },
  {
    id:    'classes',
    label: 'My Classes',
    href:  '/teacher/classes',
    icon:  <GraduationCap className="w-5 h-5 shrink-0" aria-hidden="true" />,
    children: [
      { label: 'All Classes',     href: '/teacher/classes' },
      { label: 'Create New Class', href: '/teacher/classes?new=1' },
    ],
  },
  {
    id:    'students',
    label: 'Students',
    href:  '/teacher/students',
    icon:  <Users className="w-5 h-5 shrink-0" aria-hidden="true" />,
  },
  {
    id:    'assignments',
    label: 'Assignments',
    href:  '/teacher/assignments',
    icon:  <ClipboardList className="w-5 h-5 shrink-0" aria-hidden="true" />,
    children: [
      { label: 'All Assignments',    href: '/teacher/assignments' },
      { label: 'Create Assignment',  href: '/teacher/assignments/create' },
    ],
  },
  {
    id:    'question-bank',
    label: 'Question Bank',
    href:  '/teacher/question-bank',
    icon:  <BookOpen className="w-5 h-5 shrink-0" aria-hidden="true" />,
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
    await fetch('/api/teacher/auth/logout', { method: 'POST' })
    window.location.href = '/teacher/login'
  }

  return (
    <aside
      className="w-60 shrink-0 bg-white border-r border-blue-100 min-h-screen sticky top-0 flex flex-col py-6 px-4"
      aria-label="Teacher navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 bg-[#006e2f] rounded-2xl flex items-center justify-center shadow-md" aria-hidden="true">
          <GraduationCap className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
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
