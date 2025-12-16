import { test, expect } from '@playwright/test'

test('API-only: / redirects to simulator (307) and API endpoints respond', async ({ request }) => {
  const health = await request.get('/api/health')
  expect(health.ok()).toBeTruthy()
  const healthJson = await health.json()
  expect(healthJson).toHaveProperty('ok')

  const metrics = await request.get('/api/metrics')
  expect(metrics.ok()).toBeTruthy()
  const metricsJson = await metrics.json()
  expect(metricsJson).toHaveProperty('ok', true)
  expect(metricsJson).toHaveProperty('metrics')
  expect(metricsJson.metrics).toHaveProperty('visits')

  // Root must redirect to the real UI (journey-simulator)
  const root = await request.get('/', { maxRedirects: 0 })
  expect(root.status()).toBe(307)
  const location = root.headers()['location'] || ''
  expect(location).toContain('3003')
})

test('API-only: non-API paths return plain 404 (no UI rendering)', async ({ request }) => {
  const res = await request.get('/wallet')
  expect(res.status()).toBe(404)
  const body = await res.text()
  expect(body.toLowerCase()).toContain('not found')
})
