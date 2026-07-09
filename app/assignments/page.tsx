'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AssignmentsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      window.location.href = '/login';
      return;
    }

    // Fetch user's registered subjects from Express backend API
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/${userId}/subjects`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedSubjects = data.subjects || [];
          
          // Show empty state if no subjects found (not a fallback)
          if (fetchedSubjects.length === 0) {
            setError('No subjects registered');
          }
          setSubjects(fetchedSubjects);
        } else {
          // Show error state instead of fallback
          setError('Failed to load subjects. Please refresh the page.');
          setSubjects([]);
        }
      } catch (error) {
        // Show error state instead of fallback
        setError('Unable to load your subjects. Please refresh the page.');
        setSubjects([]);
      }
    };

    fetchSubjects();
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <SiteHeader />

      <div className="flex pt-24">
        {/* SIDEBAR - Optional */}
        {/* <Sidebar activeSubject="Assignments" /> */}

        {/* MAIN */}
        <main className="flex-1 px-6 py-10">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Assignments</h1>
              <p className="text-slate-600">Select a subject to generate practice assignments</p>
            </div>

            {/* Error/Empty State */}
            {error && subjects.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center space-y-3">
                <p className="text-amber-900 font-medium">📚 {error}</p>
                {error === 'No subjects registered' && (
                  <p className="text-sm text-amber-700">
                    It looks like you haven't added your subjects yet. Please update your profile to get started.
                  </p>
                )}
              </div>
            )}

            {/* Subjects Grid */}
            {subjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <Link
                    key={subject}
                    href={`/assignments/${encodeURIComponent(subject)}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                          {subject}
                        </h3>
                        <span className="text-blue-600 opacity-0 group-hover:opacity-100">→</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Generate practice assignments on any topic
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-blue-900">How it works</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ Select a subject above</li>
                <li>✓ Enter a topic you want to practice</li>
                <li>✓ Choose difficulty level</li>
                <li>✓ Generate and solve the assignment</li>
                <li>✓ Get instant AI-powered feedback</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
