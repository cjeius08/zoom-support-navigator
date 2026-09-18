import { beforeEach, describe, expect, it, vi } from 'vitest'

const invoke = vi.fn()
const rpc = vi.fn()
vi.mock('./supabaseClient', () => ({ supabase: { functions: { invoke }, rpc } }))

describe('runAdminAction', () => {
  beforeEach(() => { invoke.mockReset(); rpc.mockReset() })

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


describe('feedback administration', () => {
  it('updates feedback status through the audited RPC', async () => {
    rpc.mockResolvedValue({ data: { id: 'feedback-1', status: 'reviewing' }, error: null })
    const api = await import('./adminApi')
    expect(typeof api.updateFeedbackStatus).toBe('function')
    await expect(api.updateFeedbackStatus('feedback-1', 'reviewing')).resolves.toEqual({ id: 'feedback-1', status: 'reviewing' })
    expect(rpc).toHaveBeenCalledWith('zoom_update_feedback_status', {
      p_feedback_id: 'feedback-1',
      p_status: 'reviewing',
    })
  })
})


describe('readiness administration', () => {
  it('loads the JA-only Readiness Lab report through the secured RPC', async () => {
    rpc.mockResolvedValue({ data: { questionSetVersion: 'zoom_general_scenarios_v1', users: [] }, error: null })
    const api = await import('./adminApi')

    await expect(api.loadReadinessReport()).resolves.toEqual({
      questionSetVersion: 'zoom_general_scenarios_v1',
      users: [],
    })
    expect(rpc).toHaveBeenCalledWith('zoom_readiness_admin_report', {
      p_question_set_version: 'zoom_general_scenarios_v1',
    })
  })
})
