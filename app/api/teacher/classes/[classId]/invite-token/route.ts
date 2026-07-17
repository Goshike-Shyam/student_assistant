import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import { getTeacherSession } from '@/lib/teacher-auth'
import { generateInviteToken, hashToken } from '@/lib/admin-auth'

/** POST /api/teacher/classes/[classId]/invite-token — generate a shareable invite link token */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  const session = await getTeacherSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { classId: classIdStr } = await params
    const classId = BigInt(classIdStr)
    const teacherId = BigInt(session.teacherId)

    const cls = await prisma.teacherClass.findFirst({ where: { id: classId, teacherId } })
    if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

    const token = generateInviteToken()
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.classInviteToken.create({
      data: { classId, tokenHash, expiresAt },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    return NextResponse.json({
      token,
      url: `${appUrl}/teacher/classes/join?token=${token}&classId=${classId.toString()}`,
      expiresAt,
    })
  } catch (err: any) {
    console.error('[teacher/classes/invite-token POST]', err)
    return NextResponse.json({ error: 'Failed to generate invite token' }, { status: 500 })
  }
}
