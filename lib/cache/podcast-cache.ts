import { cacheGet, cacheSet, KEY } from './provider'

const PODCAST_CACHE_TTL = 60 * 60 * 24 * 7 // 7 days

export interface CachedPodcastSegment {
  speaker: string
  audioUrl: string
  text: string
  index: number
}

export async function getCachedPodcastSegments(queryId: string): Promise<CachedPodcastSegment[] | null> {
  const cached = await cacheGet<CachedPodcastSegment[]>(KEY.podcastSegments(queryId))
  if (cached) {
    console.log('[PodcastCache] HIT — queryId:', queryId.slice(0, 8))
  }
  return cached
}

export async function setCachedPodcastSegments(queryId: string, segments: CachedPodcastSegment[]): Promise<void> {
  if (!segments?.length) return
  await cacheSet(KEY.podcastSegments(queryId), segments, PODCAST_CACHE_TTL)
  console.log('[PodcastCache] SET — queryId:', queryId.slice(0, 8), `(${segments.length} segments, TTL 7d)`)
}
