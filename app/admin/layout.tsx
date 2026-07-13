/**
 * STABILITY CONTRACT — read before editing this file
 *
 * [admin/layout.tsx]
 * - AdminSidebar renders HERE only — not in individual admin page components
 * - Adding sidebar to a page component will cause duplication
 * - /admin/login and /admin/accept-invite are PUBLIC — sidebar is hidden there
 * - Session guard is enforced by middleware.ts (sa-admin-session cookie)
 */
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/ui/admin-sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const isPublicAdminPage =
    pathname === '/admin/login' || pathname.startsWith('/admin/accept-invite');

  // Public pages (login, accept-invite) render without sidebar
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
    );
  }

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-[#0058be] focus:underline"
      >
        Skip to main content
      </a>
      <AdminSidebar />
      <div className="flex-1 overflow-auto" id="main-content">
        {children}
      </div>
    </div>
  );
}
