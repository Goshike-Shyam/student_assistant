'use client'

import { useEffect, useState } from 'react'

type FeedbackItem = {
  id: string
  displayName: string
  userRole: string
  feedbackText: string
  attachmentUrl: string | null
  attachmentName: string | null
  tone: string
  showOnHomepage: boolean
  adminNote: string | null
  createdAt: string
}

const TONE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  Appreciation: {
    bg: '#D1FAE5',
    color: '#065F46',
    label: 'Appreciation',
  },
  Improvement: {
    bg: '#FEF3C7',
    color: '#92400E',
    label: 'Improvement',
  },
  Frustration: {
    bg: '#FEE2E2',
    color: '#991B1B',
    label: 'Frustration',
  },
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/feedback')
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleHomepage = async (id: string, current: boolean) => {
    setSaving(id)
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          showOnHomepage: !current,
        }),
      })

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, showOnHomepage: !current } : item)),
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  const approvedCount = items.filter((item) => item.showOnHomepage).length

  return (
    <div
      style={{
        padding: '28px 24px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 1200,
      }}
    >
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#111',
              marginBottom: 4,
            }}
          >
            Feedback and Testimonials
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280' }}>
            {items.length} total - <strong style={{ color: '#065F46' }}>{approvedCount} approved</strong> for homepage
          </p>
        </div>
        <div
          style={{
            background: '#D1FAE5',
            border: '1px solid #6EE7B7',
            borderRadius: 10,
            padding: '8px 14px',
            fontSize: 12,
            color: '#065F46',
            fontWeight: 500,
          }}
        >
          Checked rows appear on the landing page
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF', fontSize: 14 }}>
          Loading feedback...
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 48,
            color: '#9CA3AF',
            fontSize: 14,
            border: '1px dashed #D1D5DB',
            borderRadius: 12,
          }}
        >
          No feedback submitted yet.
        </div>
      ) : (
        <div
          style={{
            overflowX: 'auto',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
              backgroundColor: '#fff',
            }}
          >
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Date', 'Name', 'Role', 'Feedback', 'Tone', 'Attachment', 'Show on Homepage'].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#374151',
                      fontSize: 12,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const toneStyle = TONE_STYLE[item.tone] ?? TONE_STYLE.Improvement
                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      background: item.showOnHomepage ? '#FAFFF8' : '#fff',
                    }}
                  >
                    <td
                      style={{
                        padding: '10px 14px',
                        whiteSpace: 'nowrap',
                        color: '#6B7280',
                        verticalAlign: 'top',
                      }}
                    >
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td
                      style={{
                        padding: '10px 14px',
                        fontWeight: 500,
                        color: '#111',
                        verticalAlign: 'top',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.displayName}
                    </td>

                    <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                      <span
                        style={{
                          background: item.userRole === 'student' ? '#EEF2FF' : item.userRole === 'parent' ? '#ECFDF5' : '#FFF7ED',
                          color: item.userRole === 'student' ? '#4338CA' : item.userRole === 'parent' ? '#065F46' : '#B45309',
                          padding: '2px 8px',
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.userRole}
                      </span>
                    </td>

                    <td style={{ padding: '10px 14px', maxWidth: 320, verticalAlign: 'top' }}>
                      <div
                        style={{
                          maxHeight: 120,
                          overflowY: 'auto',
                          fontSize: 12,
                          color: '#374151',
                          lineHeight: 1.6,
                          padding: '4px 6px',
                          background: '#F9FAFB',
                          borderRadius: 6,
                          border: '1px solid #E5E7EB',
                        }}
                      >
                        {item.feedbackText}
                      </div>
                    </td>

                    <td style={{ padding: '10px 14px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          background: toneStyle.bg,
                          color: toneStyle.color,
                          padding: '3px 10px',
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {toneStyle.label}
                      </span>
                    </td>

                    <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                      {item.attachmentUrl ? (
                        <a
                          href={item.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#F59E0B',
                            fontSize: 12,
                            fontWeight: 500,
                            textDecoration: 'none',
                          }}
                        >
                          {item.attachmentName?.slice(0, 20) ?? 'Download'}
                        </a>
                      ) : (
                        <span style={{ color: '#D1D5DB', fontSize: 12 }}>-</span>
                      )}
                    </td>

                    <td style={{ padding: '10px 14px', textAlign: 'center', verticalAlign: 'top' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.showOnHomepage}
                          onChange={() => toggleHomepage(item.id, item.showOnHomepage)}
                          disabled={saving === item.id}
                          style={{
                            width: 18,
                            height: 18,
                            accentColor: '#10B981',
                            cursor: 'pointer',
                          }}
                          aria-label={`Show ${item.displayName} feedback on homepage`}
                        />
                        {saving === item.id ? (
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>saving...</span>
                        ) : null}
                      </label>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
