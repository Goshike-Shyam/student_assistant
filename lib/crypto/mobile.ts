import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

const KEY_HEX = process.env.MOBILE_ENCRYPTION_KEY || ''
const KEY = KEY_HEX ? Buffer.from(KEY_HEX, 'hex') : null
if (KEY && KEY.length !== 32) throw new Error('MOBILE_ENCRYPTION_KEY must be 32 bytes (hex)')

export function encryptMobile(plain: string): string {
  if (!KEY) throw new Error('MOBILE_ENCRYPTION_KEY not set')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', KEY, iv)
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, ct, tag]).toString('base64')
}

export function decryptMobile(blob: string): string {
  if (!KEY) throw new Error('MOBILE_ENCRYPTION_KEY not set')
  const buf = Buffer.from(blob, 'base64')
  const iv = buf.slice(0, 12)
  const tag = buf.slice(buf.length - 16)
  const ct = buf.slice(12, buf.length - 16)
  const decipher = createDecipheriv('aes-256-gcm', KEY, iv)
  decipher.setAuthTag(tag)
  const out = Buffer.concat([decipher.update(ct), decipher.final()])
  return out.toString('utf8')
}
