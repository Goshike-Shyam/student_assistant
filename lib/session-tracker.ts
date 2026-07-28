/**
 * SESSION TRACKER CONTRACT
 * Tracks time from page load to unload.
 * Sends duration to /api/sessions/end on:
 *   - beforeunload (tab close / navigate away)
 *   - visibilitychange to hidden (tab switch)
 * Uses sendBeacon for reliability on unload.
 * sessionId stored in sessionStorage — not localStorage.
 * Never blocks page load or navigation.
 * Sessions < 5 seconds are NOT recorded (noise filter).
 */

let startTime = Date.now()
let pageViews = 1
let currentSessionId: string | null = null
let listenerRegistered = false

export function initSessionTracker(sessionId: string) {
  currentSessionId = sessionId
  startTime = Date.now()
  pageViews = 1

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('sa_session_id', sessionId)
    sessionStorage.setItem('sa_session_start', String(startTime))
  }

  if (!listenerRegistered && typeof window !== 'undefined') {
    window.addEventListener('beforeunload', sendSessionEnd)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') sendSessionEnd()
    })
    listenerRegistered = true
  }
}

export function trackPageView() {
  pageViews++
}

function sendSessionEnd() {
  const id =
    currentSessionId ?? sessionStorage.getItem('sa_session_id')
  const start = Number(
    sessionStorage.getItem('sa_session_start') ?? startTime,
  )
  const duration = Math.floor((Date.now() - start) / 1000)

  // Ignore very short sessions (noise)
  if (!id || duration < 5) return

  const payload = JSON.stringify({
    sessionId: id,
    durationSecs: duration,
    pageViews,
  })

  // sendBeacon is fire-and-forget and works reliably on page close
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/sessions/end', payload)
  } else {
    fetch('/api/sessions/end', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    }).catch(() => {})
  }

  // Clear storage after send so duplicate sends don't occur
  sessionStorage.removeItem('sa_session_id')
  sessionStorage.removeItem('sa_session_start')
  currentSessionId = null
}
