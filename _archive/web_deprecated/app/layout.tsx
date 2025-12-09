import './globals.css'
import 'swagger-ui-react/swagger-ui.css'
import type { Metadata } from 'next'
import WalletProvider from '@/components/WalletProvider'

export const metadata: Metadata = {
  title: 'Journey Web',
  description: 'Premium dashboard front (Next.js) — browser-first',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  )
}
