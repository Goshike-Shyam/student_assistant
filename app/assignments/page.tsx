'use client';

/**
 * CLASS ASSIGNMENTS TAB CONTRACT
 * teacherAssignments state: fetched ONCE when userId is available
 *   useEffect deps = [userId] — never re-fetches when tab or selection changes
 *   NEVER reset when opening/closing an assignment
 * openSubmissionId: tracks which assignment is open inline
 *   setting to null returns to list WITHOUT re-fetch
 * submissionId is the ONLY key used to find/open assignments — never use assignmentId or index
 * All IDs in state are strings (BigInt.toString())
 * handleBackToList() sets openSubmissionId=null only — does NOT clear teacherAssignments
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Send, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ── Types for teacher-assigned work ──────────────────────────────────────────
interface TeacherAssignmentItem {
  submissionId: string;
  assignmentId: string;
  subject: string;
  topic: string;
  teacherName: string;
  className: string;
  dueDate: string;
  status: string;
  score: number | null;
  totalMarks: number;
  questions: any[] | null;
  feedback: any | null;
}

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  REVIEWED: 'Reviewed',
  RELEASED: 'Released',
  OVERDUE: 'Overdue',
};
const STATUS_CLS: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  SUBMITTED: 'bg-amber-100 text-amber-800',
  REVIEWED: 'bg-purple-100 text-purple-800',
  RELEASED: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
};

type Tab = 'my' | 'class';

export default function AssignmentsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Teacher-assigned state
  const [tab, setTab] = useState<Tab>('my');
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentItem[]>([]);
  const [taLoading, setTaLoading] = useState(false);
  const [taError, setTaError] = useState('');
  const [userId, setUserId] = useState('');

  // In-page assignment view state — opening an assignment NEVER clears teacherAssignments
  const [openSubmissionId, setOpenSubmissionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitDone, setSubmitDone] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      window.location.href = '/login';
      return;
    }
    setUserId(uid);

    // Fetch user's registered subjects from Express backend API
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/${uid}/subjects`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedSubjects = data.subjects || [];
          if (fetchedSubjects.length === 0) {
            setError('No subjects registered');
          }
          setSubjects(fetchedSubjects);
        } else {
          setError('Failed to load subjects. Please refresh the page.');
          setSubjects([]);
        }
      } catch (error) {
        setError('Unable to load your subjects. Please refresh the page.');
        setSubjects([]);
      }
    };

    fetchSubjects();
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  // Fetch class assignments ONCE when userId is available — deps=[userId], NOT [tab,userId]
  // Empty/reset of teacherAssignments never happens after initial load
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setTaLoading(true);
    setTaError('');

    const loadClassAssignments = async () => {
      // Cold dev compilations can intermittently return 404 once; retry once before surfacing an error.
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await fetch(`/api/student/teacher-assignments?userId=${userId}`);
          if (r.status === 404 && attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 400));
            continue;
          }
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const data = await r.json();
          if (cancelled) return;
          if (data.error) throw new Error(data.error);
          setTeacherAssignments(Array.isArray(data) ? data : []);
          return;
        } catch (e: any) {
          if (attempt === 1) {
            if (cancelled) return;
            console.error('[ClassTab] fetch error:', e);
            // Keep UI usable by showing empty list on repeated 404s and transient failures.
            setTeacherAssignments([]);
            setTaError(e?.message ?? 'Failed to load class assignments');
          }
        }
      }
    };

    loadClassAssignments().finally(() => {
      if (!cancelled) setTaLoading(false);
    });

    return () => { cancelled = true; };
  }, [userId]);

  // openedAssignment is looked up from local state — no extra API call needed
  const openedAssignment = openSubmissionId
    ? (teacherAssignments.find((a) => a.submissionId === openSubmissionId) ?? null)
    : null;

  function handleOpenAssignment(submissionId: string) {
    if (!submissionId || submissionId === 'undefined' || submissionId === 'null') {
      console.error('[ClassTab] invalid submissionId:', submissionId);
      return;
    }
    setAnswers({});
    setSubmitError('');
    setSubmitDone(false);
    setOpenSubmissionId(submissionId);
  }

  function handleBackToList() {
    // teacherAssignments is UNCHANGED — list reappears immediately, no re-fetch
    setOpenSubmissionId(null);
    setAnswers({});
    setSubmitError('');
    setSubmitDone(false);
  }

  async function handleClassSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!openedAssignment || !userId) return;
    setSubmitting(true);
    setSubmitError('');

    const answersArray = (openedAssignment.questions ?? []).map((q: any) => ({
      questionId: q.id,
      answer: answers[q.id] ?? '',
    }));

    try {
      const res = await fetch(
        `/api/student/teacher-assignments/${openedAssignment.submissionId}/submit?userId=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: answersArray }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setSubmitDone(true);
        // Update status in local state so card reflects SUBMITTED when user goes back to list
        setTeacherAssignments((prev) =>
          prev.map((a) =>
            a.submissionId === openedAssignment.submissionId
              ? { ...a, status: 'SUBMITTED', questions: null }
              : a,
          ),
        );
      } else {
        setSubmitError(data.error ?? 'Submission failed');
      }
    } catch {
      setSubmitError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <main className="px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Assignments</h1>
            </div>

            {/* Tabs */}
            <div role="tablist" aria-label="Assignment types" className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
              <button
                role="tab"
                aria-selected={tab === 'my'}
                onClick={() => setTab('my')}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none
                    ${tab === 'my' ? 'border-blue-600 text-blue-700 dark:text-cyan-300' : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                My Assignments
              </button>
              <button
                role="tab"
                aria-selected={tab === 'class'}
                onClick={() => setTab('class')}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none
                    ${tab === 'class' ? 'border-blue-600 text-blue-700 dark:text-cyan-300' : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                Class Assignments
                {teacherAssignments.filter((a) => a.status === 'NOT_STARTED').length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs" aria-label={`${teacherAssignments.filter((a) => a.status === 'NOT_STARTED').length} not started`}>
                    {teacherAssignments.filter((a) => a.status === 'NOT_STARTED').length}
                  </span>
                )}
              </button>
            </div>

            {/* MY ASSIGNMENTS TAB */}
            {tab === 'my' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300">Select a subject to generate practice assignments</p>

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

                {subjects.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
                      <Link
                        key={subject}
                        href={`/assignments/${encodeURIComponent(subject)}`}
                        className="group"
                      >
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-cyan-500 transition-all cursor-pointer">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                              {subject}
                            </h3>
                            <span className="text-blue-600 opacity-0 group-hover:opacity-100" aria-hidden="true">→</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Generate practice assignments on any topic
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-blue-900 dark:text-cyan-200">How it works</h3>
                  <ul className="text-sm text-blue-800 dark:text-slate-300 space-y-2">
                    <li>✓ Select a subject above</li>
                    <li>✓ Enter a topic you want to practice</li>
                    <li>✓ Choose difficulty level</li>
                    <li>✓ Generate and solve the assignment</li>
                    <li>✓ Get instant AI-powered feedback</li>
                  </ul>
                </div>
              </div>
            )}

            {/* CLASS ASSIGNMENTS TAB */}
            {tab === 'class' && (
              <div className="space-y-4">
                {taLoading && (
                  <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Loading class assignments">
                    {[0, 1, 2].map((i) => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
                  </div>
                )}

                {taError && (
                  <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {taError}
                  </div>
                )}

                {!taLoading && !taError && teacherAssignments.length === 0 && !openSubmissionId && (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-300 font-medium">No class assignments yet</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Assignments from your teachers will appear here.</p>
                  </div>
                )}

                {/* ── INLINE ASSIGNMENT VIEW ────────────────────────────── */}
                {openSubmissionId && openedAssignment && !submitDone && (
                  <div>
                    <button
                      onClick={handleBackToList}
                      className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 mb-6 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
                      aria-label="Back to class assignments list"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      Back to Class Assignments
                    </button>

                    <div className="max-w-3xl">
                      {/* Assignment header */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{openedAssignment.topic}</h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          {openedAssignment.subject} · {openedAssignment.className} · Teacher: {openedAssignment.teacherName}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                          Due: {new Date(openedAssignment.dueDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                          {' · '}{openedAssignment.totalMarks} marks
                        </p>
                      </div>

                      {submitError && (
                        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                          {submitError}
                        </div>
                      )}

                      {/* Teacher feedback — only when RELEASED */}
                      {openedAssignment.status === 'RELEASED' && openedAssignment.feedback && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl">
                          <p className="text-sm font-semibold text-green-800 mb-1">Teacher Feedback</p>
                          <p className="text-sm text-green-900">{(openedAssignment.feedback as any)?.overall_feedback}</p>
                          <p className="text-sm font-medium text-green-800 mt-2">
                            Score: {openedAssignment.score}/{openedAssignment.totalMarks}
                          </p>
                        </div>
                      )}

                      {/* Under review */}
                      {(openedAssignment.status === 'SUBMITTED' || openedAssignment.status === 'REVIEWED') && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                          <p className="text-sm text-amber-800 italic">
                            Your submission is under review by your teacher. You'll see feedback once it's released.
                          </p>
                        </div>
                      )}

                      {/* Questions form */}
                      {(openedAssignment.status === 'NOT_STARTED' || openedAssignment.status === 'IN_PROGRESS') && openedAssignment.questions && (
                        <form onSubmit={handleClassSubmit} className="space-y-5">
                          {openedAssignment.questions.map((q: any, i: number) => (
                            <div key={q.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                              <div className="flex justify-between items-start gap-2 mb-3">
                                <p className="font-medium text-slate-900 dark:text-slate-100">Q{i + 1}. {q.question}</p>
                                <span className="text-xs text-slate-500 shrink-0">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                              </div>

                              {q.type === 'MCQ' || q.type === 'TRUE_FALSE' ? (
                                <fieldset>
                                  <legend className="sr-only">Select your answer for Question {i + 1}</legend>
                                  <div className="space-y-2">
                                    {(q.type === 'TRUE_FALSE' ? ['True', 'False'] : (q.options ?? [])).map((opt: string, oi: number) => (
                                      <label
                                        key={oi}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-cyan-950/30 transition-colors"
                                      >
                                        <input
                                          type="radio"
                                          name={`q-${q.id}`}
                                          value={opt}
                                          checked={answers[q.id] === opt}
                                          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                                          className="accent-blue-600"
                                          aria-label={opt}
                                        />
                                        <span className="text-sm text-slate-800 dark:text-slate-200">{opt}</span>
                                      </label>
                                    ))}
                                  </div>
                                </fieldset>
                              ) : q.type === 'FILL_BLANK' ? (
                                <div>
                                  <label htmlFor={`fill-${q.id}`} className="sr-only">Your answer for Question {i + 1}</label>
                                  <input
                                    id={`fill-${q.id}`}
                                    type="text"
                                    value={answers[q.id] ?? ''}
                                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                                    placeholder="Fill in the blank…"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <label htmlFor={`ans-${q.id}`} className="sr-only">Your answer for Question {i + 1}</label>
                                  <textarea
                                    id={`ans-${q.id}`}
                                    value={answers[q.id] ?? ''}
                                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                                    rows={q.type === 'LONG_ANSWER' ? 5 : 3}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none resize-none"
                                    placeholder="Write your answer…"
                                  />
                                </div>
                              )}
                            </div>
                          ))}

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 min-h-[48px] bg-blue-600 text-white font-semibold rounded-xl py-3 hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-60"
                          >
                            <Send className="w-4 h-4" aria-hidden="true" />
                            {submitting ? 'Submitting…' : 'Submit Assignment'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* ── SUBMISSION SUCCESS ────────────────────────────────── */}
                {openSubmissionId && submitDone && (
                  <div className="flex items-center justify-center py-16">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 text-center border border-green-100 dark:border-slate-700">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" aria-hidden="true" />
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Submitted!</h2>
                      <p className="text-gray-600 dark:text-slate-300 mb-6">Your teacher will review and share feedback soon.</p>
                      <button
                        onClick={handleBackToList}
                        className="min-h-[44px] px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                      >
                        Back to Class Assignments
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ASSIGNMENT LIST — visible only when no assignment is open ── */}
                {!openSubmissionId && !taLoading && !taError && teacherAssignments.map((item) => (
                  <div
                    key={item.submissionId}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h2 className="font-bold text-slate-900 dark:text-slate-100">{item.topic}</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                          {item.subject} · {item.className} · Teacher: {item.teacherName}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_CLS[item.status] ?? 'bg-gray-100 text-gray-700'}`}
                        aria-label={`Status: ${STATUS_LABEL[item.status] ?? item.status}`}
                      >
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Due: {new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {item.score !== null && item.totalMarks
                        ? ` · Score: ${item.score}/${item.totalMarks}`
                        : ''}
                    </p>

                    {/* Status-specific actions */}
                    {(item.status === 'NOT_STARTED' || item.status === 'IN_PROGRESS') && item.questions && (
                      <button
                        onClick={() => handleOpenAssignment(item.submissionId)}
                        className="inline-flex items-center min-h-[40px] px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                      >
                        {item.status === 'NOT_STARTED' ? 'Start Assignment' : 'Continue'}
                      </button>
                    )}

                    {(item.status === 'SUBMITTED' || item.status === 'REVIEWED') && (
                      <p className="text-sm text-slate-600 italic">
                        Your submission is under review by your teacher.
                      </p>
                    )}

                    {item.status === 'RELEASED' && item.feedback && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                        <p className="text-sm font-semibold text-green-800 mb-1">Teacher Feedback</p>
                        <p className="text-sm text-green-900">
                          {(item.feedback as any)?.overall_feedback ?? 'See detailed feedback below.'}
                        </p>
                        <button
                          onClick={() => handleOpenAssignment(item.submissionId)}
                          className="mt-2 text-xs text-green-700 underline hover:text-green-900 focus-visible:outline-none"
                        >
                          View full feedback
                        </button>
                      </div>
                    )}

                    {item.status === 'OVERDUE' && (
                      <p className="text-sm text-red-600 italic">This assignment is past due.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
    </div>
  );
}
