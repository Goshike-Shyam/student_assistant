'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/ui/site-header';
import { Button } from '@/components/ui/button';

interface AssignmentHistory {
  id: string;
  subject: string;
  topic: string;
  title: string;
  createdAt: string;
  submittedAt: string | null;
  score: number | null;
  grade: string | null;
  totalMarks: number;
}

export default function AssignmentHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState<AssignmentHistory[]>([]);
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted'>('all');
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      window.location.href = '/login';
      return;
    }

    // TODO: Fetch from API
    // For now, show placeholder data
    setAssignments([
      {
        id: '1',
        subject: 'Mathematics',
        topic: 'Quadratic Equations',
        title: 'Solving Quadratic Equations',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        score: 18,
        grade: 'A',
        totalMarks: 20,
      },
      {
        id: '2',
        subject: 'Science',
        topic: 'Photosynthesis',
        title: 'Understanding Photosynthesis',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: null,
        score: null,
        grade: null,
        totalMarks: 25,
      },
    ]);

    setSubjects([...new Set(assignments.map((a) => a.subject))]);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  const filteredAssignments = assignments.filter((a) => {
    if (filterSubject && a.subject !== filterSubject) return false;
    if (filterStatus === 'pending' && a.submittedAt) return false;
    if (filterStatus === 'submitted' && !a.submittedAt) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <SiteHeader />

      <div className="pt-24 px-6 pb-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Assignment History</h1>
            <p className="text-slate-600">View and manage all your assignments</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-wrap gap-4">
            {/* Subject Filter */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredAssignments.length > 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">Subject</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Topic</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Generated</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Submitted</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Score</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Grade</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-4 font-semibold text-slate-900">{assignment.subject}</td>
                      <td className="p-4 text-slate-700">{assignment.topic}</td>
                      <td className="p-4 text-slate-600 text-xs">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-600 text-xs">
                        {assignment.submittedAt
                          ? new Date(assignment.submittedAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="p-4">
                        {assignment.score !== null ? (
                          <span className="font-semibold text-slate-900">
                            {assignment.score}/{assignment.totalMarks}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {assignment.grade ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold text-xs">
                            {assignment.grade}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!assignment.submittedAt}
                        >
                          View Feedback
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <p className="text-slate-600">No assignments found</p>
              <Link href="/assignments" className="text-blue-600 hover:underline mt-2 inline-block">
                Generate your first assignment →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
