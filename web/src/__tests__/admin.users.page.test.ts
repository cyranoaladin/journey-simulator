/** @jest-environment node */
import { renderToStaticMarkup } from 'react-dom/server'

jest.mock('@/server/db', () => ({
  prisma: {
    agentLog: {
      findMany: jest.fn(async () => [
        { userId: 'u1', ts: new Date('2025-01-01T10:00:00Z') },
        { userId: 'u2', ts: new Date('2025-01-02T10:00:00Z') },
      ]),
    },
    mintLog: {
      findMany: jest.fn(async () => [
        { userId: 'u3', createdAt: new Date('2025-01-03T10:00:00Z') },
      ]),
    },
  },
}))

describe('Admin Users page', () => {
  it('renders table with heading and columns', async () => {
    const Page = (await import('../../app/admin/users/page')).default as any
    const element = await Page()
    const html = renderToStaticMarkup(element)
    expect(html).toContain('Recent users (last 20)')
    expect(html).toContain('<table')
    expect(html).toContain('User ID')
    expect(html).toContain('Last seen')
    expect(html).toContain('Sources')
  })
})
