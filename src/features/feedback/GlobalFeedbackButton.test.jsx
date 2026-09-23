import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { GlobalFeedbackButton } from './GlobalFeedbackButton'
import { buildGlobalFeedbackContext } from './feedbackContext'

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

  const button = screen.getByRole('button', { name: 'Report an issue' })
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
  expect(screen.getByRole('button', { name: 'Report an issue' })).toBeInTheDocument()

  rerender(<GlobalFeedbackButton currentView="usage" reportContext={{}} onSubmit={vi.fn()} />)
  expect(screen.getByRole('button', { name: 'Report an issue' })).toBeInTheDocument()
})


it('compacts the report button beside Readiness Lab controls and source pages', () => {
  const css = readFileSync(join(cwd(), 'src/styles.css'), 'utf8')
  expect(css).toContain('body:has(.readiness-lab-dock) .global-feedback-fab')
  expect(css).toContain('body:has(.source-pages) .global-feedback-fab')
  expect(css).toContain('body:has(.process-document-reader) .global-feedback-fab')
  expect(css).toContain('width: 2.75rem;')
  expect(css).toContain('body:has(.readiness-lab-dock) .readiness-question-nav')
  expect(css).toContain('body:has(.source-pages) .source-pages figure')
  expect(css).toContain('body:has(.process-document-reader) .process-document-page')
  expect(css).toContain('.common-issue-drawer .process-tabs > button')
})

it('uses viewport-fixed portal styling so resize and page containers cannot cover the report button', () => {
  const css = readFileSync(join(cwd(), 'src/styles.css'), 'utf8')

  expect(css).toMatch(/\.global-feedback-fab\s*\{[^}]*position:\s*fixed/)
  expect(css).toMatch(/\.global-feedback-fab\s*\{[^}]*right:\s*max\(12px,\s*env\(safe-area-inset-right\)\)/)
  expect(css).toMatch(/\.global-feedback-fab\s*\{[^}]*bottom:\s*max\(12px,\s*env\(safe-area-inset-bottom\)\)/)
  expect(css).toMatch(/\.global-feedback-fab\s*\{[^}]*z-index:\s*30000/)
  expect(css).toMatch(/\.global-feedback-fab\s*\{[^}]*max-width:\s*calc\(100vw - 24px\)/)
  expect(css).toMatch(/\.global-feedback-backdrop\s*\{[^}]*position:\s*fixed[^}]*inset:\s*0[^}]*z-index:\s*31000/)
})
