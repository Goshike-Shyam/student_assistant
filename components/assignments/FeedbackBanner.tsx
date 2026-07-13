'use client';

import { FeedbackResult } from '@/types/assignments';

interface FeedbackBannerProps {
  feedback: FeedbackResult;
}

export default function FeedbackBanner({ feedback }: FeedbackBannerProps) {
  const pct = feedback.percentage;

  const bannerColors =
    pct >= 90 ? 'bg-green-50 border-green-400 text-green-900' :
    pct >= 70 ? 'bg-blue-50 border-blue-400 text-blue-900' :
    pct >= 50 ? 'bg-amber-50 border-amber-400 text-amber-900' :
                'bg-red-50 border-red-300 text-red-900';

  return (
    <div className="space-y-4 mb-6">
      {/* ── Top summary banner ── */}
      <div className={`rounded-xl p-6 border-2 text-center ${bannerColors}`}>
        <div className="text-5xl mb-2">{feedback.grade_emoji ?? '🎓'}</div>
        <div className="text-3xl font-bold mb-1">{feedback.grade_label}</div>
        <div className="text-xl font-medium mb-3">
          {feedback.total_marks_awarded} / {feedback.total_marks_possible} marks
          &nbsp;({feedback.percentage.toFixed(1)}%)
        </div>
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1 border text-sm font-semibold mb-4 text-gray-700">
          🏅 {feedback.encouragement_badge}
        </div>
        <p className="text-base leading-relaxed max-w-2xl mx-auto">
          {feedback.overall_feedback}
        </p>
      </div>

      {/* ── Strengths + Keep Improving ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg p-4 bg-green-50 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">💪 Your Strengths</h3>
          <p className="text-sm text-green-800 leading-relaxed">{feedback.strengths}</p>
        </div>
        <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">📖 Keep Improving</h3>
          <p className="text-sm text-blue-800 leading-relaxed">{feedback.improvement_areas}</p>
        </div>
      </div>

      {/* ── Next Steps checklist ── */}
      {feedback.next_steps && feedback.next_steps.length > 0 && (
        <div className="rounded-lg p-4 bg-amber-50 border border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-3">🎯 Your Next Steps</h3>
          <ul className="space-y-2">
            {feedback.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span className="mt-0.5 text-amber-700 font-bold">✓</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

