import crypto from 'crypto'
import bcryptjs from 'bcryptjs'

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
