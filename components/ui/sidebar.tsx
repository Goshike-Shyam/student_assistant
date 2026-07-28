'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const STUDENT_NAV = [
  { href: '/dashboard',   icon: 'home',            label: 'Home' },
  { href: '/resources',   icon: 'science',          label: 'Research' },
  { href: '/assignments', icon: 'assignment',        label: 'Assignments' },
  { href: '/practice',    icon: 'auto_stories',      label: 'Practice' },
  { href: '/progress',    icon: 'insights',          label: 'Progress' },
  { href: '/ai-tutor',    icon: 'headphones',        label: 'Podcasts' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 bg-white border-r border-[#e5eeff] sticky top-16 h-[calc(100vh-64px)] flex flex-col py-5 px-3 overflow-y-auto">
      <div className="mb-5 px-2">
        <p className="text-[#0058be] font-semibold text-sm">Welcome back!</p>
        <p className="text-[#3d4a3d] text-xs mt-0.5 flex items-center gap-1">
          Current Streak: 5 Days <span className="mat-fill text-[#ff8e4d] text-sm">local_fire_department</span>
        </p>
      </div>

      {/* Feature navigation — no subject links */}
      <nav className="flex flex-col gap-0.5 flex-1" aria-label="Student navigation">
        {STUDENT_NAV.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`sub-link${isActive ? ' active' : ''}`}
            >
              <span className="mat" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Subjects are selected within each feature page, not from sidebar navigation */}

      <button className="mt-4 w-full btn-3d-green bg-[#ff8e4d] text-white rounded-xl py-3 text-sm font-bold qs hover:bg-[#f07030] transition-colors flex items-center justify-center gap-1.5 min-h-[44px]">
        <span className="mat text-lg" aria-hidden="true">bolt</span>Start Daily Quest
      </button>
    </aside>
  );
}
