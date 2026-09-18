import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { CommonIssueDrawer } from './CommonIssueDrawer'
import { COMMON_ISSUE_ROUTES } from './commonIssueRoutes'

afterEach(() => cleanup())

it('gives every current Common Issue route at least one bundled local visual', () => {
  expect(COMMON_ISSUE_ROUTES).toHaveLength(19)

  for (const route of COMMON_ISSUE_ROUTES) {
    expect(route.visuals?.length, route.id + ' should have a visual').toBeGreaterThan(0)

    for (const visual of route.visuals) {
      expect(visual.src, route.id + ' should not hotlink its visual').not.toMatch(/^https?:\/\//)
      expect(visual.title).toBeTruthy()
      expect(visual.alt).toBeTruthy()
      expect(visual.note).toBeTruthy()
      expect(visual.sourceUrl).toBeTruthy()

      const file = path.join(process.cwd(), 'public', visual.src)
      expect(fs.existsSync(file), 'Missing bundled visual for ' + route.id + ': ' + visual.src).toBe(true)
      expect(fs.statSync(file).size).toBeGreaterThan(1000)
    }
  }
})

it.each(COMMON_ISSUE_ROUTES.map(route => [route.id, route]))(
  'renders the photo/visual before optional links and never shows the fallback for %s',
  async (_routeId, route) => {
    const user = userEvent.setup()
    render(<CommonIssueDrawer
      route={route}
      callContext={{ device: null, role: null, status: null }}
      onClose={() => {}}
      onOpenProcess={() => {}}
      onOpenRoute={() => {}}
      onStatusChange={() => {}}
    />)

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('tab', { name: 'Visual Guide' }))

    const image = within(dialog).getByRole('img')
    const links = within(dialog).getAllByRole('link')

    expect(image).toHaveAttribute('src', expect.stringContaining(route.visuals[0].src))
    expect(within(dialog).queryByText(/No reviewed visual yet for this route/i)).not.toBeInTheDocument()
    expect(links.length).toBeGreaterThan(0)
    expect(image.compareDocumentPosition(links[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  }
)
