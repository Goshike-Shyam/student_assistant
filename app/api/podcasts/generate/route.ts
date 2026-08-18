import { NextRequest, NextResponse } from 'next/server'
import { getTeacherSession } from '@/lib/teacher-auth'
import { prisma } from '@/lib/prismaClient'
import { hasFeatureAccess } from '@/lib/feature-access'
import { buildPodcastScript, generateTTSAudio } from '@/lib/tts'
import { logAiCredit } from '@/lib/ai-credit-logger'

/**
 * ID SAFETY CONTRACT - DO NOT USE BigInt() DIRECTLY
 * queryId can arrive as UUID or numeric string from clients.
 * Always normalize via safeId() before DB operations.
 */
function safeId(
  raw: string | number | null | undefined,
): bigint | string | null {
  if (raw === null || raw === undefined || raw === '') return null
  const str = String(raw).trim()
  if (isNumericId(str)) return BigInt(str)
  if (str.length > 0) return str
  return null
}

function isNumericId(raw: string | null | undefined): boolean {
  return /^\d+$/.test(String(raw ?? ''))
}

function isBindFormatError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return message.includes('incorrect binary data format in bind parameter')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { topic, subject, response, queryId, role, userId: studentUserId } = body

    if (!topic || !subject || !response) {
      return NextResponse.json(
        { error: 'topic, subject and response required' },
        { status: 400 },
      )
    }

    let userId: string
    let userRole: 'STUDENT' | 'TEACHER'
    let grade = '6'

    if (role === 'TEACHER') {
      const session = await getTeacherSession()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = session.teacherId
      userRole = 'TEACHER'
    } else {
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

    const queryIdSafe = safeId(queryId)

    if (queryIdSafe !== null) {
      const podcastQueryId =
        typeof queryIdSafe === 'bigint' ? String(queryIdSafe) : queryIdSafe

      const existing = await prisma.podcast
        .findFirst({
          where: { queryId: podcastQueryId as any },
          select: { id: true, audioUrl: true, durationSecs: true },
        })
        .catch((err) => {
          // Runtime-safe fallback when Prisma client type and DB column drift temporarily.
          if (isBindFormatError(err)) {
            console.warn('[Podcast/Generate] cache lookup skipped due to queryId bind type mismatch')
            return null
          }
          throw err
        })

      if (existing?.audioUrl) {
        return NextResponse.json({
          podcastId: existing.id.toString(),
          audioUrl: existing.audioUrl,
          durationSecs: existing.durationSecs ?? 0,
          cached: true,
        })
      }
    }

    const script = buildPodcastScript(topic, subject, grade, response)

    const startMs = Date.now()
    const ttsResult = await generateTTSAudio(script, grade, userId)
    const latencyMs = Date.now() - startMs

    const queryIdForSave =
      queryIdSafe === null
        ? null
        : typeof queryIdSafe === 'bigint'
          ? String(queryIdSafe)
          : queryIdSafe

    const podcast = await prisma.podcast
      .create({
        data: {
          queryId: queryIdForSave as any,
          audioUrl: ttsResult.audioUrl,
          durationSecs: ttsResult.durationSecs,
          filePath: ttsResult.filePath,
        },
      })
      .catch(async (err) => {
        if (!isBindFormatError(err)) throw err

        console.warn('[Podcast/Generate] create retried with queryId=null due to bind type mismatch')
        return prisma.podcast.create({
          data: {
            queryId: null,
            audioUrl: ttsResult.audioUrl,
            durationSecs: ttsResult.durationSecs,
            filePath: ttsResult.filePath,
          },
        })
      })

    logAiCredit({
      userId,
      userRole,
      feature: 'PODCAST',
      promptTokens: ttsResult.charCount,
      completionTokens: 0,
      latencyMs,
    }).catch(console.error)

    return NextResponse.json({
      podcastId: podcast.id.toString(),
      audioUrl: ttsResult.audioUrl,
      durationSecs: ttsResult.durationSecs,
      cached: false,
    })
  } catch (err: any) {
    console.error('[Podcast/Generate]', err)
    return NextResponse.json(
      { error: err?.message ?? 'Generation failed' },
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