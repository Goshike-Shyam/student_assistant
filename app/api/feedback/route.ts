import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { callGeminiWithRetry } from '@/lib/ai-with-retry'
import { getParentSession } from '@/lib/parent-auth'
import { getTeacherSession } from '@/lib/teacher-auth'
import { COOKIE_NAMES } from '@/lib/session-config'

type Tone = 'Appreciation' | 'Improvement' | 'Frustration'

function parseStudentIdFromCookie(raw: string | undefined): string | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { userId?: string }
    const userId = String(parsed?.userId ?? '').trim()
    return userId || null
  } catch {
    return null
  }
}

async function classifyTone(text: string): Promise<Tone> {
  const fallbackByKeyword = (): Tone => {
    const lower = text.toLowerCase()
    if (
      lower.includes('thank') ||
      lower.includes('great') ||
      lower.includes('love') ||
      lower.includes('excellent') ||
      lower.includes('amazing')
    ) {
      return 'Appreciation'
    }
    if (
      lower.includes('frustrat') ||
      lower.includes('disappoint') ||
      lower.includes('terrible') ||
      lower.includes('useless') ||
      lower.includes('hate')
    ) {
      return 'Frustration'
    }
    return 'Improvement'
  }

  try {
    const prompt = `You are a sentiment classifier.
Read the following user feedback and classify it into EXACTLY ONE of these three categories:
- Appreciation: positive, happy, grateful, complimentary feedback
- Improvement: constructive suggestions, feature requests, neutral observations
- Frustration: negative, angry, upset, complaints, dissatisfied feedback

Respond with ONLY one word - either Appreciation, Improvement, or Frustration.
No punctuation. No explanation.

Feedback text:
"${text.slice(0, 500)}"`

    const result = await callGeminiWithRetry(prompt, 10)
    const raw = (result?.text ?? '').trim().replace(/[^a-zA-Z]/g, '')

    if (raw === 'Appreciation' || raw === 'Improvement' || raw === 'Frustration') {
      return raw
    }

    return fallbackByKeyword()
  } catch {
    return 'Appreciation'
  }
}

async function resolveSubmitter(req: NextRequest): Promise<{ role: 'student' | 'parent' | 'teacher'; userId: string } | null> {
  const parentSession = await getParentSession()
  if (parentSession) {
    return {
      role: 'parent',
      userId: String(parentSession.parentId),
    }
  }

  const teacherSession = await getTeacherSession()
  if (teacherSession) {
    return {
      role: 'teacher',
      userId: String(teacherSession.teacherId),
    }
  }

  const jar = await cookies()
  const cookieStudentId = parseStudentIdFromCookie(jar.get(COOKIE_NAMES.student)?.value)
  if (cookieStudentId) {
    return {
      role: 'student',
      userId: cookieStudentId,
    }
  }

  const headerStudentId = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('userId')
  if (headerStudentId) {
    return {
      role: 'student',
      userId: String(headerStudentId),
    }
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const submitter = await resolveSubmitter(req)
    if (!submitter) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const displayName = String(body?.displayName ?? '').trim()
    const feedbackText = String(body?.feedbackText ?? '').trim()
    const attachmentUrl = body?.attachmentUrl ? String(body.attachmentUrl) : null
    const attachmentName = body?.attachmentName ? String(body.attachmentName) : null

    if (!displayName) {
      return NextResponse.json({ error: 'Display name required' }, { status: 400 })
    }

    if (!feedbackText || feedbackText.length < 10) {
      return NextResponse.json(
        { error: 'Feedback must be at least 10 characters' },
        { status: 400 },
      )
    }

    const tone = await classifyTone(feedbackText)
    console.log(`[Feedback] tone: ${tone}`)

    const record = await prisma.feedback.create({
      data: {
        userRole: submitter.role,
        userId: submitter.userId,
        displayName: displayName.slice(0, 100),
        feedbackText,
        attachmentUrl: attachmentUrl ? attachmentUrl.slice(0, 500) : null,
        attachmentName: attachmentName ? attachmentName.slice(0, 200) : null,
        tone,
        showOnHomepage: false,
      },
      select: {
        id: true,
        tone: true,
      },
    })

    return NextResponse.json({
      ok: true,
      id: record.id.toString(),
      tone: record.tone,
    })
  } catch (err) {
    console.error('[Feedback POST]', err)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}
