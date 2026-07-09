'use client';

import { SubmissionFeedback } from '@/types/assignments';

interface FeedbackBannerProps {
  feedback: SubmissionFeedback & {
    score?: number;
    total_marks?: number;
    percentage?: number;
  };
}

export default function FeedbackBanner({ feedback }: FeedbackBannerProps) {
  const gradeColors: { [key: string]: string } = {
    'A+': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'A': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'B+': 'bg-blue-100 text-blue-800 border-blue-300',
    'B': 'bg-blue-100 text-blue-800 border-blue-300',
    'C': 'bg-amber-100 text-amber-800 border-amber-300',
    'D': 'bg-orange-100 text-orange-800 border-orange-300',
    'Needs Improvement': 'bg-red-100 text-red-800 border-red-300',
  };

  const colorClass = gradeColors[feedback.grade_label] || 'bg-slate-100 text-slate-800 border-slate-300';

  return (
    <div className={`rounded-lg border-2 p-6 space-y-4 mb-6 ${colorClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Assignment Submitted</h3>
          <p className="text-sm opacity-90">Thank you! Here's your feedback.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">
            {feedback.percentage}%
          </p>
          <p className="text-lg font-semibold">{feedback.grade_label}</p>
        </div>
      </div>

      {/* Score Details */}
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-current opacity-75">
        <div className="text-center">
          <p className="text-sm opacity-75">Marks Awarded</p>
          <p className="text-2xl font-bold">
            {feedback.score?.toFixed(1) || feedback.total_marks_awarded}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm opacity-75">Total Marks</p>
          <p className="text-2xl font-bold">
            {feedback.total_marks || feedback.total_marks_possible}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm opacity-75">Percentage</p>
          <p className="text-2xl font-bold">{feedback.percentage}%</p>
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Teacher's Comments</h4>
        <p className="text-sm leading-relaxed">
          {feedback.overall_feedback}
        </p>
      </div>

      {/* Question-by-question feedback (if included) */}
      {feedback.per_question_feedback && feedback.per_question_feedback.length > 0 && (
        <details className="space-y-2 mt-4 pt-4 border-t border-current opacity-75">
          <summary className="font-semibold text-sm cursor-pointer">
            View feedback for each question ({feedback.per_question_feedback.length})
          </summary>
          <div className="mt-3 space-y-2 ml-2">
            {feedback.per_question_feedback.map((qf, idx) => (
              <div key={idx} className="text-sm p-2 bg-current opacity-5 rounded">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">
                    Q{qf.question_id} {qf.is_correct ? '✅' : '❌'}
                  </span>
                  <span>
                    {qf.marks_awarded} mark{qf.marks_awarded !== 1 ? 's' : ''}
                  </span>
                </div>
                <p>{qf.brief_explanation}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
