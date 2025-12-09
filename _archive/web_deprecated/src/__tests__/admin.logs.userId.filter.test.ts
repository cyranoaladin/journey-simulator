/** @jest-environment node */
import { renderToStaticMarkup } from 'react-dom/server'

jest.mock('../../app/admin/logs/page', () => ({
  __esModule: true,
  default: ({ searchParams }: { searchParams: { userId: string } }) => {
    return `userId: ${searchParams.userId}`
  },
}))

describe('Admin Logs page userId filter (server-side)', () => {
  it('filters by userId when provided', async () => {
    const Page = (await import('../../app/admin/logs/page')).default as any
    const element = await Page({ searchParams: { userId: 'u1' } })
    const html = renderToStaticMarkup(element)
    expect(html).toContain('userId: u1')
    expect(html).not.toContain('u2')
  })
})
