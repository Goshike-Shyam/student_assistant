import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaClient'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const VERIFY_SECRET = process.env.NEXTAUTH_SECRET || ''

function signVerifyToken(payload: Record<string, any>) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', VERIFY_SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const password = String(body.password ?? '')
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })

    const jar = await cookies()
    const userCookie = jar.get('sa-user-session')?.value
    const teacherCookie = jar.get('sa-teacher-session')?.value

    let userId: string | null = null
    let role: 'STUDENT' | 'TEACHER' | null = null
    let storedHash: string | null = null

    if (userCookie) {
      try {
        const parsed = JSON.parse(userCookie)
        userId = String(parsed.userId)
        role = 'STUDENT'
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
        storedHash = user?.password ?? null
      } catch {}
    } else if (teacherCookie) {
      // teacher session uses signed token; delegate to teacher-auth where possible
      try {
        // token format: base64.payload.signature — but getTeacherSession exists elsewhere; keep simple: token contains teacherId in payload
        const parts = teacherCookie.split('.')
        if (parts.length === 2) {
          const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))
          userId = String(payload.teacherId)
          role = 'TEACHER'
          const t = await prisma.teacher.findUnique({ where: { id: BigInt(userId) }, select: { passwordHash: true } })
          storedHash = t?.passwordHash ?? null
        }
      } catch {}
    }

    if (!userId || !role || !storedHash) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const valid = await bcrypt.compare(password, storedHash)
    if (!valid) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })

    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 5 * 60
    const token = signVerifyToken({ userId, role, purpose: 'profile-update', iat, exp })
    return NextResponse.json({ token })
  } catch (err: any) {
    console.error('[VerifyPassword]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
