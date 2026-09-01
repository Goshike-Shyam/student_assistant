/**
 * GAMIFICATION CONFIG
 * Single source of truth for all XP values,
 * level thresholds, badge definitions, and
 * feature flags. Change here only - never
 * hardcode values in components or routes.
 * Monthly XP reset runs via cron on 1st of month.
 */

export const GAMIFICATION_ENABLED =
  process.env.NEXT_PUBLIC_GAMIFICATION_ENABLED !== 'false'
// Set NEXT_PUBLIC_GAMIFICATION_ENABLED=false
// in Vercel to disable globally instantly

// XP awarded per action:
export const XP_ACTIONS = {
  RESEARCH_QUERY: 10,
  ASSIGNMENT_SUBMIT: 25,
  PRACTICE_COMPLETE: 20,
  SCORE_ABOVE_90: 15,
  SCORE_PERFECT: 25,
  PODCAST_GENERATED: 5,
  DAILY_LOGIN: 10,
  STREAK_7_DAY: 50,
  STREAK_30_DAY: 150,
  STREAK_100_DAY: 500,
} as const

export type XPAction = keyof typeof XP_ACTIONS

// Level thresholds (monthly XP):
export const LEVELS = [
  { level: 1, label: 'Learner', minXP: 0 },
  { level: 2, label: 'Explorer', minXP: 100 },
  { level: 3, label: 'Scholar', minXP: 300 },
  { level: 4, label: 'Champion', minXP: 600 },
  { level: 5, label: 'Legend', minXP: 1000 },
] as const

export function getLevel(xp: number) {
  return [...LEVELS].reverse().find((l) => xp >= l.minXP) ?? LEVELS[0]
}

export function getNextLevel(xp: number) {
  const curr = getLevel(xp)
  return LEVELS.find((l) => l.level === curr.level + 1) ?? null
}

export function getLevelProgress(xp: number) {
  const curr = getLevel(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  const range = next.minXP - curr.minXP
  const earned = xp - curr.minXP
  return Math.min(100, Math.round((earned / range) * 100))
}

// Badge definitions:
export const BADGES = [
  {
    id: 'first_research',
    label: 'Explorer',
    desc: 'First research query',
    emoji: '🔬',
    trigger: 'RESEARCH_QUERY',
    threshold: 1,
  },
  {
    id: 'research_10',
    label: 'Curious Mind',
    desc: '10 research queries',
    emoji: '🧠',
    trigger: 'RESEARCH_QUERY',
    threshold: 10,
  },
  {
    id: 'assignment_1',
    label: 'Go-getter',
    desc: 'First assignment submitted',
    emoji: '📝',
    trigger: 'ASSIGNMENT_SUBMIT',
    threshold: 1,
  },
  {
    id: 'assignment_10',
    label: 'Achiever',
    desc: '10 assignments submitted',
    emoji: '🎯',
    trigger: 'ASSIGNMENT_SUBMIT',
    threshold: 10,
  },
  {
    id: 'perfect_score',
    label: 'Perfectionist',
    desc: 'Score 100% on any test',
    emoji: '⭐',
    trigger: 'SCORE_PERFECT',
    threshold: 1,
  },
  {
    id: 'streak_7',
    label: 'On Fire',
    desc: '7-day login streak',
    emoji: '🔥',
    trigger: 'STREAK_7_DAY',
    threshold: 1,
  },
  {
    id: 'streak_30',
    label: 'Dedicated',
    desc: '30-day login streak',
    emoji: '💎',
    trigger: 'STREAK_30_DAY',
    threshold: 1,
  },
  {
    id: 'practice_10',
    label: 'Trainer',
    desc: '10 practice tests done',
    emoji: '🏋️',
    trigger: 'PRACTICE_COMPLETE',
    threshold: 10,
  },
  {
    id: 'podcast_fan',
    label: 'Podcast Fan',
    desc: '5 podcasts generated',
    emoji: '🎧',
    trigger: 'PODCAST_GENERATED',
    threshold: 5,
  },
  {
    id: 'top_class',
    label: 'Class Champion',
    desc: 'Weekly class XP leader',
    emoji: '🏆',
    trigger: 'LEADERBOARD_TOP',
    threshold: 1,
  },
] as const

export type BadgeId = (typeof BADGES)[number]['id']

// Avatar config:
export const AVATAR_OPTIONS = {
  skinTones: ['#FDDBB4', '#F0C27F', '#C68642', '#8D5524', '#4A2912'],
  hairStyles: ['short', 'long', 'curly', 'braids', 'afro', 'ponytail'],
  hairColors: ['#1a1a1a', '#8B4513', '#DAA520', '#FF4500', '#800080', '#4169E1'],
  outfits: ['uniform', 'casual', 'sporty', 'formal', 'hoodie', 'traditional'],
  accessories: ['none', 'glasses', 'headband', 'cap', 'earrings', 'scarf'],
} as const

// Comic background themes:
export const COMIC_THEMES = [
  { id: 'superhero', label: 'Superhero', emoji: '🦸' },
  { id: 'space', label: 'Space Odyssey', emoji: '🚀' },
  { id: 'fantasy', label: 'Fantasy Quest', emoji: '⚔️' },
  { id: 'mecha', label: 'Mecha City', emoji: '🤖' },
  { id: 'manga', label: 'Manga Studio', emoji: '🌸' },
  { id: 'magic', label: 'Magic Academy', emoji: '🧙' },
  { id: 'racer', label: 'Speed Racer', emoji: '🏎️' },
  { id: 'ocean', label: 'Ocean Warrior', emoji: '🌊' },
  { id: 'none', label: 'No background', emoji: '⬜' },
] as const

export type ComicThemeId = (typeof COMIC_THEMES)[number]['id']

// Dashboard colour themes:
export const DASHBOARD_THEMES = [
  { id: 'classic', label: 'Classic Light' },
  { id: 'galaxy', label: 'Dark Galaxy' },
  { id: 'manga_gold', label: 'Manga Gold' },
  { id: 'cyber', label: 'Cyber Blue' },
  { id: 'neon', label: 'Neon Purple' },
  { id: 'matrix', label: 'Matrix Green' },
  { id: 'sakura', label: 'Sakura' },
  { id: 'nature', label: 'Nature Calm' },
] as const

export type DashboardThemeId = (typeof DASHBOARD_THEMES)[number]['id']
