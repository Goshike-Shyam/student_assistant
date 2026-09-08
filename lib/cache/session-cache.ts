import { cacheGet, cacheSet, cacheDel, KEY } from './provider'

const SESSION_TTL = 60 * 5 // 5 minutes

export interface CachedStudentProfile {
  id: string
  name: string
  grade: string
  board: string
  subjects: string[]
  subscriptionStatus: string
  gamificationOn: boolean
  dashboardTheme: string
  comicTheme: string
  loginStreak: number
}

export interface CachedTeacherProfile {
  id: string
  name: string
  email: string
  schoolName: string
  classIds: string[]
}

export async function getCachedStudentProfile(childId: string): Promise<CachedStudentProfile | null> {
  return cacheGet<CachedStudentProfile>(KEY.studentProfile(childId))
}

export async function setCachedStudentProfile(childId: string, profile: CachedStudentProfile): Promise<void> {
  await cacheSet(KEY.studentProfile(childId), profile, SESSION_TTL)
}

export async function invalidateStudentCache(childId: string): Promise<void> {
  await cacheDel(KEY.studentProfile(childId))
  console.log('[SessionCache] Invalidated student:', childId)
}

export async function getCachedTeacherProfile(teacherId: string): Promise<CachedTeacherProfile | null> {
  return cacheGet<CachedTeacherProfile>(KEY.teacherProfile(teacherId))
}

export async function setCachedTeacherProfile(teacherId: string, profile: CachedTeacherProfile): Promise<void> {
  await cacheSet(KEY.teacherProfile(teacherId), profile, SESSION_TTL)
}

export async function invalidateTeacherCache(teacherId: string): Promise<void> {
  await cacheDel(KEY.teacherProfile(teacherId))
}
