import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import {
  SubmitRequest,
  SubmissionFeedback,
  Question,
  QuestionFeedback,
} from '@/types/assignments';
import { generateContentWithRetry } from '@/server/utils';

const LLM_TIMEOUT_MS = 20000;

/**
 * Build LLM prompt for assignment evaluation
 */
function buildEvaluationPrompt(
  board: string,
  grade: number,
  subject: string,
  topic: string,
  questions: Question[],
  studentAnswers: Array<{ question_id: number; answer: string }>
): string {
  const questionsForEval = questions.map((q) => ({
    id: q.id,
    type: q.type,
    question: q.question,
    options: q.options,
    marks: q.marks,
    correct_answer: q.correct_answer,
  }));

  return `You are a ${board} Grade ${grade} teacher marking a ${subject} assignment on "${topic}".
Evaluate each student answer carefully.

QUESTIONS AND CORRECT ANSWERS:
${JSON.stringify(questionsForEval, null, 2)}

STUDENT'S ANSWERS:
${JSON.stringify(studentAnswers, null, 2)}

Return ONLY valid JSON in this exact format:
{
  "per_question_feedback": [
    {
      "question_id": 1,
      "is_correct": true,
      "marks_awarded": 1,
      "brief_explanation": "Clear and correct answer."
    }
  ],
  "total_marks_awarded": 15,
  "total_marks_possible": 20,
  "percentage": 75,
  "grade_label": "B",
  "overall_feedback": "Good understanding of the topic. You answered most questions correctly. Work on [area] to improve further."
}

Rules:
- Award full marks only if the answer is correct or demonstrates complete understanding
- For MCQ: Full marks if option matches correct_answer, 0 otherwise
- For SHORT_ANSWER/FILL_BLANK: Full marks for exact answer or reasonable equivalent, partial marks for partial understanding
- For LONG_ANSWER: Award marks proportionally to completeness and correctness
- For TRUE_FALSE: Full marks if correct, 0 otherwise
- Grade labels: A+ (95-100%), A (85-94%), B+ (75-84%), B (65-74%), C (55-64%), D (45-54%), Needs Improvement (<45%)
- Explanation must be 1-2 sentences, grade-appropriate, encouraging
- Keep overall_feedback to 3-4 sentences`;
}

/**
 * Parse and validate feedback JSON from LLM
 */
function parseFeedbackResponse(jsonStr: string): SubmissionFeedback | null {
  try {
    const parsed = JSON.parse(jsonStr);

    if (
      !Array.isArray(parsed.per_question_feedback) ||
      parsed.total_marks_awarded === undefined ||
      parsed.total_marks_possible === undefined ||
      parsed.percentage === undefined ||
      !parsed.grade_label ||
      !parsed.overall_feedback
    ) {
      return null;
    }

    return parsed as SubmissionFeedback;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubmitRequest;
    const { assignment_id, answers } = body;

    if (!assignment_id || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid assignment_id or answers' },
        { status: 400 }
      );
    }

    // Fetch assignment with correct answers
    const assignment = await prisma.generatedAssignment.findUnique({
      where: { id: assignment_id },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if already submitted
    if (assignment.submittedAt) {
      return NextResponse.json(
        { error: 'This assignment has already been submitted' },
        { status: 400 }
      );
    }

    // Parse stored questions
    let questions: Question[];
    try {
      questions = JSON.parse(assignment.questionsJson);
    } catch {
      return NextResponse.json(
        { error: 'Invalid assignment data' },
        { status: 500 }
      );
    }

    // Validate all questions were answered
    const answeredQuestionIds = new Set(answers.map((a) => a.question_id));
    if (answeredQuestionIds.size !== questions.length) {
      return NextResponse.json(
        { error: 'Not all questions were answered' },
        { status: 400 }
      );
    }

    // Call LLM for evaluation with retry logic
    const prompt = buildEvaluationPrompt(
      assignment.board,
      assignment.grade,
      assignment.subject,
      assignment.topic,
      questions,
      answers
    );

    let feedback: SubmissionFeedback | null = null;
    let lastError: string | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await Promise.race([
          generateContentWithRetry(prompt),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('LLM request timeout')), LLM_TIMEOUT_MS)
          ),
        ]);

        feedback = parseFeedbackResponse(response);
        if (feedback) {
          break;
        }
        lastError = 'Invalid JSON response from LLM';
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        if (attempt < 2) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
          );
        }
      }
    }

    if (!feedback) {
      console.error('[POST /api/assignments/submit] LLM evaluation error:', lastError);
      return NextResponse.json(
        { error: 'Failed to evaluate assignment. Please try again.' },
        { status: 503 }
      );
    }

    // Update assignment with submission data
    const percentage = feedback.total_marks_awarded / assignment.totalMarks * 100;
    const updatedAssignment = await prisma.generatedAssignment.update({
      where: { id: assignment_id },
      data: {
        submittedAnswersJson: JSON.stringify(answers),
        feedbackJson: JSON.stringify(feedback),
        score: feedback.total_marks_awarded,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        assignment_id,
        score: feedback.total_marks_awarded,
        total_marks: assignment.totalMarks,
        ...feedback,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/assignments/submit] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
