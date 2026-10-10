import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      displayName: true,
      userRole: true,
      userId: true,
      feedbackText: true,
      attachmentUrl: true,
      attachmentName: true,
      tone: true,
      showOnHomepage: true,
      adminNote: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      id: item.id.toString(),
    })),
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, showOnHomepage, adminNote } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  await prisma.feedback.update({
    where: { id: BigInt(id) },
    data: {
      ...(showOnHomepage !== undefined ? { showOnHomepage: Boolean(showOnHomepage) } : {}),
      ...(adminNote !== undefined ? { adminNote: adminNote ? String(adminNote).slice(0, 255) : null } : {}),
    },
  })

  return NextResponse.json({ ok: true })
}
