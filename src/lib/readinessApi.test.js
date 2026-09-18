import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.fn()
vi.mock('./supabaseClient', () => ({ supabase: { rpc } }))

describe('readinessApi', () => {
  beforeEach(() => rpc.mockReset())

  it('loads readiness state from the versioned server source', async () => {
    rpc.mockResolvedValue({ data: { questions: [], attempts: [] }, error: null })
    const api = await import('./readinessApi')

    await expect(api.loadReadinessState()).resolves.toEqual({ questions: [], attempts: [] })
    expect(rpc).toHaveBeenCalledWith('zoom_readiness_get_state', {
      p_question_set_version: 'zoom_general_scenarios_v1',
    })
  })

  it('starts or resumes through the server-side attempt gate', async () => {
    rpc.mockResolvedValue({ data: { activeAttempt: { id: 'a1' } }, error: null })
    const api = await import('./readinessApi')

    await api.startOrResumeReadinessAttempt()
    expect(rpc).toHaveBeenCalledWith('zoom_readiness_start_or_resume', {
      p_question_set_version: 'zoom_general_scenarios_v1',
    })
  })

  it('sends only the selected option when checking an answer, never the answer key', async () => {
    rpc.mockResolvedValue({ data: { isCorrect: false }, error: null })
    const api = await import('./readinessApi')

    await api.checkReadinessAnswer({
      attemptId: 'attempt-1',
      questionId: 'join-exact-state',
      selectedOptionId: 'a',
    })

    expect(rpc).toHaveBeenCalledWith('zoom_readiness_check_answer', {
      p_attempt_id: 'attempt-1',
      p_question_id: 'join-exact-state',
      p_selected_option_id: 'a',
    })
  })

  it('submits only a complete attempt id and lets the server calculate the score', async () => {
    rpc.mockResolvedValue({ data: { score: 4, totalQuestions: 5 }, error: null })
    const api = await import('./readinessApi')

    await api.submitReadinessAttempt('attempt-1')
    expect(rpc).toHaveBeenCalledWith('zoom_readiness_submit_attempt', {
      p_attempt_id: 'attempt-1',
    })
  })

  it('surfaces server enforcement errors without local fallback', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('Attempt incomplete') })
    const api = await import('./readinessApi')

    await expect(api.submitReadinessAttempt('attempt-1')).rejects.toThrow('Attempt incomplete')
  })
})
