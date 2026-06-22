'use client';

import { Sidebar } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type PracticeTest = {
  id: string;
  subject: string;
  title: string;
  duration: number;
  totalQuestions: number;
  difficulty: string;
};

type PracticeAttempt = {
  id: string;
  progress: number;
  status: string;
  test: PracticeTest;
};

export default function PracticePage() {
  const [practiceTests, setPracticeTests] = useState<PracticeTest[]>([]);
  const [practiceAttempts, setPracticeAttempts] = useState<Record<string, PracticeAttempt>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all practice tests
        const testsResponse = await fetch(`${API_URL}/api/practice-tests`);
        if (!testsResponse.ok) throw new Error('Failed to fetch practice tests');
        const tests = await testsResponse.json();
        setPracticeTests(tests);

        // Fetch user's practice attempts (you'll need to replace with actual userId from session/auth)
        const userId = localStorage.getItem('userId') || 'demo-user';
        const attemptsResponse = await fetch(`${API_URL}/api/practice-tests/user/${userId}`);
        if (attemptsResponse.ok) {
          const attempts = await attemptsResponse.json();
          const attemptsMap = attempts.reduce((acc: Record<string, PracticeAttempt>, attempt: PracticeAttempt) => {
            acc[attempt.test.id] = attempt;
            return acc;
          }, {});
          setPracticeAttempts(attemptsMap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-100 text-emerald-700';
      case 'Medium':
        return 'bg-amber-100 text-amber-700';
      case 'Hard':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredTests = practiceTests.filter((test) => {
    if (selectedSubject !== 'All Subjects' && test.subject !== selectedSubject) return false;
    if (selectedDifficulty !== 'All Levels' && test.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const totalTests = practiceTests.length;
  const completedTests = Object.values(practiceAttempts).filter((a) => a.status === 'Complete').length;
  const averageScore = practiceAttempts && Object.values(practiceAttempts).length > 0 
    ? Math.round(Object.values(practiceAttempts).reduce((sum, a) => sum + (a.progress || 0), 0) / Object.values(practiceAttempts).length) 
    : 0;

  const subjects = ['All Subjects', ...new Set(practiceTests.map((t) => t.subject))];

  if (loading) {
    return (
      <div className="flex pt-16 min-h-screen bg-slate-50">
        <Sidebar activeSubject="Mathematics" />
        <main className="flex-1 overflow-x-hidden px-10 py-10">
          <div className="text-center">Loading practice tests...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex pt-16 min-h-screen bg-slate-50">
        <Sidebar activeSubject="Mathematics" />
        <main className="flex-1 overflow-x-hidden px-10 py-10">
          <div className="text-red-600">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex pt-16 min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <Sidebar activeSubject="Mathematics" />

      {/* MAIN */}
      <main className="flex-1 overflow-x-hidden">
        <div className="px-10 py-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="qs font-bold text-[36px] text-[#0b1c30] mb-3">Practice Tests</h1>
            <p className="text-slate-600">Test your knowledge and improve your skills with our comprehensive practice tests.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-5 mb-10">
            <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Total Tests</h3>
                <span className="mat text-[#0058be] text-2xl">assignment</span>
              </div>
              <p className="text-2xl font-bold text-[#0b1c30]">{totalTests}</p>
              <p className="text-xs text-slate-500 mt-2">Available to practice</p>
            </div>

            <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Completed</h3>
                <span className="mat text-[#006e2f] text-2xl">check_circle</span>
              </div>
              <p className="text-2xl font-bold text-[#0b1c30]">{completedTests}</p>
              <p className="text-xs text-slate-500 mt-2">Tests completed</p>
            </div>

            <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Average Score</h3>
                <span className="mat text-[#ff8e4d] text-2xl">trending_up</span>
              </div>
              <p className="text-2xl font-bold text-[#0b1c30]">{averageScore}%</p>
              <p className="text-xs text-slate-500 mt-2">Across all tests</p>
            </div>

            <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Streak</h3>
                <span className="mat text-[#22c55e] text-2xl">local_fire_department</span>
              </div>
              <p className="text-2xl font-bold text-[#0b1c30]">7 Days</p>
              <p className="text-xs text-slate-500 mt-2">Keep it going!</p>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search tests..."
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]"
              />
              <span className="mat absolute right-3 top-2.5 text-slate-400">search</span>
            </div>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <select 
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]"
            >
              <option>All Levels</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          {/* Practice Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => {
              const attempt = practiceAttempts[test.id];
              const progress = attempt?.progress ?? 0;
              const status = attempt?.status ?? 'Start';

              return (
                <div key={test.id} className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-[#0058be] uppercase tracking-wide">{test.subject}</p>
                      <h3 className="qs font-bold text-lg text-[#0b1c30] mt-1">{test.title}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(test.difficulty)}`}>
                      {test.difficulty}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-600 font-medium">Progress</span>
                      <span className="text-xs font-bold text-[#0058be]">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0058be] to-[#006e2f] transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-slate-200">
                    <div>
                      <p className="text-xs text-slate-600">Duration</p>
                      <p className="font-semibold text-sm text-[#0b1c30]">{test.duration} mins</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Questions</p>
                      <p className="font-semibold text-sm text-[#0b1c30]">{test.totalQuestions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Status</p>
                      <p className="font-semibold text-sm text-[#0058be]">
                        {progress === 100 ? 'Complete' : progress > 0 ? 'In Progress' : 'Start'}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full px-4 py-2.5 bg-[#0058be] text-white rounded-xl font-semibold text-sm hover:bg-[#003da8] transition-colors group-hover:shadow-lg">
                    {progress === 100 ? 'Review' : progress > 0 ? 'Continue' : 'Start Test'}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredTests.length === 0 && (
            <div className="text-center text-slate-600">
              No practice tests found for the selected filters.
            </div>
          )}

          {/* Recommended Section */}
          <div className="mt-12">
            <h2 className="qs font-bold text-2xl text-[#0b1c30] mb-6">Recommended For You</h2>
            <div className="bg-gradient-to-r from-[#0058be]/10 to-[#006e2f]/10 border border-[#e5eeff] rounded-2xl p-8">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="w-12 h-12 bg-[#0058be]/20 rounded-xl flex items-center justify-center mb-3">
                    <span className="mat text-[#0058be] text-xl">school</span>
                  </div>
                  <h3 className="font-bold text-[#0b1c30] mb-2">Take Mock Exams</h3>
                  <p className="text-sm text-slate-600">Experience real exam conditions with our full-length mock tests.</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-[#006e2f]/20 rounded-xl flex items-center justify-center mb-3">
                    <span className="mat text-[#006e2f] text-xl">analytics</span>
                  </div>
                  <h3 className="font-bold text-[#0b1c30] mb-2">Analyze Your Performance</h3>
                  <p className="text-sm text-slate-600">Get detailed insights on your strengths and areas for improvement.</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-[#ff8e4d]/20 rounded-xl flex items-center justify-center mb-3">
                    <span className="mat text-[#ff8e4d] text-xl">timer</span>
                  </div>
                  <h3 className="font-bold text-[#0b1c30] mb-2">Time Management</h3>
                  <p className="text-sm text-slate-600">Improve your speed and accuracy with timed practice sessions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-100 text-emerald-700';
      case 'Medium':
        return 'bg-amber-100 text-amber-700';
      case 'Hard':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex pt-16 min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <Sidebar activeSubject="Mathematics" />

      {/* MAIN */}
      <main className="flex-1 overflow-x-hidden">
        <div className="px-10 py-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="qs font-bold text-[36px] text-[#0b1c30] mb-3">Practice Tests</h1>
            <p className="text-slate-600">Test your knowledge and improve your skills with our comprehensive practice tests.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-5 mb-10">
            <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Total Tests</h3>
                <span className="mat text-[#0058be] text-2xl">assignment</span>
              </div>
              <p className="text-2xl font-bold text-[#0b1c30]">24</p>
              <p className="text-xs text-slate-500 mt-2">Available to practice</p>
            </div>

            <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Completed</h3>
                <span className="mat text-[#006e2f] text-2xl">check_circle</span>
              </div>
              <p className="text-2xl font-bold text-[#0b1c30]">16</p>
              <p className="text-xs text-slate-500 mt-2">Tests completed</p>
            </div>

            <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Average Score</h3>
                <span className="mat text-[#ff8e4d] text-2xl">trending_up</span>
              </div>
              <p className="text-2xl font-bold text-[#0b1c30]">78%</p>
              <p className="text-xs text-slate-500 mt-2">Across all tests</p>
            </div>

            <div className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Streak</h3>
                <span className="mat text-[#22c55e] text-2xl">local_fire_department</span>
              </div>
              <p className="text-2xl font-bold text-[#0b1c30]">7 Days</p>
              <p className="text-xs text-slate-500 mt-2">Keep it going!</p>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search tests..."
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]"
              />
              <span className="mat absolute right-3 top-2.5 text-slate-400">search</span>
            </div>
            <select className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]">
              <option>All Subjects</option>
              <option>Mathematics</option>
              <option>Science</option>
              <option>English</option>
              <option>History</option>
              <option>Biology</option>
              <option>Geography</option>
            </select>
            <select className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]">
              <option>All Levels</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          {/* Practice Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceTests.map((test) => (
              <div key={test.id} className="bg-white border border-[#e5eeff] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-[#0058be] uppercase tracking-wide">{test.subject}</p>
                    <h3 className="qs font-bold text-lg text-[#0b1c30] mt-1">{test.title}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(test.difficulty)}`}>
                    {test.difficulty}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 font-medium">Progress</span>
                    <span className="text-xs font-bold text-[#0058be]">{test.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0058be] to-[#006e2f] transition-all"
                      style={{ width: `${test.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-slate-200">
                  <div>
                    <p className="text-xs text-slate-600">Duration</p>
                    <p className="font-semibold text-sm text-[#0b1c30]">{test.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Questions</p>
                    <p className="font-semibold text-sm text-[#0b1c30]">{test.questions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Status</p>
                    <p className="font-semibold text-sm text-[#0058be]">
                      {test.progress === 100 ? 'Complete' : test.progress > 0 ? 'In Progress' : 'Start'}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full px-4 py-2.5 bg-[#0058be] text-white rounded-xl font-semibold text-sm hover:bg-[#003da8] transition-colors group-hover:shadow-lg">
                  {test.progress === 100 ? 'Review' : test.progress > 0 ? 'Continue' : 'Start Test'}
                </button>
              </div>
            ))}
          </div>

          {/* Recommended Section */}
          <div className="mt-12">
            <h2 className="qs font-bold text-2xl text-[#0b1c30] mb-6">Recommended For You</h2>
            <div className="bg-gradient-to-r from-[#0058be]/10 to-[#006e2f]/10 border border-[#e5eeff] rounded-2xl p-8">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="w-12 h-12 bg-[#0058be]/20 rounded-xl flex items-center justify-center mb-3">
                    <span className="mat text-[#0058be] text-xl">school</span>
                  </div>
                  <h3 className="font-bold text-[#0b1c30] mb-2">Take Mock Exams</h3>
                  <p className="text-sm text-slate-600">Experience real exam conditions with our full-length mock tests.</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-[#006e2f]/20 rounded-xl flex items-center justify-center mb-3">
                    <span className="mat text-[#006e2f] text-xl">analytics</span>
                  </div>
                  <h3 className="font-bold text-[#0b1c30] mb-2">Analyze Your Performance</h3>
                  <p className="text-sm text-slate-600">Get detailed insights on your strengths and areas for improvement.</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-[#ff8e4d]/20 rounded-xl flex items-center justify-center mb-3">
                    <span className="mat text-[#ff8e4d] text-xl">timer</span>
                  </div>
                  <h3 className="font-bold text-[#0b1c30] mb-2">Time Management</h3>
                  <p className="text-sm text-slate-600">Improve your speed and accuracy with timed practice sessions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
