import Link from 'next/link'
import { getParentSession } from '@/lib/parent-auth'

export async function ParentTopBar() {
  const session = await getParentSession()

  return (
    <header className="sticky top-0 z-40 flex-shrink-0 h-14 flex items-center justify-between px-5 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-2">
        <Link
          href="/parent/dashboard"
          className="text-lg font-bold text-emerald-700 dark:text-emerald-400"
          aria-label="Go to parent dashboard"
        >
          Student Assistant
        </Link>
        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">Parent Portal</span>
      </div>

      {session && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {session.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">{session.name}</span>
        </div>
      )}
    </header>
  )
}
