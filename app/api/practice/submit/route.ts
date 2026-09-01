/**
 * PRACTICE ROUTE CONTRACT
 * Prisma models: prisma.practiceTest    (@@map "practice_tests")
 *                prisma.practiceAttempt (@@map "practice_attempts")
 * NEVER use: prisma.generatedPracticeTest / prisma.generatedPracticeAttempt
 * SUBMIT ORDER — DO NOT CHANGE:
 * 1. Validate payload
 * 2. DB lookup practice_tests (return 404 if not found)
 * 3. Fetch child context
 * 4. Call Gemini evaluation
 * 5. Save to practice_attempts
 * 6. Return feedback
 * Gemini is NEVER called before DB lookup.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { callGeminiWithRetry } from '@/lib/ai-with-retry';
import { logAiCredit } from '@/lib/ai-credit-logger';
import { awardXP } from '@/lib/gamification/xp';

const LLM_TIMEOUT_MS = 45000;

function buildEvalPrompt(
  questions: any[],
  answers: Array<{ questionId: number; answer: string }>,
  studentName: string,
  grade: number,
  board: string,
  subject: string,
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
Evaluate this practice test and provide feedback that is age-appropriate for Grade ${grade},
specific to the ${board} curriculum, always encouraging, and constructive.

${qa}

Return ONLY this exact JSON, no markdown fences:
{
  "per_question_feedback": [
    {
      "question_id": <number>,
      "is_correct": <boolean>,
      "marks_awarded": <number>,
      "marks_possible": <number>,
      "brief_explanation": "<1-2 sentences. If correct: celebrate. If wrong: explain correct answer simply and encourage.>",
      "correct_answer": "<the correct answer for this question>"
    }
  ],
  "total_marks_awarded": <number>,
  "total_marks_possible": <number>,
  "percentage": <number 0-100>,
  "grade_label": "<A+|A|B+|B|C|D|Needs Improvement>",
  "grade_emoji": "<emoji>",
  "strengths": "<2-3 sentences about what the student did well>",
  "improvement_areas": "<2-3 sentences about topics to revise, framed positively>",
  "overall_feedback": "<4-5 sentences personalised to ${studentName}>",
  "encouragement": "<1-2 warm encouraging sentences for the student>",
  "topics_to_revise": ["<topic 1>", "<topic 2>"],
  "parent_summary": "<3-4 sentences for parents: score, strongest area, area needing support, one action>",
  "next_steps": ["<study tip 1>", "<study tip 2>", "<study tip 3>"],
  "encouragement_badge": "<Rising Star|Quick Learner|Hard Worker|Improving Fast|Knowledge Seeker|Subject Champion>"
}
Scoring:
- MCQ/TRUE_FALSE: full marks if correct, 0 if wrong
- FILL_BLANK: full marks if matches correct_answer (case-insensitive, trimmed)
- SHORT_ANSWER/LONG_ANSWER: partial marks (0, 25%, 50%, 75%, or 100% of marks)
- grade_label: A+(90-100) A(80-89) B+(70-79) B(60-69) C(50-59) D(40-49) Needs Improvement(<40)`;
}

function parseFeedback(raw: string): any | null {
  try {
    const stripped = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();
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
    return parsed;
  } catch {
    return null;
  }
}

function toSafeFloat(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toSafeInt(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practiceTestId, answers, timeTakenSecs } = body as {
      practiceTestId?: string;
      answers?: Array<{ questionId: number; answer: string }>;
      timeTakenSecs?: number;
    };

    // STEP 1 — Validate
    if (!practiceTestId || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'practiceTestId and answers are required' },
        { status: 400 },
      );
    }

    // Reject temp_ IDs — they were never saved to DB
    if (String(practiceTestId).startsWith('temp_')) {
      return NextResponse.json(
        { error: 'Invalid test ID. Please regenerate the practice test.' },
        { status: 400 },
      );
    }

    // STEP 2 — DB lookup FIRST
    const practiceTest = await prisma.practiceTest.findUnique({
      where: { id: practiceTestId },
    });

    if (!practiceTest) {
      console.error('[Practice/Submit] Test not found for id:', practiceTestId);
      return NextResponse.json(
        { error: `Practice test not found. ID: ${practiceTestId}` },
        { status: 404 },
      );
    }

    // STEP 3 — Fetch child context
    const child = await prisma.user.findUnique({
      where: { id: practiceTest.childId },
      select: { name: true, grade: true, curriculum: true },
    });
    const studentName = child?.name ?? 'Student';
    const grade = child?.grade ?? 10;
    const board = String(child?.curriculum ?? 'CBSE');

    // STEP 4 — Parse stored questions (includes correct_answer — never sent to client before this)
    let questions: any[];
    try {
      questions = JSON.parse(practiceTest.questionsJson);
    } catch {
      return NextResponse.json({ error: 'Invalid practice test data' }, { status: 500 });
    }

    // STEP 5 — Call Gemini
    const prompt = buildEvalPrompt(
      questions,
      answers,
      studentName,
      grade,
      board,
      practiceTest.subject,
    );

    let feedback: any = null;
    let lastError: string | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await Promise.race([
          callGeminiWithRetry(prompt, 2048),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('LLM request timeout')), LLM_TIMEOUT_MS),
          ),
        ]);

        logAiCredit({
          userId: practiceTest.childId,
          userRole: 'STUDENT',
          feature: 'PRACTICE_FEEDBACK',
          promptTokens: 0,
          completionTokens: 0,
        }).catch(console.error);

        console.log(
          `[Practice/Submit] model=${response.modelUsed} fallback=${response.usedFallback}`,
        );

        feedback = parseFeedback(response.text);
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
      console.error('[Practice/Submit] LLM evaluation failed:', lastError);
      return NextResponse.json(
        { error: 'Failed to evaluate practice test. Please try again.' },
        { status: 503 },
      );
    }

    // STEP 6 — Save attempt to DB
    const normalizedScore = toSafeFloat(feedback.percentage);
    const normalizedMarksAwarded = toSafeInt(feedback.total_marks_awarded);
    const normalizedMarksPossible = toSafeInt(feedback.total_marks_possible);

    const savedAttempt = await prisma.practiceAttempt.create({
      data: {
        practiceTestId,
        childId: practiceTest.childId,
        answersJson: JSON.stringify(answers),
        feedbackJson: JSON.stringify(feedback),
        score: normalizedScore,
        marksAwarded: normalizedMarksAwarded,
        marksPossible: normalizedMarksPossible,
        timeTakenSecs: timeTakenSecs ?? null,
        completedAt: new Date(),
      },
    });

    awardXP(practiceTest.childId, 'PRACTICE_COMPLETE', savedAttempt.id.toString()).catch(() => {});
    if (normalizedScore === 100) {
      awardXP(practiceTest.childId, 'SCORE_PERFECT').catch(() => {});
    } else if (normalizedScore !== null && normalizedScore >= 90) {
      awardXP(practiceTest.childId, 'SCORE_ABOVE_90').catch(() => {});
    }

    // STEP 7 — Return feedback
    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    console.error('[POST /api/practice/submit] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
