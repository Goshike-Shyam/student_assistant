'use client';

import { useState, useEffect } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Search, TrendingUp, Calendar } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SearchQuery {
  id: string;
  query: string;
  subject: string | null;
  createdAt: string;
}

export default function ParentPortalPage() {
  const [searchHistory, setSearchHistory] = useState<SearchQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [totalSearches, setTotalSearches] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Geography',
    'Computer Science',
    'Biology',
    'Chemistry',
    'Physics',
    'Economics',
    'General Knowledge'
  ];

  // Parent portal requires parent role in localStorage session.
  useEffect(() => {
    const storedStudentId = localStorage.getItem('userId');
    const storedUserRole = localStorage.getItem('userRole');

    if (!storedStudentId || storedUserRole?.toLowerCase() !== 'parent') {
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);
    setStudentId(storedStudentId);
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <span className="mb-4 block text-4xl" aria-hidden="true">👨‍👩‍👧</span>
          <h1 className="mb-2 text-xl font-bold text-gray-900">Parent Portal</h1>
          <p className="mb-6 text-sm text-gray-600">Please log in with your parent account to access this portal.</p>
          <a
            href="/login?role=parent"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Parent Login
          </a>
        </div>
      </div>
    );
  }

  // Fetch search history
  useEffect(() => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    const fetchSearchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/search/history/${studentId}?limit=100`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch search history: ${response.status}`);
        }
        
        const data = await response.json();
        setSearchHistory(data || []);
        setTotalSearches(data?.length || 0);
      } catch (error) {
        console.error('Error fetching search history:', error);
        // Set empty array instead of failing completely
        setSearchHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchHistory();
  }, [studentId]);

  const filteredHistory = selectedSubject 
    ? searchHistory.filter(item => item.subject === selectedSubject)
    : searchHistory;

  const subjectStats = subjects.map(subject => ({
    subject,
    count: searchHistory.filter(item => item.subject === subject).length
  })).filter(stat => stat.count > 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      
      {/* Main Content */}
      <div className="pt-4 px-6 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Parent Portal</h1>
            <p className="text-lg text-slate-600">Monitor your child&apos;s learning progress and research activities</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm text-slate-600">Total Searches</CardTitle>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{totalSearches}</p>
                  </div>
                  <Search className="w-10 h-10 text-cyan-600 opacity-20" />
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm text-slate-600">Topics Explored</CardTitle>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{subjectStats.length}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm text-slate-600">Learning Trend</CardTitle>
                    <p className="text-sm text-green-600 font-semibold mt-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Active
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Subject Distribution */}
          {subjectStats.length > 0 && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Subject Areas</CardTitle>
                <CardDescription>Topics your child has been exploring</CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {subjectStats.map((stat) => (
                    <div key={stat.subject} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{stat.subject}</span>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {stat.count} {stat.count === 1 ? 'search' : 'searches'}
                          </span>
                        </div>
                        <div
                          role="progressbar"
                          aria-valuenow={Math.round((stat.count / Math.max(...subjectStats.map(s => s.count))) * 100)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${stat.subject}: ${stat.count} ${stat.count === 1 ? 'search' : 'searches'}`}
                          className="w-full bg-slate-200 rounded-full h-2"
                        >
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                            style={{ width: `${(stat.count / Math.max(...subjectStats.map(s => s.count))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Subject Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-slate-700">Filter by subject:</span>
            <button
              onClick={() => setSelectedSubject(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSubject === null
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              All ({searchHistory.length})
            </button>
            {subjectStats.map((stat) => (
              <button
                key={stat.subject}
                onClick={() => setSelectedSubject(stat.subject)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubject === stat.subject
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {stat.subject} ({stat.count})
              </button>
            ))}
          </div>

          {/* Search History */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Research History</CardTitle>
              <CardDescription>Recent questions and topics explored</CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block">
                    <div className="animate-spin">
                      <Search className="w-8 h-8 text-cyan-600" />
                    </div>
                  </div>
                  <p className="mt-4 text-slate-600">Loading search history...</p>
                </div>
              ) : filteredHistory.length > 0 ? (
                <div className="space-y-3">
                  {filteredHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200 hover:border-cyan-300 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900 truncate">{item.query}</p>
                          {item.subject && (
                            <span className="text-xs font-medium bg-cyan-100 text-cyan-700 px-2 py-1 rounded whitespace-nowrap">
                              📚 {item.subject}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.createdAt)} at {formatTime(item.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">
                    {selectedSubject 
                      ? `No searches found in ${selectedSubject}`
                      : 'No search history yet'}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Tips Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">💡 Tips for Supporting Your Child's Learning</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Encourage curiosity by discussing their research topics</li>
                <li>✓ Review the subjects they explore regularly</li>
                <li>✓ Ask follow-up questions to deepen understanding</li>
                <li>✓ Celebrate learning milestones and diverse topic exploration</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
