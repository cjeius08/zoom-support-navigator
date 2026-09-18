import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { ReadinessLab } from './ReadinessLab'
import { READINESS_PARTS } from './readinessLabData'

const readinessMocks = vi.hoisted(() => ({
  getReadinessState: vi.fn(),
  startOrResumeReadiness: vi.fn(),
  checkReadinessAnswer: vi.fn(),
  submitReadinessAttempt: vi.fn(),
}))

vi.mock('../../lib/readinessApi', () => readinessMocks)

const DEVICE_QUESTION_SET = 'zoom_device_navigation_v1'
const TROUBLESHOOTING_QUESTION_SET = 'zoom_troubleshooting_judgment_v1'

const QUESTIONS = [
  {
    id: 'join-exact-state',
    order: 1,
    type: 'Scenario',
    prompt: 'A Zoom user says, “I can’t get into the meeting.” What is the best first move?',
    options: [
      { id: 'a', text: 'Restart the computer immediately.' },
      { id: 'b', text: 'Ask what exact Zoom screen or message appears and confirm the meeting details.' },
    ],
    locationLabel: 'Training & Resources → Scenario Scripts → Can’t Join',
    resourceTarget: { view: 'training', section: 'scripts', mode: 'scenarios', scenario: 'cant-join' },
    source: 'Scripts & Communication · Can’t Join',
  },
  {
    id: 'cant-hear-output',
    order: 2,
    type: 'Scenario',
    prompt: 'A user is inside Zoom but cannot hear anyone. What should be checked first?',
    options: [
      { id: 'a', text: 'Check the speaker/output path.' },
      { id: 'b', text: 'Check the microphone/input path.' },
    ],
    locationLabel: 'Training & Resources → Scenario Scripts → Can’t Hear',
    resourceTarget: { view: 'training', section: 'scripts', mode: 'scenarios', scenario: 'cant-hear' },
    source: 'Scripts & Communication · Can’t Hear',
  },
  {
    id: 'cant-be-heard-input',
    order: 3,
    type: 'Scenario',
    prompt: 'Other participants cannot hear the user. What should be checked first?',
    options: [
      { id: 'a', text: 'Check speaker volume.' },
      { id: 'b', text: 'Check Zoom mute and microphone input.' },
    ],
    locationLabel: 'Training & Resources → Scenario Scripts → They Can’t Hear Me',
    resourceTarget: { view: 'training', section: 'scripts', mode: 'scenarios', scenario: 'cant-be-heard' },
    source: 'Scripts & Communication · They Can’t Hear Me',
  },
  {
    id: 'camera-state',
    order: 4,
    type: 'Scenario',
    prompt: 'A user says the camera is not working. What should be determined first?',
    options: [
      { id: 'a', text: 'Determine whether video is off or the camera is failing to show an image.' },
      { id: 'b', text: 'Check meeting audio.' },
    ],
    locationLabel: 'Training & Resources → Scenario Scripts → Camera',
    resourceTarget: { view: 'training', section: 'scripts', mode: 'scenarios', scenario: 'camera-not-working' },
    source: 'Scripts & Communication · Camera',
  },
  {
    id: 'screen-share-control',
    order: 5,
    type: 'Scenario',
    prompt: 'A user cannot share their screen. What is the safest first judgment?',
    options: [
      { id: 'a', text: 'Reinstall Zoom immediately.' },
      { id: 'b', text: 'Check what happens when they try and whether host controls are involved.' },
    ],
    locationLabel: 'Training & Resources → Scenario Scripts → Screen Share',
    resourceTarget: { view: 'training', section: 'scripts', mode: 'scenarios', scenario: 'cant-share' },
    source: 'Scripts & Communication · Screen Share',
  },
]

const DEVICE_QUESTIONS = [
  {
    id: 'windows-toolbar-location',
    order: 1,
    type: 'Scenario',
    prompt: 'A Windows caller says the meeting controls disappeared. What should the agent do first?',
    options: [
      { id: 'a', text: 'Open Windows Settings.' },
      { id: 'b', text: 'Move the pointer inside the Zoom meeting window and look along the bottom.' },
    ],
    locationLabel: 'Training & Resources → Device Walkthroughs → Windows → In-meeting map',
    resourceTarget: { view: 'training', section: 'devices', device: 'windows' },
    source: 'Device Walkthroughs · Windows desktop walkthrough',
  },
  ...['mac', 'iphone', 'android', 'browser'].map((device, index) => ({
    id: `${device}-device-check`,
    order: index + 2,
    type: 'Scenario',
    prompt: `${device} navigation check`,
    options: [
      { id: 'a', text: 'Wrong path.' },
      { id: 'b', text: 'Correct device path.' },
    ],
    locationLabel: `Training & Resources → Device Walkthroughs → ${device}`,
    resourceTarget: { view: 'training', section: 'devices', device },
    source: `Device Walkthroughs · ${device}`,
  })),
]

