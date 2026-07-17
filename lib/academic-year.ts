/**
 * ACADEMIC YEAR CONTRACT
 * CBSE/ICSE/STATE_BOARD: starts April → "YYYY-YY" format
 * COMMON_CORE: starts September → "YYYY-YY" format
 * OTHER: defaults to April start (India)
 * Always computed at runtime — never hardcoded.
 * getAcademicYear(board) → call whenever board changes.
 *
 * Example outputs as of July 2026:
 *   CBSE        → "2026-27"  (April already passed)
 *   ICSE        → "2026-27"
 *   STATE_BOARD → "2026-27"
 *   COMMON_CORE → "2025-26"  (September not yet reached)
 *   OTHER       → "2026-27"
 */

export type Board = 'CBSE' | 'ICSE' | 'STATE_BOARD' | 'COMMON_CORE' | 'OTHER'

interface AcademicYearConfig {
  /** 1-based month the academic year starts (4 = April, 9 = September) */
  startMonth: number
  label:      string
}

const BOARD_CONFIG: Record<Board, AcademicYearConfig> = {
  CBSE:        { startMonth: 4, label: 'April–March'    },
  ICSE:        { startMonth: 4, label: 'April–March'    },
  STATE_BOARD: { startMonth: 4, label: 'April–March'    },
  COMMON_CORE: { startMonth: 9, label: 'September–June' },
  OTHER:       { startMonth: 4, label: 'April–March'    },
}

/**
 * Returns the academic year string (e.g. "2025-26") for the given board,
 * computed from the current date at call time.
 */
export function getAcademicYear(board: Board): string {
  const config = BOARD_CONFIG[board] ?? BOARD_CONFIG['OTHER']
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-based
  const currentYear  = now.getFullYear()

  // If we are at or past the start month, the year spans currentYear → currentYear+1
  // Otherwise it spans currentYear-1 → currentYear
  const isNewYearStarted = currentMonth >= config.startMonth
  const yearStart = isNewYearStarted ? currentYear : currentYear - 1
  const yearEnd   = yearStart + 1

  // Format: "2025-26" (short two-digit suffix for end year)
  return `${yearStart}-${String(yearEnd).slice(2)}`
}

/**
 * Returns a human-readable academic year label, e.g. "2025-26 (April–March)".
 */
export function getAcademicYearLabel(board: Board): string {
  const config = BOARD_CONFIG[board] ?? BOARD_CONFIG['OTHER']
  return `${getAcademicYear(board)} (${config.label})`
}
