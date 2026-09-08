import crypto from 'crypto'

const VERIFY_SECRET = process.env.NEXTAUTH_SECRET || ''

export async function verifyProfileToken(token: string, expectedRole: string, expectedUserId: string): Promise<void> {
  if (!token) throw new Error('Missing token')
  const parts = token.split('.')
  if (parts.length !== 2) throw new Error('Invalid token')
  const [data, sig] = parts
  const expectedSig = crypto.createHmac('sha256', VERIFY_SECRET).update(data).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('Invalid signature')
  const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as any
  if (payload.purpose !== 'profile-update') throw new Error('Invalid token purpose')
  if (payload.role !== expectedRole) throw new Error('Role mismatch')
  if (payload.userId !== expectedUserId) throw new Error('User mismatch')
  const now = Math.floor(Date.now() / 1000)
  if (!payload.exp || payload.exp < now) throw new Error('Token expired')
}
