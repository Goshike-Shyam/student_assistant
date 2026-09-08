/**
 * GENERATE CONTRACT — DO NOT BREAK
 * NEVER return a temp_ or client-generated ID.
 * Assignment MUST be saved to DB (prisma.generatedAssignment.create)
 * BEFORE this route returns a response.
 * The returned assignmentId MUST be savedAssignment.id from the DB row — nothing else.
 * This route calls Gemini directly — it does NOT proxy to the Express server.
 * Client uses this ID for submission — if fake/temp, submit gets 404.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { callGeminiWithRetry } from '@/lib/ai-with-retry';
import { checkRateLimit } from '@/lib/rate-limit'
import { logAiCredit } from '@/lib/ai-credit-logger';
import { AssignmentGenerateRequest } from '@/types/assignments';

const LLM_TIMEOUT_MS = 45000;

/**
 * Normalise any type string Gemini may return to the canonical form
 * used throughout the codebase (types/assignments.ts QuestionType).
 * Unknown types fall back to SHORT_ANSWER — never crash.
 */
function normaliseQuestionType(raw: string): string {
  const map: Record<string, string> = {
    // MCQ variants
    'mcq':               'MCQ',
    'multiple choice':   'MCQ',
    'multiple_choice':   'MCQ',
    'MCQ':               'MCQ',
    // SHORT_ANSWER variants
    'short answer':      'SHORT_ANSWER',
    'short_answer':      'SHORT_ANSWER',
    'SHORT_ANSWER':      'SHORT_ANSWER',
    'short':             'SHORT_ANSWER',
    // LONG_ANSWER variants
    'long answer':       'LONG_ANSWER',
    'long_answer':       'LONG_ANSWER',
    'LONG_ANSWER':       'LONG_ANSWER',
    'long':              'LONG_ANSWER',
    'essay':             'LONG_ANSWER',
    // FILL_BLANK variants
    'fill in the blank': 'FILL_BLANK',
    'fill_in_the_blank': 'FILL_BLANK',
    'fill blank':        'FILL_BLANK',
    'fill_blank':        'FILL_BLANK',
    'FILL_BLANK':        'FILL_BLANK',
    'fill in blank':     'FILL_BLANK',
    // TRUE_FALSE variants
    'true/false':        'TRUE_FALSE',
    'true_false':        'TRUE_FALSE',
    'TRUE_FALSE':        'TRUE_FALSE',
    'truefalse':         'TRUE_FALSE',
    'true or false':     'TRUE_FALSE',
    't/f':               'TRUE_FALSE',
    'True/False':        'TRUE_FALSE',
  };
  if (!raw) return 'SHORT_ANSWER';
  // Try exact match first, then case-insensitive
  return map[raw.trim()] ?? map[raw.trim().toLowerCase()] ?? 'SHORT_ANSWER';
}

