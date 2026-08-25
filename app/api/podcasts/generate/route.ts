import { NextRequest, NextResponse } from 'next/server'
import { getTeacherSession } from '@/lib/teacher-auth'
import { prisma } from '@/lib/prismaClient'
import { hasFeatureAccess } from '@/lib/feature-access'
import { generatePodcastScript, generateInterruptionAnswer } from '@/lib/podcast-script'
import { generatePodcastSegments, generateAnswerAudio, activeProvider } from '@/lib/tts-provider'
import { logAiCredit } from '@/lib/ai-credit-logger'

/**
 * PODCAST GENERATE CONTRACT
 * POST mode=podcast -> full segment generation
 * POST mode=answer  -> interruption answer generation
 * GET -> feature access check for current role/user
 */
function safeId(raw: string | number | null | undefined): string | null {
  if (raw === null || raw === undefined || raw === '') return null
  const str = String(raw).trim()
  if (str.length > 0) return str
  return null
}

function isBindFormatError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return message.includes('incorrect binary data format in bind parameter')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      topic,
      subject,
      response,
      queryId,
      role,
      userId: studentUserId,
      mode,
      question,
    } = body

    let userId: string
    let userRole: 'STUDENT' | 'TEACHER'
    let grade = '7'

    if (role === 'TEACHER') {
      const session = await getTeacherSession()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = session.teacherId
      userRole = 'TEACHER'
    } else {
      if (!topic || !subject || !response) {
        return NextResponse.json(
          { error: 'topic, subject and response required' },
          { status: 400 },
        )
      }

      if (!studentUserId) {
        return NextResponse.json(
          { error: 'Unauthorized: missing student userId' },
          { status: 401 },
        )
      }

      const student = await (async () => {
        try {
          return prisma.user.findFirst({
            where: { id: String(studentUserId), role: 'STUDENT' },
            select: { id: true, grade: true },
          })
        } catch {
          return null
        }
      })()

      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }

      userId = student.id
      userRole = 'STUDENT'
      grade = String(student.grade ?? 6)
    }

    const canUsePodcast = await hasFeatureAccess(userId, userRole, 'PODCAST')
    if (!canUsePodcast) {
      return NextResponse.json(
        {
          error: 'FEATURE_NOT_ENABLED',
          message:
            'Podcast feature is not enabled for your account. Please contact your administrator.',
        },
        { status: 403 },
      )
    }

    if (mode === 'answer') {
      if (!question || !response) {
        return NextResponse.json(
          { error: 'question and response required' },
          { status: 400 },
        )
      }

      const startMs = Date.now()
      const answerText = await generateInterruptionAnswer(
        String(question),
        String(topic ?? 'Research topic'),
        String(subject ?? 'General'),
        grade,
        String(response),
      )

      const answerResult = await generateAnswerAudio(answerText, userId)

      logAiCredit({
        userId,
        userRole,
        feature: 'PODCAST_QA',
        modelProvider: activeProvider === 'edge' ? 'MICROSOFT' : 'ELEVENLABS',
        modelName: activeProvider === 'edge' ? 'msedge-tts-neural' : 'elevenlabs-tts-flash',
        promptTokens: answerResult.charCount,
        completionTokens: 0,
        latencyMs: Date.now() - startMs,
      }).catch(console.error)

      return NextResponse.json({
        answerText,
        audioUrl: answerResult.audioUrl,
        durationSecs: answerResult.durationSecs,
      })
    }

    if (!topic || !subject || !response) {
      return NextResponse.json(
        { error: 'topic, subject and response required' },
        { status: 400 },
      )
    }

    const queryIdSafe = safeId(queryId)

    if (queryIdSafe !== null) {
      const existing = await prisma.podcast
        .findFirst({
          where: { queryId: queryIdSafe },
          select: { id: true, audioUrl: true, durationSecs: true, segmentsJson: true },
        })
        .catch((err) => {
          if (isBindFormatError(err)) {
            console.warn('[Podcast/Generate] cache lookup skipped due to queryId bind type mismatch')
            return null
          }
          throw err
        })

      if (existing?.segmentsJson) {
        let parsedSegments: unknown[] = []
        try {
          parsedSegments = JSON.parse(existing.segmentsJson)
        } catch {
          parsedSegments = []
        }

        return NextResponse.json({
          podcastId: existing.id.toString(),
          segments: parsedSegments,
          durationSecs: existing.durationSecs ?? 0,
          cached: true,
        })
      }
    }

    const startMs = Date.now()
    const script = await generatePodcastScript(topic, subject, grade, response)

    const ttsResult = await generatePodcastSegments(script, userId)
    const durationSecs = ttsResult.segmentCount * 8

    const queryIdForSave = queryIdSafe ?? null

    const podcast = await prisma.podcast
      .create({
        data: {
          queryId: queryIdForSave as any,
          audioUrl: ttsResult.segments[0]?.audioUrl ?? '',
          segmentsJson: JSON.stringify(ttsResult.segments),
          durationSecs,
          filePath: ttsResult.segments[0]?.filePath ?? '',
        },
      })
      .catch(async (err) => {
        if (!isBindFormatError(err)) throw err

        console.warn('[Podcast/Generate] create retried with queryId=null due to bind type mismatch')
        return prisma.podcast.create({
          data: {
            queryId: null,
            audioUrl: ttsResult.segments[0]?.audioUrl ?? '',
            segmentsJson: JSON.stringify(ttsResult.segments),
            durationSecs,
            filePath: ttsResult.segments[0]?.filePath ?? '',
          },
        })
      })

    logAiCredit({
      userId,
      userRole,
      feature: 'PODCAST',
      modelProvider: activeProvider === 'edge' ? 'MICROSOFT' : 'ELEVENLABS',
      modelName: activeProvider === 'edge' ? 'msedge-tts-neural' : 'elevenlabs-tts-flash',
      promptTokens: ttsResult.totalChars,
      completionTokens: 0,
      latencyMs: Date.now() - startMs,
    }).catch(console.error)

    return NextResponse.json({
      podcastId: podcast.id.toString(),
      segments: ttsResult.segments,
      durationSecs,
      script,
      cached: false,
    })
  } catch (err: any) {
    const isAuthErr =
      err?.statusCode === 401 ||
      err?.message?.includes('401') ||
      err?.message?.includes('Unauthorized')

    const isBillingErr =
      err?.statusCode === 402 ||
      err?.message?.includes('402') ||
      err?.message?.toLowerCase?.().includes('payment required')

    const isQuotaErr =
      err?.statusCode === 429 ||
      err?.message?.toLowerCase?.().includes('quota') ||
      err?.message?.toLowerCase?.().includes('rate limit')

    if (isAuthErr) {
      console.error('[Podcast] ElevenLabs auth error - check ELEVENLABS_API_KEY')
      return NextResponse.json(
        { error: 'Podcast service unavailable', code: 'TTS_AUTH_ERROR' },
        { status: 503 },
      )
    }

    if (isQuotaErr) {
      return NextResponse.json(
        {
          error: 'Podcast generation limit reached. Please try again in a few minutes.',
          code: 'TTS_QUOTA_ERROR',
        },
        { status: 429 },
      )
    }

    if (isBillingErr) {
      return NextResponse.json(
        {
          error: 'Podcast service is temporarily unavailable due to TTS billing or plan limits. Please contact admin to top up or adjust ElevenLabs plan.',
          code: 'TTS_BILLING_ERROR',
        },
        { status: 402 },
      )
    }

    console.error('[Podcast/Generate]', err)
    return NextResponse.json(
      {
        error: 'Podcast generation failed. Please try again.',
        code: 'TTS_UNKNOWN_ERROR',
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const role = req.nextUrl.searchParams.get('role')

    if (role === 'TEACHER') {
      const session = await getTeacherSession()
      if (!session) return NextResponse.json({ hasAccess: false })

      const hasAccess = await hasFeatureAccess(
        session.teacherId,
        'TEACHER',
        'PODCAST',
      )
      return NextResponse.json({ hasAccess })
    }

    const studentUserId =
      req.nextUrl.searchParams.get('userId') || req.headers.get('x-user-id')
    if (!studentUserId) return NextResponse.json({ hasAccess: false })

    const hasAccess = await hasFeatureAccess(studentUserId, 'STUDENT', 'PODCAST')
    return NextResponse.json({ hasAccess })
  } catch {
    return NextResponse.json({ hasAccess: false })
  }
}