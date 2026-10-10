import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 300

export async function GET() {
  try {
    const items = await prisma.feedback.findMany({
      where: { showOnHomepage: true },
      select: {
        id: true,
        displayName: true,
        userRole: true,
        feedbackText: true,
        tone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        id: item.id.toString(),
      })),
    })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
