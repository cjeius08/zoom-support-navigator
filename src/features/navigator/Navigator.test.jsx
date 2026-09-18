import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { Navigator } from './Navigator'

it('opens a source-driven Call Guide with safe copy actions before lossless source views', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  expect(screen.getByRole('heading', { name: 'Locate → Describe → Guide → Confirm' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Common Issues' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Customer cannot join/i }))
  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByRole('tab', { name: 'Call Guide' })).toHaveAttribute('aria-selected', 'true')
  expect(within(dialog).getByRole('button', { name: 'Copy Quick Steps' })).toBeInTheDocument()
  expect(within(dialog).getAllByRole('button', { name: 'Copy Script' }).length).toBeGreaterThan(0)
  expect(within(dialog).getAllByText(/Confirm with Customer/i).length).toBeGreaterThan(0)
  await user.click(within(dialog).getByRole('tab', { name: 'Visual Guide' }))
  expect(within(dialog).getByText(/No visual reference available|Visual 1/i)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('tab', { name: 'Source Pages' }))
  expect(within(dialog).getByText(/Page 1 of/i)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('tab', { name: 'Full Process' }))
  expect(within(dialog).getByRole('region', { name: 'Full Process' })).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: 'Close process' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('shows source-page and Zoom-visual counts on process cards', async () => {
  const user = userEvent.setup(); render(<Navigator />)
  await user.click(screen.getByRole('button', { name: /Audio & Microphone/i }))
  expect(screen.getAllByText(/source pages?/i).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/Zoom visuals?/i).length).toBeGreaterThan(0)
})

it('shows a friendly decorative icon on every support category card', () => {
  render(<Navigator />)
  const icons = screen.getAllByTestId('category-icon')
  expect(icons).toHaveLength(7)
  icons.forEach(icon => expect(icon).toHaveAttribute('aria-hidden', 'true'))
})

it('offers keyboard-accessible search suggestions and opens the highlighted process', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  const search = screen.getByRole('combobox', { name: 'Search support processes' })

  await user.type(search, 'camera')

  expect(search).toHaveAttribute('aria-expanded', 'true')
  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  expect(within(listbox).getAllByRole('option').length).toBeGreaterThan(0)

  await user.keyboard('{ArrowDown}')
  expect(search).toHaveAttribute('aria-activedescendant')
  await user.keyboard('{Enter}')

  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

it('suggests and opens the intended process even when the search has a typo', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  const search = screen.getByRole('combobox', { name: 'Search support processes' })

  await user.type(search, 'cant jion')

  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  const options = within(listbox).getAllByRole('option')
  expect(options.length).toBeLessThanOrEqual(6)
  const joinSuggestion = within(listbox).getByRole('option', { name: /Troubleshooting When You Can’t Join a Zoom Meeting/i })

  await user.click(joinSuggestion)

  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByRole('heading', { name: /Troubleshooting When You Can’t Join a Zoom Meeting/i })).toBeInTheDocument()
})

it('opens the exact process selected from meeting control suggestions', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  const search = screen.getByRole('combobox', { name: 'Search support processes' })

  await user.type(search, 'meeting control')

  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  const selectedOption = within(listbox).getAllByRole('option')[0]
  const selectedTitle = selectedOption.querySelector('strong')?.textContent
  expect(selectedTitle).toBeTruthy()

  await user.click(selectedOption)

  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByRole('heading', { name: selectedTitle })).toBeInTheDocument()
  expect(screen.queryByRole('listbox', { name: 'Search suggestions' })).not.toBeInTheDocument()
})


it('emits only identifier-based analytics events for support interactions', async () => {
  const user = userEvent.setup()
  const onTrackEvent = vi.fn()
  render(<Navigator onTrackEvent={onTrackEvent} />)

  await user.click(screen.getByRole('button', { name: /Audio & Microphone/i }))
  expect(onTrackEvent).toHaveBeenCalledWith({
    eventType: 'category_open',
    routeId: 'navigator',
    categoryId: 'audio',
  })

  await user.click(screen.getByRole('button', { name: /Customer cannot join/i }))
  const dialog = screen.getByRole('dialog')
  await user.click(within(dialog).getAllByRole('button', { name: 'Copy Script' })[0])

  const copyEvent = onTrackEvent.mock.calls.map(([event]) => event).find(event => event.eventType === 'copy_action')
  expect(copyEvent).toBeTruthy()
  expect(copyEvent).toMatchObject({ routeId: 'navigator' })
  expect(Object.keys(copyEvent)).toEqual(expect.arrayContaining(['eventType', 'routeId', 'processId', 'categoryId', 'toolId']))
  expect(copyEvent).not.toHaveProperty('text')
  expect(copyEvent).not.toHaveProperty('searchQuery')
  expect(copyEvent).not.toHaveProperty('clipboard')
})


it('shows the Core Live Call Flow before the process library', () => {
  render(<Navigator />)
  const liveFlow = screen.getByRole('region', { name: 'Core Live Call Flow' })
  const search = screen.getByRole('combobox', { name: 'Search support processes' })
  expect(liveFlow).toBeInTheDocument()
  expect(liveFlow.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})
