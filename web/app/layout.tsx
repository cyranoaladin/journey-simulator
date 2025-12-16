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
