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
