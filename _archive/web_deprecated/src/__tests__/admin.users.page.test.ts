/** @jest-environment node */
import { renderToStaticMarkup } from 'react-dom/server'

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
