'use client'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  Sentry.captureException(error)
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen p-8 lg:p-12">
          <h1 className="text-3xl font-medium mb-4">An error occurred</h1>
          <p className="opacity-80 mb-6">Our team has been notified. You can try again.</p>
          <button className="btn btn-primary" onClick={() => reset()}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
