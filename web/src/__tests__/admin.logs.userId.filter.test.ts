/** @jest-environment node */
import { renderToStaticMarkup } from 'react-dom/server'

const findManyMock = jest.fn(async (args?: any) => {
  // Return only u1 if where.userId is set, else return both
  if (args?.where?.userId === 'u1') {
    return [
      {
        id: 'l1',
        userId: 'u1',
        ts: new Date('2025-01-01T10:00:00Z'),
        agent: 'Zyno',
        action: 'step',
        details: {},
      },
    ]
  }
  return [
    {
      id: 'l1',
      userId: 'u1',
      ts: new Date('2025-01-01T10:00:00Z'),
      agent: 'Zyno',
      action: 'step',
      details: {},
    },
    {
      id: 'l2',
      userId: 'u2',
      ts: new Date('2025-01-02T10:00:00Z'),
      agent: 'Zyno',
      action: 'step',
      details: {},
    },
  ]
})

jest.mock('@/server/db', () => ({
  prisma: {
    agentLog: { findMany: (args?: any) => findManyMock(args) },
  },
}))

describe('Admin Logs page userId filter (server-side)', () => {
  it('filters by userId when provided', async () => {
    const Page = (await import('../../app/admin/logs/page')).default as any
    const element = await Page({ searchParams: { userId: 'u1' } })
    const html = renderToStaticMarkup(element)
    expect(findManyMock).toHaveBeenCalled()
    expect(html).toContain('userId:')
    expect(html).toContain('u1')
    expect(html).not.toContain('u2')
  })
})
