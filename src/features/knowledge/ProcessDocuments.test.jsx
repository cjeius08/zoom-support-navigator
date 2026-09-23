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
