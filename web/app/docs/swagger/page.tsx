'use client'
import SwaggerUI from 'swagger-ui-react'

export default function SwaggerPage() {
  return (
    <div className="container mx-auto p-4">
      <SwaggerUI url="/openapi.json" />
    </div>
  )
}
