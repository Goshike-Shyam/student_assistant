/**
 * SESSION CONFIG CONTRACT
 * All session expiry logic lives here only.
 * To change session lifetime: edit ONLY this file.
 *
 * DAILY EXPIRY DESIGN:
 * Sessions expire at midnight local time (IST for India = UTC+5:30).
 * After midnight, the next request to any protected route returns 401
 * and middleware redirects to login.
 *
 * ACADEMIC YEAR EXPIRY:
 * India: May 1 (academic year ends April 30)
 * US: September 1 (year ends August 31)
 * UK: September 1 (year ends August 31)
 * AU: February 1 (year ends January 31)
 * Detected from the student's board field.
 */

export type AcademicRegion =
  | 'INDIA'
  | 'US'
  | 'UK'
  | 'AUSTRALIA'
  | 'GLOBAL'

export interface StudentSessionPayload {
  userId: string
  role: 'STUDENT'
  board: string
  exp: number
}

export const COOKIE_NAMES = {
  student: 'sa-user-session',
  teacher: 'sa-teacher-session',
  admin: 'sa-admin-session',
  parent: 'sa-parent-session',
} as const

export function secondsUntilMidnight(): number {
  const nowUTC = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const nowIST = new Date(nowUTC.getTime() + istOffset)
  const midnightIST = new Date(nowIST)
  midnightIST.setUTCHours(24, 0, 0, 0)

  const secsRemaining = Math.floor((midnightIST.getTime() - nowUTC.getTime()) / 1000)
  return Math.max(secsRemaining, 60)
}

export function getDailySessionMaxAge(): number {
  return secondsUntilMidnight()
}

export function getDailySessionExpiry(): string {
  return `${secondsUntilMidnight()}s`
}

export function getDailySessionExpiresAt(): number {
  return Math.floor(Date.now() / 1000) + secondsUntilMidnight()
}

export function getAcademicRegion(board: string): AcademicRegion {
  const normalizedBoard = (board ?? '').toUpperCase()

  if (
    normalizedBoard.includes('CBSE') ||
    normalizedBoard.includes('ICSE') ||
    normalizedBoard.includes('ISC') ||
    normalizedBoard.includes('STATE') ||
    normalizedBoard.includes('AP') ||
    normalizedBoard.includes('TS') ||
    normalizedBoard.includes('TELANGANA') ||
    normalizedBoard.includes('ANDHRA')
  ) {
    return 'INDIA'
  }

  if (normalizedBoard.includes('COMMON_CORE') || normalizedBoard.includes('CC') || normalizedBoard.includes('US')) {
    return 'US'
  }

  if (
    normalizedBoard.includes('UK') ||
    normalizedBoard.includes('GCSE') ||
    normalizedBoard.includes('A_LEVEL') ||
    normalizedBoard.includes('CAMBRIDGE')
  ) {
    return 'UK'
  }

  if (normalizedBoard.includes('AU') || normalizedBoard.includes('AUSTRALIA') || normalizedBoard.includes('ACARA')) {
    return 'AUSTRALIA'
  }

  return 'GLOBAL'
}

export function getAcademicYearEnd(board: string): Date {
  const region = getAcademicRegion(board)
  const now = new Date()
  const year = now.getFullYear()

  switch (region) {
    case 'INDIA':
      if (now.getMonth() >= 5) {
        return new Date(year + 1, 3, 30, 23, 59, 59)
      }
      return new Date(year, 3, 30, 23, 59, 59)

    case 'US':
    case 'UK':
      if (now.getMonth() >= 8) {
        return new Date(year + 1, 7, 31, 23, 59, 59)
      }
      return new Date(year, 7, 31, 23, 59, 59)

    case 'AUSTRALIA':
      if (now.getMonth() >= 1) {
        return new Date(year + 1, 0, 31, 23, 59, 59)
      }
      return new Date(year, 0, 31, 23, 59, 59)

    default:
      return new Date(year, 11, 31, 23, 59, 59)
  }
}

export function isAcademicYearExpired(board: string): boolean {
  return new Date() > getAcademicYearEnd(board)
}

export function formatAcademicYearEnd(board: string): string {
  return getAcademicYearEnd(board).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}