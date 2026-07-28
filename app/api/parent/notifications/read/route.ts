import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'

export async function POST(request: NextRequest) {
  const parentId = request.nextUrl.searchParams.get('userId') || request.headers.get('x-user-id')
  if (!parentId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { ids } = await request.json().catch(() => ({ ids: [] }))
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ ok: true })

  const parsedIds = ids
    .map((id: string) => {
      try {
        return BigInt(id)
      } catch {
        return null
      }
    })
    .filter((id: bigint | null): id is bigint => id !== null)

  if (parsedIds.length === 0) return NextResponse.json({ ok: true })

  await prisma.notification.updateMany({
    where: {
      id: { in: parsedIds },
      userId: parentId,
      userRole: 'PARENT',
    },
    data: { isRead: true },
  })

  return NextResponse.json({ ok: true })
}
