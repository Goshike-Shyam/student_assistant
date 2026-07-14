/**
 * SUBMIT CONTRACT — DO NOT CHANGE ORDER
 * 1. Validate payload (assignmentId + answers required)
 * 2. DB lookup FIRST — return 404 immediately if not found
 * 3. Check already-submitted (409 if true)
 * 4. Fetch student name from User table for personalised prompt
 * 5. Call Gemini with buildEvalPrompt() — 45s timeout
 * 6. Parse JSON response (strips markdown fences) → FeedbackResult
 * 7. DB update: feedbackJson, score, submittedAt
 * 8. Return FeedbackResult to client
 * Gemini is NEVER called before DB lookup — prevents 100s timeout then 404
 * feedbackJson always contains: per_question_feedback, overall_feedback,
 *   parent_summary, next_steps, encouragement_badge — used by parent report
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { FeedbackResult, Question } from '@/types/assignments';
import { callGeminiWithRetry } from '@/lib/ai-with-retry';
import { logAiCredit } from '@/lib/ai-credit-logger';

const LLM_TIMEOUT_MS = 45000; // 45s — LLM evaluation can be slow for long assignments

/**
 * Build a rich, personalised LLM evaluation prompt.
 * Includes correct_answer from DB (never sent to client).
 */
function buildEvalPrompt(
  questions: any[],
  answers: Array<{ questionId: number; answer: string }>,
  studentName: string,
  grade: number,
  board: string,
  subject: string
): string {
  const qa = questions
    .map((q: any, i: number) => {
      const studentAns =
        answers.find((a) => String(a.questionId) === String(q.id))?.answer ?? '(no answer)';
      return `Q${i + 1} [${q.type}] [${q.marks} marks]
Question: ${q.question}
${q.options ? `Options: ${q.options.join(' | ')}` : ''}
Correct answer: ${q.correct_answer ?? 'N/A'}
Student answered: ${studentAns}`;
    })
    .join('\n\n');

  return `You are a warm, encouraging ${board} Grade ${grade} ${subject} teacher.
Student name: ${studentName}
Your task: evaluate this assignment and provide feedback that is:
- Age-appropriate for Grade ${grade}
- Specific to ${board} ${subject} curriculum
- Always encouraging, never discouraging
- Constructive — tell the student HOW to improve, not just what is wrong
- Celebratory for correct answers
- Empathetic and motivating for wrong answers

${qa}

Return ONLY this exact JSON structure, no markdown fences, no extra text:
{
  "per_question_feedback": [
    {
      "question_id": <number matching q id>,
      "is_correct": <boolean>,
      "marks_awarded": <number>,
      "marks_possible": <number>,
      "brief_explanation": "<1-2 sentences. If correct: celebrate + reinforce why. If wrong: explain correct answer simply + encourage. Always end positively.>"
    }
  ],
  "total_marks_awarded": <number>,
  "total_marks_possible": <number>,
  "percentage": <number 0-100>,
  "grade_label": "<one of: A+ | A | B+ | B | C | D | Needs Improvement>",
  "grade_emoji": "<one of: 🌟 | ⭐ | 👍 | 🙂 | 💪 | 📚>",
  "strengths": "<2-3 sentences about what the student did well overall>",
  "improvement_areas": "<2-3 sentences about specific topics to revise, framed positively>",
  "overall_feedback": "<4-5 sentences personalised to ${studentName}. (1) Open with genuine praise for attempting the assignment. (2) Highlight their strongest answer. (3) Gently note one improvement area with a specific study tip. (4) Connect to their future potential. (5) Close with an energetic motivational line for Grade ${grade}.>",
  "parent_summary": "<3-4 sentences FOR PARENTS (not student). Include: score, strongest area shown, area needing home support, and one specific action the parent can take. Professional and warm tone.>",
  "next_steps": [
    "<specific actionable study tip 1 for this topic>",
    "<specific actionable study tip 2 for this topic>",
    "<specific actionable study tip 3 for this topic>"
  ],
  "encouragement_badge": "<one of: Rising Star | Quick Learner | Hard Worker | Improving Fast | Knowledge Seeker | Subject Champion>"
}

Scoring rules:
- MCQ / TRUE_FALSE: full marks if correct, 0 if wrong
- FILL_BLANK: full marks if answer matches correct_answer (case-insensitive, trimmed)
- SHORT_ANSWER / LONG_ANSWER: partial marks allowed (0, 25%, 50%, 75%, or 100% of marks) based on key concept coverage
- Never give negative marks
- percentage = (total_marks_awarded / total_marks_possible) * 100, rounded to 1 decimal
- grade_label: A+(90-100) A(80-89) B+(70-79) B(60-69) C(50-59) D(40-49) Needs Improvement(<40)`;
}

