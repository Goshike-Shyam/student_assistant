'use client'

import { CSSProperties, FormEvent, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type ToneName = 'Appreciation' | 'Improvement' | 'Frustration'

export default function FeedbackPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    displayName: '',
    feedbackText: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ tone: ToneName } | null>(null)
  const [fileError, setFileError] = useState('')

  const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'doc', 'docx']

  const TONE_CONFIG: Record<ToneName, { emoji: string; color: string; bg: string; label: string }> = {
    Appreciation: {
      emoji: 'STAR',
      color: '#065F46',
      bg: '#D1FAE5',
      label: 'Appreciation',
    },
    Improvement: {
      emoji: 'IDEA',
      color: '#92400E',
      bg: '#FEF3C7',
      label: 'Improvement',
    },
    Frustration: {
      emoji: 'ALERT',
      color: '#991B1B',
      bg: '#FEE2E2',
      label: 'Frustration',
    },
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) {
      setFile(null)
      return
    }

    const ext = selected.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ALLOWED_EXT.includes(ext)) {
      setFileError('Only JPG, JPEG, PNG, DOC files allowed')
      setFile(null)
      return
    }

    if (selected.size > 5 * 1024 * 1024) {
      setFileError('File must be under 5MB')
      setFile(null)
      return
    }

    setFileError('')
    setFile(selected)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.displayName.trim()) {
      setError('Display name is required')
      return
    }

    if (form.feedbackText.trim().length < 10) {
      setError('Please enter at least 10 characters')
      return
    }

    setSubmitting(true)
    let attachmentUrl: string | null = null
    let attachmentName: string | null = null

    if (file) {
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('attachment', file)

        const uploadRes = await fetch('/api/feedback/upload', {
          method: 'POST',
          body: fd,
        })

        const uploadData = await uploadRes.json()

        if (!uploadRes.ok) {
          setError(uploadData.error ?? 'File upload failed')
          setUploading(false)
          setSubmitting(false)
          return
        }

        attachmentUrl = uploadData.url
        attachmentName = uploadData.name
      } catch {
        setError('File upload failed. Try again.')
        setUploading(false)
        setSubmitting(false)
        return
      }
      setUploading(false)
    }

    try {
      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      const parsedUser = userRaw ? JSON.parse(userRaw) : null
      const userId = parsedUser?.id ? String(parsedUser.id) : ''

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          displayName: form.displayName,
          feedbackText: form.feedbackText,
          attachmentUrl,
          attachmentName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to submit feedback.')
        } else {
          setError(data.error ?? 'Submission failed')
        }
        return
      }

      setSuccess({ tone: data.tone as ToneName })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    const tc = TONE_CONFIG[success.tone] ?? TONE_CONFIG.Appreciation

    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#FFFBF5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: `2px solid ${tc.bg}`,
            borderRadius: 16,
            padding: 32,
            maxWidth: 420,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{tc.emoji}</div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#1C1917',
              marginBottom: 8,
            }}
          >
            Thank you for your feedback
          </h2>
          <div
            style={{
              display: 'inline-block',
              background: tc.bg,
              color: tc.color,
              padding: '4px 14px',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            Classified as: {tc.label}
          </div>
          <p
            style={{
              fontSize: 13,
              color: '#78716C',
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            Your feedback has been saved. If selected by our team, it may appear on our homepage.
          </p>
          <button
            onClick={() => router.back()}
            style={{
              background: '#F59E0B',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: 99,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Back to app
          </button>
        </div>
      </div>
    )
  }

  const rowStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '160px 1fr',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 18,
  }
  const labelStyle: CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    paddingTop: 10,
  }
  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #D1D5DB',
    fontSize: 14,
    color: '#111',
    background: '#fff',
    outline: 'none',
    minHeight: 44,
    fontFamily: 'inherit',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFBF5',
        padding: '40px 16px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>FEEDBACK</div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#1C1917',
              marginBottom: 6,
            }}
          >
            Share your feedback
          </h1>
          <p style={{ fontSize: 14, color: '#78716C' }}>
            Your experience helps us improve Veda AI for every student.
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #FDE68A',
            borderRadius: 16,
            padding: '28px 32px',
          }}
        >
          {error ? (
            <div
              role="alert"
              style={{
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                color: '#991B1B',
                marginBottom: 18,
              }}
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} noValidate>
            <div style={rowStyle}>
              <label htmlFor="displayName" style={labelStyle}>
                Display Name
                <span aria-hidden="true" style={{ color: '#EF4444', marginLeft: 2 }}>
                  *
                </span>
              </label>
              <div>
                <input
                  id="displayName"
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  required
                  aria-required="true"
                  maxLength={100}
                  placeholder="Name shown on testimonial"
                  style={inputStyle}
                />
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                  This name will be shown publicly if selected
                </p>
              </div>
            </div>

            <div style={rowStyle}>
              <label htmlFor="feedbackText" style={labelStyle}>
                Feedback
                <span aria-hidden="true" style={{ color: '#EF4444', marginLeft: 2 }}>
                  *
                </span>
              </label>
              <div>
                <textarea
                  id="feedbackText"
                  value={form.feedbackText}
                  onChange={(e) => setForm((f) => ({ ...f, feedbackText: e.target.value }))}
                  required
                  aria-required="true"
                  rows={10}
                  maxLength={2000}
                  placeholder="Share your experience with Veda AI - what you love, what could be better, or anything else on your mind."
                  style={{
                    ...inputStyle,
                    minHeight: 'unset',
                    resize: 'vertical',
                    lineHeight: 1.6,
                  }}
                />
                <p
                  style={{
                    fontSize: 11,
                    color: '#9CA3AF',
                    marginTop: 4,
                    textAlign: 'right',
                  }}
                >
                  {form.feedbackText.length}/2000
                </p>
              </div>
            </div>

            <div style={rowStyle}>
              <label htmlFor="attachment" style={labelStyle}>
                Attachment
                <span
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 400,
                    color: '#9CA3AF',
                    marginTop: 2,
                  }}
                >
                  Optional
                </span>
              </label>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    id="attachment"
                    type="text"
                    readOnly
                    value={file?.name ?? ''}
                    placeholder="No file selected"
                    style={{
                      ...inputStyle,
                      flex: 1,
                      background: '#F9FAFB',
                      cursor: 'default',
                      color: '#6B7280',
                    }}
                    aria-label="Selected file name"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      background: '#F59E0B',
                      color: '#fff',
                      padding: '10px 18px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      minHeight: 44,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    Upload
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    aria-label="Upload attachment"
                  />
                </div>

                {fileError ? (
                  <p role="alert" style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>
                    {fileError}
                  </p>
                ) : null}

                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                  JPG, JPEG, PNG or DOC - max 5MB
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 8,
                paddingTop: 16,
                borderTop: '1px solid #F3F4F6',
              }}
            >
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  background: '#fff',
                  color: '#374151',
                  padding: '10px 22px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  border: '1px solid #D1D5DB',
                  cursor: 'pointer',
                  minHeight: 44,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                style={{
                  background: submitting || uploading ? '#FCD34D' : '#F59E0B',
                  color: '#fff',
                  padding: '10px 26px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  minHeight: 44,
                  opacity: submitting ? 0.8 : 1,
                }}
              >
                {uploading ? 'Uploading...' : submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
