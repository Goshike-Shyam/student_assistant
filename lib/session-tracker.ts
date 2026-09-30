const SESSION_ID_KEY = 'sa_session_id'
const SESSION_START_KEY = 'sa_session_start'

let startTime = 0
let pageViews = 1
let currentSessionId: string | null = null
let currentChildId: string | null = null
let listenerRegistered = false
let endSent = false

function registerListeners() {
  if (listenerRegistered || typeof window === 'undefined') return

  window.addEventListener('pagehide', sendSessionEnd)
  window.addEventListener('beforeunload', sendSessionEnd)
  listenerRegistered = true
}

function resetSessionState(sessionId: string, childId: string) {
  currentSessionId = sessionId
  currentChildId = childId
  startTime = Date.now()
  pageViews = 1
  endSent = false

  sessionStorage.setItem(SESSION_ID_KEY, sessionId)
  sessionStorage.setItem(SESSION_START_KEY, String(startTime))
}

export async function startSession(childId: string): Promise<void> {
  if (typeof window === 'undefined') return

  const normalizedChildId = childId.trim()
  if (!normalizedChildId) return

  registerListeners()

  const existingSessionId = sessionStorage.getItem(SESSION_ID_KEY)
  const existingSessionStart = Number(sessionStorage.getItem(SESSION_START_KEY) ?? '0')

  if (existingSessionId && Number.isFinite(existingSessionStart) && existingSessionStart > 0) {
    currentSessionId = existingSessionId
    currentChildId = normalizedChildId
    startTime = existingSessionStart
    endSent = false
    return
  }

  try {
    const response = await fetch('/api/sessions/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': normalizedChildId,
      },
      body: JSON.stringify({ childId: normalizedChildId }),
      keepalive: true,
    })

    if (!response.ok) return

    const payload = await response.json().catch(() => null)
    if (typeof payload?.sessionId === 'string' && payload.sessionId) {
      resetSessionState(payload.sessionId, normalizedChildId)
    }
  } catch {
    // Silent fail: session tracking must not affect navigation.
  }
}

export function trackPageView() {
  if (!currentSessionId && typeof window !== 'undefined') {
    currentSessionId = sessionStorage.getItem(SESSION_ID_KEY)
  }
  if (currentSessionId) pageViews += 1
}

export async function endSession(): Promise<void> {
  sendSessionEnd()
}

function sendSessionEnd() {
  if (typeof window === 'undefined' || endSent) return

  const sessionId = currentSessionId ?? sessionStorage.getItem(SESSION_ID_KEY)
  const storedStart = Number(sessionStorage.getItem(SESSION_START_KEY) ?? String(startTime || 0))
  const durationSecs = Math.floor((Date.now() - storedStart) / 1000)

  if (!sessionId || !Number.isFinite(storedStart) || storedStart <= 0 || durationSecs < 5) {
    return
  }

  endSent = true

  const payload = JSON.stringify({
    sessionId,
    durationSecs,
    pageViews,
  })

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

  sessionStorage.removeItem(SESSION_ID_KEY)
  sessionStorage.removeItem(SESSION_START_KEY)
  currentSessionId = null
  currentChildId = null
}
