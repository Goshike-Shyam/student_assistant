import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const childId = request.nextUrl.searchParams.get('userId') || request.headers.get('x-user-id')
    if (!childId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    await prisma.libraryItem.update({
      where: { id: BigInt(id) },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
