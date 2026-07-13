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

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (userName) {
      setAdminName(userName);
      const parts = userName.split(' ');
      const initials = parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
      setAdminInitials(initials);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [startDate, endDate, featureFilter]);

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

  if (!mounted || !data) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <nav className="h-16 bg-white border-b border-[#e5eeff] flex items-center justify-between px-8 sticky top-0 z-40" style={{ boxShadow: '0 2px 8px rgba(0,88,190,.04)' }}>
          <div className="flex items-center gap-8">
            <span className="qs font-bold text-lg text-[#006e2f]">EduPulse</span>
            <div className="flex items-center gap-6">
              <a href="/admin" className="text-sm font-semibold text-[#3d4a3d] pb-2 hover:text-[#0058be]">Dashboard</a>
              <a href="/admin/users" className="text-sm font-semibold text-[#3d4a3d] pb-2 hover:text-[#0058be]">Users</a>
              <a href="#" className="text-sm font-semibold text-[#3d4a3d] pb-2 border-b-2 border-[#006e2f] text-[#006e2f]">Credits</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#213145] border-2 border-[#adc6ff] flex items-center justify-center font-bold text-white text-xs qs">{adminInitials}</div>
            <div>
              <p className="text-sm font-semibold leading-none">{adminName}</p>
              <p className="text-[10px] text-[#374151] mt-0.5">ADMIN</p>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Page Header */}
          <div className="mb-7">
            <h1 className="qs font-bold text-[32px] text-[#0b1c30]">AI Credit Usage</h1>
            <p className="text-[#374151] text-sm mt-2">Track Gemini 2.5 Flash API consumption and costs</p>
          </div>

          {/* Filters */}
          <div className="bg-white border border-[#e5eeff] rounded-2xl p-5 mb-6 shadow-sm flex items-end gap-4">
            <div>
              <label htmlFor="credits-start-date" className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Start Date</label>
              <input
                id="credits-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2.5 border border-[#bccbb9] rounded-xl text-[#0b1c30] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-[#0058be] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="credits-end-date" className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">End Date</label>
              <input
                id="credits-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2.5 border border-[#bccbb9] rounded-xl text-[#0b1c30] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-[#0058be] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="credits-feature" className="block text-xs font-bold text-[#374151] mb-1.5 uppercase tracking-wider">Feature</label>
              <select
                id="credits-feature"
                value={featureFilter}
                onChange={(e) => setFeatureFilter(e.target.value)}
                className="px-4 py-2.5 border border-[#bccbb9] rounded-xl text-[#0b1c30] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 focus-visible:border-[#0058be] transition-colors"
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
          <div className="grid grid-cols-4 gap-5 mb-6">
            <div className="bg-white border border-[#e5eeff] rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-[#374151] font-medium mb-2">Total Calls</p>
              <p className="qs font-bold text-2xl text-[#0b1c30]">{data.summary.totalCalls.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-[#e5eeff] rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-[#374151] font-medium mb-2">Total Tokens</p>
              <p className="qs font-bold text-2xl text-[#0b1c30]">{(data.summary.totalTokens / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K</p>
            </div>
            <div className="bg-white border border-[#e5eeff] rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-[#374151] font-medium mb-2">Total Cost (USD)</p>
              <p className="qs font-bold text-2xl text-[#0b1c30]">${data.summary.totalCostUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white border border-[#e5eeff] rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-[#374151] font-medium mb-2">Avg Cost/Call</p>
              <p className="qs font-bold text-2xl text-[#0b1c30]">${data.summary.avgCostPerCall.toLocaleString('en-US', { maximumFractionDigits: 4 })}</p>
            </div>
          </div>

          {/* Usage by Feature Table */}
          <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="qs font-bold text-lg text-[#0b1c30] mb-5">Usage by Feature</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5eeff] bg-[#f8f9ff]">
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Feature</th>
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Calls</th>
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Tokens</th>
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byFeature
                    .sort((a, b) => b.costUsd - a.costUsd)
                    .map((feature) => (
                      <tr key={feature.feature} className="border-b border-[#e5eeff] hover:bg-[#f8f9ff]">
                        <td className="p-4 text-[#0b1c30] font-semibold text-sm">{feature.feature}</td>
                        <td className="p-4 text-[#374151] text-sm">{feature.calls}</td>
                        <td className="p-4 text-[#374151] text-sm">{feature.tokens.toLocaleString()}</td>
                        <td className="p-4 text-[#0b1c30] font-semibold text-sm">
                          ${feature.costUsd.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Spend Table */}
          <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="qs font-bold text-lg text-[#0b1c30] mb-5">Daily Spend</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5eeff] bg-[#f8f9ff]">
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Date</th>
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Calls</th>
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Tokens</th>
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byDate
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 30)
                    .map((day) => (
                      <tr key={day.date} className="border-b border-[#e5eeff] hover:bg-[#f8f9ff]">
                        <td className="p-4 text-[#0b1c30] font-semibold text-sm">{day.date}</td>
                        <td className="p-4 text-[#374151] text-sm">{day.calls}</td>
                        <td className="p-4 text-[#374151] text-sm">{day.tokens.toLocaleString()}</td>
                        <td className="p-4 text-[#0b1c30] font-semibold text-sm">
                          ${day.costUsd.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Usage by User Table */}
          <div className="bg-white border border-[#e5eeff] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#e5eeff]">
              <h2 className="qs font-bold text-lg text-[#0b1c30]">Usage by User</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5eeff] bg-[#f8f9ff]">
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">User</th>
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Role</th>
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Calls</th>
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Tokens</th>
                    <th scope="col" className="text-left p-4 text-[#374151] font-semibold text-sm">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byUser
                    .sort((a, b) => b.costUsd - a.costUsd)
                    .slice(0, 10)
                    .map((user) => (
                      <tr key={user.userId} className="border-b border-[#e5eeff] hover:bg-[#f8f9ff]">
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-[#0b1c30] text-sm">{user.userName}</p>
                            <p className="text-[#374151] text-xs">{user.userEmail}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-[#0058be] bg-[#eff4ff] px-2.5 py-1 rounded-full">
                            {user.userRole}
                          </span>
                        </td>
                        <td className="p-4 text-[#0b1c30] font-semibold text-sm">{user.calls}</td>
                        <td className="p-4 text-[#374151] text-sm">{user.tokens.toLocaleString()}</td>
                        <td className="p-4 text-[#0b1c30] font-semibold text-sm">
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
