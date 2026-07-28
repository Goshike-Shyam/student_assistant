'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Placeholder quotes for inspirational messages
const EDUCATION_QUOTES = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
  "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. - Brian Herbert",
  "Education is the foundation upon which we build our future. - Christine Gregoire",
  "Learning never exhausts the mind. - Leonardo da Vinci",
  "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
  "Education is the most effective tool for change. - Oprah Winfrey",
  "An investment in knowledge always pays the best interest. - Benjamin Franklin",
  "The only person who is educated is the one who has learned how to learn. - Carl Rogers",
  "Education is not the filling of a pail, but the lighting of a fire. - William Butler Yeats",
];

interface ChildAssignmentStats {
  childName: string;
  grade: number;
  board: string;
  totalAssignments: number;
  submittedAssignments: number;
  averageScore: number;
  gradeDistribution: {
    'A+': number;
    'A': number;
    'B+': number;
    'B': number;
    'C': number;
    'D': number;
    'Needs Improvement': number;
  };
  subjectPerformance: {
    [subject: string]: {
      averageScore: number;
      assignmentCount: number;
    };
  };
  recentAssignments: Array<{
    subject: string;
    topic: string;
    submittedAt: string;
    score: number;
    totalMarks: number;
    grade_label?: string;
    encouragement_badge?: string;
    parent_summary?: string;
  }>;
}

