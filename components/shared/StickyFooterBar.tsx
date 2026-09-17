'use client'

import { useEffect, useRef, useState } from 'react'
import { Construction } from 'lucide-react'

interface FooterLink {
  id: string
  label: string
  // UPGRADE: add href here when real pages are ready.
}

const FOOTER_LINKS: FooterLink[] = [
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'usage', label: 'Usage Policies' },
  { id: 'contact', label: 'Contact Us' },
]

const MODAL_CONTENT: Record<string, { title: string; message: string }> = {
  terms: {
    title: 'Terms & Conditions',
    message: 'Our complete Terms & Conditions page is being prepared and will be available soon.',
  },
  usage: {
    title: 'Usage Policies',
    message: 'Our Usage Policies page is being prepared and will be available soon.',
  },
  contact: {
    title: 'Contact Us',
    message: 'Our Contact Us page is being prepared. For urgent queries, reach us at support@vedaai.in',
  },
}

/**
 * STICKY FOOTER BAR CONTRACT
 * Renders on student pages only via StudentShell.
 * Replace modal open behavior with navigation when real pages exist.
 */
export function StickyFooterBar() {
  const [activeLink, setActiveLink] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const closeModal = () => {
    setActiveLink(null)
    requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }

  useEffect(() => {
    if (!activeLink) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeModal()
        return
      }

      if (event.key !== 'Tab' || !modalRef.current) return

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (!focusable.length) {
        event.preventDefault()
        modalRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    requestAnimationFrame(() => {
      modalRef.current?.focus()
    })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeLink])

  const openModal = (id: string, button: HTMLButtonElement) => {
    triggerRef.current = button
    setActiveLink(id)
  }

  const content = activeLink ? MODAL_CONTENT[activeLink] : null

  return (
    <>
      <footer
        role="contentinfo"
        aria-label="Site links"
        className="sticky bottom-0 z-30 flex w-full flex-shrink-0 flex-wrap items-center justify-center gap-1 border-t border-gray-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
      >
        {FOOTER_LINKS.map((link, index) => (
          <span key={link.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={(event) => openModal(link.id, event.currentTarget)}
              className="rounded px-1 py-1 text-xs text-gray-500 transition-colors hover:text-blue-600 hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:text-gray-400 dark:hover:text-blue-400"
              aria-haspopup="dialog"
            >
              {link.label}
            </button>
            {index < FOOTER_LINKS.length - 1 ? (
              <span className="select-none text-xs text-gray-300 dark:text-slate-600" aria-hidden="true">
                ·
              </span>
            ) : null}
          </span>
        ))}

        <span className="ml-2 select-none text-xs text-gray-300 dark:text-slate-600" aria-hidden="true">
          |
        </span>
        <span className="ml-2 select-none text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Veda AI
        </span>
      </footer>

      {activeLink && content ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeModal()
            }
          }}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
            className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl focus-visible:outline-none dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
              <Construction size={28} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
            </div>

            <h2 id="modal-title" className="mb-2 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
              {content.title}
            </h2>

            <div className="mb-4 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-200">
                🚧 Page under construction
              </span>
            </div>

            <p className="mb-6 text-center text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {content.message}
            </p>

            <button
              type="button"
              onClick={closeModal}
              className="min-h-[44px] w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}