/**
 * STABILITY CONTRACT — read before editing this file
 *
 * [AssignmentToolbar.tsx]
 * - Submit handler sends answers to /api/assignments/submit
 * - assignment.id is the DB UUID (saved during generate) — NOT a temp value
 * - Payload uses camelCase: { assignmentId, answers: [{questionId, answer}] }
 * - allAnswered is computed here via .every() — DO NOT rely solely on unansweredCount prop
 * - onSubmitSuccess(feedback) called on success — parent page owns feedback state
 * - Never call onSubmitSuccess on error — that would incorrectly lock the form
 */
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AssignmentResponse, FeedbackResult } from '@/types/assignments';
import { Button } from '@/components/ui/button';
import { celebrate } from '@/lib/gamification/confetti';

interface AssignmentToolbarProps {
  assignment: AssignmentResponse;
  unansweredCount: number;
  answers: { [key: number]: string };
  onSubmitSuccess?: (feedback: FeedbackResult) => void;
}

export default function AssignmentToolbar({
  assignment,
  unansweredCount,
  answers,
  onSubmitSuccess,
}: AssignmentToolbarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // Computed directly here so it stays accurate for ALL question types
  // (text inputs, radio, etc.) — does not rely on the parent's unansweredCount counter
  const allAnswered = assignment.questions.every(
    (q) => {
      const ans = answers[q.id];
      return ans !== undefined && ans.trim() !== '';
    }
  );

  const canSubmit = allAnswered && !submitted;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    // Guard: assignment.id must be a real DB UUID, never a temp_ value
    if (!assignment?.id || String(assignment.id).startsWith('temp_')) {
      toast.error('Invalid assignment ID. Please regenerate the assignment.');
      console.error('[Submit] bad id:', assignment?.id);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        assignmentId: assignment.id,
        answers: assignment.questions.map((q) => ({
          questionId: q.id,
          answer: (answers[q.id] ?? '').trim(),
        })),
      };
      console.log('[Submit] payload:', JSON.stringify({ assignmentId: payload.assignmentId, answerCount: payload.answers.length }));

      const response = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errData?.error ?? 'Submission failed');
      }

      const data: FeedbackResult = await response.json();
      setSubmitted(true);
      onSubmitSuccess?.(data);
      celebrate('submit');
      toast.success('Assignment submitted! Check your feedback below.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed. Try again.';
      setError(msg);
      toast.error(msg);
      console.error('[Assignment Submit]', err);
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
      {/* Toolbar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 rounded-lg shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          {/* Status Info */}
          <div className="space-y-1">
            {unansweredCount > 0 && !submitted && (
              <p className="text-sm text-amber-700 font-semibold">
                ⚠️ {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} unanswered
              </p>
            )}
            {submitted && (
              <p className="text-sm text-emerald-700 font-semibold">
                ✅ Assignment submitted — see feedback above
              </p>
            )}
            {error && (
              <p className="text-sm text-red-700 font-semibold">
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
            {!submitted && (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
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
