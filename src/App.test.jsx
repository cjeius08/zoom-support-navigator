import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('application access gate', () => {
  it('shows username-only sign in with activation instead of public registration', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Username')).toBeInTheDocument())
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Activate Account' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
  })

  it('provides icon inputs and a password visibility control', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Username')).toBeInTheDocument())
    expect(screen.getByTestId('username-icon')).toBeInTheDocument()
    expect(screen.getByTestId('password-icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument()
  })
})
