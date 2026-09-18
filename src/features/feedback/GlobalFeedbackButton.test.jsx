import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { buildGlobalFeedbackContext, GlobalFeedbackButton } from './GlobalFeedbackButton'

it('captures hidden report context at the moment the report is opened', () => {
  const originalWidth = window.innerWidth
  const originalHeight = window.innerHeight
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 777 })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 488 })

  try {
    const context = buildGlobalFeedbackContext('navigator', {
      selected_tab: 'Visual Guide',
      current_section: 'Common Issue drawer',
      active_device: 'Windows',
      active_caller_role: 'Participant',
      active_common_issue: 'camera-not-working',
      process_id: 'testing-your-video-in-zoom',
      category_id: 'video',
    })

    expect(context.route_id).toBe('navigator')
    expect(context.page_label).toBe('Navigator')
    expect(context.selected_tab).toBe('Visual Guide')
    expect(context.active_device).toBe('Windows')
    expect(context.active_caller_role).toBe('Participant')
    expect(context.active_common_issue).toBe('camera-not-working')
    expect(context.viewport_width).toBe(777)
    expect(context.viewport_height).toBe(488)
    expect(context.browser_user_agent).toBe(navigator.userAgent)
    expect(context.client_reported_at).toMatch(/T/)
  } finally {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalHeight })
  }
})

it('renders the report button globally and submits the captured page context', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn().mockResolvedValue(undefined)

  render(<GlobalFeedbackButton
    currentView="training"
    reportContext={{
      selected_tab: 'Scenario Scripts',
      current_section: 'Screen Share',
      active_device: null,
      active_caller_role: null,
      active_common_issue: null,
    }}
    onSubmit={onSubmit}
  />)

  const button = screen.getByRole('button', { name: /Report an issue from Training & Resources/i })
  await user.click(button)

  const dialog = screen.getByRole('dialog', { name: 'Report an issue' })
  expect(within(dialog).getByText('Training & Resources')).toBeInTheDocument()
  expect(within(dialog).getByText('Scenario Scripts')).toBeInTheDocument()

  await user.type(within(dialog).getByLabelText('What did you notice?'), 'The script card is clipped.')
  await user.click(within(dialog).getByRole('button', { name: 'Send feedback' }))

  expect(onSubmit).toHaveBeenCalledTimes(1)
  expect(onSubmit.mock.calls[0][0]).toMatchObject({
    route_id: 'training',
    page_label: 'Training & Resources',
    selected_tab: 'Scenario Scripts',
    current_section: 'Screen Share',
    what_noticed: 'The script card is clipped.',
  })
  expect(onSubmit.mock.calls[0][0].browser_user_agent).toBe(navigator.userAgent)
  expect(onSubmit.mock.calls[0][0].viewport_width).toBe(window.innerWidth)
  expect(onSubmit.mock.calls[0][0].viewport_height).toBe(window.innerHeight)
})

it('keeps the global report button independent of the current page', () => {
  const { rerender } = render(<GlobalFeedbackButton currentView="navigator" reportContext={{}} onSubmit={vi.fn()} />)
  expect(screen.getByRole('button', { name: /Report an issue from Navigator/i })).toBeInTheDocument()

  rerender(<GlobalFeedbackButton currentView="usage" reportContext={{}} onSubmit={vi.fn()} />)
  expect(screen.getByRole('button', { name: /Report an issue from Usage Analytics/i })).toBeInTheDocument()
})
