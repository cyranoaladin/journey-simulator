import { Suspense, lazy } from 'react'
import type { ComponentProps } from 'react'

type WalletMultiButtonProps = ComponentProps<
  typeof import('@solana/wallet-adapter-react-ui').WalletMultiButton
>

const WalletMultiButton = lazy(async () => {
  const module = await import('@solana/wallet-adapter-react-ui')
  return { default: module.WalletMultiButton }
})

const LazyWalletMultiButton = (props: WalletMultiButtonProps) => {
  return (
    <Suspense
      fallback={
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-gradient-primary text-white font-medium"
          disabled
        >
          Loading wallet...
        </button>
      }
    >
      <WalletMultiButton {...props} />
    </Suspense>
  )
}

export default LazyWalletMultiButton
