import { beforeEach, describe, expect, it, vi } from 'vitest'

const invoke = vi.fn()
vi.mock('./supabaseClient', () => ({ supabase: { functions: { invoke } } }))

describe('runAdminAction', () => {
  beforeEach(() => invoke.mockReset())

  it('sends privileged lifecycle requests only through the admin Edge Function', async () => {
    invoke.mockResolvedValue({ data: { invite_code: 'one-time-code' }, error: null })
    const { runAdminAction } = await import('./adminApi')
    await expect(runAdminAction({ action: 'generate_invite', initials: 'AB' })).resolves.toEqual({ invite_code: 'one-time-code' })
    expect(invoke).toHaveBeenCalledWith('admin-account', { body: { action: 'generate_invite', initials: 'AB' } })
  })

  it('surfaces server-side authorization errors instead of falling back to direct table mutations', async () => {
    invoke.mockResolvedValue({ data: null, error: new Error('Not authorized') })
    const { runAdminAction } = await import('./adminApi')
    await expect(runAdminAction({ action: 'deactivate', user_id: 'agent-id' })).rejects.toThrow('Not authorized')
  })
})
