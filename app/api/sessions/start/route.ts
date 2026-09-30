import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()
    let body: { childId?: unknown } = {}

    if (text.trim()) {
      try {
        body = JSON.parse(text)
      } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
      }
    }

    const rawChildId = body.childId ?? req.headers.get('x-user-id')
    const childId = typeof rawChildId === 'string' ? rawChildId.trim() : String(rawChildId ?? '').trim()

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 })
    }

    const session = await prisma.studentSession.create({
      data: {
        childId,
        startedAt: new Date(),
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, sessionId: session.id.toString() })
  } catch (err) {
    console.error('[/api/sessions/start]', err)
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
  }
}