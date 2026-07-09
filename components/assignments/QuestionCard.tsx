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
    switch (question.type) {
      case 'MCQ':
        return (
          <div className="space-y-3 mt-4">
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <RadioGroup value={answer} onValueChange={onAnswerChange} disabled={isReadOnly}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={option} id={`q${question.id}_opt${idx}`} />
                    <Label htmlFor={`q${question.id}_opt${idx}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="space-y-3 mt-4">
            {['True', 'False'].map((option) => (
              <div key={option} className="flex items-center gap-3">
                <RadioGroup value={answer} onValueChange={onAnswerChange} disabled={isReadOnly}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={option} id={`q${question.id}_${option}`} />
                    <Label htmlFor={`q${question.id}_${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        );

      case 'FILL_BLANK':
        return (
          <Input
            className="mt-4"
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={isReadOnly}
          />
        );

      case 'SHORT_ANSWER':
        return (
          <Textarea
            className="mt-4"
            placeholder="Enter your answer (2-3 lines)"
            rows={3}
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={isReadOnly}
          />
        );

      case 'LONG_ANSWER':
        return (
          <Textarea
            className="mt-4"
            placeholder="Enter your detailed answer"
            rows={6}
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={isReadOnly}
          />
        );

      default:
        return null;
    }
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
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          ⚠️ This question is not answered
        </div>
      )}
    </div>
  );
}
