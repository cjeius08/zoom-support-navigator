import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import App from './App'

const authMock = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(),
  loginWithUsername: vi.fn(),
  signOut: vi.fn(),
}))
vi.mock('./lib/authApi', async importOriginal => ({
  ...await importOriginal(),
  getCurrentProfile: authMock.getCurrentProfile,
  loginWithUsername: authMock.loginWithUsername,
  signOut: authMock.signOut,
}))

beforeEach(() => {
  authMock.getCurrentProfile.mockReset().mockResolvedValue(null)
  authMock.loginWithUsername.mockReset()
  authMock.signOut.mockReset().mockResolvedValue(undefined)
})

it('disables repeated sign-in submissions while a remote login is pending and shows the current phase', async () => {
  let rejectLogin
  const pending = new Promise((_, reject) => { rejectLogin = reject })
  authMock.loginWithUsername.mockImplementation((_username, _password, onProgress) => {
    onProgress('Verifying credentials…')
    return pending
  })
  render(<App />)
  const username = await screen.findByLabelText('Username')
  fireEvent.change(username, { target: { value: 'agent_1' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
  const button = screen.getByRole('button', { name: /Sign In/i })
  const form = button.closest('form')
  fireEvent.submit(form)
  fireEvent.submit(form)
  expect(authMock.loginWithUsername).toHaveBeenCalledTimes(1)
  expect(authMock.loginWithUsername).toHaveBeenCalledWith('agent_1', 'password123', expect.any(Function))
  expect(screen.getByRole('button', { name: 'Signing In…' })).toBeDisabled()
  expect(screen.getByRole('status')).toHaveTextContent('Verifying credentials…')
  await act(async () => { rejectLogin(new Error('Login service temporarily unavailable')) })
  expect(await screen.findByRole('alert')).toHaveTextContent('Login service temporarily unavailable')
  expect(screen.getByRole('button', { name: /Sign In/i })).toBeEnabled()
})

it('does not force sign-out when the initial profile check temporarily fails, and allows a retry', async () => {
  authMock.getCurrentProfile.mockRejectedValueOnce(new Error('network unavailable')).mockResolvedValue(null)
  render(<App />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not check your saved session.')
  expect(authMock.signOut).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Retry session check' }))
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Welcome Back!' })).toBeInTheDocument())
  expect(authMock.getCurrentProfile).toHaveBeenCalledTimes(2)
  expect(authMock.signOut).not.toHaveBeenCalled()
})
