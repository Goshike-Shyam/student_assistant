import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'

export const dynamic = 'force-dynamic'

function readChildId(request: NextRequest): string | null {
  const fromQuery = request.nextUrl.searchParams.get('childId')
  const fromHeader = request.headers.get('x-user-id')
  const raw = fromQuery || fromHeader
  if (!raw) return null
  return String(raw)
}

function sanitizeAvatarJson(value: unknown): string | null {
  if (value === null || value === undefined) return null
  try {
    return JSON.stringify(value)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const childId = readChildId(request)
  if (!childId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const prefs = await prisma.studentPreferences.findUnique({ where: { childId } })

  return NextResponse.json({
    dashboardTheme: prefs?.dashboardTheme ?? 'classic',
    comicTheme: prefs?.comicTheme ?? 'none',
    avatarJson: prefs?.avatarJson ? JSON.parse(prefs.avatarJson) : null,
    gamificationOn: prefs?.gamificationOn ?? true,
  })
}

export async function POST(request: NextRequest) {
  const childId = readChildId(request)
  if (!childId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as {
    dashboardTheme?: string
    comicTheme?: string
    avatarJson?: unknown
    gamificationOn?: boolean
  }

  const { dashboardTheme, comicTheme, avatarJson, gamificationOn } = body

  await prisma.studentPreferences.upsert({
    where: { childId },
    create: {
      childId,
      dashboardTheme: dashboardTheme ?? 'classic',
      comicTheme: comicTheme ?? 'none',
      avatarJson: sanitizeAvatarJson(avatarJson),
      gamificationOn: gamificationOn ?? true,
    },
    update: {
      ...(dashboardTheme !== undefined ? { dashboardTheme } : {}),
      ...(comicTheme !== undefined ? { comicTheme } : {}),
      ...(avatarJson !== undefined ? { avatarJson: sanitizeAvatarJson(avatarJson) } : {}),
      ...(gamificationOn !== undefined ? { gamificationOn } : {}),
    },
  })

  return NextResponse.json({ ok: true })
}
