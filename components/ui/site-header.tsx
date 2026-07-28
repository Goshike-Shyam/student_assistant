/**
 * STABILITY CONTRACT — read before editing this file
 *
 * [site-header.tsx]
 * - isHydrated guard prevents Sign In button flashing during SSR/hydration
 * - Home nav link MUST point to /dashboard — DO NOT change to "/"
 * - Admin Portal link is ONLY shown for role === 'Admin'
 * - isLoggedIn is derived AFTER hydration using localStorage (no next-auth)
 * - Returns null on /admin/* routes — admin pages must not show student header
 */
"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { NotificationPanel } from '@/components/shared/NotificationPanel';
import { AppLogo } from '@/components/ui/app-logo';

const navItems: Array<{ label: string; href: Route }> = [];
// Nav links have moved to the sidebar — top bar shows logo + user menu only

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userGrade, setUserGrade] = useState('Grade 10');
  const [userRole, setUserRole] = useState('Student');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Fetch user data from localStorage (this is where you'd store it after login)
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    const storedUserGrade = localStorage.getItem('userGrade');
    const storedUserRole = localStorage.getItem('userRole');

    // Only set as logged in if userId exists
    if (storedUserId && storedUserName) {
      setIsLoggedIn(true);
      setUserName(storedUserName);
      setUserGrade(storedUserGrade || 'Grade 10');
      setUserRole(storedUserRole || 'Student');
    } else {
      setIsLoggedIn(false);
      setUserName(null);
    }
    setIsHydrated(true);
  }, []);

  // Generate user initials from name
  const getUserInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userInitials = getUserInitials(userName);
  const normalizedRole = userRole.toLowerCase();
  const isParentRole = normalizedRole === 'parent' || pathname.startsWith('/parent');
  const headerRole: 'student' | 'parent' = isParentRole ? 'parent' : 'student';

  // Admin and teacher pages have their own navigation — never show the student header there
  if (pathname.startsWith('/admin') || pathname.startsWith('/teacher')) return null;

  return (
    <nav className="sticky top-0 z-40 w-full h-16 bg-white border-b border-[#e5eeff] flex items-center justify-between px-10"
      style={{ boxShadow: '0 2px 12px rgba(0,88,190,.06)' }}
    >
      <div className="flex items-center">
        <Link
          href="/dashboard"
          className="qs font-bold text-[22px] text-[#006e2f] no-underline flex items-center gap-2"
          aria-label="Student Assistant — go to home"
        >
          <AppLogo
            size={32}
            alt=""
            className="rounded-xl"
            priority
            ariaHidden
          />
          Student Assistant
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <NotificationPanel
          fetchUrl={headerRole === 'parent' ? '/api/parent/notifications' : '/api/student/notifications'}
          markReadUrl={headerRole === 'parent' ? '/api/parent/notifications/read' : '/api/student/notifications/read'}
          emptyMessage={
            headerRole === 'parent'
              ? 'No new updates for your children'
              : 'No pending assignments or updates'
          }
          role={headerRole}
        />

        {/* Show skeleton during hydration to prevent Sign In flash */}
        {!isHydrated ? (
          <div className="w-10 h-10 rounded-full bg-[#e5eeff] animate-pulse" />
        ) : isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="User menu"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="w-10 h-10 rounded-full bg-[#d3e4fe] border-2 border-[#22c55e] flex items-center justify-center font-bold text-[#006e2f] text-xs qs"
            >
              {userInitials}
            </button>

            <div
              id="umenu"
              role="menu"
              className={`${menuOpen ? '' : 'hidden'} absolute top-11 right-0 bg-white rounded-2xl border border-[#e5eeff] py-2 min-w-[200px]`}
              style={{ boxShadow: '0 8px 32px rgba(0,88,190,.14)' }}
            >
              <div className="px-4 py-3 border-b border-[#f8f9ff]">
                <p className="font-semibold text-sm">{userName}</p>
                <p className="text-xs text-[#374151]">{userGrade} · {userRole}</p>
              </div>

              <Link
                href={'/parent-portal' as Route}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
              >
                <span className="mat text-[#006e2f] text-lg">
                  family_restroom
                </span>
                Parent View
              </Link>

              {/* Only show Admin Portal link for admin role */}
              {userRole === 'Admin' && (
                <Link
                  href={'/admin' as Route}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
                >
                  <span className="mat text-[#0058be] text-lg">
                    admin_panel_settings
                  </span>
                  Admin Portal
                </Link>
              )}

              <div className="border-t border-[#f8f9ff] mt-1 pt-1">
                <button
                  onClick={async () => {
                    // 1. Clear ALL auth cookies server-side
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                    } catch {
                      // Non-critical — continue logout
                    }
                    if (typeof window !== 'undefined') {
                      // 2. Clear ALL client-side storage
                      localStorage.clear();
                      sessionStorage.clear();
                      // 3. Clear document cookies client-side too
                      document.cookie.split(';').forEach(c => {
                        document.cookie = c.trim().split('=')[0] +
                          '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
                      });
                    }
                    // 4. Hard redirect — not router.push — forces complete
                    //    page unload with no React state cache
                    window.location.replace('/login');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#ba1a1a] hover:bg-[#fff4f4] transition-colors text-left"
                >
                  <span className="mat text-[#ba1a1a] text-lg">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
            <Link
            href={'/login' as Route}
            className="min-h-[44px] px-4 py-2 bg-[#0058be] text-white rounded-lg text-sm font-medium hover:bg-[#003da8] transition-colors inline-flex items-center"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
