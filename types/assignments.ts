// Type definitions for assignments module

export type QuestionType = 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'FILL_BLANK' | 'TRUE_FALSE';

export type ComplexityLevel = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

export type GradeLabel = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'Needs Improvement';

export type BoardType = 'CBSE' | 'ICSE' | 'STATE_BOARD' | 'COMMON_CORE';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[] | null;
  marks: number;
  correct_answer?: string; // Only on server-side, stripped before client response
}

export interface AssignmentGenerated {
  title: string;
  topic: string;
  instructions: string;
  questions: Question[];
  totalMarks: number;
  estimatedMinutes: number;
}

export interface AssignmentResponse extends AssignmentGenerated {
  /** UUID from the DB row — comes from generate API as `assignmentId` */
  id: string;
}

export interface AssignmentGenerateRequest {
  child_id: string;
  subject: string;
  grade: number;
  board: BoardType;
  topic: string;
  complexity: ComplexityLevel;
}

export interface QuestionFeedback {
  question_id:       number;
  is_correct:        boolean;
  marks_awarded:     number;
  marks_possible:    number;
  brief_explanation: string;
}

/** Full rich feedback returned by the submit API and stored in DB feedbackJson */
export interface FeedbackResult {
  per_question_feedback:  QuestionFeedback[];
  total_marks_awarded:    number;
  total_marks_possible:   number;
  percentage:             number;
  grade_label:            GradeLabel;
  grade_emoji:            string;
  strengths:              string;
  improvement_areas:      string;
  overall_feedback:       string;
  parent_summary:         string;
  next_steps:             string[];
  encouragement_badge:    string;
}

/** Backward-compat alias */
export type SubmissionFeedback = FeedbackResult;

export interface SubmitRequest {
  assignmentId: string;
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}

export interface AssignmentHistoryItem {
  id: string;
  subject: string;
  topic: string;
  generatedAt: string;
  submittedAt: string | null;
  score: number | null;
  grade: GradeLabel | null;
}
