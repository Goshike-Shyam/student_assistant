/**
 * STABILITY CONTRACT — read before editing this file
 *
 * AdminSidebar renders here only. Public admin pages render without the shell.
 * Session guard is enforced here as a second layer after middleware.
 */
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { AdminSidebar } from '@/components/ui/admin-sidebar'
import { getAdminSession } from '@/lib/admin-auth'

interface AdminLayoutProps {
  children: ReactNode
}

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/accept-invite']

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') ?? ''
  const isPublicAdminPage = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))

  if (isPublicAdminPage) {
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

  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-[#0058be] focus:underline"
      >
        Skip to main content
      </a>
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto" id="main-content">
        {children}
      </main>
    </div>
  )
}
