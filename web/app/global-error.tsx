'use client'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  Sentry.captureException(error)
  return (
    <html lang="fr">
      <body>
        <main className="min-h-screen p-8 lg:p-12">
<h1 className="text-3xl font-medium mb-4">Une erreur s&apos;est produite</h1>
          <p className="opacity-80 mb-6">Notre équipe a été notifiée. Vous pouvez réessayer.</p>
          <button className="btn btn-primary" onClick={() => reset()}>Réessayer</button>
        </main>
      </body>
    </html>
  )
}