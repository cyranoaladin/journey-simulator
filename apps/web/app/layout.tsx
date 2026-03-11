/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import './globals.css'
import 'swagger-ui-react/swagger-ui.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journey Web API',
  description: 'Next.js API gateway (UI désactivée)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