const TROUBLESHOOTING_QUESTIONS = [
  {
    id: 'join-becomes-waiting-room',
    order: 1,
    type: 'Scenario',
    prompt: 'A failed-join call now shows Waiting Room. What is the best next judgment?',
    options: [
      { id: 'a', text: 'Keep troubleshooting failed join.' },
      { id: 'b', text: 'Switch to the Waiting Room state.' },
    ],
    locationLabel: 'Training & Resources',
    resourceTarget: { view: 'training' },
    source: 'Common Issue Route · Can’t join the meeting / Waiting to get in',
  },
  ...['audio','microphone','camera','screen-share'].map((topic, index) => ({
    id: `${topic}-judgment`,
    order: index + 2,
    type: 'Scenario',
    prompt: `${topic} troubleshooting judgment`,
    options: [
      { id: 'a', text: 'Wrong next action.' },
      { id: 'b', text: 'Correct next action.' },
    ],
    locationLabel: 'Training & Resources',
    resourceTarget: { view: 'training' },
    source: `Common Issue Route · ${topic}`,
  })),
]

function answer(questionId, isCorrect = true, selectedOptionId = 'b') {
  return {
    questionId,
    selectedOptionId,
    isCorrect,
    correctOptionId: isCorrect ? selectedOptionId : 'a',
    explanation: isCorrect ? 'Correct explanation.' : 'Review explanation.',
    checkedAt: '2026-09-19T00:00:00Z',
  }
}

function activeState({
  attemptNumber = 1,
  answers = [],
  attempts,
  questionSetVersion = 'zoom_general_scenarios_v1',
  questions = QUESTIONS,
} = {}) {
  const activeAttempt = {
    id: `attempt-${attemptNumber}`,
    attemptNumber,
    status: 'active',
    score: null,
    totalQuestions: questions.length,
    startedAt: '2026-09-19T00:00:00Z',
    submittedAt: null,
    answers,
  }
  return {
    questionSetVersion,
    maxAttempts: 3,
    questions,
    attempts: attempts || [{
      id: activeAttempt.id,
      attemptNumber,
      status: 'active',
      score: null,
      totalQuestions: questions.length,
      checkedCount: answers.length,
      startedAt: activeAttempt.startedAt,
      submittedAt: null,
    }],
    activeAttempt,
  }
}

function submittedState(attemptNumber = 1, score = 4) {
  return {
    questionSetVersion: 'zoom_general_scenarios_v1',
    maxAttempts: 3,
    questions: QUESTIONS,
    attempts: Array.from({ length: attemptNumber }, (_, index) => ({
      id: `attempt-${index + 1}`,
      attemptNumber: index + 1,
      status: 'submitted',
      score: index + 1 === attemptNumber ? score : 3,
      totalQuestions: 5,
      checkedCount: 5,
      startedAt: '2026-09-19T00:00:00Z',
      submittedAt: '2026-09-19T00:10:00Z',
    })),
    activeAttempt: null,
  }
}

beforeEach(() => {
  readinessMocks.getReadinessState.mockReset()
  readinessMocks.startOrResumeReadiness.mockReset()
  readinessMocks.checkReadinessAnswer.mockReset()
  readinessMocks.submitReadinessAttempt.mockReset()
})

it('shows five readiness parts and the five-question general Zoom scenario set', async () => {
  readinessMocks.getReadinessState.mockResolvedValue(activeState())
  render(<ReadinessLab open />)

  expect(READINESS_PARTS).toHaveLength(5)
  expect(await screen.findByRole('heading', { name: 'Readiness Lab' })).toBeInTheDocument()
  expect(screen.getByText(/Each available readiness part uses five source-backed questions/i)).toBeInTheDocument()

  const tabs = screen.getAllByRole('tab')
  expect(tabs).toHaveLength(5)
  expect(screen.getByRole('tab', { name: /Scenarios Available now/i })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: /Devices Available now/i })).toBeEnabled()
  expect(screen.getByRole('tab', { name: /Troubleshooting Available now/i })).toBeEnabled()
  expect(screen.getByRole('tab', { name: /Scope Coming next/i })).toBeDisabled()
  expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
  expect(screen.getByText(QUESTIONS[0].prompt)).toBeInTheDocument()
})

