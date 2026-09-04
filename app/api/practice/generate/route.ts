/**
 * PRACTICE ROUTE CONTRACT
 * Prisma models: prisma.practiceTest    (@@map "practice_tests")
 *                prisma.practiceAttempt (@@map "practice_attempts")
 * NEVER use: prisma.generatedPracticeTest / prisma.generatedPracticeAttempt
 * childId: UUID string from User.id — no conversion needed
 * practiceTestId: saved.id.toString() from DB — never temp_*
 * DB table: practice_tests (public schema, matches DATABASE_URL)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { callGeminiWithRetry } from '@/lib/ai-with-retry';
import { checkRateLimit } from '@/lib/rate-limit'
import { getCachedAIResponse, setCachedAIResponse } from '@/lib/cache/ai-cache'
import { getCachedStudentProfile, setCachedStudentProfile } from '@/lib/cache/session-cache'
import { logAiCredit } from '@/lib/ai-credit-logger';

const LLM_TIMEOUT_MS = 45000;

function normaliseQuestionType(raw: string): string {
  const map: Record<string, string> = {
    mcq: 'MCQ',
    'multiple choice': 'MCQ',
    multiple_choice: 'MCQ',
    MCQ: 'MCQ',
    'short answer': 'SHORT_ANSWER',
    short_answer: 'SHORT_ANSWER',
    SHORT_ANSWER: 'SHORT_ANSWER',
    short: 'SHORT_ANSWER',
    'long answer': 'LONG_ANSWER',
    long_answer: 'LONG_ANSWER',
    LONG_ANSWER: 'LONG_ANSWER',
    long: 'LONG_ANSWER',
    essay: 'LONG_ANSWER',
    'fill in the blank': 'FILL_BLANK',
    fill_in_the_blank: 'FILL_BLANK',
    'fill blank': 'FILL_BLANK',
    fill_blank: 'FILL_BLANK',
    FILL_BLANK: 'FILL_BLANK',
    'fill in blank': 'FILL_BLANK',
    'true/false': 'TRUE_FALSE',
    true_false: 'TRUE_FALSE',
    TRUE_FALSE: 'TRUE_FALSE',
    truefalse: 'TRUE_FALSE',
    'true or false': 'TRUE_FALSE',
    't/f': 'TRUE_FALSE',
    'True/False': 'TRUE_FALSE',
  };
  if (!raw) return 'SHORT_ANSWER';
  return map[raw.trim()] ?? map[raw.trim().toLowerCase()] ?? 'SHORT_ANSWER';
}

function buildPracticePrompt(
  board: string,
  grade: number,
  subject: string,
  topic: string,
  complexity: string,
): string {
  const questionCount =
    complexity === 'Easy' ? 5 : complexity === 'Medium' ? 8 : 10;

  return `You are a ${board} Grade ${grade} ${subject} teacher.
Generate a practice test on "${topic}" with complexity "${complexity}".
Return ONLY valid JSON, no markdown or extra text:
{
  "title": "string — descriptive test title",
  "topic": "${topic}",
  "duration_mins": number,
  "questions": [
    {
      "id": 1,
      "type": "MCQ",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "marks": 1,
      "correct_answer": "A",
      "hint": "Brief hint to help if stuck"
    }
  ],
  "total_marks": number
}
RULES:
- Generate exactly ${questionCount} questions (${complexity === 'Mixed' ? 'mix of all types' : `all ${complexity} difficulty`})
- MCQ: 4 options, single correct answer
- TRUE_FALSE: options ["True","False"]
- FILL_BLANK: options null, correct_answer is the word/phrase
- SHORT_ANSWER: options null, 2-3 marks
- LONG_ANSWER: options null, 4-5 marks
- LONG_ANSWER: only include for Hard or Mixed complexity
- "type" MUST be exactly one of: "MCQ","SHORT_ANSWER","LONG_ANSWER","FILL_BLANK","TRUE_FALSE"
- Language appropriate for Grade ${grade} ${board} curriculum
- No violent, political, or inappropriate content
- Each question has a brief hint`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childId, subject, topic, complexity } = body as {
      childId?: string;
      subject?: string;
      topic?: string;
      complexity?: string;
    };

    if (!childId || !subject || !topic || !complexity) {
      return NextResponse.json({ error: 'childId, subject, topic, and complexity are required' }, { status: 400 });
    }

    // Fetch child data for grade-aware prompt (session cache first)
    const cached = await getCachedStudentProfile(childId).catch(() => null)
    let child: any = null
    if (cached) {
      child = cached
    } else {
      child = await prisma.user.findUnique({
        where: { id: childId },
        select: { grade: true, curriculum: true, name: true },
      });
      if (child) {
        // Backfill short-lived session cache (fire-and-forget)
        setCachedStudentProfile(childId, {
          id: childId,
          name: child.name ?? '',
          grade: String(child.grade ?? '10'),
          board: String(child.curriculum ?? 'CBSE'),
          subjects: [],
          subscriptionStatus: 'ACTIVE',
          gamificationOn: true,
          dashboardTheme: 'classic',
          comicTheme: 'none',
          loginStreak: 0,
        }).catch(() => {})
      }
    }

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const grade = child?.grade ?? 10;
    const board = child?.curriculum ?? 'CBSE';
    const prompt = buildPracticePrompt(String(board), grade, subject, topic, complexity);

    // ── Rate limit check ──────────────────────
    const rl = await checkRateLimit(request, 'RESEARCH', childId)
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

    // ── AI response cache check ─────────────────
    const cachedResponse = await getCachedAIResponse(
      topic,
      String(grade),
      String(board ?? 'CBSE'),
      subject,
    ).catch(() => null)

    if (cachedResponse) {
      try {
        const stripped = cachedResponse.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
        const jsonMatch = stripped.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.title && parsed.topic && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            parsed.questions = parsed.questions.map((q: any) => ({ ...q, type: normaliseQuestionType(q.type) }));

            const totalMarks: number = parsed.questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);

            const saved = await prisma.practiceTest.create({
              data: {
                childId,
                subject,
                topic: parsed.topic,
                complexity,
                questionsJson: JSON.stringify(parsed.questions),
                totalMarks,
                durationMins: parsed.duration_mins ?? 15,
              },
            });

            const clientQuestions = parsed.questions.map((q: any) => {
              const { correct_answer, hint, ...clientQ } = q;
              return clientQ;
            });

            return NextResponse.json({
              practiceTestId: saved.id.toString(),
              title: parsed.title,
              topic: parsed.topic,
              questions: clientQuestions,
              totalMarks,
              durationMins: saved.durationMins,
              cached: true,
            });
          }
        }
      } catch (e) {
        // fallthrough to live generation on any parse error
      }
    }

    let testData: any = null;
    let lastError = '';

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await Promise.race([
          callGeminiWithRetry(prompt, 2048),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('LLM timeout')), LLM_TIMEOUT_MS),
          ),
        ]);

        logAiCredit({
          userId: childId,
          userRole: 'STUDENT',
          feature: 'PRACTICE_GENERATE',
          promptTokens: 0,
          completionTokens: 0,
        }).catch(console.error);

        console.log(
          `[Practice/Generate] model=${result.modelUsed} fallback=${result.usedFallback}`,
        );

        const stripped = result.text
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```\s*$/, '')
          .trim();
        const jsonMatch = stripped.match(/\{[\s\S]*\}/);
        if (!jsonMatch) { lastError = 'No JSON in response'; continue; }

        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.title && parsed.topic && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          parsed.questions = parsed.questions.map((q: any) => ({
            ...q,
            type: normaliseQuestionType(q.type),
          }));
          testData = parsed;
          break;
        }
        lastError = 'Invalid JSON structure from LLM';
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Unknown error';
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }

    if (!testData) {
      const isBusy =
        lastError.toLowerCase().includes('unavailable') ||
        lastError.includes('503') ||
        lastError.toLowerCase().includes('models failed') ||
        lastError.toLowerCase().includes('overloaded');
      return NextResponse.json(
        {
          error: isBusy
            ? 'AI service is temporarily busy. Please try again in a few seconds.'
            : `Failed to generate practice test. ${lastError}`,
        },
        { status: 503 },
      );
    }

    const totalMarks: number = testData.questions.reduce(
      (sum: number, q: any) => sum + (q.marks || 0),
      0,
    );

    // Save to DB BEFORE responding — practiceTestId is always a real DB UUID
    const saved = await prisma.practiceTest.create({
      data: {
        childId,
        subject,
        topic: testData.topic,
        complexity,
        questionsJson: JSON.stringify(testData.questions), // retains correct_answer and hint for grading
        totalMarks,
        durationMins: testData.duration_mins ?? 15,
      },
    });

    // Strip correct_answer and hint before returning to client
    const clientQuestions = testData.questions.map((q: any) => {
      const { correct_answer, hint, ...clientQ } = q;
      return clientQ;
    });

    return NextResponse.json({
      practiceTestId: saved.id.toString(), // always a real DB id — never temp_*
      title: testData.title,
      topic: testData.topic,
      questions: clientQuestions,
      totalMarks,
      durationMins: saved.durationMins,
    });
  } catch (error) {
    console.error('[POST /api/practice/generate] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
