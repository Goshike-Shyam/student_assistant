'use client';

import { AdminSidebar } from '@/components/ui/admin-sidebar';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* RIGHT SECTION */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Admin Top Nav */}
        <nav className="h-16 bg-white border-b border-[#e5eeff] flex items-center justify-between px-8 sticky top-0 z-40" style={{ boxShadow: '0 2px 8px rgba(0,88,190,.04)' }}>
          <div className="flex items-center gap-8">
            <span className="qs font-bold text-lg text-[#006e2f]">EduPulse</span>
            <div className="flex items-center gap-6">
              <a href="/admin" className="top-nav-link active">Dashboard</a>
              <a href="#" className="top-nav-link">Support</a>
              <a href="#" className="top-nav-link">Help Center</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <span className="mat absolute left-3 text-[#6d7b6c] text-lg pointer-events-none">search</span>
              <input type="text" placeholder="Search analytics..." className="pl-9 pr-4 py-2 border border-[#bccbb9] rounded-full text-sm bg-[#f8f9ff] w-44 transition-colors focus:outline-none" style={{ fontFamily: 'inherit' }} />
            </div>
            <button className="relative w-9 h-9 rounded-full hover:bg-[#eff4ff] flex items-center justify-center text-[#3d4a3d]">
              <span className="mat">notifications</span>
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] rounded-full text-[9px] text-white font-bold flex items-center justify-center">3</span>
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-[#eff4ff] flex items-center justify-center text-[#3d4a3d]">
              <span className="mat">settings</span>
            </button>
            <div className="flex items-center gap-2 ml-1">
              <div className="w-9 h-9 rounded-full bg-[#213145] border-2 border-[#adc6ff] flex items-center justify-center font-bold text-white text-xs qs">AR</div>
              <div>
                <p className="text-sm font-semibold leading-none">Alex Rivera</p>
                <p className="text-[10px] text-[#6d7b6c] mt-0.5">SYSTEM ADMIN</p>
              </div>
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <main className="flex-1 p-8">
          {/* Page header */}
          <div className="mb-7">
            <h1 className="qs font-bold text-[32px] text-[#0b1c30]">Analytics Overview</h1>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-4 gap-5 mb-6">
            {/* Total Students */}
            <div className="bg-white border border-[#e5eeff] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[#eff4ff] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="mat text-[#0058be] text-xl">group</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6d7b6c] font-medium mb-0.5">Total Active Students</p>
                  <p className="qs font-bold text-2xl text-[#0b1c30]">12,482</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#006e2f] bg-[#22c55e]/10 px-2.5 py-1 rounded-full">
                <span className="mat-fill text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>trending_up</span>+8.4%
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white border border-[#e5eeff] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="mat text-[#006e2f] text-xl">task_alt</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6d7b6c] font-medium mb-0.5">Completion Rate</p>
                  <p className="qs font-bold text-2xl text-[#0b1c30]">76.2%</p>
                </div>
              </div>
              <div className="w-full h-2 bg-[#e5eeff] rounded-full overflow-hidden">
                <div className="h-full bg-[#006e2f] rounded-full" style={{ width: '76.2%' }}></div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white border border-[#e5eeff] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[#ffdbca] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="mat text-[#9d4300] text-xl">payments</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6d7b6c] font-medium mb-0.5">Platform Revenue</p>
                  <p className="qs font-bold text-2xl text-[#0b1c30]">$48,290</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#006e2f] bg-[#22c55e]/10 px-2.5 py-1 rounded-full">
                <span className="mat-fill text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>trending_up</span>+12.1%
              </div>
            </div>

            {/* Engagement */}
            <div className="bg-white border border-[#e5eeff] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[#e5eeff] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="mat text-[#0058be] text-xl">bolt</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6d7b6c] font-medium mb-0.5">Engagement Score</p>
                  <p className="qs font-bold text-2xl text-[#0b1c30]">8.4/10</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0058be] bg-[#eff4ff] px-2.5 py-1 rounded-full">
                High Activity
              </span>
            </div>
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-3 gap-5">
            {/* Engagement Trends */}
            <div className="col-span-2 bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="qs font-bold text-lg text-[#0b1c30]">Student Engagement Trends</h2>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#bccbb9] rounded-lg text-xs font-semibold text-[#3d4a3d] hover:bg-[#eff4ff] transition-colors">
                    <span className="mat text-base">calendar_month</span>Oct 1 – Oct 31
                  </button>
                  <button className="px-3 py-1.5 bg-[#006e2f] text-white rounded-lg text-xs font-bold hover:bg-[#005828] transition-colors">Export PDF</button>
                </div>
              </div>

              <div className="flex items-end justify-around gap-2 h-48 p-4 bg-gradient-to-b from-[#eff4ff]/30 to-transparent rounded-xl">
                {[65, 78, 82, 71, 89, 76, 85].map((value, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-[#0058be] to-[#adc6ff]" style={{ height: `${value * 1.5}px` }}></div>
                    <span className="text-xs text-[#6d7b6c] font-medium">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Engagement */}
            <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm">
              <h2 className="qs font-bold text-lg text-[#0b1c30] mb-5">Overall Engagement</h2>
              <div className="flex items-center justify-center h-48">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#e5eeff" strokeWidth="8" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#0058be" strokeWidth="8" strokeDasharray="164.93 219.91" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="qs font-bold text-3xl text-[#0b1c30]">82%</p>
                    <p className="text-xs text-[#6d7b6c] mt-1">Active Users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
