'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Lock, Pause, Play, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  queryId?: string
  userId?: string
  topic: string
  subject: string
  response: string
  role: 'student' | 'teacher'
}

type PlayerState = 'checking' | 'locked' | 'idle' | 'generating' | 'ready' | 'error'

export function PodcastPlayer({ queryId, userId, topic, subject, response, role }: Props) {
  const [state, setState] = useState<PlayerState>('checking')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let mounted = true

    const params = new URLSearchParams({ role: role.toUpperCase() })
    if (role === 'student' && userId) {
      params.set('userId', userId)
    }

    fetch(`/api/podcasts/generate?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { hasAccess?: boolean }) => {
        if (!mounted) return
        setState(data.hasAccess ? 'idle' : 'locked')
      })
      .catch(() => {
        if (mounted) setState('locked')
      })

    return () => {
      mounted = false
    }
  }, [role, userId])

  const generate = async () => {
    setState('generating')
    setError(null)

    try {
      const res = await fetch('/api/podcasts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId,
          topic,
          subject,
          response,
          role: role.toUpperCase(),
          userId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'FEATURE_NOT_ENABLED') {
          setState('locked')
          return
        }
        throw new Error(data.error || 'Podcast generation failed')
      }

      setAudioUrl(data.audioUrl)
      setDuration(data.durationSecs ?? 0)
      setCurrentTime(0)
      setIsPlaying(false)
      setState('ready')
    } catch (err: any) {
      setError(err?.message ?? 'Generation failed')
      setState('error')
    }
  }

  const togglePlay = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const time = Number(event.target.value)
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const setPlaybackSpeed = (nextSpeed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed
    }
    setSpeed(nextSpeed)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (state === 'locked') {
    return (
      <div
        className="group relative inline-block"
        role="group"
        aria-label="Podcast feature premium lock"
        tabIndex={0}
      >
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-describedby={`podcast-upgrade-tooltip-${role}`}
          className="flex min-h-[44px] cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-400"
          title="Premium feature. Contact admin to unlock."
        >
          <Lock size={14} aria-hidden="true" />
          <Volume2 size={14} aria-hidden="true" />
          Generate Podcast
        </button>
        <span
          id={`podcast-upgrade-tooltip-${role}`}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          Premium feature — contact admin to unlock
        </span>
      </div>
    )
  }

  if (state === 'checking') {
    return (
      <div
        className="h-10 w-40 animate-pulse rounded-lg bg-gray-100 dark:bg-slate-700"
        aria-label="Loading podcast feature"
        role="status"
      />
    )
  }

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={generate}
        className="flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        aria-label={`Generate podcast for ${topic}`}
      >
        <Volume2 size={16} aria-hidden="true" />
        Generate Podcast
      </button>
    )
  }

  if (state === 'generating') {
    return (
      <div
        className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-slate-900"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" aria-hidden="true" />
        <span className="text-sm text-blue-700 dark:text-blue-300">
          Creating your podcast...
          <span className="ml-1 text-xs opacity-70">(~10 seconds)</span>
        </span>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950" role="alert">
        <p className="mb-2 text-sm text-red-700 dark:text-red-300">{error ?? 'Podcast generation failed'}</p>
        <button
          type="button"
          onClick={generate}
          className="rounded text-xs text-red-700 underline hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onEnded={() => {
            setIsPlaying(false)
            setCurrentTime(0)
          }}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
          aria-label={`Podcast ${topic}`}
        />
      )}

      <div className="mb-3 flex items-center gap-2">
        <Volume2 size={15} className="shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        <span className="flex-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">Audio summary: {topic}</span>
        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={handleSeek}
        step="0.1"
        className="mb-3 h-1.5 w-full cursor-pointer accent-blue-600"
        aria-label="Podcast seek bar"
        aria-valuenow={Math.round(currentTime)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? `Pause ${topic}` : `Play ${topic}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        </button>

        <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
          {[0.75, 1, 1.25, 1.5].map((candidate) => (
            <button
              key={candidate}
              type="button"
              onClick={() => setPlaybackSpeed(candidate)}
              aria-pressed={speed === candidate}
              aria-label={`${candidate}x speed`}
              className={cn(
                'min-h-[36px] rounded px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                speed === candidate
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-blue-100 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700',
              )}
            >
              {candidate}x
            </button>
          ))}
        </div>

        {audioUrl && (
          <a
            href={audioUrl}
            download={`${topic.replace(/\s+/g, '-')}.mp3`}
            className="ml-auto flex min-h-[44px] items-center gap-1 rounded text-xs text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300"
            aria-label={`Download podcast for ${topic}`}
          >
            <Download size={13} aria-hidden="true" />
            Download
          </a>
        )}
      </div>
    </div>
  )
}
