'use client'
import SwaggerUI from 'swagger-ui-react'

export default function SwaggerPage() {
  return (
    <main className="min-h-screen p-8 lg:p-12">
      <h1 className="text-3xl font-medium mb-6">API Documentation</h1>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <SwaggerUI url="/openapi.yaml" docExpansion="list" defaultModelsExpandDepth={0} />
      </div>
    </main>
  )
}
