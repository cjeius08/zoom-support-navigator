import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { Navigator } from './Navigator'

it('opens a source-driven Call Guide with safe copy actions before lossless source views', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  expect(screen.getByRole('heading', { name: 'Live Call Flow' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Fastest Routes' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: 'Common Issues' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Process Guides' })).toBeInTheDocument()
  await user.click(screen.getByRole('tab', { name: 'Process Guides' }))
  await user.click(screen.getByRole('button', { name: /Joining Meetings/i }))
  await user.click(screen.getByRole('button', { name: /Troubleshooting When You Can’t Join a Zoom Meeting/i }))
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
  await user.click(screen.getByRole('tab', { name: 'Process Guides' }))
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

it('routes a typo in natural caller language to the Common Issue before process documentation', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  const search = screen.getByRole('combobox', { name: 'Search support processes' })

  await user.type(search, 'cant jion')

  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  const options = within(listbox).getAllByRole('option')
  expect(options.length).toBeLessThanOrEqual(6)
  expect(options[0]).toHaveTextContent('Can’t join the meeting')
  expect(options[0]).toHaveTextContent('Common Issue')

  await user.click(options[0])

  expect(screen.getByRole('dialog', { name: /Can’t join the meeting/i })).toBeInTheDocument()
})

it('routes meeting-control language to the reviewed Common Issue first', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  const search = screen.getByRole('combobox', { name: 'Search support processes' })

  await user.type(search, 'find a meeting control')

  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  const selectedOption = within(listbox).getAllByRole('option')[0]
  expect(selectedOption).toHaveTextContent('Can’t find a meeting control')
  expect(selectedOption).toHaveTextContent('Common Issue')

  await user.click(selectedOption)

  expect(screen.getByRole('dialog', { name: /Can’t find a meeting control/i })).toBeInTheDocument()
  expect(screen.queryByRole('listbox', { name: 'Search suggestions' })).not.toBeInTheDocument()
})


it.each([
  ['cant share', 'Can’t share my screen', /Sharing Your Screen, Desktop, or Content in Zoom/i],
  ['cant find chat', 'Can’t find chat \/ can’t send a message', /Chatting in a Zoom Meeting/i],
  ['find a meeting control', 'Can’t find a meeting control', /Using Participant Controls in a Zoom Meeting|Zoom Meeting Controls & Icons/i],
])('shows Common Issues before Process Guides for %s', async (query, routeTitle, processTitle) => {
  const user = userEvent.setup()
  render(<Navigator />)
  const search = screen.getByRole('combobox', { name: 'Search support processes' })

  await user.type(search, query)

  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  const options = within(listbox).getAllByRole('option')
  expect(options[0]).toHaveTextContent(routeTitle)
  expect(options[0]).toHaveTextContent('Common Issue')
  expect(options.some(option => processTitle.test(option.textContent ?? '') && /Process Guide/.test(option.textContent ?? ''))).toBe(true)

  const commonHeading = screen.getByRole('heading', { name: 'Common Issues' })
  const processHeading = screen.getByRole('heading', { name: 'Process Guides' })
  expect(commonHeading.compareDocumentPosition(processHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(screen.getByText(routeTitle)).toBeInTheDocument()
})

it('emits only identifier-based analytics events for support interactions', async () => {
  const user = userEvent.setup()
  const onTrackEvent = vi.fn()
  render(<Navigator onTrackEvent={onTrackEvent} />)

  await user.click(screen.getByRole('tab', { name: 'Process Guides' }))
  await user.click(screen.getByRole('button', { name: /Audio & Microphone/i }))
  expect(onTrackEvent).toHaveBeenCalledWith({
    eventType: 'category_open',
    routeId: 'navigator',
    categoryId: 'audio',
  })

  await user.click(screen.getByRole('button', { name: /Zoom Audio Troubleshooting/i }))
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
