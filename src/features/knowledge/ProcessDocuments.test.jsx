import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { ProcessDocuments } from './ProcessDocuments'

it('keeps the Process Documents library searchable and opens the original source pages', async () => {
  const user = userEvent.setup()
  const onTrackEvent = vi.fn()
  const onReportContextChange = vi.fn()

  render(
    <ProcessDocuments
      onTrackEvent={onTrackEvent}
      onReportContextChange={onReportContextChange}
    />,
  )

  expect(screen.getByRole('heading', { name: 'Process Documents' })).toBeInTheDocument()
  const search = screen.getByRole('searchbox', { name: 'Find a process document' })
  await user.type(search, 'Joining a Zoom Meeting')

  const title = screen.getByText('Joining a Zoom Meeting', { selector: 'strong' })
  const documentButton = title.closest('button')
  expect(documentButton).toBeVisible()

  await user.click(documentButton)

  expect(screen.getByRole('heading', { name: 'Joining a Zoom Meeting' })).toBeInTheDocument()
  expect(screen.getByText(/Page 1 of/i)).toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: 'Open full size' }).length).toBeGreaterThan(0)
  expect(onTrackEvent).toHaveBeenCalledWith(expect.objectContaining({
    routeId: 'process_documents',
    toolId: 'source_document',
  }))

  await user.click(screen.getByRole('button', { name: /Back to Process Documents/i }))
  expect(screen.getByRole('heading', { name: 'Process Documents' })).toBeInTheDocument()
})

it('shows an empty state for a process-document search with no match', async () => {
  const user = userEvent.setup()
  render(<ProcessDocuments />)

  await user.type(screen.getByRole('searchbox', { name: 'Find a process document' }), 'no-such-process-xyz')
  expect(screen.getByRole('heading', { name: 'No process document found' })).toBeInTheDocument()
})


it.each(['cant join', "can't join", 'can’t join'])(
  'finds Can’t Join in Process Documents when searching %s',
  async (query) => {
    const user = userEvent.setup()
    render(<ProcessDocuments />)

    await user.type(screen.getByRole('searchbox', { name: 'Find a process document' }), query)

    expect(screen.getByText('Troubleshooting When You Can’t Join a Zoom Meeting', { selector: 'strong' }))
      .toBeVisible()
  },
)

it('imports both breakout room guides and the safe Hub reference without duplicate source records', async () => {
  const user = userEvent.setup()
  const onOpenReference = vi.fn()
  render(<ProcessDocuments onOpenReference={onOpenReference} />)
  const search=screen.getByRole('searchbox', {name:'Find a process document'})
  await user.type(search,'breakout rooms')
  expect(screen.getByText('Participating in Meeting Breakout Rooms', {selector:'strong'})).toBeVisible()
  expect(screen.getByText('Managing Meeting Breakout Rooms', {selector:'strong'})).toBeVisible()
  await user.clear(search)
  await user.type(search,'PMI')
  const hubCard=screen.getByText('Flex Arbitration Hub – Agent Reference Guide',{selector:'strong'}).closest('button')
  expect(hubCard).toBeVisible()
  await user.click(hubCard)
  expect(screen.getByText(/Arbitrators CANNOT stop or turn off recordings/)).toBeInTheDocument()
  expect(screen.getByText(/internal-only escalation email address is withheld/)).toBeInTheDocument()
  expect(document.body.textContent).not.toContain('odflexmassarbs@')
  await user.click(screen.getByRole('button',{name:/Open guided Flex Arbitration Hub reference/}))
  expect(onOpenReference).toHaveBeenCalledWith('flex_hub')
})

it('keeps breakout room original source text available in Process Documents', async () => {
  const user = userEvent.setup()
  render(<ProcessDocuments />)
  const search=screen.getByRole('searchbox',{name:'Find a process document'})
  await user.type(search,'Participating in Meeting Breakout Rooms')
  await user.click(screen.getByText('Participating in Meeting Breakout Rooms',{selector:'strong'}).closest('button'))
  expect(screen.getByText(/Leave Breakout Room/)).toBeInTheDocument()
})