it('resumes the same incomplete attempt after the lab is closed and reopened', async () => {
  const persisted = activeState({ answers: [answer('join-exact-state')] })
  readinessMocks.getReadinessState.mockResolvedValue(persisted)

  const { rerender } = render(<ReadinessLab open />)
  expect(await screen.findByText('Question 2 of 5')).toBeInTheDocument()
  expect(screen.getByText('1/5 checked')).toBeInTheDocument()

  rerender(<ReadinessLab open={false} />)
  expect(screen.queryByRole('heading', { name: 'Readiness Lab' })).not.toBeInTheDocument()

  rerender(<ReadinessLab open />)
  expect(await screen.findByText('Question 2 of 5')).toBeInTheDocument()
  expect(readinessMocks.getReadinessState).toHaveBeenCalledTimes(2)
})

it('keeps reset locked while the current attempt is incomplete', async () => {
  readinessMocks.getReadinessState.mockResolvedValue(activeState())
  render(<ReadinessLab open />)

  const reset = await screen.findByRole('button', { name: 'Reset for next attempt' })
  expect(reset).toBeDisabled()
  expect(screen.getByText(/Reset is locked while Attempt 1 is unfinished/i)).toBeInTheDocument()
})

it('persists a checked answer, locks it, and prevents skipping ahead before checking', async () => {
  const user = userEvent.setup()
  readinessMocks.getReadinessState
    .mockResolvedValueOnce(activeState())
    .mockResolvedValueOnce(activeState({ answers: [answer('join-exact-state', true, 'b')] }))
  readinessMocks.checkReadinessAnswer.mockResolvedValue({
    questionId: 'join-exact-state',
    selectedOptionId: 'b',
    isCorrect: true,
    locked: true,
  })

  render(<ReadinessLab open />)

  const next = await screen.findByRole('button', { name: 'Next' })
  expect(next).toBeDisabled()

  const choice = screen.getByRole('radio', { name: /Ask what exact Zoom screen/i })
  await user.click(choice)
  await user.click(screen.getByRole('button', { name: 'Check answer' }))

  expect(readinessMocks.checkReadinessAnswer).toHaveBeenCalledWith({
    attemptId: 'attempt-1',
    questionId: 'join-exact-state',
    selectedOptionId: 'b',
  })
  expect(await screen.findByText('Correct')).toBeInTheDocument()
  expect(choice).toBeDisabled()
  expect(next).toBeEnabled()
})

it('keeps resource discovery separate from the saved attempt', async () => {
  const user = userEvent.setup()
  const onOpenResource = vi.fn()
  readinessMocks.getReadinessState.mockResolvedValue(activeState())

  render(<ReadinessLab open onOpenResource={onOpenResource} />)
  await screen.findByText('Question 1 of 5')
  await user.click(screen.getByRole('button', { name: 'Open Training & Resources' }))

  expect(onOpenResource).toHaveBeenCalledWith({ view: 'training' })
  expect(readinessMocks.checkReadinessAnswer).not.toHaveBeenCalled()
})

