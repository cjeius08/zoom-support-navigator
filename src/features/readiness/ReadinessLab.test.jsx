import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { ReadinessLab } from './ReadinessLab'
import { READINESS_PARTS } from './readinessLabData'

const readinessMocks = vi.hoisted(() => ({
  loadReadinessState: vi.fn(),
  startOrResumeReadinessAttempt: vi.fn(),
  checkReadinessAnswer: vi.fn(),
  submitReadinessAttempt: vi.fn(),
}))

vi.mock('../../lib/readinessApi', () => readinessMocks)

const {
  loadReadinessState,
  startOrResumeReadinessAttempt,
  checkReadinessAnswer,
  submitReadinessAttempt,
} = readinessMocks

const questions = [
  {
    id: 'join-exact-state',
    order: 1,
    type: 'Scenario',
    prompt: 'A Zoom user says, “I can’t get into the meeting.” What is the best first move?',
    options: [
      { id: 'a', text: 'Restart immediately.' },
      { id: 'b', text: 'Ask what exact Zoom screen or message appears before choosing the route.' },
      { id: 'c', text: 'Check the microphone.' },
      { id: 'd', text: 'Contact the host immediately.' },
    ],
    locationLabel: 'Scenario Scripts → Can’t Join',
    resourceTarget: { view: 'training', section: 'scripts', mode: 'scenarios', scenario: 'cant-join' },
    source: 'Scripts & Communication · Can’t Join',
  },
  {
    id: 'cant-hear-output',
    order: 2,
    type: 'Scenario',
    prompt: 'A user is already inside a Zoom meeting but cannot hear anyone.',
    options: [{ id: 'a', text: 'Check speaker/output.' }, { id: 'b', text: 'Check microphone.' }],
    locationLabel: 'Scenario Scripts → Can’t Hear',
    resourceTarget: { view: 'training', section: 'scripts', mode: 'scenarios', scenario: 'cant-hear' },
    source: 'Scripts & Communication · Can’t Hear',
  },
  {
    id: 'cant-be-heard-input',
    order: 3,
    type: 'Scenario',
    prompt: 'Other participants cannot hear the Zoom user.',
    options: [{ id: 'a', text: 'Check speaker.' }, { id: 'b', text: 'Check microphone/input.' }],
    locationLabel: 'Scenario Scripts → They Can’t Hear Me',
    resourceTarget: { view: 'training', section: 'scripts', mode: 'scenarios', scenario: 'cant-be-heard' },
    source: 'Scripts & Communication · They Can’t Hear Me',
  },
  {
    id: 'camera-state',
    order: 4,
    type: 'Scenario',
    prompt: 'A Zoom user says their camera is not working.',
    options: [{ id: 'a', text: 'Determine whether video is off or the camera has no image.' }, { id: 'b', text: 'Check audio.' }],
    locationLabel: 'Scenario Scripts → Camera',
    resourceTarget: { view: 'training', section: 'scripts', mode: 'scenarios', scenario: 'camera-not-working' },
    source: 'Scripts & Communication · Camera',
  },
  {
    id: 'screen-share-control',
    order: 5,
    type: 'Scenario',
    prompt: 'A Zoom user cannot share their screen.',
    options: [{ id: 'a', text: 'Reinstall Zoom.' }, { id: 'b', text: 'Determine what happens and whether sharing is host-controlled.' }],
    locationLabel: 'Scenario Scripts → Screen Share',
    resourceTarget: { view: 'training', section: 'scripts', mode: 'scenarios', scenario: 'cant-share' },
    source: 'Scripts & Communication · Screen Share',
  },
]

function activeState(answers = [], attemptNumber = 1, attempts = null) {
  return {
    questionSetVersion: 'zoom_general_scenarios_v1',
    maxAttempts: 3,
    questions,
    attempts: attempts || [{
      id: `attempt-${attemptNumber}`,
      attemptNumber,
      status: 'active',
      score: null,
      totalQuestions: 5,
      checkedCount: answers.length,
      startedAt: '2026-09-19T00:00:00Z',
      submittedAt: null,
    }],
    activeAttempt: {
      id: `attempt-${attemptNumber}`,
      attemptNumber,
      status: 'active',
      score: null,
      totalQuestions: 5,
      answers,
    },
  }
}

