import { beforeEach, expect, it, vi } from 'vitest'
import { loginWithUsername } from './authApi'

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  setSession: vi.fn(),
  getSession: vi.fn(),
  maybeSingle: vi.fn(),
  from: vi.fn(),
}))
vi.mock('./supabaseClient', () => ({
  supabaseConfigured: true,
  supabase: {
    functions: { invoke: mocks.invoke },
    auth: { setSession: mocks.setSession, getSession: mocks.getSession },
    from: mocks.from,
  },
}))

beforeEach(() => {
  mocks.invoke.mockReset().mockResolvedValue({
    data: { access_token: 'test-access', refresh_token: 'test-refresh', user: { id: 'test-user', username: 'agent_1', role: 'member' } },
    error: null,
  })
  mocks.setSession.mockReset().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null })
  mocks.getSession.mockReset()
  mocks.maybeSingle.mockReset().mockResolvedValue({ data: { id: 'test-user', username: 'agent_1', workspace_role: 'member' }, error: null })
  mocks.from.mockReset().mockReturnValue({
    select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }),
  })
})

it('shows distinct login phases and avoids a redundant getSession request after the verified session exists', async () => {
  const phases = []
  const result = await loginWithUsername('agent_1', 'not-a-real-password', phase => phases.push(phase))
  expect(phases).toEqual(['Verifying credentials…', 'Establishing secure session…', 'Opening your workspace…'])
  expect(mocks.invoke).toHaveBeenCalledTimes(1)
  expect(mocks.setSession).toHaveBeenCalledTimes(1)
  expect(mocks.getSession).not.toHaveBeenCalled()
  expect(mocks.from).toHaveBeenCalledWith('zoom_profiles')
  expect(result).toMatchObject({ id: 'test-user', username: 'agent_1' })
})

it('never submits another authentication attempt when the login function rejects', async () => {
  mocks.invoke.mockResolvedValue({ data: { error: 'Username or password is incorrect.' }, error: { message: '401' } })
  await expect(loginWithUsername('agent_1', 'invalid')).rejects.toThrow('Username or password is incorrect.')
  expect(mocks.invoke).toHaveBeenCalledTimes(1)
  expect(mocks.setSession).not.toHaveBeenCalled()
})
