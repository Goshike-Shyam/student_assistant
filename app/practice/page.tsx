/**
 * PRACTICE PAGE CONTRACT
 * Subjects: GET /api/practice/subjects ? child_subjects table
 * Metrics:  GET /api/practice/metrics  ? practice_attempts table
 * Generate: POST /api/practice/generate ? Gemini + practice_tests
 * Submit:   POST /api/practice/submit  ? DB lookup FIRST,
 *           then Gemini, then save to practice_attempts
 * NEVER hardcode subjects, metrics, or test data
 * REUSE QuestionCard.tsx � do not create new renderer
 * REUSE callGeminiWithRetry() � do not call Gemini directly
 * All buttons must be wired to real handlers
 * Option text: text-gray-900 always (WCAG AA)
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import QuestionCard from '@/components/assignments/QuestionCard';
import { Question } from '@/types/assignments';
import { useTheme } from '@/lib/theme';

// --- Types --------------------------------------------------------------------

interface PracticeQuestion extends Question {
  hint?: string;
}

interface PracticeTestData {
  practiceTestId: string;
  title: string;
  topic: string;
  questions: PracticeQuestion[];
  totalMarks: number;
  durationMins: number;
}

interface PerQuestionFeedback {
  question_id: number;
  is_correct: boolean;
  marks_awarded: number;
  marks_possible: number;
  brief_explanation: string;
  correct_answer: string;
}

interface PracticeFeedback {
  per_question_feedback: PerQuestionFeedback[];
  total_marks_awarded: number;
  total_marks_possible: number;
  percentage: number;
  grade_label: string;
  grade_emoji: string;
  strengths: string;
  improvement_areas: string;
  overall_feedback: string;
  encouragement: string;
  topics_to_revise: string[];
  parent_summary: string;
  next_steps: string[];
  encouragement_badge: string;
}

interface MetricsData {
  totalAttempts: number;
  averageScore: string;
  totalTests: number;
  streak: number;
  subjectBreakdown: Array<{
    subject: string;
    avg_score: number;
    attempts: number;
    best_score: number;
  }>;
  recentAttempts: Array<{
    score: number;
    completedAt: string;
    test: { subject: string; topic: string };
  }>;
}

interface HistoryItem {
  id: string;
  practiceTestId: string;
  score: number | null;
  marksAwarded: number | null;
  marksPossible: number | null;
  timeTakenSecs: number | null;
  completedAt: string | null;
  gradeLabel: string | null;
  gradeEmoji: string | null;
  feedbackJson: string | null;
  test: { subject: string; topic: string; complexity: string; totalMarks: number };
}

interface SearchResult {
  id: string;
  subject: string;
  topic: string;
  complexity: string;
  totalMarks: number;
  durationMins: number;
  createdAt: string;
  attemptCount: number;
  bestScore: number | null;
  lastScore: number | null;
}

type ViewState = 'generate' | 'taking' | 'feedback' | 'history';
type ComplexityLevel = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

// --- Helpers ------------------------------------------------------------------

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function complexityBadge(c: string) {
  switch (c) {
    case 'Easy':  return 'bg-emerald-100 text-emerald-900';
    case 'Hard':  return 'bg-rose-100 text-rose-900';
    case 'Mixed': return 'bg-purple-100 text-purple-900';
    default:      return 'bg-amber-100 text-amber-900';
  }
}

function scoreBannerClass(pct: number) {
  if (pct >= 90) return 'bg-green-50 border-green-400 text-green-900';
  if (pct >= 70) return 'bg-blue-50 border-blue-400 text-blue-900';
  if (pct >= 50) return 'bg-amber-50 border-amber-400 text-amber-900';
  return 'bg-red-50 border-red-300 text-red-900';
}

// --- Page Component -----------------------------------------------------------

export default function PracticePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Auth
  const [childData, setChildData] = useState<{
    childId: string;
    grade: number;
    board: string;
  } | null>(null);

  // Data
  const [subjects, setSubjects]           = useState<string[]>([]);
  const [metrics, setMetrics]             = useState<MetricsData | null>(null);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics]   = useState(true);

  // View
  const [view, setView]               = useState<ViewState>('generate');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  // Generate form
  const [topic, setTopic]           = useState('');
  const [complexity, setComplexity] = useState<ComplexityLevel>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Test
  const [practiceTest, setPracticeTest] = useState<PracticeTestData | null>(null);
  const [answers, setAnswers]           = useState<Record<number, string>>({});
  const [elapsed, setElapsed]           = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  // Feedback
  const [feedback, setFeedback]           = useState<PracticeFeedback | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<PracticeFeedback | null>(null);
  const [reviewTest, setReviewTest]         = useState<HistoryItem | null>(null);

  // History
  const [history, setHistory]             = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Search
  const [searchQuery, setSearchQuery]         = useState('');
  const [filterSubject, setFilterSubject]     = useState('all');
  const [filterComplexity, setFilterComplexity] = useState('all');
  const [searchResults, setSearchResults]     = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching]         = useState(false);
  const [showSearch, setShowSearch]           = useState(false);

  // -- Auth init --
  useEffect(() => {
    const childId = localStorage.getItem('userId');
    const grade   = localStorage.getItem('userGrade');
    const board   = localStorage.getItem('userBoard');
    if (!childId) { window.location.href = '/login'; return; }
    setChildData({ childId, grade: parseInt(grade ?? '10', 10), board: board ?? 'CBSE' });
  }, []);

  // -- Load subjects and metrics once child is known --
  useEffect(() => {
    if (!childData) return;

    const fetchSubjects = async () => {
      try {
        const res = await fetch(`/api/practice/subjects?childId=${childData.childId}`);
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects ?? []);
          if ((data.subjects ?? []).length > 0) setActiveSubject(data.subjects[0]);
        }
      } catch { /* silent */ } finally {
        setIsLoadingSubjects(false);
      }
    };

    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/practice/metrics?childId=${childData.childId}`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch { /* silent */ } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchSubjects();
    fetchMetrics();
  }, [childData]);

  // -- Timer --
  useEffect(() => {
    if (view !== 'taking') return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [view]);

  // -- Load history --
  const loadHistory = useCallback(async () => {
    if (!childData) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/practice/history?childId=${childData.childId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.attempts ?? []);
      }
    } catch { /* silent */ } finally {
      setIsLoadingHistory(false);
    }
  }, [childData]);

  // -- Generate --
  const handleGenerate = async () => {
    if (!childData || !topic.trim() || !activeSubject) {
      setGenerateError(!activeSubject ? 'Please select a subject first.' : 'Please enter a topic.');
      return;
    }
    setGenerateError(null);
    setIsGenerating(true);
    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: childData.childId, subject: activeSubject, topic: topic.trim(), complexity }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate test');
      }
      const data = await res.json();
      setPracticeTest({
        practiceTestId: data.practiceTestId,
        title:          data.title,
        topic:          data.topic,
        questions:      data.questions,
        totalMarks:     data.totalMarks,
        durationMins:   data.durationMins,
      });
      setAnswers({});
      setElapsed(0);
      setFeedback(null);
      setView('taking');
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  // -- Submit --
  const handleSubmit = async () => {
    if (!practiceTest || !childData) return;
    setSubmitError(null);
    setIsSubmitting(true);
    const answersArray = practiceTest.questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] ?? '',
    }));
    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practiceTestId: practiceTest.practiceTestId, answers: answersArray, timeTakenSecs: elapsed }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit test');
      }
      const fb = await res.json();
      setFeedback(fb);
      setView('feedback');
      // Refresh metrics in background
      if (childData) {
        fetch(`/api/practice/metrics?childId=${childData.childId}`)
          .then((r) => r.json()).then((d) => setMetrics(d)).catch(() => { /* silent */ });
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -- Search --
  const handleSearch = async () => {
    if (!childData) return;
    setIsSearching(true);
    try {
      const params = new URLSearchParams({ childId: childData.childId });
      if (searchQuery.trim()) params.set('query', searchQuery.trim());
      if (filterSubject !== 'all') params.set('subject', filterSubject);
      if (filterComplexity !== 'all') params.set('complexity', filterComplexity);
      const res = await fetch(`/api/practice/search?${params.toString()}`);
      if (res.ok) { const data = await res.json(); setSearchResults(data.results ?? []); }
    } catch { /* silent */ } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery(''); setFilterSubject('all'); setFilterComplexity('all'); setSearchResults(null);
  };

  // -- Reset --
  const handleTryAnother = () => {
    setPracticeTest(null); setAnswers({}); setElapsed(0);
    setFeedback(null); setSubmitError(null); setView('generate');
  };

  const handleViewHistory = () => { setView('history'); loadHistory(); };

  // -- Review --
  const handleReview = (item: HistoryItem) => {
    if (!item.feedbackJson) return;
    try { setReviewFeedback(JSON.parse(item.feedbackJson)); setReviewTest(item); } catch { /* silent */ }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const allAnswered =
    practiceTest !== null &&
    practiceTest.questions.every((q) => answers[q.id]?.trim());

  if (!childData) return null;

  // ----------------------------------------------------------------
  // REVIEW OVERLAY
  // ----------------------------------------------------------------
  if (reviewFeedback && reviewTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <button
            onClick={() => { setReviewFeedback(null); setReviewTest(null); }}
            className="mb-6 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded min-h-[44px] px-2"
            aria-label="Back to history"
          >
            ? Back to History
          </button>
          <FeedbackView
            feedback={reviewFeedback}
            testQuestions={[]}
            answers={{}}
            onTryAnother={() => { setReviewFeedback(null); setReviewTest(null); handleTryAnother(); }}
            onViewHistory={() => { setReviewFeedback(null); setReviewTest(null); }}
            isReview
          />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // TEST-TAKING VIEW
  // ----------------------------------------------------------------
  if (view === 'taking' && practiceTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                {activeSubject} � {complexity}
              </p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{practiceTest.title}</h1>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                {practiceTest.questions.length} questions � {practiceTest.totalMarks} marks
              </p>
            </div>
            <div className="text-right">
              <div
                role="timer"
                aria-live="polite"
                aria-label={`Time elapsed: ${formatTime(elapsed)}`}
                className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100"
              >
                {formatTime(elapsed)}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">elapsed</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                {Object.values(answers).filter((a) => a?.trim()).length} / {practiceTest.questions.length} answered
              </p>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {practiceTest.questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                questionNumber={idx + 1}
                answer={answers[q.id] ?? ''}
                onAnswerChange={(ans) => handleAnswerChange(q.id, ans)}
                isReadOnly={false}
              />
            ))}
          </div>

          {/* Submit */}
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3" role="alert" aria-live="assertive">
              <span aria-hidden="true">?</span>
              <p className="text-sm text-red-700 font-medium">{submitError}</p>
            </div>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className="min-h-[44px] px-8 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label={
                !allAnswered
                  ? `Submit � ${practiceTest.questions.length - Object.values(answers).filter((a) => a?.trim()).length} questions unanswered`
                  : 'Submit test'
              }
            >
              {isSubmitting ? 'Submitting�' : 'Submit Test'}
            </Button>
            {!allAnswered && (
              <p className="text-sm text-amber-900 font-medium" role="status" aria-live="polite">
                ?? Answer all questions before submitting
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // FEEDBACK VIEW
  // ----------------------------------------------------------------
  if (view === 'feedback' && feedback && practiceTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <FeedbackView
            feedback={feedback}
            testQuestions={practiceTest.questions}
            answers={answers}
            onTryAnother={handleTryAnother}
            onViewHistory={handleViewHistory}
          />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // HISTORY VIEW
  // ----------------------------------------------------------------
  if (view === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Practice History</h1>
            <Button
              variant="outline"
              onClick={handleTryAnother}
              className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label="Start a new practice test"
            >
              + New Practice Test
            </Button>
          </div>

          {isLoadingHistory ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading history�">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-200 animate-pulse rounded-lg" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-4">No practice attempts yet.</p>
              <Button onClick={handleTryAnother} className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                Start Your First Test
              </Button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-sm">
              <table className="w-full text-sm" aria-label="Practice attempt history">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    {['Subject', 'Topic', 'Complexity', 'Score', 'Grade', 'Time', 'Date', 'Action'].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">{item.test.subject}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{item.test.topic}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${complexityBadge(item.test.complexity)}`}>
                          {item.test.complexity}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {item.score !== null ? `${Number(item.score).toFixed(1)}%` : '�'}
                      </td>
                      <td className="px-4 py-3">
                        {item.gradeEmoji && item.gradeLabel
                          ? <span className="font-semibold text-slate-900 dark:text-slate-100">{item.gradeEmoji} {item.gradeLabel}</span>
                          : '�'}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {item.timeTakenSecs ? formatTime(item.timeTakenSecs) : '�'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '�'}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          onClick={() => handleReview(item)}
                          disabled={!item.feedbackJson}
                          className="text-xs min-h-[36px] py-1 px-3 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          aria-label={`Review ${item.test.topic} attempt`}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // GENERATE / DASHBOARD VIEW (default)
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">Practice Tests</h1>
            <p className="text-slate-600 dark:text-slate-300">Generate AI-powered practice tests tailored to your curriculum.</p>
          </div>
          <Button
            variant="outline"
            onClick={handleViewHistory}
            className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="View practice history"
          >
            View History
          </Button>
        </div>

        {/* Metrics */}
        <section aria-label="Practice performance metrics">
          {isLoadingMetrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" aria-busy="true" aria-label="Loading metrics�">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-slate-200 animate-pulse rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {([
                {
                  label: 'Tests Taken',
                  value: metrics?.totalTests ?? 0,
                  iconSrc: '/icons/practice-metrics/tests-taken.png',
                },
                {
                  label: 'Avg Score',
                  value: `${metrics?.averageScore ?? '0.0'}%`,
                  iconSrc: '/icons/practice-metrics/avg-score.png',
                },
                {
                  label: 'Total Attempts',
                  value: metrics?.totalAttempts ?? 0,
                  iconSrc: '/icons/practice-metrics/total-attempts.png',
                },
                {
                  label: 'Current Streak',
                  value: `${metrics?.streak ?? 0} days`,
                  iconSrc: '/icons/practice-metrics/current-streak.png',
                },
              ] as const).map(({ label, value, iconSrc }) => (
                <div key={label} className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Image
                      src={iconSrc}
                      alt=""
                      width={20}
                      height={20}
                      aria-hidden="true"
                      className="h-5 w-5 object-contain"
                    />
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{label}</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Score Trend</h2>
              {metrics && metrics.recentAttempts.length > 0 ? (
                <div role="img" aria-label="Score trend chart � your recent practice test scores over time">
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={metrics.recentAttempts}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                      <XAxis
                        dataKey="completedAt"
                        tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        tick={{ fill: isDark ? '#cbd5e1' : '#374151', fontSize: 11 }}
                      />
                      <YAxis domain={[0, 100]} tick={{ fill: isDark ? '#cbd5e1' : '#374151', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          color: isDark ? '#e2e8f0' : '#111827',
                          backgroundColor: isDark ? '#0f172a' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#e5e7eb',
                          fontSize: 12,
                        }}
                        formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Score']}
                        labelFormatter={(l) => new Date(l).toLocaleDateString()}
                      />
                      <Line type="monotone" dataKey="score" stroke={isDark ? '#22d3ee' : '#2563EB'} strokeWidth={2} dot={{ r: 4, fill: isDark ? '#22d3ee' : '#2563EB' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-slate-400 text-sm py-10 text-center">
                  Complete your first test to see your progress chart.
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Performance by Subject</h2>
              {metrics && metrics.subjectBreakdown.length > 0 ? (
                <div role="img" aria-label="Performance by subject bar chart � average scores per subject">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={metrics.subjectBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                      <XAxis dataKey="subject" tick={{ fill: isDark ? '#cbd5e1' : '#374151', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: isDark ? '#cbd5e1' : '#374151', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          color: isDark ? '#e2e8f0' : '#111827',
                          backgroundColor: isDark ? '#0f172a' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#e5e7eb',
                          fontSize: 12,
                        }}
                        formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Avg Score']}
                      />
                      <Bar dataKey="avg_score" fill={isDark ? '#22d3ee' : '#2563EB'} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-slate-400 text-sm py-10 text-center">
                  Complete tests in multiple subjects to see a comparison.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Subject sidebar + Generate + Search */}
        <div className="flex gap-6">
          {/* Subject sidebar */}
          <aside aria-label="Subject selection" className="w-52 shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden sticky top-20">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Your Subjects</h2>
              </div>
              {isLoadingSubjects ? (
                <div className="p-4 space-y-2" aria-busy="true" aria-label="Loading subjects�">
                  {[1, 2, 3].map((i) => <div key={i} className="h-9 bg-slate-100 animate-pulse rounded" />)}
                </div>
              ) : subjects.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-slate-400 p-4">
                  No subjects found.{' '}
                  <Link href="/profile" className="underline text-blue-700 hover:text-blue-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded">
                    Update your profile
                  </Link>{' '}
                  to add subjects.
                </p>
              ) : (
                <nav className="py-2" aria-label="Practice subjects">
                  {subjects.map((s) => (
                    <button
                      key={s}
                      onClick={() => setActiveSubject(s)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
                        activeSubject === s
                          ? 'bg-blue-50 text-blue-900 font-medium border-l-4 border-blue-600'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-l-4 border-transparent'
                      }`}
                      aria-current={activeSubject === s ? 'true' : undefined}
                      aria-label={`Select ${s} as practice subject`}
                    >
                      {s}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          </aside>

          {/* Generate + Search panel */}
          <div className="flex-1 space-y-6">
            {/* Generate form */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Generate New Practice Test
                {activeSubject && (
                  <span className="ml-2 text-blue-700 font-medium text-base">� {activeSubject}</span>
                )}
              </h2>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="topic-input" className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">
                    Topic
                  </Label>
                  <Input
                    id="topic-input"
                    placeholder={activeSubject ? 'e.g. Photosynthesis, Fractions�' : 'Select a subject first'}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                    disabled={isGenerating || !activeSubject}
                    aria-label="Practice test topic"
                    className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  />
                </div>
                <div>
                  <Label htmlFor="complexity-select" className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">
                    Complexity
                  </Label>
                  <Select
                    id="complexity-select"
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value as ComplexityLevel)}
                    disabled={isGenerating}
                    aria-label="Select complexity level"
                    className="focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <option value="Easy">Easy (5 questions)</option>
                    <option value="Medium">Medium (8 questions)</option>
                    <option value="Hard">Hard (10 questions)</option>
                    <option value="Mixed">Mixed (10 questions)</option>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim() || !activeSubject}
                className="min-h-[44px] px-6 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label={isGenerating ? 'Generating test�' : 'Generate practice test'}
              >
                {isGenerating ? 'Generating�' : 'Generate Test'}
              </Button>

              {generateError && (() => {
                const isBusy = generateError.toLowerCase().includes('busy') ||
                  generateError.toLowerCase().includes('unavailable') || generateError.includes('503');
                return (
                  <div
                    className={`flex items-start gap-3 rounded-lg border p-4 ${isBusy ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}
                    role="alert"
                    aria-live="assertive"
                  >
                    <span aria-hidden="true">{isBusy ? '??' : '?'}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium mb-1 ${isBusy ? 'text-amber-900' : 'text-red-700'}`}>
                        {isBusy ? 'AI is temporarily busy. Click "Try Again" � it usually resolves in seconds.' : generateError}
                      </p>
                      {isBusy && (
                        <button
                          onClick={() => { setGenerateError(null); handleGenerate(); }}
                          disabled={isGenerating}
                          className="text-sm font-medium text-amber-800 underline hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
                          aria-label="Try generating test again"
                        >
                          {isGenerating ? 'Retrying�' : 'Try Again ?'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
              <button
                onClick={() => setShowSearch((s) => !s)}
                className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-base hover:text-blue-700 dark:hover:text-cyan-300 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
                aria-expanded={showSearch}
                aria-controls="search-panel"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search Past Tests
                <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">({showSearch ? 'hide' : 'show'})</span>
              </button>

              {showSearch && (
                <div id="search-panel">
                  <div className="flex flex-wrap gap-3 items-end mb-4" role="search" aria-label="Search practice tests">
                    <div className="flex-1 min-w-[180px]">
                      <Label htmlFor="search-input" className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">
                        Topic Name
                      </Label>
                      <Input
                        id="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search by topic�"
                        aria-label="Search by topic name"
                        className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="search-subject-filter" className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">
                        Subject
                      </Label>
                      <Select
                        id="search-subject-filter"
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        aria-label="Filter by subject"
                        className="w-40 focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <option value="all">All Subjects</option>
                        {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="search-complexity-filter" className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">
                        Complexity
                      </Label>
                      <Select
                        id="search-complexity-filter"
                        value={filterComplexity}
                        onChange={(e) => setFilterComplexity(e.target.value)}
                        aria-label="Filter by complexity"
                        className="w-36 focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <option value="all">All Levels</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        <option value="Mixed">Mixed</option>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="flex items-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        aria-label="Search practice tests"
                      >
                        <Search className="h-4 w-4" aria-hidden="true" />
                        <span>{isSearching ? 'Searching�' : 'Search'}</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleClearSearch}
                        className="min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        aria-label="Clear search filters"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  {searchResults !== null && (
                    searchResults.length === 0 ? (
                      <p className="text-gray-600 dark:text-slate-400 text-sm">No matching tests found. Try different filters.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {searchResults.map((r) => (
                          <div key={r.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">{r.subject}</p>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{r.topic}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${complexityBadge(r.complexity)}`}>
                                {r.complexity}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{r.totalMarks} marks � {r.durationMins} min</p>
                            {r.attemptCount > 0 && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {r.attemptCount} attempt{r.attemptCount !== 1 ? 's' : ''} � Best: {r.bestScore !== null ? `${r.bestScore.toFixed(1)}%` : '�'}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- FeedbackView sub-component -----------------------------------------------

interface FeedbackViewProps {
  feedback: PracticeFeedback;
  testQuestions: PracticeQuestion[];
  answers: Record<number, string>;
  onTryAnother: () => void;
  onViewHistory: () => void;
  isReview?: boolean;
}

function FeedbackView({ feedback, testQuestions, answers, onTryAnother, onViewHistory, isReview }: FeedbackViewProps) {
  const pct = feedback.percentage;

  return (
    <div className="space-y-6">
      {/* Score banner */}
      <div className={`rounded-xl p-6 border-2 text-center ${scoreBannerClass(pct)}`}>
        <div className="text-5xl mb-2">{feedback.grade_emoji ?? '??'}</div>
        <div className="text-3xl font-bold mb-1">{feedback.grade_label}</div>
        <div className="text-xl font-medium mb-3">
          {feedback.total_marks_awarded} / {feedback.total_marks_possible} marks
          &nbsp;({pct.toFixed(1)}%)
        </div>
        {feedback.encouragement_badge && (
          <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 rounded-full px-4 py-1 border dark:border-slate-600 text-sm font-semibold mb-4 text-gray-700 dark:text-slate-200">
            ?? {feedback.encouragement_badge}
          </div>
        )}
        <p className="text-base leading-relaxed max-w-2xl mx-auto">{feedback.overall_feedback}</p>
      </div>

      {/* Strengths + Topics to revise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg p-4 bg-green-50 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">?? Your Strengths</h3>
          <p className="text-sm text-green-800 leading-relaxed">{feedback.strengths}</p>
        </div>
        <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">?? Topics to Revise</h3>
          {feedback.topics_to_revise && feedback.topics_to_revise.length > 0 ? (
            <ul className="text-sm text-blue-800 space-y-1">
              {feedback.topics_to_revise.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">�</span>{t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-blue-800">{feedback.improvement_areas}</p>
          )}
        </div>
      </div>

      {/* Encouragement */}
      {feedback.encouragement && (
        <div className="rounded-lg p-4 bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-900 font-medium">? {feedback.encouragement}</p>
        </div>
      )}

      {/* Per-question review */}
      {testQuestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Question-by-Question Review</h2>
          {testQuestions.map((q, idx) => {
            const qf = feedback.per_question_feedback?.find(
              (f) => String(f.question_id) === String(q.id),
            );
            return (
              <div key={q.id}>
                <QuestionCard
                  question={q}
                  questionNumber={idx + 1}
                  answer={answers[q.id] ?? ''}
                  onAnswerChange={() => { /* read-only */ }}
                  feedback={qf ? { is_correct: qf.is_correct, marks_awarded: qf.marks_awarded, brief_explanation: qf.brief_explanation } : undefined}
                  isReadOnly
                />
                {/* Reveal correct answer for wrong answers */}
                {qf && !qf.is_correct && qf.correct_answer && (
                  <div className="mt-1 ml-0 px-4 py-2 rounded-b-lg border-x border-b border-red-200 bg-red-50 text-sm text-red-900">
                    <span className="font-semibold">? Correct answer: </span>
                    {qf.correct_answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action buttons */}
      {!isReview && (
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={onTryAnother}
            className="min-h-[44px] px-6 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Try another practice test"
          >
            Try Another Test
          </Button>
          <Button
            variant="outline"
            onClick={onViewHistory}
            className="min-h-[44px] px-6 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="View practice history"
          >
            View History
          </Button>
        </div>
      )}
    </div>
  );
}

