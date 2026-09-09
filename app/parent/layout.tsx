import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { getParentSession } from '@/lib/parent-auth'
import { ParentSidebar } from '@/components/parent/ParentSidebar'
import { ParentTopBar } from '@/components/parent/ParentTopBar'

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const reqHeaders = await headers()
  const pathname = reqHeaders.get('x-pathname') ?? reqHeaders.get('next-url') ?? ''
  const isPublicParentRoute = pathname.includes('/parent/login') || pathname.includes('/parent/register')

  if (isPublicParentRoute) {
    return <>{children}</>
  }

  const session = await getParentSession()
  if (!session) {
    redirect('/parent/login')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ParentTopBar />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <ParentSidebar />
        <main id="parent-main" className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  )
}
