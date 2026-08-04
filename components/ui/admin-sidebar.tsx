'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import type { Route } from "next";
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { AppLogo } from '@/components/ui/app-logo';

export function AdminSidebar() {
  const pathname = usePathname();
  type NavItem = {
    id: string;
    label: string;
    href: Route;
    icon: React.ReactNode;
  };
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard', href: '/admin' as Route },
    { id: 'progress', label: 'Student Progress', icon: 'trending_up', href: '/admin/progress' as Route },
    { id: 'financials', label: 'Financials', icon: 'account_balance_wallet', href: '/admin/financials' as Route },
    { id: 'users', label: 'User Management', icon: 'manage_accounts', href: '/admin/users' as Route },
    { id: 'credits', label: 'Credit Tracking', icon: 'bolt', href: '/admin/credits' as Route },
    { id: 'content', label: 'Content Library', icon: 'library_books', href: '/admin/content' as Route },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/admin/settings' as Route },
  ];

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Non-critical - continue logout
    }
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach((c) => {
        document.cookie =
          c.trim().split('=')[0] +
          '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
      });
      window.location.replace('/admin/login');
    }
  };

  return (
    <aside
      className="w-64 bg-slate-900 flex flex-col h-full overflow-hidden flex-shrink-0"
      aria-label="Admin navigation"
    >
      {/* Brand */}
      <div className="px-4 py-5 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <AppLogo
            size={40}
            alt="Veda AI logo"
            className="rounded-xl bg-white p-1 flex-shrink-0"
          />
        <div>
            <p className="qs font-bold text-[17px] text-white leading-none">Admin Portal</p>
            <p className="text-slate-300 text-[11px] mt-0.5">System Management</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto min-h-0" aria-label="Main admin navigation">
        <div className="flex flex-col gap-1">
        {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-medium transition-colors flex items-center gap-3 ${pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                ? 'bg-slate-800 text-white'
                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mat text-[18px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        </div>
      </nav>

      {/* Sign out fixed at bottom */}
      <div className="px-3 py-4 border-t border-slate-700 flex-shrink-0">
        <ThemeToggle className="mb-2 px-3 py-2.5 rounded-lg text-gray-200 hover:bg-slate-800 dark:hover:bg-slate-800" />
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Sign out of admin portal"
        >
          <LogOut size={18} aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
