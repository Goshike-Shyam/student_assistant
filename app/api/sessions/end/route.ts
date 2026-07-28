/**
 * SESSION END ROUTE CONTRACT
 * Called by session-tracker.ts via sendBeacon or fetch on page unload.
 * Requires the Session model in Prisma (see schema.prisma).
 *
 * PREREQUISITE — run once in Supabase SQL Editor:
 *   CREATE TABLE IF NOT EXISTS student_sessions (
 *     id            BIGSERIAL PRIMARY KEY,
 *     child_id      VARCHAR(36) NOT NULL,
 *     started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     ended_at      TIMESTAMPTZ NULL,
 *     duration_secs INT NULL CHECK (duration_secs >= 0),
 *     page_views    INT NOT NULL DEFAULT 0
 *   );
 *   CREATE INDEX IF NOT EXISTS idx_ss_child ON student_sessions(child_id);
 *
 * Then add to prisma/schema.prisma:
 *   model StudentSession {
 *     id           BigInt    @id @default(autoincrement()) @db.BigInt
 *     childId      String    @map("child_id") @db.VarChar(36)
 *     startedAt    DateTime  @default(now()) @map("started_at")
 *     endedAt      DateTime? @map("ended_at")
 *     durationSecs Int?      @map("duration_secs")
 *     pageViews    Int       @default(0) @map("page_views")
 *     @@map("student_sessions")
 *   }
 * Then run: npx prisma generate
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'

export async function POST(req: NextRequest) {
  try {
    let body: { sessionId?: unknown; durationSecs?: unknown; pageViews?: unknown }

    // sendBeacon sends text/plain — parse as JSON regardless of content-type
    const text = await req.text()
    try {
      body = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { sessionId, durationSecs, pageViews } = body

    if (!sessionId || durationSecs === undefined) {
      return NextResponse.json(
        { error: 'sessionId and durationSecs are required' },
        { status: 400 },
      )
    }

    const safeDuration = Math.min(Number(durationSecs), 86_400) // cap at 24 h
    const safePageViews = Math.max(0, Number(pageViews) || 0)

    // Update the open session row — only if endedAt is still null to prevent re-update
    await (prisma as any).studentSession.updateMany({
      where: {
        id: BigInt(String(sessionId)),
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
        durationSecs: safeDuration,
        pageViews: safePageViews,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/sessions/end]', err)
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 })
  }
}
