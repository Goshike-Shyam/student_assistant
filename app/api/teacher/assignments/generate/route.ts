/**
 * TEACHER ASSIGNMENT GENERATE CONTRACT
 * - Saves to teacher_assignments table (NOT generatedAssignment)
 * - Strips correct_answer before returning to client
 * - Auto-creates NOT_STARTED submission rows for all enrolled students
 * - Uses callGeminiWithRetry() — same retry pattern as student assignments
 * - Calls logAiCredit() with userRole: 'TEACHER'
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'
import { callGeminiWithRetry } from '@/lib/ai-with-retry'
import { logAiCredit } from '@/lib/ai-credit-logger'

const LLM_TIMEOUT_MS = 45000

function normaliseQuestionType(raw: string): string {
  const map: Record<string, string> = {
    mcq: 'MCQ', 'multiple choice': 'MCQ', multiple_choice: 'MCQ', MCQ: 'MCQ',
    'short answer': 'SHORT_ANSWER', short_answer: 'SHORT_ANSWER', SHORT_ANSWER: 'SHORT_ANSWER', short: 'SHORT_ANSWER',
    'long answer': 'LONG_ANSWER', long_answer: 'LONG_ANSWER', LONG_ANSWER: 'LONG_ANSWER', long: 'LONG_ANSWER', essay: 'LONG_ANSWER',
    'fill in the blank': 'FILL_BLANK', fill_in_the_blank: 'FILL_BLANK', fill_blank: 'FILL_BLANK', FILL_BLANK: 'FILL_BLANK',
    'true/false': 'TRUE_FALSE', true_false: 'TRUE_FALSE', TRUE_FALSE: 'TRUE_FALSE', truefalse: 'TRUE_FALSE',
    'true or false': 'TRUE_FALSE', 't/f': 'TRUE_FALSE', 'True/False': 'TRUE_FALSE',
  }
  if (!raw) return 'SHORT_ANSWER'
  return map[raw.trim()] ?? map[raw.trim().toLowerCase()] ?? 'SHORT_ANSWER'
}

function buildPrompt(grade: string, board: string, subject: string, topic: string, complexity: string): string {
  return `You are a ${board} curriculum teacher creating a class assignment for Grade ${grade}.
Generate a ${complexity} assignment on "${topic}" for subject "${subject}" suitable for all students in the class.
Return ONLY valid JSON in this exact format, no markdown or extra text:
{
  "title": "Assignment Title",
  "topic": "${topic}",
  "instructions": "Clear instructions for students",
  "questions": [
    {
      "id": 1,
      "type": "MCQ",
      "question": "Multiple choice question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "marks": 1,
      "correct_answer": "Option 1",
      "brief_explanation": "Why this is correct"
    },
    {
      "id": 2,
      "type": "SHORT_ANSWER",
      "question": "Short answer question",
      "options": null,
      "marks": 3,
      "correct_answer": "Expected answer",
      "brief_explanation": "Key points to award marks"
    },
    {
      "id": 3,
      "type": "LONG_ANSWER",
      "question": "Long answer question",
      "options": null,
      "marks": 5,
      "correct_answer": "Detailed expected answer",
      "brief_explanation": "Rubric for grading"
    }
  ],
  "total_marks": 20,
  "estimated_minutes": 45
}
IMPORTANT: Generate at least 5 questions. Type must be one of: MCQ, SHORT_ANSWER, LONG_ANSWER, FILL_BLANK, TRUE_FALSE.`
}

export async function POST(request: NextRequest) {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { classId, subject, topic, complexity, dueDate, instructions, isDraft } = await request.json()

    if (!classId || !subject || !topic || !complexity || !dueDate) {
      return NextResponse.json({ error: 'classId, subject, topic, complexity, and dueDate are required' }, { status: 400 })
    }

    const teacherId = BigInt(session.teacherId)
    const classIdBig = BigInt(classId)

    const cls = await prisma.teacherClass.findFirst({
      where: { id: classIdBig, teacherId },
    })
    if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

    const prompt = buildPrompt(cls.grade, cls.board, subject, topic, complexity)
    const start = Date.now()

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('LLM_TIMEOUT')), LLM_TIMEOUT_MS),
    )
    const aiResult = await Promise.race([callGeminiWithRetry(prompt, 4096), timeoutPromise])

    const latencyMs = Date.now() - start

    // Parse AI response
    let parsed: any
    try {
      const cleaned = aiResult.text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 502 })
    }

    const questions = (parsed.questions ?? []).map((q: any, idx: number) => ({
      ...q,
      id: idx + 1,
      type: normaliseQuestionType(q.type),
    }))

    const totalMarks = questions.reduce((s: number, q: any) => s + (Number(q.marks) || 0), 0)

    const isPublished = isDraft !== true

    const saved = await prisma.teacherAssignment.create({
      data: {
        teacherId,
        classId: classIdBig,
        subject,
        topic,
        complexity,
        instructions: instructions?.trim() ?? parsed.instructions ?? null,
        questionsJson: questions,
        totalMarks,
        dueDate: new Date(dueDate),
        isPublished,
      },
    })

    // Auto-create NOT_STARTED submission rows for all enrolled students
    if (isPublished) {
      const enrollments = await prisma.classEnrollment.findMany({
        where: { classId: classIdBig },
        select: { childId: true },
      })

      if (enrollments.length > 0) {
        await prisma.$transaction(
          enrollments.map((e) =>
            prisma.teacherAssignmentSubmission.upsert({
              where: {
                uq_submission: {
                  teacherAssignmentId: saved.id,
                  childId: e.childId,
                },
              },
              create: {
                teacherAssignmentId: saved.id,
                childId: e.childId,
                status: 'NOT_STARTED',
              },
              update: {},
            }),
          ),
        )
      }
    }

    // Log AI credit
    await logAiCredit({
      userId: session.teacherId,
      userRole: 'TEACHER',
      feature: 'teacher_assignment_generate',
      promptTokens: Math.ceil(prompt.length / 4),
      completionTokens: Math.ceil(aiResult.text.length / 4),
      latencyMs,
    }).catch(() => {})

    // Strip correct_answer before returning
    const questionsForClient = questions.map((q: any) => {
      const { correct_answer, ...rest } = q
      return rest
    })

    const enrolledCount = await prisma.classEnrollment.count({ where: { classId: classIdBig } })

    return NextResponse.json({
      assignmentId: saved.id.toString(),
      title: parsed.title ?? topic,
      questions: questionsForClient,
      totalMarks,
      dueDate: saved.dueDate,
      enrolledCount,
      isPublished,
    }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'LLM_TIMEOUT') {
      return NextResponse.json({ error: 'AI generation timed out. Please try again.' }, { status: 504 })
    }
    console.error('[teacher/assignments/generate]', err)
    return NextResponse.json({ error: 'Failed to generate assignment' }, { status: 500 })
  }
}
