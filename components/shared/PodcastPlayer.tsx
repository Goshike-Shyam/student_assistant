'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Download,
  Lock,
  MessageSquare,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PodcastSegment {
  speaker: 'HOST' | 'COHOST'
  audioUrl: string
  text: string
  index: number
}

interface Props {
  queryId?: string
  userId?: string
  topic: string
  subject: string
  response: string
  role: 'student' | 'teacher'
}

type State = 'checking' | 'locked' | 'idle' | 'generating' | 'ready' | 'error'
type InputMode = 'text' | 'voice'
type QAState = 'closed' | 'open' | 'thinking' | 'answering'

export function PodcastPlayer({ queryId, userId, topic, subject, response, role }: Props) {
  const [state, setState] = useState<State>('checking')
  const [segments, setSegments] = useState<PodcastSegment[]>([])
  const [currentSeg, setCurrentSeg] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [speed, setSpeed] = useState(1)

  const [qaState, setQAState] = useState<QAState>('closed')
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [question, setQuestion] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [answerUrl, setAnswerUrl] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const answerRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const pausedSegRef = useRef(0)
  const pausedTimeRef = useRef(0)

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
      recognitionRef.current?.stop?.()
    }
  }, [role, userId])

  const playSegment = useCallback(
    async (index: number, startTime = 0) => {
      if (!segments[index] || !audioRef.current) return

      audioRef.current.src = segments[index].audioUrl
      audioRef.current.currentTime = startTime
      audioRef.current.playbackRate = speed

      try {
        await audioRef.current.play()
        setIsPlaying(true)
        setCurrentSeg(index)
      } catch {
        setIsPlaying(false)
      }
    },
    [segments, speed],
  )

  const handleSegmentEnd = useCallback(() => {
    const next = currentSeg + 1
    if (next < segments.length) {
      void playSegment(next)
      return
    }

    setIsPlaying(false)
    setProgress(0)
    setCurrentSeg(0)
  }, [currentSeg, segments.length, playSegment])

  const generate = async () => {
    setState('generating')
    setError(null)

    try {
      const res = await fetch('/api/podcasts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId,
          userId,
          topic,
          subject,
          response,
          role: role.toUpperCase(),
          mode: 'podcast',
        }),
      })

      const data = await res.json()
      if (res.status === 429) {
        setError(data.message ?? 'Daily podcast limit reached (2/day). Try again in 24 hours.')
        setState('error')
        return
      }
      if (!res.ok) {
        if (data.error === 'FEATURE_NOT_ENABLED') {
          setState('locked')
          return
        }
        throw new Error(data.error || 'Podcast generation failed')
      }

      const nextSegments = Array.isArray(data.segments) ? data.segments : []
      setSegments(nextSegments)
      setCurrentSeg(0)
      setProgress(0)
      setDuration(0)
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

    if (audioRef.current.src) {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
      return
    }

    await playSegment(currentSeg)
  }

  const handleInterrupt = () => {
    if (audioRef.current && isPlaying) {
      pausedSegRef.current = currentSeg
      pausedTimeRef.current = audioRef.current.currentTime
      audioRef.current.pause()
      setIsPlaying(false)
    }

    setQAState('open')
    setQuestion('')
    setAnswerText('')
    setAnswerUrl(null)
  }

  const submitQuestion = async (q: string) => {
    if (!q.trim()) return

    setQAState('thinking')

    try {
      const res = await fetch('/api/podcasts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role: role.toUpperCase(),
          mode: 'answer',
          question: q.trim(),
          topic,
          subject,
          response,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to answer question')
      }

      setAnswerText(data.answerText ?? 'No answer generated.')
      setAnswerUrl(data.audioUrl ?? null)
      setQAState('answering')

      if (answerRef.current && data.audioUrl) {
        answerRef.current.src = data.audioUrl
        void answerRef.current.play()
      }
    } catch {
      setAnswerText('Sorry, I could not answer that. Please try again.')
      setQAState('answering')
    }
  }

  const resumePodcast = useCallback(() => {
    if (segments.length === 0) return
    void playSegment(pausedSegRef.current, pausedTimeRef.current)
  }, [segments.length, playSegment])

  const handleAnswerEnd = () => {
    setQAState('closed')
    resumePodcast()
  }

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setQuestion('Voice input is not supported in this browser. Use text mode instead.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript ?? ''
      setQuestion(transcript)
      setIsListening(false)
      if (transcript.trim()) {
        void submitQuestion(transcript)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop?.()
    setIsListening(false)
  }

  const closeQA = () => {
    if (qaState === 'thinking') return

    answerRef.current?.pause()
    setQAState('closed')
    setQuestion('')
    setAnswerText('')
    setAnswerUrl(null)
    resumePodcast()
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const speakerLabel = (speaker: 'HOST' | 'COHOST') =>
    speaker === 'HOST' ? 'Host' : 'Co-host'

  if (state === 'locked') {
    return (
      <div className="group relative inline-block" role="group" aria-label="Podcast premium feature">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex min-h-[44px] cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-400"
        >
          <Lock size={14} aria-hidden="true" />
          <Volume2 size={14} aria-hidden="true" />
          Generate Podcast
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        >
          Premium - contact admin to unlock
        </span>
      </div>
    )
  }

  if (state === 'checking') {
    return (
      <div
        className="h-10 w-40 animate-pulse rounded-lg bg-gray-100 dark:bg-slate-700"
        role="status"
        aria-label="Loading podcast feature"
      />
    )
  }

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={generate}
        className="flex min-h-[44px] items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
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
        className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-950"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className="h-4 w-4 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Creating your podcast...</p>
          <p className="mt-0.5 text-xs text-purple-500 dark:text-purple-400">
            Host + Co-host script to audio generation (~30-60 seconds)
          </p>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950" role="alert">
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

  const seg = segments[currentSeg]

  return (
    <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 dark:border-purple-800 dark:from-purple-950 dark:to-slate-900">
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (!audioRef.current) return
          const pct = (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100
          setProgress(pct)
          setDuration(audioRef.current.duration || 0)
        }}
        onEnded={handleSegmentEnd}
        aria-label={`Podcast segment ${currentSeg + 1}`}
      />

      <audio ref={answerRef} onEnded={handleAnswerEnd} aria-label="Question answer audio" />

      <div className="mb-3 flex items-center gap-2">
        <Volume2 size={15} className="shrink-0 text-purple-600 dark:text-purple-400" aria-hidden="true" />
        <span className="flex-1 truncate text-sm font-semibold text-purple-900 dark:text-purple-100">{topic}</span>
        <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600 dark:bg-purple-900 dark:text-purple-300">
          {seg ? speakerLabel(seg.speaker) : ''}
        </span>
      </div>

      <div className="mb-3 flex gap-1" aria-label="Podcast segments" role="list">
        {segments.map((segment, index) => (
          <div
            key={index}
            role="listitem"
            title={speakerLabel(segment.speaker)}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              index < currentSeg
                ? 'bg-purple-600'
                : index === currentSeg
                  ? segment.speaker === 'HOST'
                    ? 'animate-pulse bg-purple-500'
                    : 'animate-pulse bg-blue-500'
                  : 'bg-gray-200 dark:bg-slate-600',
            )}
            aria-current={index === currentSeg ? 'true' : undefined}
          />
        ))}
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={progress}
        onChange={(event) => {
          if (!audioRef.current) return
          const pct = Number(event.target.value)
          audioRef.current.currentTime = (pct / 100) * (audioRef.current.duration || 0)
          setProgress(pct)
        }}
        className="mb-3 h-1.5 w-full cursor-pointer accent-purple-600"
        aria-label="Seek within current segment"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${formatTime((progress / 100) * duration)} of ${formatTime(duration)}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            void togglePlay()
          }}
          aria-label={isPlaying ? 'Pause podcast' : 'Play podcast'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white transition-colors hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
        >
          {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        </button>

        <button
          type="button"
          onClick={() => {
            setCurrentSeg(0)
            setProgress(0)
            if (audioRef.current) {
              audioRef.current.src = ''
            }
            setIsPlaying(false)
          }}
          aria-label="Restart podcast from beginning"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
        >
          <RotateCcw size={15} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
          {[0.75, 1, 1.25, 1.5].map((candidate) => (
            <button
              key={candidate}
              type="button"
              onClick={() => {
                setSpeed(candidate)
                if (audioRef.current) {
                  audioRef.current.playbackRate = candidate
                }
              }}
              aria-pressed={speed === candidate}
              aria-label={`${candidate}x speed`}
              className={cn(
                'min-h-[36px] rounded px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
                speed === candidate
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-purple-100 dark:bg-slate-700 dark:text-gray-300',
              )}
            >
              {candidate}x
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleInterrupt}
          disabled={qaState !== 'closed'}
          aria-label="Interrupt podcast and ask a question"
          className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900"
        >
          <MessageSquare size={13} aria-hidden="true" />
          Ask a Question
        </button>

        <span className="ml-auto text-xs text-purple-500 dark:text-purple-400">
          {segments.length > 0 ? `${currentSeg + 1}/${segments.length}` : '0/0'}
        </span>
      </div>

      {qaState !== 'closed' && (
        <div
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950"
          role="dialog"
          aria-label="Ask the hosts a question"
          aria-modal="false"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Ask the hosts</p>
            <button
              type="button"
              onClick={closeQA}
              disabled={qaState === 'thinking'}
              aria-label="Close question panel and resume podcast"
              className="rounded text-amber-600 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-40 dark:text-amber-400"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {qaState === 'open' && (
            <div className="mb-3 flex gap-2" role="group" aria-label="Choose input method">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                aria-pressed={inputMode === 'text'}
                className={cn(
                  'flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
                  inputMode === 'text'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-gray-700 dark:bg-slate-700 dark:text-gray-300',
                )}
              >
                <MessageSquare size={12} aria-hidden="true" />
                Type
              </button>
              <button
                type="button"
                onClick={() => setInputMode('voice')}
                aria-pressed={inputMode === 'voice'}
                className={cn(
                  'flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
                  inputMode === 'voice'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-gray-700 dark:bg-slate-700 dark:text-gray-300',
                )}
              >
                <Mic size={12} aria-hidden="true" />
                Speak
              </button>
            </div>
          )}

          {qaState === 'open' && inputMode === 'text' && (
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && question.trim()) {
                    void submitQuestion(question)
                  }
                }}
                placeholder="What do you want to ask?"
                autoFocus
                className="min-h-[44px] flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-amber-700 dark:bg-slate-700 dark:text-gray-100"
                aria-label="Type your question"
              />
              <button
                type="button"
                onClick={() => {
                  void submitQuestion(question)
                }}
                disabled={!question.trim()}
                className="min-h-[44px] rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                Ask
              </button>
            </div>
          )}

          {qaState === 'open' && inputMode === 'voice' && (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                aria-label={isListening ? 'Stop listening' : 'Start speaking your question'}
                aria-pressed={isListening}
                className={cn(
                  'flex min-h-[44px] items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
                  isListening ? 'animate-pulse bg-red-500 text-white' : 'bg-amber-500 text-white hover:bg-amber-600',
                )}
              >
                {isListening ? (
                  <>
                    <MicOff size={16} aria-hidden="true" />
                    Listening... tap to stop
                  </>
                ) : (
                  <>
                    <Mic size={16} aria-hidden="true" />
                    Tap to speak
                  </>
                )}
              </button>
              {question && <p className="text-center text-xs italic text-amber-700 dark:text-amber-300">"{question}"</p>}
            </div>
          )}

          {qaState === 'thinking' && (
            <div className="flex items-center gap-3" role="status" aria-live="polite" aria-busy="true">
              <div
                className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-t-amber-600"
                aria-hidden="true"
              />
              <p className="text-sm text-amber-700 dark:text-amber-300">The host is finding your answer...</p>
            </div>
          )}

          {qaState === 'answering' && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Host answer</p>
              <p className="rounded-lg border border-amber-100 bg-white p-3 text-sm leading-relaxed text-gray-800 dark:border-amber-900 dark:bg-slate-800 dark:text-gray-200">
                {answerText}
              </p>
              <p className="mt-2 text-center text-xs text-amber-500 dark:text-amber-400" aria-live="polite">
                Podcast will resume automatically.
              </p>
              {answerUrl && (
                <a
                  href={answerUrl}
                  className="mt-2 inline-flex rounded text-xs text-amber-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300"
                >
                  Answer audio ready
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {seg && (
        <div className="mt-3 rounded-lg border border-purple-100 bg-white/60 px-3 py-2 dark:border-purple-900 dark:bg-slate-800/60">
          <p className="mb-0.5 text-xs font-medium text-purple-500 dark:text-purple-400">{speakerLabel(seg.speaker)}</p>
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300">{seg.text}</p>
        </div>
      )}

      {segments[0]?.audioUrl && (
        <div className="mt-3 flex justify-end">
          <a
            href={segments[0].audioUrl}
            download={`${topic.replace(/\s+/g, '-')}.mp3`}
            className="flex min-h-[44px] items-center gap-1 rounded text-xs text-purple-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:text-purple-400"
            aria-label="Download podcast"
          >
            <Download size={13} aria-hidden="true" />
            Download
          </a>
        </div>
      )}
    </div>
  )
}