export default function AssignmentReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [childrenStats, setChildrenStats] = useState<ChildAssignmentStats[]>([]);
  const [selectedQuote] = useState(
    EDUCATION_QUOTES[Math.floor(Math.random() * EDUCATION_QUOTES.length)]
  );

  useEffect(() => {
    const parentId = localStorage.getItem('userId');
    if (!parentId) {
      window.location.href = '/login';
      return;
    }

    // TODO: Fetch from API /api/parent/reports/assignments?parentId={parentId}
    // Placeholder data
    setChildrenStats([
      {
        childName: 'Aryan',
        grade: 8,
        board: 'CBSE',
        totalAssignments: 12,
        submittedAssignments: 10,
        averageScore: 78,
        gradeDistribution: {
          'A+': 1,
          'A': 3,
          'B+': 4,
          'B': 2,
          'C': 0,
          'D': 0,
          'Needs Improvement': 0,
        },
        subjectPerformance: {
          'Mathematics': { averageScore: 82, assignmentCount: 4 },
          'Science': { averageScore: 75, assignmentCount: 3 },
          'English': { averageScore: 76, assignmentCount: 3 },
        },
        recentAssignments: [
          {
            subject: 'Mathematics',
            topic: 'Quadratic Equations',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            score: 18,
            totalMarks: 20,
            grade_label: 'A',
            encouragement_badge: 'Subject Champion',
            parent_summary: 'Aryan scored 18/20 (90%) on Quadratic Equations, demonstrating strong algebra skills. He showed excellent understanding of factorisation and the quadratic formula. Minor improvement is needed in word-problem interpretation. You can help at home by encouraging Aryan to solve 2-3 practice problems daily from his NCERT textbook.',
          },
        ],
      },
    ]);

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  const handleDownloadReport = () => {
    alert('PDF report download feature coming soon');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">

      <div className="pt-4 px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-slate-900">Assignment Reports</h1>
            <p className="text-slate-600">Monitor your child's assignment progress and performance</p>
          </div>

          {/* Motivational Quote */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
            <p className="text-center text-slate-700 italic text-lg">"{selectedQuote}"</p>
          </div>

          {/* Children Reports */}
          {childrenStats.map((child) => (
            <div key={child.childName} className="space-y-6">
              {/* Child Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{child.childName}</h2>
                  <p className="text-slate-600">
                    Grade {child.grade} • {child.board}
                  </p>
                </div>
                <Button onClick={handleDownloadReport}>
                  Download Report PDF
                </Button>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p className="text-3xl font-bold text-blue-700">
                    {child.submittedAssignments}/{child.totalAssignments}
                  </p>
                  <p className="text-sm text-slate-700 mt-1">Completed</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-700">
                    {child.averageScore}%
                  </p>
                  <p className="text-sm text-slate-700 mt-1">Average Score</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p className="text-3xl font-bold text-amber-700">
                    {child.gradeDistribution['A+'] + child.gradeDistribution['A']}
                  </p>
                  <p className="text-sm text-slate-700 mt-1">A Grade Count</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                  <p className="text-3xl font-bold text-purple-700">
                    {Object.keys(child.subjectPerformance).length}
                  </p>
                  <p className="text-sm text-slate-700 mt-1">Subjects</p>
                </div>
              </div>

              {/* Charts and Analysis Section */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Subject Performance */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Subject Performance</h3>
                  <div className="space-y-3">
                    {Object.entries(child.subjectPerformance).map(([subject, data]) => (
                      <div key={subject}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-700">{subject}</span>
                          <span className="text-sm font-semibold text-slate-900">
                            {data.averageScore}%
                          </span>
                        </div>
                        <div
                          role="progressbar"
                          aria-valuenow={data.averageScore}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Score: ${data.averageScore}%`}
                          className="h-2 bg-slate-100 rounded-full overflow-hidden"
                        >
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                            style={{ width: `${data.averageScore}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {data.assignmentCount} assignment{data.assignmentCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grade Distribution */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Grade Distribution</h3>
                  <div className="space-y-2">
                    {Object.entries(child.gradeDistribution)
                      .filter(([_, count]) => count > 0)
                      .map(([grade, count]) => {
                        const total = child.submittedAssignments;
                        const percentage = (count / total) * 100;
                        const colorMap: { [key: string]: string } = {
                          'A+': 'bg-emerald-500',
                          'A': 'bg-emerald-400',
                          'B+': 'bg-blue-500',
                          'B': 'bg-blue-400',
                          'C': 'bg-amber-500',
                          'D': 'bg-orange-500',
                          'Needs Improvement': 'bg-red-500',
                        };

                        return (
                          <div key={grade}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-semibold text-slate-700">{grade}</span>
                              <span className="text-sm font-semibold text-slate-900">
                                {count} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                        <div
                          role="progressbar"
                          aria-valuenow={percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${grade}: ${percentage.toFixed(0)}%`}
                          className="h-2 bg-slate-100 rounded-full overflow-hidden"
                        >
                          <div
                            className={`h-full ${colorMap[grade]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Recent Assignments */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Assignments</h3>
                <div className="space-y-3">
                  {child.recentAssignments.map((assignment, idx) => (
                    <div key={idx} className="space-y-2">
                      <div
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{assignment.subject}</p>
                          <p className="text-sm text-slate-600">{assignment.topic}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(assignment.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {assignment.score}/{assignment.totalMarks}
                          </p>
                          <p className="text-sm text-emerald-700">
                            {Math.round((assignment.score / assignment.totalMarks) * 100)}%
                          </p>
                          {assignment.grade_label && (
                            <span className="text-xs font-bold text-blue-700">
                              {assignment.grade_label}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Teacher's Note for Parents — from feedbackJson.parent_summary */}
                      {assignment.parent_summary && (
                        <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
                          <h4 className="font-semibold text-blue-800 text-sm mb-1">
                            📋 Teacher's Note for Parents
                          </h4>
                          <p className="text-sm text-blue-700 leading-relaxed">
                            {assignment.parent_summary}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-blue-600">
                            <span>
                              Score:{' '}
                              <strong>
                                {Math.round((assignment.score / assignment.totalMarks) * 100)}%
                              </strong>
                            </span>
                            {assignment.grade_label && (
                              <span>Grade: <strong>{assignment.grade_label}</strong></span>
                            )}
                            {assignment.encouragement_badge && (
                              <span>Badge: <strong>{assignment.encouragement_badge}</strong></span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                <h3 className="font-semibold text-amber-900 mb-3">💡 Tips to Support Learning</h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>✓ Review assignment feedback with your child to identify improvement areas</li>
                  <li>✓ Encourage daily practice in weak subjects</li>
                  <li>✓ Celebrate improvements and good grades</li>
                  <li>✓ Ensure regular study schedule for consistent performance</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
