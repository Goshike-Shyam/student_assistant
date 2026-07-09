'use client';

import { useState } from 'react';
import { AssignmentResponse } from '@/types/assignments';
import { Button } from '@/components/ui/button';
import FeedbackBanner from '@/components/assignments/FeedbackBanner';

interface AssignmentToolbarProps {
  assignment: AssignmentResponse;
  unansweredCount: number;
  answers: { [key: number]: string };
  feedback?: any;
}

export default function AssignmentToolbar({
  assignment,
  unansweredCount,
  answers,
  feedback: initialFeedback,
}: AssignmentToolbarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(initialFeedback || null);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const canSubmit = unansweredCount === 0 && !feedback;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert answers to expected format
      const formattedAnswers = assignment.questions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id] || '',
      }));

      const response = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: assignment.assignment_id,
          answers: formattedAnswers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit assignment');
      }

      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download using jsPDF
    alert('PDF download feature coming soon');
  };

  const handleDownloadDocx = () => {
    // TODO: Implement DOCX download using docx package
    alert('Word download feature coming soon');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Feedback Banner */}
      {feedback && <FeedbackBanner feedback={feedback} />}

      {/* Toolbar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 rounded-lg shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          {/* Status Info */}
          <div className="space-y-1">
            {unansweredCount > 0 && (
              <p className="text-sm text-amber-600 font-semibold">
                ⚠️ {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} unanswered
              </p>
            )}
            {feedback && (
              <p className="text-sm text-emerald-600 font-semibold">
                ✅ Assignment submitted
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 font-semibold">
                ❌ {error}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Download Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                disabled={!assignment}
              >
                Download ▾
              </Button>
              {showDownloadMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b"
                  >
                    Download as PDF
                  </button>
                  <button
                    onClick={handleDownloadDocx}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50"
                  >
                    Download as Word
                  </button>
                </div>
              )}
            </div>

            {/* Print Button */}
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!assignment}
            >
              Print
            </Button>

            {/* Submit Button */}
            {!feedback && (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
