import crypto from 'crypto'
import bcryptjs from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prismaClient'

const ADMIN_COOKIE_NAME = 'sa-admin-session'

export interface AdminSessionPayload {
  adminId: string
  role: string
  name: string
  email: string
}

/**
 * Read admin session strictly from sa-admin-session cookie.
 * Never reads any student/parent cookie and never uses next-auth.
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const jar = await cookies()
  const token = jar.get(ADMIN_COOKIE_NAME)?.value
  if (!token) return null

  try {
    const parsed = JSON.parse(token) as Partial<AdminSessionPayload>
    if (!parsed.adminId || !parsed.role || !parsed.name || !parsed.email) return null
    let adminIdBigInt: bigint
    try {
      adminIdBigInt = BigInt(parsed.adminId)
    } catch {
      return null
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminIdBigInt },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        isActive: true,
      },
    })

    if (!admin || !admin.isActive) return null

    if (admin.role !== parsed.role || admin.email !== parsed.email) return null

    return {
      adminId: admin.id.toString(),
      role: admin.role,
      name: admin.name,
      email: admin.email,
    }
  } catch {
    return null
  }
}

/**
 * Validate password strength
 * Requires: min 12 chars, 1 uppercase, 1 number, 1 symbol
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one symbol')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Generate a random token for invites
 */
export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a token with SHA-256
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Hash a password with bcryptjs (cost 12)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12)
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

/**
 * Password strength indicator
 */
export function getPasswordStrengthLevel(password: string): 'weak' | 'medium' | 'strong' {
  const { valid } = validatePasswordStrength(password)
  if (valid) return 'strong'
  
  if (password.length >= 8) return 'medium'
  return 'weak'
}
