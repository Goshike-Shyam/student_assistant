export { redis } from './provider'

export { getCachedAIResponse, setCachedAIResponse } from './ai-cache'

export {
  getCachedStudentProfile,
  setCachedStudentProfile,
  invalidateStudentCache,
  getCachedTeacherProfile,
  setCachedTeacherProfile,
  invalidateTeacherCache,
} from './session-cache'

export { getCachedPodcastSegments, setCachedPodcastSegments } from './podcast-cache'

// Re-export rate-limit helpers for convenience
export { checkRateLimit, resetRateLimit } from '../rate-limit'