const checkedAnswer = {
  questionId: 'join-exact-state',
  selectedOptionId: 'a',
  isCorrect: false,
  correctOptionId: 'b',
  explanation: 'Use the exact Zoom state before choosing the route.',
  checkedAt: '2026-09-19T00:01:00Z',
}

beforeEach(() => {
  loadReadinessState.mockReset()
  startOrResumeReadinessAttempt.mockReset()
  checkReadinessAnswer.mockReset()
  submitReadinessAttempt.mockReset()
  loadReadinessState.mockResolvedValue(activeState())
})

it('uses five general Zoom scenarios without hearing or proceeding assumptions', async () => {
  render(<ReadinessLab open />)

  expect(await screen.findByRole('heading', { name: 'General Zoom Scenarios' })).toBeInTheDocument()
  expect(READINESS_PARTS).toHaveLength(5)
  expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
  expect(screen.getByText(/can’t get into the meeting/i)).toBeInTheDocument()
  expect(screen.queryByText(/hearing/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/arbitration/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/proceeding/i)).not.toBeInTheDocument()
})

it('creates Attempt 1 only when there is no saved attempt and then resumes server state', async () => {
  loadReadinessState.mockResolvedValueOnce({
    questionSetVersion: 'zoom_general_scenarios_v1',
    maxAttempts: 3,
    questions,
    attempts: [],
    activeAttempt: null,
  })
  startOrResumeReadinessAttempt.mockResolvedValueOnce(activeState())

  render(<ReadinessLab open />)

  expect(await screen.findByText('Attempt 1 progress')).toBeInTheDocument()
  expect(startOrResumeReadinessAttempt).toHaveBeenCalledTimes(1)
  expect(screen.getByText('0/5 checked')).toBeInTheDocument()
})

it('server-locks a checked wrong answer and restores it after close and reopen', async () => {
  const user = userEvent.setup()
  loadReadinessState
    .mockResolvedValueOnce(activeState())
    .mockResolvedValueOnce(activeState([checkedAnswer]))
    .mockResolvedValueOnce(activeState([checkedAnswer]))
  checkReadinessAnswer.mockResolvedValueOnce({ ...checkedAnswer, checkedCount: 1, locked: true })

  const { rerender } = render(<ReadinessLab open />)
  const wrong = await screen.findByRole('radio', { name: /Restart immediately/i })
  await user.click(wrong)
  await user.click(screen.getByRole('button', { name: 'Check answer' }))

  expect(checkReadinessAnswer).toHaveBeenCalledWith({
    attemptId: 'attempt-1',
    questionId: 'join-exact-state',
    selectedOptionId: 'a',
  })
  expect(await screen.findByText('Review this')).toBeInTheDocument()
  expect(screen.getByText('1/5 checked')).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: /Restart immediately/i })).toBeDisabled()

  rerender(<ReadinessLab open={false} />)
  rerender(<ReadinessLab open />)

  expect(await screen.findByText('Review this')).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: /Restart immediately/i })).toHaveAttribute('aria-checked', 'true')
  expect(screen.getByRole('radio', { name: /Restart immediately/i })).toBeDisabled()
  expect(screen.getByText('1/5 checked')).toBeInTheDocument()
})

it('greys out Reset / New Attempt until the current attempt is submitted', async () => {
  render(<ReadinessLab open />)

  const reset = await screen.findByRole('button', { name: 'Reset / New Attempt' })
  expect(reset).toBeDisabled()
  expect(screen.getByText(/Finish all 5 questions and submit first/i)).toBeInTheDocument()
})

it('keeps Find in Workspace open-book while preserving the active attempt', async () => {
  const user = userEvent.setup()
  const onOpenResource = vi.fn()
  render(<ReadinessLab open onOpenResource={onOpenResource} />)

  await screen.findByText('Question 1 of 5')
  await user.click(screen.getByRole('button', { name: 'Find in Workspace' }))

  expect(onOpenResource).toHaveBeenCalledWith({
    view: 'training',
    section: 'scripts',
    mode: 'scenarios',
    scenario: 'cant-join',
  })
  expect(screen.getByText('Attempt 1 progress')).toBeInTheDocument()
})

