import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeedbackForm } from '../feedback/FeedbackForm'
import { AppShell } from '../shell/AppShell'

const read = path => readFileSync(join(cwd(),path),'utf8')
const css = read('src/features/theme/finalQaBatch9.css')
const app = read('src/App.jsx')
const shell = read('src/features/shell/AppShell.jsx')
const feedback = read('src/features/feedback/FeedbackForm.jsx')

describe('Batch 9: final workspace UI, keyboard, and responsive QA',()=>{
  it('identifies error message uniquely across inline Feedback and the floating Report dialog',async()=>{
    const user = userEvent.setup()
    render(<>
      <FeedbackForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      <FeedbackForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    </>)
    const forms = screen.getAllByRole('form',{name:'Report feedback'})
    expect(forms).toHaveLength(2)
    await user.click(within(forms[0]).getByRole('button',{name:'Send feedback'}))
    await user.click(within(forms[1]).getByRole('button',{name:'Send feedback'}))
    const firstError = within(forms[0]).getByRole('alert')
    const secondError = within(forms[1]).getByRole('alert')
    expect(firstError).toHaveTextContent('Tell us what you noticed.')
    expect(secondError).toHaveTextContent('Tell us what you noticed.')
    expect(firstError.id).toBeTruthy()
    expect(secondError.id).toBeTruthy()
    expect(firstError.id).not.toBe(secondError.id)
    const firstWhat = within(forms[0]).getByRole('textbox',{name:'What did you notice?'})
    const secondWhat = within(forms[1]).getByRole('textbox',{name:'What did you notice?'})
    expect(firstWhat).toHaveAttribute('aria-describedby',firstError.id)
    expect(secondWhat).toHaveAttribute('aria-describedby',secondError.id)
    expect(secondWhat).toHaveFocus()
  })

  it('retains normal Feedback submission and Cancel interactions',async()=>{
    const user=userEvent.setup()
    const onSubmit=vi.fn().mockResolvedValue(undefined)
    const onCancel=vi.fn()
    render(<FeedbackForm onSubmit={onSubmit} onCancel={onCancel} context={{page_label:'Dashboard'}}/>)
    await user.type(screen.getByRole('textbox',{name:'What did you notice?'}),'A missing label')
    await user.click(screen.getByRole('button',{name:'Send feedback'}))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      what_noticed:'A missing label',page_label:'Dashboard'
    }))
    await user.click(screen.getByRole('button',{name:'Cancel'}))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(feedback).toContain('const errorId = useId()')
    expect(feedback).toContain('whatRef.current?.focus()')
  })

  it('keeps approved Day blue and near-black Night description accurate for everyone',async()=>{
    const user=userEvent.setup()
    render(<AppShell profile={{username:'agent_one',initials:'AO',role:'agent',workspace_role:'member'}}/>)
    await user.click(screen.getByRole('button',{name:'agent_one account'}))
    await user.click(screen.getByRole('button',{name:'Appearance'}))
    expect(screen.getByRole('button',{name:/Day Mode/})).toHaveTextContent('Pale-blue workspace background')
    expect(screen.getByRole('button',{name:/Night Mode/})).toHaveTextContent('Near-black workspace background')
    expect(shell).not.toContain('muted turquoise accents.')
    expect(shell).not.toContain('Deep charcoal Dashboard background')
    expect(screen.getByRole('button',{name:/Day Mode/})).toHaveAttribute('aria-pressed','true')
  })

  it('keeps report button compact on narrow windows without hiding accessible name',()=>{
    expect(css).toContain('@media (max-width: 680px)')
    expect(css).toContain('body .global-feedback-fab > strong')
    expect(css).toContain('body:has(.process-document-grid) .global-feedback-fab > strong')
    expect(css).toContain('max-height: calc(100dvh - 1rem)')
    expect(css).toContain('max-width: calc(100vw - 1rem)')
    expect(css).toContain('.global-feedback-dialog [role="alert"]')
    expect(read('src/features/feedback/GlobalFeedbackButton.jsx')).toContain('aria-label="Report an issue"')
  })

  it('preserves desktop hover pointer bridge and accessible mobile dropdown scrolling',()=>{
    expect(css).toContain('@media (max-width: 800px), (hover: none) and (pointer: coarse)')
    expect(css).toContain('max-height: min(70dvh,33rem)')
    const idx=css.indexOf('max-height: min(70dvh,33rem)')
    const enclosingMedia=css.lastIndexOf('@media (max-width: 800px)',idx)
    expect(enclosingMedia).toBeGreaterThanOrEqual(0)
    const header = read('src/features/shell/headerBatch5.css')
    expect(header).toContain('.topnav-dropdown[open] .topnav-menu::before')
    expect(shell).toContain('onPointerEnter={openOnMouseHover}')
    expect(shell).toContain('onPointerLeave={closeAfterMouseLeaves}')
    expect(shell).toContain('inert={compactNav && !open ? true : undefined}')
  })

  it('preserves Admin and Saved Notes red Delete buttons and required focus rings',()=>{
    expect(css).toContain('.saved-notes-page, .avatar-library-management, .team-management')
    expect(css).toContain('color: var(--cleanup-delete-ink) !important')
    expect(css).toContain('background: var(--cleanup-delete-bg) !important')
    expect(css).toContain('outline: 3px solid var(--read-ring)')
    expect(css).not.toContain('.access-shell')
    expect(css).not.toMatch(/display:\s*none\s*!important/)
    expect(app).toContain("import './features/theme/finalQaBatch9.css'")
    expect(app.indexOf('finalQaBatch9.css')).toBeGreaterThan(app.indexOf('linearBlueBlack.css'))
  })
})