/**
 * Parse and validate FeedbackResult JSON from LLM.
 * Handles raw JSON AND markdown-fenced JSON (```json ... ```).
 * Uses regex extraction so stray text around the JSON block is ignored.
 */
function parseFeedbackResponse(raw: string): FeedbackResult | null {
  try {
    // 1. Strip markdown code fences if present
    const stripped = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    // 2. Extract the outermost JSON object in case there's surrounding text
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

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

    return parsed as FeedbackResult;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, answers } = body as { assignmentId?: string; answers?: any[] };

    // STEP 1 — validate payload
    if (!assignmentId || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'assignmentId and answers are required' },
        { status: 400 }
      );
    }

    // Reject temp_ IDs immediately — never query DB for them
    console.log('[Submit] received id:', assignmentId, 'type:', typeof assignmentId);
    if (String(assignmentId).startsWith('temp_')) {
      return NextResponse.json(
        { error: 'Temporary ID received — assignment was not saved to DB. Please regenerate the assignment.' },
        { status: 400 }
      );
    }

    // STEP 2 — DB lookup FIRST, before any AI call
    const assignment = await prisma.generatedAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      console.error('[Submit] Assignment not found for id:', assignmentId);
      return NextResponse.json(
        { error: `Assignment not found. ID: ${assignmentId}` },
        { status: 404 }
      );
    }

    // STEP 3 — check already submitted
    if (assignment.submittedAt) {
      return NextResponse.json(
        { error: 'This assignment has already been submitted' },
        { status: 409 }
      );
    }

    // STEP 4 — parse stored questions (include correct_answer for grading)
    let questions: Question[];
    try {
      questions = JSON.parse(assignment.questionsJson);
    } catch {
      return NextResponse.json({ error: 'Invalid assignment data' }, { status: 500 });
    }

    // STEP 5 — fetch student name for personalised feedback
    const student = await prisma.user.findUnique({
      where: { id: assignment.childId },
      select: { name: true },
    });
    const studentName = student?.name ?? 'Student';

    // STEP 6 — build rich evaluation prompt and call Gemini
    const prompt = buildEvalPrompt(
      questions,
      answers as Array<{ questionId: number; answer: string }>,
      studentName,
      assignment.grade,
      assignment.board,
      assignment.subject
    );

    let feedback: FeedbackResult | null = null;
    let lastError: string | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await Promise.race([
          callGeminiWithRetry(prompt, 2048),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('LLM request timeout')), LLM_TIMEOUT_MS)
          ),
        ]);

        const responseText = response.text;

        // Log AI credit (fire-and-forget)
        logAiCredit({
          userId: assignment.childId,
          userRole: 'STUDENT',
          feature: 'ASSIGNMENT_FEEDBACK',
          promptTokens: 0,
          completionTokens: 0,
        }).catch(console.error);

        console.log(
          `[Submit] model=${response.modelUsed} fallback=${response.usedFallback} attempts=${response.attemptsTaken}`,
        );

        feedback = parseFeedbackResponse(responseText);
        if (feedback) break;
        lastError = 'Invalid JSON response from LLM';
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    if (!feedback) {
      console.error('[POST /api/assignments/submit] LLM evaluation failed:', lastError);
      return NextResponse.json(
        { error: 'Failed to evaluate assignment. Please try again.' },
        { status: 503 }
      );
    }

    // STEP 7 — persist to DB
    await prisma.generatedAssignment.update({
      where: { id: assignmentId },
      data: {
        submittedAnswersJson: JSON.stringify(answers),
        feedbackJson:         JSON.stringify(feedback),
        score:                feedback.total_marks_awarded,
        submittedAt:          new Date(),
      },
    });

    // STEP 8 — return full FeedbackResult to client
    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    console.error('[POST /api/assignments/submit] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
