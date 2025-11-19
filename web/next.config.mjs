import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const csp = isProd
  ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"
  : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    typedRoutes: true,
  },
  headers: async () => ([{
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: csp }
    ]
  }]),
}
export default withSentryConfig(nextConfig, { silent: true }, { hideSourceMaps: true })
