import crypto from 'crypto'
import { cookies } from 'next/headers'
import { getDailySessionExpiresAt, getDailySessionMaxAge } from '@/lib/session-config'

const COOKIE_NAME = 'sa-parent-session'
export interface ParentSessionPayload {
  parentId: string
  name: string
  email: string
  exp: number
}

function getSecret(): Buffer {
  const secret = process.env.PARENT_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.TEACHER_SESSION_SECRET
  if (!secret) throw new Error('PARENT_SESSION_SECRET env var is not set')
  return Buffer.from(secret.length === 64 ? secret : secret.padEnd(64, '0'), 'utf8')
}

function signToken(payload: ParentSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64url')
  return `${data}.${sig}`
}

function verifyToken(token: string): ParentSessionPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [data, sig] = parts
  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64url')

  try {
    const sigBuf = Buffer.from(sig, 'base64url')
    const expBuf = Buffer.from(expected, 'base64url')
    if (sigBuf.length !== expBuf.length) return null
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null
  } catch {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf8'),
    ) as ParentSessionPayload
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export async function getParentSession(): Promise<ParentSessionPayload | null> {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function createParentSession(parent: {
  id: string
  name: string
  email: string
}): Promise<void> {
  const exp = getDailySessionExpiresAt()
  const token = signToken({
    parentId: parent.id,
    name: parent.name,
    email: parent.email,
    exp,
  })
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: getDailySessionMaxAge(),
    path: '/',
  })
}

export async function deleteParentSession(): Promise<void> {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
}
