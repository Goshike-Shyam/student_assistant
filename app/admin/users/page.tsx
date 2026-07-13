'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  board: string;
  plan: string;
  subscription_status: string;
  child_count: number;
  created_at: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  invitedByName?: string;
  lastLogin?: string | null;
  createdAt?: string;
}

type TabType = 'users' | 'admins';

export default function AdminUsersPage() {
  const [mounted, setMounted] = useState(false);
  const [adminName, setAdminName] = useState<string>('Admin');
  const [adminInitials, setAdminInitials] = useState<string>('AD');
  const [adminRole, setAdminRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('users');

  // Users section state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const perPage = 20;

  // Admin accounts section state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('SUPPORT');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    // Extract user info from localStorage
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    if (userName) {
      setAdminName(userName);
      const parts = userName.split(' ');
      const initials = parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
      setAdminInitials(initials);
    }
    if (userRole) {
      setAdminRole(userRole);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'admins') {
      fetchAdmins();
    }
  }, [currentPage, searchQuery, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchQuery
      });
      
      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    setAdminsLoading(true);
    try {
      /**
       * ADMIN ACCOUNTS TAB CONTRACT
       * - Data source: GET /api/admin/accounts ONLY
       * - NEVER reads localStorage or student session data
       * - NEVER uses hardcoded or mock admin arrays
       */
      const response = await fetch('/api/admin/accounts');
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `Error ${response.status}`);
      }
      const data = await response.json();
      setAdmins((data as { admins: AdminUser[] }).admins);
    } catch (error) {
      console.error('[AdminAccounts] fetch failed:', error);
      setAdmins([]);
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteMessage('');
    setInviteLoading(true);

    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        setInviteError(data.error || 'Failed to send invite');
        setInviteLoading(false);
        return;
      }

      setInviteMessage(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('SUPPORT');
      
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteMessage('');
      }, 2000);
    } catch (err) {
      setInviteError('An unexpected error occurred');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
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
            <div className="relative flex items-center flex-1">
              <Search className="absolute left-3 h-4 w-4 text-[#4B5563] pointer-events-none" aria-hidden="true" />
              <input 
                type="text" 
                placeholder="Search user..." 
                aria-label="Search users"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-44 pl-9 pr-4 py-2 border border-[#bccbb9] rounded-full text-sm bg-[#f8f9ff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2" 
                style={{ fontFamily: 'inherit' }} 
              />
            </div>
            <button aria-label="View notifications (1 unread)" className="relative w-9 h-9 rounded-full hover:bg-[#eff4ff] flex items-center justify-center text-[#3d4a3d]">
              <span className="mat" aria-hidden="true">notifications</span>
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] rounded-full text-[9px] text-white font-bold flex items-center justify-center" aria-hidden="true">1</span>
            </button>
            <button aria-label="Settings" className="w-9 h-9 rounded-full hover:bg-[#eff4ff] flex items-center justify-center text-[#3d4a3d]">
              <span className="mat" aria-hidden="true">settings</span>
            </button>
            <div className="flex items-center gap-2 ml-1">
              <div className="w-9 h-9 rounded-full bg-[#213145] border-2 border-[#adc6ff] flex items-center justify-center font-bold text-white text-xs qs">{adminInitials}</div>
              <div>
                <p className="text-sm font-semibold leading-none">{adminName}</p>
                <p className="text-[10px] text-[#374151] mt-0.5">ADMIN</p>
              </div>
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <main className="flex-1 p-8">
          {/* Page header */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <h1 className="qs font-bold text-[32px] text-[#0b1c30] leading-none mb-2">User Management</h1>
              <p className="text-[#3d4a3d] text-sm">Review and manage identities across the platform.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#e5eeff] mb-6 flex gap-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 font-semibold text-sm transition-colors ${
                activeTab === 'users'
                  ? 'text-[#0058be] border-b-2 border-[#0058be]'
                  : 'text-[#374151] hover:text-[#0b1c30]'
              }`}
            >
              Users & Parents
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`pb-4 font-semibold text-sm transition-colors ${
                activeTab === 'admins'
                  ? 'text-[#0058be] border-b-2 border-[#0058be]'
                  : 'text-[#374151] hover:text-[#0b1c30]'
              }`}
            >
              Admin Accounts
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <>
              {/* Filters */}
              <div className="bg-white border border-[#e5eeff] rounded-2xl p-5 mb-5 flex items-end gap-4 shadow-sm">
                <div className="flex-1 min-w-0">
                  <label htmlFor="filter-role" className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Role</label>
                  <select id="filter-role" className="w-full px-4 py-2.5 border border-[#bccbb9] rounded-xl text-[#0b1c30] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-[#0058be] transition-colors" style={{ fontFamily: 'inherit' }}>
                    <option>All Roles</option>
                    <option>Student</option>
                    <option>Teacher</option>
                    <option>Parent</option>
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="filter-status" className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Status</label>
                  <select id="filter-status" className="w-full px-4 py-2.5 border border-[#bccbb9] rounded-xl text-[#0b1c30] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-[#0058be] transition-colors" style={{ fontFamily: 'inherit' }}>
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="filter-date" className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Registration Date</label>
                  <input id="filter-date" type="date" className="w-full px-4 py-2.5 border border-[#bccbb9] rounded-xl text-[#0b1c30] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-[#0058be] transition-colors" style={{ fontFamily: 'inherit' }} />
                </div>
                <button
                  aria-label="Search users"
                  className="flex items-center gap-2 min-h-[44px] px-4 bg-[#eff4ff] border border-[#dce9ff] rounded-xl hover:bg-[#dce9ff] transition-colors text-[#0058be] font-semibold text-sm"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span>Search</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-[#e5eeff] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e5eeff]">
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Name</th>
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Email</th>
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Board/Grade</th>
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Plan</th>
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Status</th>
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Children</th>
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Joined</th>
                        <th scope="col" className="text-center p-4 text-[#374151] font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        // Skeleton loader
                        [...Array(5)].map((_, idx) => (
                          <tr key={idx} className="border-b border-[#e5eeff] hover:bg-[#f8f9ff]">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#e5eeff] animate-pulse"></div>
                                <div className="h-4 bg-[#e5eeff] rounded w-24 animate-pulse"></div>
                              </div>
                            </td>
                            <td className="p-4"><div className="h-4 bg-[#e5eeff] rounded w-32 animate-pulse"></div></td>
                            <td className="p-4"><div className="h-4 bg-[#e5eeff] rounded w-20 animate-pulse"></div></td>
                            <td className="p-4"><div className="h-4 bg-[#e5eeff] rounded w-16 animate-pulse"></div></td>
                            <td className="p-4"><div className="h-4 bg-[#e5eeff] rounded w-20 animate-pulse"></div></td>
                            <td className="p-4"><div className="h-4 bg-[#e5eeff] rounded w-12 animate-pulse"></div></td>
                            <td className="p-4"><div className="h-4 bg-[#e5eeff] rounded w-24 animate-pulse"></div></td>
                            <td className="p-4 flex items-center justify-center gap-2">
                              <div className="w-8 h-8 bg-[#e5eeff] rounded animate-pulse"></div>
                            </td>
                          </tr>
                        ))
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center">
                            <p className="text-[#374151]">No users found</p>
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => {
                          const initials = user.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2);
                          
                          return (
                            <tr key={user.id} className="border-b border-[#e5eeff] hover:bg-[#f8f9ff]">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#0058be] text-white flex items-center justify-center text-xs font-bold qs">
                                    {initials}
                                  </div>
                                  <span className="font-semibold text-[#0b1c30] text-sm">{user.name}</span>
                                </div>
                              </td>
                              <td className="p-4 text-[#374151] text-sm">{user.email}</td>
                              <td className="p-4 text-[#374151] text-sm">{user.board}</td>
                              <td className="p-4">
                                <span className="inline-flex items-center text-xs font-bold rounded-full bg-[#eff4ff] text-[#0058be] border border-[#adc6ff] px-2.5 py-1">
                                  {user.plan}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1 font-semibold text-sm text-[#006e2f]">
                                  <span className="mat text-base">check_circle</span>
                                  Active
                                </div>
                              </td>
                              <td className="p-4 text-[#0b1c30] font-semibold text-sm">{user.child_count}</td>
                              <td className="p-4 text-[#374151] text-sm">{user.created_at}</td>
                              <td className="p-4 flex items-center justify-center gap-2">
                                <Link href={`/admin/users/${user.id}`}>
                                  <button className="w-8 h-8 rounded-lg bg-white hover:bg-[#e5eeff] flex items-center justify-center text-[#0058be] transition-colors" title="View Details">
                                    <span className="mat">info</span>
                                  </button>
                                </Link>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!loading && users.length > 0 && (
                  <div className="flex items-center justify-between p-4 border-t border-[#e5eeff] bg-[#f8f9ff]">
                    <p className="text-sm text-[#374151]">
                      Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalUsers)} of {totalUsers} users
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-[#bccbb9] rounded-lg text-sm font-semibold text-[#0b1c30] hover:bg-[#eff4ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-semibold text-[#0b1c30]">Page {currentPage}</span>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage * perPage >= totalUsers}
                        className="px-3 py-2 border border-[#bccbb9] rounded-lg text-sm font-semibold text-[#0b1c30] hover:bg-[#eff4ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Admin Accounts Tab */}
          {activeTab === 'admins' && (
            <>
              {/* Admin Accounts Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="qs font-bold text-xl text-[#0b1c30] mb-1">Administrator Accounts</h2>
                  <p className="text-[#374151] text-sm">Manage admin users and send invitations</p>
                </div>
                {adminRole === 'SUPER_ADMIN' && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-5 py-2.5 bg-[#0058be] text-white font-semibold rounded-lg text-sm hover:bg-[#004199] transition-colors flex items-center gap-2"
                  >
                    <span className="mat text-lg">person_add</span>
                    Invite Admin
                  </button>
                )}
              </div>

              {/* Admins Table */}
              <div className="bg-white border border-[#e5eeff] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e5eeff]">
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Name</th>
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Email</th>
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Role</th>
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Status</th>
                        <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Last Login</th>
                        <th scope="col" className="text-center p-4 text-[#374151] font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminsLoading ? (
                        [...Array(3)].map((_, idx) => (
                          <tr key={idx} className="border-b border-[#e5eeff]">
                            <td className="p-4"><div className="h-4 bg-[#e5eeff] rounded w-32 animate-pulse"></div></td>
                            <td className="p-4"><div className="h-4 bg-[#e5eeff] rounded w-40 animate-pulse"></div></td>
                            <td className="p-4"><div className="h-4 bg-[#e5eeff] rounded w-24 animate-pulse"></div></td>
                            <td className="p-4"><div className="h-4 bg-[#e5eeff] rounded w-16 animate-pulse"></div></td>
                            <td className="p-4"><div className="h-4 bg-[#e5eeff] rounded w-28 animate-pulse"></div></td>
                            <td className="p-4 flex items-center justify-center gap-2">
                              <div className="w-8 h-8 bg-[#e5eeff] rounded animate-pulse"></div>
                            </td>
                          </tr>
                        ))
                      ) : admins.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center">
                            <p className="text-[#374151]">No admins found</p>
                          </td>
                        </tr>
                      ) : (
                        admins.map((admin) => {
                          const initials = admin.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2);

                          const roleDisplay = {
                            SUPER_ADMIN: 'Super Admin',
                            CONTENT_MOD: 'Content Moderator',
                            SUPPORT: 'Support Agent',
                            FINANCE: 'Finance Admin',
                          }[admin.role] || admin.role;

                          return (
                            <tr key={admin.id} className="border-b border-[#e5eeff] hover:bg-[#f8f9ff]">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#006e2f] text-white flex items-center justify-center text-xs font-bold qs">
                                    {initials}
                                  </div>
                                  <span className="font-semibold text-[#0b1c30] text-sm">{admin.name}</span>
                                </div>
                              </td>
                              <td className="p-4 text-[#374151] text-sm">{admin.email}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center text-xs font-bold rounded-full px-2.5 py-1 ${
                                  admin.role === 'SUPER_ADMIN'
                                    ? 'bg-red-100 text-red-700 border border-red-300'
                                    : 'bg-blue-100 text-blue-700 border border-blue-300'
                                }`}>
                                  {roleDisplay}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className={`flex items-center gap-1 font-semibold text-sm ${
                                  admin.isActive ? 'text-[#006e2f]' : 'text-red-600'
                                }`}>
                                  <span className="mat text-base">
                                    {admin.isActive ? 'check_circle' : 'cancel'}
                                  </span>
                                  {admin.isActive ? 'Active' : 'Inactive'}
                                </div>
                              </td>
                              <td className="p-4 text-[#374151] text-sm">
                                {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="p-4 flex items-center justify-center gap-2">
                                {admin.role !== 'SUPER_ADMIN' && adminRole === 'SUPER_ADMIN' && (
                                  <button
                                    className="w-8 h-8 rounded-lg bg-white hover:bg-red-50 flex items-center justify-center text-red-600 transition-colors"
                                    title="Deactivate"
                                  >
                                    <span className="mat">block</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>

      {/* Invite Admin Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="invite-dialog-title" className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
              <h2 id="invite-dialog-title" className="qs font-bold text-lg text-[#0b1c30]">Invite Admin</h2>
              <button
                aria-label="Close invite dialog"
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError('');
                  setInviteMessage('');
                }}
                className="w-9 h-9 flex items-center justify-center hover:bg-[#f8f9ff] rounded-lg transition-colors"
              >
                <span className="mat text-[#374151]" aria-hidden="true">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="invite-email" className="block text-sm font-semibold text-[#0b1c30] mb-2">
                  Email Address
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2.5 border border-[#e5eeff] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 text-[#0b1c30]"
                  required
                  disabled={inviteLoading}
                />
              </div>

              {/* Role Field */}
              <div>
                <label htmlFor="invite-role" className="block text-sm font-semibold text-[#0b1c30] mb-2">
                  Role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#e5eeff] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 text-[#0b1c30]"
                  disabled={inviteLoading}
                >
                  <option value="SUPPORT">Support Agent</option>
                  <option value="CONTENT_MOD">Content Moderator</option>
                  <option value="FINANCE">Finance Admin</option>
                </select>
              </div>

              {/* Error Message */}
              {inviteError && (
                <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{inviteError}</p>
                </div>
              )}

              {/* Success Message */}
              {inviteMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{inviteMessage}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteError('');
                    setInviteMessage('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-[#e5eeff] rounded-lg text-[#0b1c30] font-semibold hover:bg-[#f8f9ff] transition-colors disabled:opacity-50"
                  disabled={inviteLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#0058be] text-white rounded-lg font-semibold hover:bg-[#004199] transition-colors disabled:opacity-50"
                  disabled={inviteLoading}
                >
                  {inviteLoading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

