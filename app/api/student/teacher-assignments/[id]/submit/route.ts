/**
 * STUDENT SUBMIT — Teacher Assignment
 * 1. Save answers + status = SUBMITTED
 * 2. Run AI evaluation (same Gemini prompt as student assignments)
 * 3. Save to ai_feedback_json (NEVER returned to student)
 * 4. Student sees "Under review" until teacher releases
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { callGeminiWithRetry } from '@/lib/ai-with-retry'
import { logAiCredit } from '@/lib/ai-credit-logger'
import { createNotification } from '@/lib/notifications'
import { awardXP } from '@/lib/gamification/xp'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Student auth uses localStorage — userId passed as query param or header
  const childId =
    request.nextUrl.searchParams.get('userId') ||
    request.headers.get('x-user-id')
  if (!childId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { answers } = await request.json()
    const { id } = await params
    const submissionId = BigInt(id)

    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: 'answers array is required' }, { status: 400 })
    }

    // Fetch submission + assignment
    const submission = await prisma.teacherAssignmentSubmission.findFirst({
      where: { id: submissionId, childId },
      include: {
        assignment: true,
        child: { select: { name: true } },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (!['NOT_STARTED', 'IN_PROGRESS'].includes(submission.status)) {
      return NextResponse.json({ error: 'Assignment already submitted' }, { status: 409 })
    }

    const now = new Date()

    // Update to SUBMITTED first
    await prisma.teacherAssignmentSubmission.update({
      where: { id: submissionId },
      data: {
        answersJson: answers,
        submittedAt: now,
        status: 'SUBMITTED',
      },
    })

    awardXP(childId, 'ASSIGNMENT_SUBMIT', submissionId.toString()).catch(() => {})

    await createNotification({
      userId: submission.assignment.teacherId.toString(),
      userRole: 'TEACHER',
      title: `${submission.child.name} submitted`,
      body: `"${submission.assignment.topic}" (${submission.assignment.subject}) is ready for review.`,
      href: `/teacher/assignments/${submission.assignment.id.toString()}/review`,
      priority: 'high',
      category: 'submission',
    })

    // Run AI evaluation in background (non-blocking to avoid timeout)
    runAiEvaluation(submission.assignment, answers, submissionId, childId).catch((e) =>
      console.error('[teacher-submit] AI eval error:', e),
    )

    return NextResponse.json({
      message: 'Submitted! Your teacher will review and share feedback soon.',
    })
  } catch (err: any) {
    console.error('[student/teacher-assignments/submit POST]', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

async function runAiEvaluation(
  assignment: any,
  answers: any[],
  submissionId: bigint,
  childId: string,
) {
  const questions = assignment.questionsJson as any[]
  const questionText = questions
    .map(
      (q: any, i: number) =>
        `Q${i + 1} [${q.type}, ${q.marks} marks]: ${q.question}\n` +
        (q.options ? `Options: ${q.options.join(', ')}\n` : '') +
        `Correct answer: ${q.correct_answer}\n` +
        `Student answer: ${answers[i]?.answer ?? 'No answer'}`,
    )
    .join('\n\n')

  const prompt = `You are an AI teacher evaluating a student's assignment submission.
Assignment: ${assignment.subject} — ${assignment.topic}

${questionText}

Evaluate each answer and return ONLY valid JSON in this exact format:
{
  "overall_feedback": "Overall assessment of the student's performance",
  "total_score": <number out of ${assignment.totalMarks}>,
  "questions": [
    {
      "id": <question id>,
      "marks_awarded": <number>,
      "marks_possible": <number>,
      "is_correct": <boolean>,
      "brief_explanation": "Brief feedback on the answer"
    }
  ]
}`

  const start = Date.now()
  const aiResult = await callGeminiWithRetry(prompt, 2048)
  const latencyMs = Date.now() - start

  let parsed: any
  try {
    const cleaned = aiResult.text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    parsed = { overall_feedback: 'AI evaluation failed', total_score: 0, questions: [] }
  }

  const score = Math.min(
    Math.max(0, Number(parsed.total_score) || 0),
    assignment.totalMarks,
  )

  await prisma.teacherAssignmentSubmission.update({
    where: { id: submissionId },
    data: {
      aiFeedbackJson: parsed,
      score,
    },
  })

  await logAiCredit({
    userId: childId,
    userRole: 'STUDENT',
    feature: 'teacher_assignment_evaluate',
    promptTokens: Math.ceil(prompt.length / 4),
    completionTokens: Math.ceil(aiResult.text.length / 4),
    latencyMs,
  }).catch(() => {})
}