it('requires all five locked answers before Submit Attempt becomes available', async () => {
  loadReadinessState.mockResolvedValueOnce(activeState([
    checkedAnswer,
    { questionId: 'cant-hear-output', selectedOptionId: 'a', isCorrect: true, correctOptionId: 'a', explanation: 'Output.', checkedAt: 'x' },
    { questionId: 'cant-be-heard-input', selectedOptionId: 'b', isCorrect: true, correctOptionId: 'b', explanation: 'Input.', checkedAt: 'x' },
    { questionId: 'camera-state', selectedOptionId: 'a', isCorrect: true, correctOptionId: 'a', explanation: 'Camera state.', checkedAt: 'x' },
    { questionId: 'screen-share-control', selectedOptionId: 'b', isCorrect: true, correctOptionId: 'b', explanation: 'Share state.', checkedAt: 'x' },
  ]))

  render(<ReadinessLab open />)

  expect(await screen.findByText('5/5 checked')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Submit Attempt 1' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Reset / New Attempt' })).toBeDisabled()
})

it('records the submitted score permanently before offering Attempt 2', async () => {
  const user = userEvent.setup()
  const allAnswers = [
    checkedAnswer,
    { questionId: 'cant-hear-output', selectedOptionId: 'a', isCorrect: true, correctOptionId: 'a', explanation: 'Output.', checkedAt: 'x' },
    { questionId: 'cant-be-heard-input', selectedOptionId: 'b', isCorrect: true, correctOptionId: 'b', explanation: 'Input.', checkedAt: 'x' },
    { questionId: 'camera-state', selectedOptionId: 'a', isCorrect: true, correctOptionId: 'a', explanation: 'Camera state.', checkedAt: 'x' },
    { questionId: 'screen-share-control', selectedOptionId: 'b', isCorrect: true, correctOptionId: 'b', explanation: 'Share state.', checkedAt: 'x' },
  ]
  loadReadinessState
    .mockResolvedValueOnce(activeState(allAnswers))
    .mockResolvedValueOnce({
      questionSetVersion: 'zoom_general_scenarios_v1',
      maxAttempts: 3,
      questions,
      attempts: [{
        id: 'attempt-1',
        attemptNumber: 1,
        status: 'submitted',
        score: 4,
        totalQuestions: 5,
        checkedCount: 5,
        submittedAt: '2026-09-19T00:05:00Z',
      }],
      activeAttempt: null,
    })
  submitReadinessAttempt.mockResolvedValueOnce({ id: 'attempt-1', attemptNumber: 1, status: 'submitted', score: 4, totalQuestions: 5 })

  render(<ReadinessLab open />)
  await user.click(await screen.findByRole('button', { name: 'Submit Attempt 1' }))

  expect(submitReadinessAttempt).toHaveBeenCalledWith('attempt-1')
  expect(await screen.findByRole('heading', { name: '4/5 final score' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Start Attempt 2' })).toBeInTheDocument()
  expect(screen.getByText(/will not overwrite it/i)).toBeInTheDocument()
})

it('locks new attempts after all three attempts are recorded', async () => {
  loadReadinessState.mockResolvedValueOnce({
    questionSetVersion: 'zoom_general_scenarios_v1',
    maxAttempts: 3,
    questions,
    attempts: [1, 2, 3].map(number => ({
      id: `attempt-${number}`,
      attemptNumber: number,
      status: 'submitted',
      score: number + 1,
      totalQuestions: 5,
      checkedCount: 5,
      submittedAt: '2026-09-19T00:05:00Z',
    })),
    activeAttempt: null,
  })

  render(<ReadinessLab open />)

  expect(await screen.findByText('3 attempts completed')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '3 attempts used' })).toBeDisabled()
  expect(screen.getByText('3/3 attempts started')).toBeInTheDocument()
})

it('renders minimized saved progress from the server-backed attempt', async () => {
  const onMinimize = vi.fn()
  loadReadinessState.mockResolvedValueOnce(activeState([checkedAnswer]))
  render(<ReadinessLab open minimized onMinimize={onMinimize} />)

  expect(await screen.findByLabelText('Readiness Lab minimized')).toHaveTextContent('Attempt 1 · 1/5 checked')
})
