/**
 * TEACHER AUTH CONTRACT
 * Cookie: sa-teacher-session (SEPARATE from admin+student)
 * NEVER import or use getAdminSession or next-auth here
 * JWT verified with TEACHER_SESSION_SECRET env var
 * Session shape: { teacherId, name, email, exp }
 * Uses Node.js built-in crypto — no external JWT library needed
 */
import crypto from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'sa-teacher-session'
const SESSION_DAYS = 7

export interface TeacherSessionPayload {
  teacherId: string
  name: string
  email: string
  exp: number
}

function getSecret(): Buffer {
  const secret = process.env.TEACHER_SESSION_SECRET
  if (!secret) throw new Error('TEACHER_SESSION_SECRET env var is not set')
  return Buffer.from(secret.length === 64 ? secret : secret.padEnd(64, '0'), 'utf8')
}

/** Sign a payload into a simple base64url.base64url token */
function signToken(payload: TeacherSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64url')
  return `${data}.${sig}`
}

/** Verify and decode a token. Returns null if invalid or expired. */
function verifyToken(token: string): TeacherSessionPayload | null {
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
    ) as TeacherSessionPayload
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

/** Read and verify the teacher session cookie. Returns null if absent/invalid. */
export async function getTeacherSession(): Promise<TeacherSessionPayload | null> {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

/** Create a signed session cookie for the given teacher. */
export async function createTeacherSession(teacher: {
  id: bigint
  name: string
  email: string
}): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60
  const token = signToken({
    teacherId: teacher.id.toString(),
    name: teacher.name,
    email: teacher.email,
    exp,
  })
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: '/',
  })
}

/** Delete the teacher session cookie. */
export async function deleteTeacherSession(): Promise<void> {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
}
