'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface AssignmentHistory {
  id: string;
  assignmentId: string;
  subject: string;
  subjectId: string;
  topic: string;
  status: string;
  createdAt: string;
  dueDate: string | null;
  submittedAt: string | null;
  score: number | null;
  isOverdue: boolean;
  isSubmitted: boolean;
  canSubmit: boolean;
  questions: Array<{
    id?: number | string;
    question?: string;
    options?: string[];
  }>;
  submission: unknown;
  feedback: unknown;
  totalMarks: number;
}

type AnswersByAssignment = Record<string, Record<string, string>>;

export default function AssignmentHistoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [assignments, setAssignments] = useState<AssignmentHistory[]>([]);
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswersByAssignment>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const subjects = useMemo(
    () => Array.from(new Set(assignments.map((a) => a.subject))).sort((a, b) => a.localeCompare(b)),
    [assignments],
  );

  const loadAssignments = useCallback(async (uid: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assignments/history?userId=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (res.ok) {
        setAssignments(Array.isArray(data.assignments) ? data.assignments : []);
      } else {
        setAssignments([]);
      }
    } catch {
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      window.location.href = '/login';
      return;
    }
    setUserId(uid);
    loadAssignments(uid);
  }, [loadAssignments]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/assignments');
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filterSubject && a.subject !== filterSubject) return false;
    if (filterStatus === 'pending' && a.isSubmitted) return false;
    if (filterStatus === 'submitted' && !a.isSubmitted) return false;
    return true;
  });

  const getSubmissionAnswer = (assignment: AssignmentHistory, questionId: string, index: number): string | null => {
    if (!assignment.submission) return null;

    if (Array.isArray(assignment.submission)) {
      const byId = assignment.submission.find((entry: any) => String(entry?.questionId) === String(questionId));
      if (byId?.answer) return String(byId.answer);
      const byIndex = assignment.submission[index] as any;
      return byIndex?.answer ? String(byIndex.answer) : null;
    }

    if (typeof assignment.submission === 'object' && assignment.submission !== null) {
      const obj = assignment.submission as Record<string, unknown>;
      const value = obj[questionId] ?? obj[String(index)];
      return value != null ? String(value) : null;
    }

    return null;
  };

  const handleSubmitAssignment = async (submissionId: string, questions: AssignmentHistory['questions']) => {
    if (!userId) return;

    const draftAnswers = answers[submissionId] ?? {};
    const answersArray = questions.map((q, idx) => ({
      questionId: q.id ?? idx,
      answer: draftAnswers[String(q.id ?? idx)] ?? '',
    }));

    setSubmitting(submissionId);
    try {
      const res = await fetch(`/api/student/teacher-assignments/${submissionId}/submit?userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray, lateSubmit: true }),
      });
      const data = await res.json();

      setSubmitResult((prev) => ({
        ...prev,
        [submissionId]: {
          ok: res.ok,
          msg: res.ok ? 'Assignment submitted successfully!' : data.error ?? 'Submission failed',
        },
      }));

      if (res.ok) {
        await loadAssignments(userId);
      }
    } catch {
      setSubmitResult((prev) => ({
        ...prev,
        [submissionId]: { ok: false, msg: 'Network error. Please try again.' },
      }));
    } finally {
      setSubmitting(null);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pt-4 px-6 pb-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Assignment History</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your assignments</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'submitted')}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>
          </div>

          {filteredAssignments.length > 0 ? (
            <div className="space-y-3">
              {filteredAssignments.map((asgn) => {
                const isExpanded = expandedId === asgn.id;
                const feedbackText =
                  typeof asgn.feedback === 'string'
                    ? asgn.feedback
                    : asgn.feedback && typeof asgn.feedback === 'object'
                      ? String((asgn.feedback as Record<string, unknown>).overall_feedback ?? (asgn.feedback as Record<string, unknown>).comment ?? '')
                      : '';

                return (
                  <div key={asgn.id} className="bg-white dark:bg-slate-800 border rounded-xl overflow-hidden border-gray-200 dark:border-slate-700">
                    <div
                      className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setExpandedId((prev) => (prev === asgn.id ? null : asgn.id))}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedId((prev) => (prev === asgn.id ? null : asgn.id));
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            asgn.isSubmitted ? 'bg-green-500' : asgn.isOverdue ? 'bg-red-400' : 'bg-amber-500'
                          }`}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{asgn.topic}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {asgn.subject} · {new Date(asgn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            asgn.isSubmitted
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : asgn.isOverdue
                                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {asgn.isSubmitted ? '✓ Submitted' : asgn.isOverdue ? '⚠ Overdue' : '⏳ Pending'}
                        </span>
                        <span className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true">
                          ▼
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-5 py-5">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{asgn.topic}</h2>
                          {asgn.dueDate && (
                            <span className={`text-xs ${asgn.isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                              Due: {new Date(asgn.dueDate).toLocaleDateString('en-IN')}
                              {asgn.isOverdue && !asgn.isSubmitted ? ' (overdue)' : ''}
                            </span>
                          )}
                        </div>

                        {asgn.isOverdue && !asgn.isSubmitted && (
                          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
                            This assignment is past its due date. You can still submit it.
                          </div>
                        )}

                        {!!feedbackText && (
                          <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">Teacher Feedback</p>
                            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{feedbackText}</p>
                            {asgn.score != null && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-semibold">
                                Score: {asgn.score}/{asgn.totalMarks}
                              </p>
                            )}
                          </div>
                        )}

                        {submitResult[asgn.id] && (
                          <div
                            className={`mb-4 p-3 rounded-xl text-sm ${
                              submitResult[asgn.id].ok
                                ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-950 dark:text-green-300'
                                : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-950 dark:text-red-300'
                            }`}
                            role="alert"
                          >
                            {submitResult[asgn.id].msg}
                          </div>
                        )}

                        {asgn.questions.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">Assignment content not available</p>
                        ) : (
                          <div className="space-y-4">
                            {asgn.questions.map((q, idx) => {
                              const qKey = String(q.id ?? idx);
                              const existingAnswer = getSubmissionAnswer(asgn, qKey, idx);
                              const currentAnswer = answers[asgn.id]?.[qKey] ?? '';

                              return (
                                <div key={qKey} className="rounded-xl p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                  <div className="flex gap-3 items-start mb-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed mb-2">
                                        {q.question ?? 'Question unavailable'}
                                      </p>

                                      {asgn.isSubmitted ? (
                                        <div className="rounded-lg bg-gray-50 dark:bg-slate-700 px-3 py-2.5">
                                          <p className="text-xs font-semibold text-gray-500 mb-1">Your Answer:</p>
                                          <p className="text-sm text-gray-700 dark:text-gray-300">{existingAnswer ?? '(not answered)'}</p>
                                        </div>
                                      ) : (
                                        <textarea
                                          value={currentAnswer}
                                          onChange={(e) => {
                                            setAnswers((prev) => ({
                                              ...prev,
                                              [asgn.id]: {
                                                ...(prev[asgn.id] ?? {}),
                                                [qKey]: e.target.value,
                                              },
                                            }));
                                          }}
                                          placeholder="Type your answer here..."
                                          rows={3}
                                          className="w-full mt-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          aria-label={`Answer for question ${idx + 1}`}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {!asgn.isSubmitted && asgn.canSubmit && (
                              <button
                                type="button"
                                disabled={submitting === asgn.id}
                                onClick={() => handleSubmitAssignment(asgn.id, asgn.questions)}
                                className="w-full py-3 mt-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              >
                                {submitting === asgn.id
                                  ? 'Submitting...'
                                  : asgn.isOverdue
                                    ? 'Submit Late Assignment'
                                    : 'Submit Assignment'}
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedId(null)}
                          className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
                        >
                          ▲ Collapse
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
              <p className="text-slate-600 dark:text-slate-300">No assignments found</p>
              <Link href="/assignments" className="text-blue-600 hover:underline mt-2 inline-block">
                Go to assignments
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
