'use client';

import { AdminSidebar } from '@/components/ui/admin-sidebar';
import { useState, useEffect } from 'react';

export default function AdminUsersPage() {
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
              <a href="/admin" className="text-sm font-semibold text-[#3d4a3d] pb-2 hover:text-[#0058be]">Dashboard</a>
              <a href="#" className="text-sm font-semibold text-[#3d4a3d] pb-2 border-b-2 border-[#006e2f] text-[#006e2f]">Support</a>
              <a href="#" className="text-sm font-semibold text-[#3d4a3d] pb-2 hover:text-[#0058be]">Help Center</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <span className="mat absolute left-3 text-[#6d7b6c] text-lg pointer-events-none">search</span>
              <input type="text" placeholder="Search user..." className="pl-9 pr-4 py-2 border border-[#bccbb9] rounded-full text-sm bg-[#f8f9ff] w-44 transition-colors focus:outline-none" style={{ fontFamily: 'inherit' }} />
            </div>
            <button className="relative w-9 h-9 rounded-full hover:bg-[#eff4ff] flex items-center justify-center text-[#3d4a3d]">
              <span className="mat">notifications</span>
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] rounded-full text-[9px] text-white font-bold flex items-center justify-center">1</span>
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-[#eff4ff] flex items-center justify-center text-[#3d4a3d]">
              <span className="mat">settings</span>
            </button>
            <div className="flex items-center gap-2 ml-1">
              <div className="w-9 h-9 rounded-full bg-[#213145] border-2 border-[#adc6ff] flex items-center justify-center font-bold text-white text-xs qs">AD</div>
              <span className="text-sm font-semibold">Admin</span>
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <main className="flex-1 p-8">
          {/* Page header */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <h1 className="qs font-bold text-[32px] text-[#0b1c30] leading-none mb-2">User Management</h1>
              <p className="text-[#3d4a3d] text-sm">Review and manage student, parent, and teacher identities across the platform.</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Active now stat */}
              <div className="bg-[#eff4ff] border border-[#dce9ff] rounded-2xl px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-[#22c55e]/20 rounded-xl flex items-center justify-center">
                  <span className="mat-fill text-[#006e2f] text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>trending_up</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#6d7b6c] uppercase tracking-wider">Active Now</p>
                  <p className="qs font-bold text-2xl text-[#0b1c30]">1,284</p>
                </div>
              </div>
              {/* Add user button */}
              <button className="px-5 py-3 bg-[#0058be] text-white qs font-bold rounded-xl text-sm hover:bg-[#004da8] transition-colors flex items-center gap-2" style={{ boxShadow: '0 4px 0 rgba(0,55,140,.22)' }}>
                <span className="mat text-lg">person_add</span>Add User
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-[#e5eeff] rounded-2xl p-5 mb-5 flex items-end gap-4 shadow-sm">
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-bold text-[#6d7b6c] mb-1.5 uppercase tracking-wider">Role</label>
              <select className="w-full px-4 py-2.5 border border-[#bccbb9] rounded-xl text-[#0b1c30] text-sm focus:outline-none focus:border-[#0058be] transition-colors" style={{ fontFamily: 'inherit' }}>
                <option>All Roles</option>
                <option>Student</option>
                <option>Teacher</option>
                <option>Parent</option>
                <option>Admin</option>
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-bold text-[#6d7b6c] mb-1.5 uppercase tracking-wider">Status</label>
              <select className="w-full px-4 py-2.5 border border-[#bccbb9] rounded-xl text-[#0b1c30] text-sm focus:outline-none focus:border-[#0058be] transition-colors" style={{ fontFamily: 'inherit' }}>
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-bold text-[#6d7b6c] mb-1.5 uppercase tracking-wider">Registration Date</label>
              <input type="date" className="w-full px-4 py-2.5 border border-[#bccbb9] rounded-xl text-[#0b1c30] text-sm focus:outline-none focus:border-[#0058be] transition-colors" style={{ fontFamily: 'inherit' }} />
            </div>
            <button className="w-10 h-10 bg-[#eff4ff] border border-[#dce9ff] rounded-xl flex items-center justify-center hover:bg-[#dce9ff] transition-colors text-[#0058be]">
              <span className="mat">tune</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-[#e5eeff] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5eeff]">
                    <th className="text-left p-4 text-[#6d7b6c] font-semibold text-sm">Name</th>
                    <th className="text-left p-4 text-[#6d7b6c] font-semibold text-sm">Email</th>
                    <th className="text-left p-4 text-[#6d7b6c] font-semibold text-sm">Role</th>
                    <th className="text-left p-4 text-[#6d7b6c] font-semibold text-sm">Status</th>
                    <th className="text-left p-4 text-[#6d7b6c] font-semibold text-sm">Joined</th>
                    <th className="text-center p-4 text-[#6d7b6c] font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Alex Johnson', email: 'alex@school.edu', role: 'Student', status: 'Active', joined: 'Jan 15, 2024', initials: 'AJ', roleBg: 'bg-[#22c55e]/10 text-[#006e2f] border border-[#22c55e]/40' },
                    { name: 'Sarah Smith', email: 'sarah@school.edu', role: 'Teacher', status: 'Active', joined: 'Jan 10, 2024', initials: 'SS', roleBg: 'bg-[#ffdbca] text-[#9d4300] border border-[#ff8e4d]/40' },
                    { name: 'Michael Brown', email: 'michael@school.edu', role: 'Parent', status: 'Inactive', joined: 'Jan 8, 2024', initials: 'MB', roleBg: 'bg-[#d8e2ff] text-[#0058be] border border-[#adc6ff]' },
                    { name: 'Emily Davis', email: 'emily@school.edu', role: 'Student', status: 'Active', joined: 'Jan 20, 2024', initials: 'ED', roleBg: 'bg-[#22c55e]/10 text-[#006e2f] border border-[#22c55e]/40' },
                    { name: 'John Wilson', email: 'john@school.edu', role: 'Teacher', status: 'Active', joined: 'Dec 28, 2023', initials: 'JW', roleBg: 'bg-[#ffdbca] text-[#9d4300] border border-[#ff8e4d]/40' }
                  ].map((user) => (
                    <tr key={user.email} className="border-b border-[#e5eeff] hover:bg-[#f8f9ff]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0058be] text-white flex items-center justify-center text-xs font-bold qs">
                            {user.initials}
                          </div>
                          <span className="font-semibold text-[#0b1c30] text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[#6d7b6c] text-sm">{user.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center padding text-xs font-bold rounded-full ${user.roleBg}`}>{user.role}</span>
                      </td>
                      <td className="p-4">
                        <div className={`flex items-center gap-1 font-semibold text-sm ${user.status === 'Active' ? 'text-[#006e2f]' : 'text-[#6d7b6c]'}`}>
                          <span className="mat text-base">{user.status === 'Active' ? 'check_circle' : 'cancel'}</span>
                          {user.status}
                        </div>
                      </td>
                      <td className="p-4 text-[#6d7b6c] text-sm">{user.joined}</td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <button className="w-8 h-8 rounded-lg bg-white hover:bg-[#e5eeff] flex items-center justify-center text-[#0058be] transition-colors" title="Edit">
                          <span className="mat">edit</span>
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-white hover:bg-[#fff4f4] flex items-center justify-center text-[#ba1a1a] transition-colors" title="Delete">
                          <span className="mat">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