it('requires all five checked answers before submission and only then enables the next attempt', async () => {
  const user = userEvent.setup()
  const allAnswers = QUESTIONS.map(question => answer(question.id))
  readinessMocks.getReadinessState
    .mockResolvedValueOnce(activeState({ answers: allAnswers }))
    .mockResolvedValueOnce(submittedState(1, 5))
  readinessMocks.submitReadinessAttempt.mockResolvedValue({
    id: 'attempt-1',
    attemptNumber: 1,
    status: 'submitted',
    score: 5,
    totalQuestions: 5,
  })
  readinessMocks.startOrResumeReadiness.mockResolvedValue(activeState({
    attemptNumber: 2,
    answers: [],
    attempts: [
      submittedState(1, 5).attempts[0],
      {
        id: 'attempt-2',
        attemptNumber: 2,
        status: 'active',
        score: null,
        totalQuestions: 5,
        checkedCount: 0,
        startedAt: '2026-09-19T00:20:00Z',
        submittedAt: null,
      },
    ],
  }))

  render(<ReadinessLab open />)

  expect(await screen.findByRole('button', { name: 'Submit attempt' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Reset for next attempt' })).toBeDisabled()

  await user.click(screen.getByRole('button', { name: 'Submit attempt' }))
  expect(readinessMocks.submitReadinessAttempt).toHaveBeenCalledWith('attempt-1')

  const reset = await screen.findByRole('button', { name: 'Reset for next attempt' })
  expect(reset).toBeEnabled()
  expect(screen.getByText('5/5 correct')).toBeInTheDocument()

  await user.click(reset)
  expect(readinessMocks.startOrResumeReadiness).toHaveBeenCalled()
  expect(await screen.findByText('Attempt 2 of 3')).toBeInTheDocument()
})

it('blocks a fourth attempt after three submitted attempts', async () => {
  readinessMocks.getReadinessState.mockResolvedValue(submittedState(3, 4))
  render(<ReadinessLab open />)

  const reset = await screen.findByRole('button', { name: '3 of 3 attempts used' })
  expect(reset).toBeDisabled()
  expect(screen.getByText(/All 3 attempts are recorded/i)).toBeInTheDocument()
})


it('loads Part 2 as its own persistent device-navigation attempt without revealing the exact answer location', async () => {
  const user = userEvent.setup()
  const onOpenResource = vi.fn()
  readinessMocks.getReadinessState.mockImplementation((questionSetVersion) => {
    if (questionSetVersion === DEVICE_QUESTION_SET) {
      return Promise.resolve(activeState({
        questionSetVersion: DEVICE_QUESTION_SET,
        questions: DEVICE_QUESTIONS,
      }))
    }
    return Promise.resolve(activeState())
  })

  render(<ReadinessLab open onOpenResource={onOpenResource} />)
  await screen.findByText(QUESTIONS[0].prompt)

  await user.click(screen.getByRole('tab', { name: /Devices Available now/i }))

  expect(await screen.findByRole('heading', { name: 'Device & Navigation Awareness' })).toBeInTheDocument()
  expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
  expect(screen.getByText(DEVICE_QUESTIONS[0].prompt)).toBeInTheDocument()
  expect(readinessMocks.getReadinessState).toHaveBeenCalledWith(DEVICE_QUESTION_SET)

  expect(screen.queryByText(/Device Walkthroughs → Windows → In-meeting map/i)).not.toBeInTheDocument()
  expect(screen.getByText(/exact answer location is intentionally not shown/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Open Training & Resources' }))
  expect(onOpenResource).toHaveBeenCalledWith({ view: 'training' })
})


it('loads Part 3 as a separate persistent troubleshooting-judgment attempt', async () => {
  const user = userEvent.setup()
  const onOpenResource = vi.fn()
  readinessMocks.getReadinessState.mockImplementation((questionSetVersion) => {
    if (questionSetVersion === TROUBLESHOOTING_QUESTION_SET) {
      return Promise.resolve(activeState({
        questionSetVersion: TROUBLESHOOTING_QUESTION_SET,
        questions: TROUBLESHOOTING_QUESTIONS,
      }))
    }
    if (questionSetVersion === DEVICE_QUESTION_SET) {
      return Promise.resolve(activeState({
        questionSetVersion: DEVICE_QUESTION_SET,
        questions: DEVICE_QUESTIONS,
      }))
    }
    return Promise.resolve(activeState())
  })

  render(<ReadinessLab open onOpenResource={onOpenResource} />)
  await screen.findByText(QUESTIONS[0].prompt)

  await user.click(screen.getByRole('tab', { name: /Troubleshooting Available now/i }))

  expect(await screen.findByRole('heading', { name: 'Troubleshooting Judgment' })).toBeInTheDocument()
  expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
  expect(screen.getByText(TROUBLESHOOTING_QUESTIONS[0].prompt)).toBeInTheDocument()
  expect(readinessMocks.getReadinessState).toHaveBeenCalledWith(TROUBLESHOOTING_QUESTION_SET)

  expect(screen.getByText(/exact answer location is intentionally not shown/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Open Training & Resources' }))
  expect(onOpenResource).toHaveBeenCalledWith({ view: 'training' })
})