function buildGeneratePrompt(
  board: string,
  grade: number,
  subject: string,
  topic: string,
  complexity: string
): string {
  return `You are a ${board} curriculum teacher for Grade ${grade}.
Generate a ${complexity} assignment on "${topic}" for subject "${subject}".
Return ONLY valid JSON in this exact format, no markdown or extra text:
{
  "title": "Assignment Title",
  "topic": "${topic}",
  "instructions": "Clear instructions for the assignment",
  "questions": [
    {
      "id": 1,
      "type": "MCQ",
      "question": "Multiple choice question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "marks": 1,
      "correct_answer": "Option 1"
    },
    {
      "id": 2,
      "type": "TRUE_FALSE",
      "question": "True or false statement",
      "options": ["True", "False"],
      "marks": 1,
      "correct_answer": "True"
    },
    {
      "id": 3,
      "type": "FILL_BLANK",
      "question": "The capital of France is ___.",
      "options": null,
      "marks": 1,
      "correct_answer": "Paris"
    },
    {
      "id": 4,
      "type": "SHORT_ANSWER",
      "question": "Short answer question text",
      "options": null,
      "marks": 2,
      "correct_answer": "Expected short answer"
    },
    {
      "id": 5,
      "type": "LONG_ANSWER",
      "question": "Long answer question text",
      "options": null,
      "marks": 5,
      "correct_answer": "Expected detailed answer"
    }
  ],
  "total_marks": 20,
  "estimated_minutes": 45
}
IMPORTANT: The "type" field MUST be exactly one of these strings: "MCQ", "SHORT_ANSWER", "LONG_ANSWER", "FILL_BLANK", "TRUE_FALSE". No spaces, no other variants.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AssignmentGenerateRequest;
    const { child_id, subject, grade, board, topic, complexity } = body;

    if (!child_id || !subject || !grade || !board || !topic || !complexity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = buildGeneratePrompt(board, grade as number, subject, topic, complexity);

    // ── Rate limit check ──────────────────────
    const rl = await checkRateLimit(request, 'RESEARCH', child_id)
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: rl.message,
          feature: 'RESEARCH',
          retryAfterSecs: rl.retryAfterSecs,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rl.retryAfterSecs ?? 86400),
            'X-RateLimit-Limit': String(rl.childLimit ?? 5),
            'X-RateLimit-Remaining': '0',
          },
        },
      )
    }

    let assignmentData: any = null;
    let lastError = '';

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await Promise.race([
          callGeminiWithRetry(prompt, 2048),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('LLM timeout')), LLM_TIMEOUT_MS)
          ),
        ]);

        const responseText = result.text;

        // Log AI credit (fire-and-forget)
        logAiCredit({
          userId: child_id,
          userRole: 'STUDENT',
          feature: 'ASSIGNMENT_GEN',
          promptTokens: 0,
          completionTokens: 0,
        }).catch(console.error);

        console.log(
          `[Generate] model=${result.modelUsed} fallback=${result.usedFallback} attempts=${result.attemptsTaken}`,
        );

        // Strip markdown fences, extract outermost JSON object
        const stripped = responseText
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```\s*$/, '')
          .trim();
        const jsonMatch = stripped.match(/\{[\s\S]*\}/);
        if (!jsonMatch) { lastError = 'No JSON in response'; continue; }

        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.title && parsed.topic && parsed.instructions && Array.isArray(parsed.questions)) {
          // Normalise all question type strings before saving — safety net for AI variance
          parsed.questions = parsed.questions.map((q: any) => ({
            ...q,
            type: normaliseQuestionType(q.type),
          }));
          assignmentData = parsed;
          break;
        }
        lastError = 'Invalid JSON structure from LLM';
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Unknown error';
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }

    if (!assignmentData) {
      const isBusy =
        lastError.toLowerCase().includes('unavailable') ||
        lastError.includes('503') ||
        lastError.toLowerCase().includes('models failed') ||
        lastError.toLowerCase().includes('overloaded');
      return NextResponse.json(
        {
          error: isBusy
            ? 'AI service is temporarily busy. Please try again in a few seconds.'
            : `Failed to generate assignment. ${lastError}`,
        },
        { status: 503 }
      );
    }

    const totalMarks: number = assignmentData.questions.reduce(
      (sum: number, q: any) => sum + (q.marks || 0),
      0
    );

    // Save to DB BEFORE returning — this is the only source of a valid assignmentId
    const savedAssignment = await prisma.generatedAssignment.create({
      data: {
        childId:          child_id,
        subject,
        topic:            assignmentData.topic,
        title:            assignmentData.title,
        instructions:     assignmentData.instructions,
        board,
        grade:            typeof grade === 'string' ? parseInt(grade as string, 10) : (grade as number),
        complexity,
        questionsJson:    JSON.stringify(assignmentData.questions), // retains correct_answer for grading
        totalMarks,
        estimatedMinutes: assignmentData.estimated_minutes ?? 45,
      },
    });

    console.log('[Generate] DB assignment id:', savedAssignment.id);

    // Strip correct_answer before sending questions to client
    const clientQuestions = assignmentData.questions.map(
      ({ correct_answer, ...rest }: any) => rest
    );

    return NextResponse.json(
      {
        assignmentId:     savedAssignment.id, // REAL DB UUID — never a temp value
        title:            assignmentData.title,
        topic:            assignmentData.topic,
        instructions:     assignmentData.instructions,
        questions:        clientQuestions,
        totalMarks,
        estimatedMinutes: assignmentData.estimated_minutes ?? 45,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/assignments/generate] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

