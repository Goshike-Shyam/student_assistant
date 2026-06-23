"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Route } from 'next';

const navItems: Array<{ label: string; href: Route }> = [
  { label: 'Home', href: '/' as Route },
  { label: 'Research', href: '/resources' as Route },
  { label: 'Practice', href: '/practice' as Route },
  { label: 'Assignments', href: '/assignments' as Route }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userGrade, setUserGrade] = useState('Grade 10');
  const [userRole, setUserRole] = useState('Student');

  useEffect(() => {
    // Fetch user data from localStorage (this is where you'd store it after login)
    const storedUserName = localStorage.getItem('userName') || 'User';
    const storedUserGrade = localStorage.getItem('userGrade') || 'Grade 10';
    const storedUserRole = localStorage.getItem('userRole') || 'Student';

    setUserName(storedUserName);
    setUserGrade(storedUserGrade);
    setUserRole(storedUserRole);
  }, []);

  // Generate user initials from name
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userInitials = getUserInitials(userName);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-[#e5eeff] flex items-center justify-between px-10 shadow-sm"
      style={{ boxShadow: '0 2px 12px rgba(0,88,190,.06)' }}
    >
      <div className="flex items-center gap-10">
        <Link
          href="/"
          className="qs font-bold text-[22px] text-[#006e2f] no-underline flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-[#0058be] rounded-xl flex items-center justify-center">
            <span className="mat-fill text-white text-lg">school</span>
          </div>
          EduSpark
        </Link>

        <div className="flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-full hover:bg-[#eff4ff] flex items-center justify-center transition-colors text-[#3d4a3d]" title="Notifications">
          <span className="mat text-[22px]">notifications</span>
        </button>

        <button className="w-10 h-10 rounded-full hover:bg-[#eff4ff] flex items-center justify-center transition-colors text-[#3d4a3d]" title="Settings">
          <span className="mat text-[22px]">settings</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-full bg-[#d3e4fe] border-2 border-[#22c55e] flex items-center justify-center font-bold text-[#006e2f] text-xs qs"
            title="User Menu"
          >
            {userInitials}
          </button>

          <div
            id="umenu"
            className={`${menuOpen ? '' : 'hidden'} absolute top-11 right-0 bg-white rounded-2xl border border-[#e5eeff] py-2 min-w-[200px]`}
            style={{ boxShadow: '0 8px 32px rgba(0,88,190,.14)' }}
          >
            <div className="px-4 py-3 border-b border-[#f8f9ff]">
              <p className="font-semibold text-sm">{userName}</p>
              <p className="text-xs text-[#6d7b6c]">{userGrade} · {userRole}</p>
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

            <Link
              href={'/admin' as Route}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
            >
              <span className="mat text-[#0058be] text-lg">
                admin_panel_settings
              </span>
              Admin Portal
            </Link>

            <div className="border-t border-[#f8f9ff] mt-1 pt-1">
              <Link
                href={'/login' as Route}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#ba1a1a] hover:bg-[#fff4f4] transition-colors"
              >
                <span className="mat text-[#ba1a1a] text-lg">logout</span>
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
