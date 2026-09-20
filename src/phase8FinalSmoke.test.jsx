import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { AppShell } from './features/shell/AppShell'

const member = {
  id: 'member-1',
  username: 'member_1',
  initials: 'MB',
  role: 'agent',
  workspace_role: 'member',
  avatar_id: null,
}

const lead = {
  ...member,
  id: 'lead-1',
  username: 'lead_1',
  initials: 'LD',
  workspace_role: 'lead',
}

const admin = {
  ...member,
  id: 'admin-1',
  username: 'admin_1',
  initials: 'AD',
  role: 'creator_admin',
}

function setWidth(width) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

afterEach(() => {
  cleanup()
  setWidth(1280)
})

it('keeps Member and Lead on the standard workspace surface', () => {
  const { rerender } = render(
    <AppShell profile={member}>
      <div>Member smoke content</div>
    </AppShell>,
  )

  expect(screen.getByRole('button', { name: /member_1 account/i })).toHaveTextContent('Member')
  expect(screen.getByRole('navigation')).toHaveTextContent('Home')
  expect(screen.getByRole('navigation')).toHaveTextContent('Favorites')
  expect(screen.getByRole('navigation')).toHaveTextContent('Training & Resources')
  expect(screen.getByRole('navigation')).toHaveTextContent('Readiness Lab')
  expect(screen.queryByText('Admin Home')).not.toBeInTheDocument()
  expect(screen.queryByText('Team Management')).not.toBeInTheDocument()
  expect(screen.queryByText('Usage Analytics')).not.toBeInTheDocument()

  rerender(
    <AppShell profile={lead}>
      <div>Lead smoke content</div>
    </AppShell>,
  )

  expect(screen.getByRole('button', { name: /lead_1 account/i })).toHaveTextContent('Lead')
  expect(screen.queryByText('Admin Home')).not.toBeInTheDocument()
  expect(screen.queryByText('Team Management')).not.toBeInTheDocument()
  expect(screen.queryByText('Usage Analytics')).not.toBeInTheDocument()
})

it('keeps the creator-admin surface complete', () => {
  render(
    <AppShell profile={admin}>
      <div>Admin smoke content</div>
    </AppShell>,
  )

  expect(screen.getByRole('button', { name: /admin_1 account/i })).toHaveTextContent('Admin')
  expect(screen.getByRole('navigation')).toHaveTextContent('Admin Home')
  expect(screen.getByRole('navigation')).toHaveTextContent('Team Management')
  expect(screen.getByRole('navigation')).toHaveTextContent('Usage Analytics')
  expect(screen.getByRole('navigation')).toHaveTextContent('Feedback Queue')
})

it('keeps Back visible on desktop and mobile while respecting history state', async () => {
  const user = userEvent.setup()
  const onBack = () => {}

  setWidth(1280)
  const { rerender } = render(
    <AppShell profile={member} canGoBack={false} onBack={onBack}>
      <div>Desktop page</div>
    </AppShell>,
  )

  expect(screen.getByRole('button', { name: 'Back to previous page' })).toBeDisabled()

  rerender(
    <AppShell profile={member} canGoBack onBack={onBack}>
      <div>Desktop page</div>
    </AppShell>,
  )
  expect(screen.getByRole('button', { name: 'Back to previous page' })).toBeEnabled()

  setWidth(390)
  expect(screen.getByRole('button', { name: 'Back to previous page' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Toggle navigation' })).toBeVisible()

  await user.click(screen.getByRole('button', { name: 'Toggle navigation' }))
  expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toHaveAttribute('aria-hidden', 'false')
})

it('keeps the responsive breakpoints and overflow protections used by the production shell', () => {
  const css = `${readFileSync(join(cwd(), 'src/features/shell/responsiveShell.css'), 'utf8')}\n${readFileSync(join(cwd(), 'src/features/shell/headerNavRevamp.css'), 'utf8')}`

  expect(css).toMatch(/@media\s*\(max-width:\s*1100px\)/)
  expect(css).toMatch(/@media\s*\(max-width:\s*920px\)/)
  expect(css).toMatch(/@media\s*\(max-width:\s*800px\)/)
  expect(css).toMatch(/@media\s*\(max-width:\s*620px\)/)
  expect(css).toMatch(/\.app-main\s*\{[^}]*overflow-x:\s*clip/)
  expect(css).toMatch(/\.top-navigation\s*\{[^}]*display:\s*flex/)
  expect(css).toMatch(/\.feedback-fab\s*\{[^}]*max-width:\s*calc\(100vw\s*-\s*1\.5rem\)/)
})
