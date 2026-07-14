/**
 * QUESTION RENDERING CONTRACT — DO NOT BREAK
 * Canonical types: MCQ | SHORT_ANSWER | LONG_ANSWER | FILL_BLANK | TRUE_FALSE
 * Types are normalised server-side in generate/route.ts before reaching here.
 * Client-side normalisation below is a safety net only.
 * MCQ and TRUE_FALSE → RadioGroup (NEVER Checkbox)
 * FILL_BLANK         → Input single line
 * SHORT_ANSWER       → Textarea rows={3}
 * LONG_ANSWER        → Textarea rows={6}
 * Unknown types fall through to LONG_ANSWER Textarea — never throw or show error.
 * Adding a new type? Add a new block below AND in types/assignments.ts.
 *
 * OPTION TEXT CONTRAST CONTRACT — DO NOT CHANGE
 * Radio option Labels: text-gray-900 (#111827) — contrast 16:1 on white — WCAG AAA ✓
 * Question text:       text-slate-700 (inherits from card)
 * Marks label:         text-slate-600
 * Warning banner text: text-amber-900 on bg-amber-50
 * NEVER use on white bg: text-gray-400, text-slate-200,
 *   text-muted-foreground, text-slate-400 for option text
 */
'use client';

import { Question, QuestionType } from '@/types/assignments';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  answer: string;
  onAnswerChange: (answer: string) => void;
  feedback?: {
    is_correct: boolean;
    marks_awarded: number;
    brief_explanation: string;
  };
  isReadOnly?: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  feedback,
  isReadOnly = false,
}: QuestionCardProps) {
  const renderAnswerInput = () => {
    // Client-side safety-net normalisation (server already normalises, but guard anyway)
    const rawType: string = (question.type as string) ?? '';
    const qType = rawType.trim().toUpperCase().replace(/\s+/g, '_') as QuestionType;

    // MCQ — single-select radio group
    if (qType === 'MCQ') {
      return (
        <div className="space-y-3 mt-4">
          <RadioGroup
            value={answer}
            onValueChange={onAnswerChange}
            disabled={isReadOnly}
          >
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <RadioGroupItem value={option} id={`q${question.id}_opt${idx}`} />
                <Label htmlFor={`q${question.id}_opt${idx}`} className="text-gray-900 font-normal cursor-pointer select-none">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }

    // TRUE_FALSE — radio group with True / False
    if (qType === 'TRUE_FALSE') {
      return (
        <div className="flex gap-6 mt-4">
          <RadioGroup
            value={answer}
            onValueChange={onAnswerChange}
            disabled={isReadOnly}
          >
            {['True', 'False'].map((option) => (
              <div key={option} className="flex items-center gap-2">
                <RadioGroupItem value={option} id={`q${question.id}_${option}`} />
                <Label htmlFor={`q${question.id}_${option}`} className="text-gray-900 font-normal cursor-pointer select-none">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }

    // FILL_BLANK — single-line text input
    if (qType === 'FILL_BLANK') {
      return (
        <div className="mt-4">
          <Label
            htmlFor={`q${question.id}-input`}
            className="text-sm text-slate-700 mb-1 block"
          >
            Fill in the blank:
          </Label>
          <Input
            id={`q${question.id}-input`}
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={isReadOnly}
            className="max-w-md"
          />
        </div>
      );
    }

    // SHORT_ANSWER — 3-row textarea
    if (qType === 'SHORT_ANSWER') {
      return (
        <div className="mt-4">
          <Label
            htmlFor={`q${question.id}-short`}
            className="text-sm text-slate-700 mb-1 block"
          >
            Your answer:
          </Label>
          <Textarea
            id={`q${question.id}-short`}
            placeholder="Write your answer here..."
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={isReadOnly}
            rows={3}
            className="resize-none"
          />
        </div>
      );
    }

    // LONG_ANSWER — 6-row textarea
    if (qType === 'LONG_ANSWER') {
      return (
        <div className="mt-4">
          <Label
            htmlFor={`q${question.id}-long`}
            className="text-sm text-slate-700 mb-1 block"
          >
            Your answer:
          </Label>
          <Textarea
            id={`q${question.id}-long`}
            placeholder="Write a detailed answer here..."
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={isReadOnly}
            rows={6}
            className="resize-none"
          />
        </div>
      );
    }

    // Fallback for any unrecognised type — renders a 6-row Textarea, never crashes
    return (
      <div className="mt-4">
        <Label
          htmlFor={`q${question.id}-fallback`}
          className="text-sm text-slate-700 mb-1 block"
        >
          Your answer:
        </Label>
        <Textarea
          id={`q${question.id}-fallback`}
          placeholder="Write a detailed answer here..."
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={isReadOnly}
          rows={6}
          className="resize-none"
        />
      </div>
    );
  };

  const borderColor = feedback
    ? feedback.is_correct
      ? 'border-green-200 bg-green-50'
      : 'border-red-200 bg-red-50'
    : 'border-slate-200';

  return (
    <div className={`rounded-lg border-2 p-6 ${borderColor}`}>
      {/* Question Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-slate-900">
            Q{questionNumber}.
          </span>
          <span className="text-slate-700">{question.question}</span>
        </div>
        <span className="text-sm font-semibold text-slate-600 whitespace-nowrap ml-2">
          {question.marks} mark{question.marks !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Answer Input */}
      {!isReadOnly && renderAnswerInput()}
      {isReadOnly && answer && (
        <div className="mt-4 p-3 bg-white rounded border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Your answer:</p>
          <p className="text-slate-900">{answer}</p>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="mt-4 space-y-2 border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {feedback.is_correct ? '✅ Correct' : '❌ Incorrect'}
            </span>
            <span className="text-sm font-semibold">
              {feedback.marks_awarded}/{question.marks} marks
            </span>
          </div>
          <p className="text-sm text-slate-700">{feedback.brief_explanation}</p>
        </div>
      )}

      {/* Unanswered indicator */}
      {!answer && !isReadOnly && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 mt-3" role="alert">
          <span aria-hidden="true">⚠️</span>
          <span className="text-sm text-amber-900 font-medium">This question is not answered</span>
        </div>
      )}
    </div>
  );
}
