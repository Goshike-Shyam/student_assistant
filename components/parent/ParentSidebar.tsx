'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  ClipboardList,
  Clock,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/parent/progress', label: 'Progress Report', icon: TrendingUp },
  { href: '/parent/research', label: 'Research Prompts', icon: Search },
  { href: '/parent/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/parent/practice', label: 'Practice Tests', icon: BarChart2 },
  { href: '/parent/login-history', label: 'Login History', icon: Clock },
  { href: '/parent/warnings', label: 'Warnings', icon: AlertTriangle },
  { href: '/parent/settings', label: 'Settings', icon: Settings },
]

export function ParentSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/parent/auth/logout', { method: 'POST' })
    window.location.replace('/parent/login')
  }

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col bg-emerald-900 dark:bg-slate-800 border-r border-emerald-800 dark:border-slate-700 overflow-hidden"
      aria-label="Parent portal navigation"
    >
      <div className="px-5 py-4 border-b border-emerald-800 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <BookOpen size={16} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Parent Portal</p>
            <p className="text-xs text-emerald-300">Veda AI</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Main navigation">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
                active ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-800 dark:hover:bg-slate-700',
              )}
            >
              <Icon size={17} aria-hidden="true" className="flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 flex-shrink-0 border-t border-emerald-800 dark:border-slate-700">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-200 hover:bg-emerald-800 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <LogOut size={17} aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
