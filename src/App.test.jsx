import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('application access gate', () => {
  it('uses the Ozzie brand on the sign-in page while keeping the internal document title', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByRole('img', { name: /Ozzie — Ogletree Support Workspace/i })).toBeInTheDocument())
    expect(document.querySelector('.ozzie-logo-stage-login')).toBeInTheDocument()
    expect(screen.queryByText('Tier 1 Zoom Support · Sign in to continue.')).not.toBeInTheDocument()
    expect(readFileSync(join(cwd(), 'index.html'), 'utf8')).toContain('<title>Ogletree Support Workspace</title>')
  })

  it('shows username-only sign in with activation instead of public registration', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Username')).toBeInTheDocument())
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Activate Account' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
  })

  it('associates sign-in validation errors with the first invalid field', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Username')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Sign In/i }))
    const username = screen.getByLabelText('Username')
    expect(username).toHaveAttribute('aria-invalid', 'true')
    expect(username.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('provides icon inputs and a password visibility control', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Username')).toBeInTheDocument())
    expect(screen.getByTestId('username-icon')).toBeInTheDocument()
    expect(screen.getByTestId('password-icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument()
  })
})
