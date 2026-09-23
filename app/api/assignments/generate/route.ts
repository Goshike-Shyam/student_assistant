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
import { getSubjectLabel } from '@/lib/subjects/config'
import { buildStudentPrompt, normaliseGrade } from '@/lib/ai-prompt-builder'

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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AssignmentGenerateRequest;
    const { child_id, subject, grade, board, topic, complexity } = body;

    if (!child_id || !subject || !grade || !board || !topic || !complexity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prefs = await (prisma as any).studentPreferences.findUnique({
      where: { childId: child_id },
      select: { responseLanguage: true },
    })
    const responseLanguage = typeof prefs?.responseLanguage === 'string' ? prefs.responseLanguage : 'en'

    const subjectLabel = getSubjectLabel(String(subject)) ?? String(subject ?? 'General');
    const prompt = buildStudentPrompt({
      grade: normaliseGrade(grade as string | number),
      board: String(board ?? 'CBSE'),
      subject: subjectLabel,
      topic: String(topic ?? subjectLabel),
      taskType: 'ASSIGNMENT',
      query: (body as any).additionalInstructions ?? undefined,
      difficulty: String(complexity ?? 'medium').toLowerCase() === 'easy'
        ? 'easy'
        : String(complexity ?? 'medium').toLowerCase() === 'hard'
          ? 'hard'
          : 'medium',
      responseLanguage,
    });

    // ── Rate limit check ──────────────────────
    const rl = await checkRateLimit(request, 'RESEARCH', child_id)
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: 'RATE LIMIT EXCEEDED',
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
          callGeminiWithRetry(prompt, 3000),
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
        const sectionQuestions = Array.isArray(parsed.sections)
          ? parsed.sections.flatMap((section: any) =>
              Array.isArray(section.questions)
                ? section.questions.map((question: any) => ({
                    ...question,
                    section: section.name ?? null,
                    sectionType: section.type ?? null,
                  }))
                : [],
            )
          : [];

        const parsedQuestions = Array.isArray(parsed.questions)
          ? parsed.questions
          : sectionQuestions;

        if (parsed.title && parsed.topic && parsed.instructions && parsedQuestions.length > 0) {
          // Normalise all question type strings before saving — safety net for AI variance
          parsed.questions = parsedQuestions.map((q: any) => ({
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

