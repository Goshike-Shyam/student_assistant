'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Route } from "next";

export function AdminSidebar() {
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
    { id: 'content', label: 'Content Library', icon: 'library_books', href: '/admin/content' as Route },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/admin/settings' as Route },
  ];

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-[#e5eeff] min-h-screen sticky top-0 flex flex-col py-6 px-4" style={{ boxShadow: '2px 0 8px rgba(0,88,190,.04)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 bg-[#006e2f] rounded-2xl flex items-center justify-center shadow-md">
          <span className="mat-fill text-white text-xl">school</span>
        </div>
        <div>
          <p className="qs font-bold text-[17px] text-[#006e2f] leading-none">Admin Portal</p>
          <p className="text-[#6d7b6c] text-[11px] mt-0.5">System Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map((item) => (
          <Link key={item.id} href={item.href} className="adm-link">
            <span className="mat text-[#6d7b6c]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-2">
        <button className="btn-3d-green w-full py-3 bg-[#006e2f] text-white qs font-bold rounded-xl text-sm hover:bg-[#005828] transition-colors flex items-center justify-center gap-2">
          <span className="mat text-lg">add_chart</span>Generate Report
        </button>
        <Link href="/login" className="adm-link text-[#ba1a1a] hover:bg-[#fff4f4]">
          <span className="mat text-[#ba1a1a]">logout</span>
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
