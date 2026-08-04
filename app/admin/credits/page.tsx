'use client';

import { useState, useEffect } from 'react';

interface CreditsData {
  summary: {
    totalCalls: number;
    totalTokens: number;
    totalCostUsd: number;
    avgCostPerCall: number;
  };
  byUser: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    calls: number;
    tokens: number;
    costUsd: number;
  }>;
  byFeature: Array<{
    feature: string;
    calls: number;
    tokens: number;
    costUsd: number;
  }>;
  byDate: Array<{
    date: string;
    calls: number;
    tokens: number;
    costUsd: number;
  }>;
}

interface CreditsData {
  summary: {
    totalCalls: number;
    totalTokens: number;
    totalCostUsd: number;
    avgCostPerCall: number;
  };
  byUser: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    calls: number;
    tokens: number;
    costUsd: number;
  }>;
  byFeature: Array<{
    feature: string;
    calls: number;
    tokens: number;
    costUsd: number;
  }>;
  byDate: Array<{
    date: string;
    calls: number;
    tokens: number;
    costUsd: number;
  }>;
}

export default function AdminCreditsPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState<string>('Admin');
  const [adminInitials, setAdminInitials] = useState<string>('AD');
  const [data, setData] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [featureFilter, setFeatureFilter] = useState('');

  const toInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase() || 'AD';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/admin/verify-session', { cache: 'no-store' });
        if (!response.ok) {
          window.location.replace('/admin/login');
          return;
        }
        const session = await response.json();
        const name = session?.admin?.name || 'Admin';
        if (cancelled) return;
        setAdminName(name);
        setAdminInitials(toInitials(name));
        setIsAuthenticated(true);
      } catch {
        window.location.replace('/admin/login');
      } finally {
        if (!cancelled) setMounted(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCredits();
  }, [startDate, endDate, featureFilter, isAuthenticated]);

  const fetchCredits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(featureFilter && { feature: featureFilter }),
      });

      const response = await fetch(`/api/admin/credits?${params}`);
      if (!response.ok) throw new Error('Failed to fetch credits');

      const creditsData = await response.json();
      setData(creditsData);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        export: 'csv',
        ...(featureFilter && { feature: featureFilter }),
      });

      const response = await fetch(`/api/admin/credits?${params}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `credits_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (!mounted || !isAuthenticated || !data) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <nav className="h-16 bg-white dark:bg-slate-900 border-b border-[#e5eeff] dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-40" style={{ boxShadow: '0 2px 8px rgba(0,88,190,.04)' }}>
          <div className="flex items-center gap-8">
            <span className="qs font-bold text-lg text-[#006e2f] dark:text-cyan-300">EduPulse</span>
            <div className="flex items-center gap-6">
              <a href="/admin" className="text-sm font-semibold text-[#3d4a3d] dark:text-slate-300 pb-2 hover:text-[#0058be] dark:hover:text-cyan-300">Dashboard</a>
              <a href="/admin/users" className="text-sm font-semibold text-[#3d4a3d] dark:text-slate-300 pb-2 hover:text-[#0058be] dark:hover:text-cyan-300">Users</a>
              <a href="#" className="text-sm font-semibold text-[#3d4a3d] dark:text-cyan-300 pb-2 border-b-2 border-[#006e2f] dark:border-cyan-400 text-[#006e2f]">Credits</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#213145] border-2 border-[#adc6ff] flex items-center justify-center font-bold text-white text-xs qs">{adminInitials}</div>
            <div>
              <p className="text-sm font-semibold leading-none text-[#0b1c30] dark:text-slate-100">{adminName}</p>
              <p className="text-[10px] text-[#374151] dark:text-slate-400 mt-0.5">ADMIN</p>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-950">
          {/* Page Header */}
          <div className="mb-7">
            <h1 className="qs font-bold text-[32px] text-[#0b1c30] dark:text-slate-100">AI Credit Usage</h1>
            <p className="text-[#374151] dark:text-slate-300 text-sm mt-2">Track Gemini 2.5 Flash API consumption and costs</p>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-900 border border-[#e5eeff] dark:border-slate-700 rounded-2xl p-5 mb-6 shadow-sm flex items-end gap-4">
            <div>
              <label htmlFor="credits-start-date" className="block text-xs font-bold text-[#374151] dark:text-slate-300 mb-1.5 uppercase tracking-wider">Start Date</label>
              <input
                id="credits-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2.5 border border-[#bccbb9] dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl text-[#0b1c30] dark:text-slate-100 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-[#0058be] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="credits-end-date" className="block text-xs font-bold text-[#374151] dark:text-slate-300 mb-1.5 uppercase tracking-wider">End Date</label>
              <input
                id="credits-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2.5 border border-[#bccbb9] dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl text-[#0b1c30] dark:text-slate-100 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-[#0058be] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="credits-feature" className="block text-xs font-bold text-[#374151] dark:text-slate-300 mb-1.5 uppercase tracking-wider">Feature</label>
              <select
                id="credits-feature"
                value={featureFilter}
                onChange={(e) => setFeatureFilter(e.target.value)}
                className="px-4 py-2.5 border border-[#bccbb9] dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl text-[#0b1c30] dark:text-slate-100 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-[#0058be] transition-colors"
              >
                <option value="">All Features</option>
                <option value="QUERY">Query</option>
                <option value="ASSIGNMENT_GEN">Assignment Gen</option>
                <option value="ASSIGNMENT_FEEDBACK">Assignment Feedback</option>
                <option value="ADDITIONAL_RESEARCH">Research</option>
                <option value="PODCAST">Podcast</option>
                <option value="REPORT">Report</option>
              </select>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-[#006e2f] text-white font-bold rounded-xl text-sm hover:bg-[#005828] transition-colors flex items-center gap-2"
            >
              <span className="mat">download</span> Export CSV
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            <div className="rounded-xl p-5 bg-blue-600 text-white shadow-sm">
              <p className="text-sm font-medium text-blue-100 mb-1">Total AI Calls</p>
              <p className="text-3xl font-bold text-white">{data.summary.totalCalls.toLocaleString()}</p>
              <p className="text-xs text-blue-200 mt-1">All features combined</p>
            </div>
            <div className="rounded-xl p-5 bg-indigo-600 text-white shadow-sm">
              <p className="text-sm font-medium text-indigo-100 mb-1">Total Tokens</p>
              <p className="text-3xl font-bold text-white">{data.summary.totalTokens.toLocaleString()}</p>
              <p className="text-xs text-indigo-200 mt-1">Input + output tokens</p>
            </div>
            <div className="rounded-xl p-5 bg-emerald-600 text-white shadow-sm">
              <p className="text-sm font-medium text-emerald-100 mb-1">Total Cost</p>
              <p className="text-3xl font-bold text-white">${Number(data.summary.totalCostUsd).toFixed(4)}</p>
              <p className="text-xs text-emerald-200 mt-1">USD - Gemini 2.5 Flash</p>
            </div>
            <div className="rounded-xl p-5 bg-amber-500 text-white shadow-sm">
              <p className="text-sm font-medium text-amber-100 mb-1">Avg Cost / Call</p>
              <p className="text-3xl font-bold text-white">${Number(data.summary.avgCostPerCall).toFixed(6)}</p>
              <p className="text-xs text-amber-100 mt-1">Per AI request</p>
            </div>
          </div>

          {/* Usage by Feature Table */}
          <div className="bg-white dark:bg-slate-900 border border-[#e5eeff] dark:border-slate-700 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="qs font-bold text-lg text-[#0b1c30] dark:text-slate-100 mb-5">Usage by Feature</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5eeff] dark:border-slate-700 bg-[#f8f9ff] dark:bg-slate-800">
                    <th scope="col" className="text-left p-4 text-[#374151] dark:text-slate-300 font-semibold text-sm">Feature</th>
                    <th scope="col" className="text-left p-4 text-[#374151] dark:text-slate-300 font-semibold text-sm">Calls</th>
                    <th scope="col" className="text-left p-4 text-[#374151] dark:text-slate-300 font-semibold text-sm">Tokens</th>
                    <th scope="col" className="text-left p-4 text-[#374151] dark:text-slate-300 font-semibold text-sm">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byFeature
                    .sort((a, b) => b.costUsd - a.costUsd)
                    .map((feature) => (
                      <tr key={feature.feature} className="border-b border-[#e5eeff] dark:border-slate-700 hover:bg-[#f8f9ff] dark:hover:bg-slate-800">
                        <td className="p-4 text-[#0b1c30] dark:text-slate-100 font-semibold text-sm">{feature.feature}</td>
                        <td className="p-4 text-[#374151] dark:text-slate-300 text-sm">{feature.calls}</td>
                        <td className="p-4 text-[#374151] dark:text-slate-300 text-sm">{feature.tokens.toLocaleString()}</td>
                        <td className="p-4 text-[#0b1c30] dark:text-slate-100 font-semibold text-sm">
                          ${feature.costUsd.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Spend Table */}
          <div className="bg-white dark:bg-slate-900 border border-[#e5eeff] dark:border-slate-700 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="qs font-bold text-lg text-[#0b1c30] dark:text-slate-100 mb-5">Daily Spend</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5eeff] dark:border-slate-700 bg-[#f8f9ff] dark:bg-slate-800">
                    <th scope="col" className="text-left p-4 text-[#374151] dark:text-slate-300 font-semibold text-sm">Date</th>
                    <th scope="col" className="text-left p-4 text-[#374151] dark:text-slate-300 font-semibold text-sm">Calls</th>
                    <th scope="col" className="text-left p-4 text-[#374151] dark:text-slate-300 font-semibold text-sm">Tokens</th>
                    <th scope="col" className="text-left p-4 text-[#374151] dark:text-slate-300 font-semibold text-sm">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byDate
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 30)
                    .map((day) => (
                      <tr key={day.date} className="border-b border-[#e5eeff] dark:border-slate-700 hover:bg-[#f8f9ff] dark:hover:bg-slate-800">
                        <td className="p-4 text-[#0b1c30] dark:text-slate-100 font-semibold text-sm">{day.date}</td>
                        <td className="p-4 text-[#374151] dark:text-slate-300 text-sm">{day.calls}</td>
                        <td className="p-4 text-[#374151] dark:text-slate-300 text-sm">{day.tokens.toLocaleString()}</td>
                        <td className="p-4 text-[#0b1c30] dark:text-slate-100 font-semibold text-sm">
                          ${day.costUsd.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Usage by User Table */}
          <div className="bg-white dark:bg-slate-900 border border-[#e5eeff] dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#e5eeff] dark:border-slate-700">
              <h2 className="qs font-bold text-lg text-[#0b1c30] dark:text-slate-100">Usage by User</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 dark:bg-slate-700">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">User</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Calls</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Tokens</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                  {data.byUser
                    .sort((a, b) => b.costUsd - a.costUsd)
                    .slice(0, 10)
                    .map((user, i) => (
                      <tr key={user.userId} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-slate-100">{user.userName}</p>
                            <p className="text-gray-500 dark:text-slate-400 text-xs">{user.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{user.userRole}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-slate-100 font-medium">{user.calls}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{user.tokens.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-slate-100 font-medium">
                          ${user.costUsd.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
    </div>
  );
}
