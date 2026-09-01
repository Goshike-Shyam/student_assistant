'use client'

import confetti from 'canvas-confetti'

type CelebrationKind = 'submit' | 'badge'

export function celebrate(kind: CelebrationKind = 'submit') {
  if (typeof window === 'undefined') return

  if (kind === 'badge') {
    confetti({
      particleCount: 140,
      spread: 95,
      startVelocity: 38,
      origin: { y: 0.62 },
    })
    return
  }

  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 35,
    origin: { y: 0.65 },
  })

  window.setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 65,
      startVelocity: 25,
      origin: { y: 0.68 },
    })
  }, 160)
}
