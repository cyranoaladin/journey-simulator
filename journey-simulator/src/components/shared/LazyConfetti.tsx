/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { Suspense, lazy } from 'react'
import type { ComponentProps } from 'react'

type ConfettiProps = ComponentProps<typeof import('react-confetti').default>

const Confetti = lazy(async () => {
  const module = await import('react-confetti')
  return { default: module.default }
})

export default function LazyConfetti(props: ConfettiProps) {
  return (
    <Suspense fallback={null}>
      <Confetti {...props} />
    </Suspense>
  )
}
