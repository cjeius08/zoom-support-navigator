import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'

const loadAvatarLibrary = vi.fn()
const uploadAvatarFiles = vi.fn()
const deleteAvatarIds = vi.fn()

vi.mock('../../lib/avatarLibraryApi', () => ({
  ACCEPTED_AVATAR_TYPES: ['image/png', 'image/jpeg', 'image/webp'],
  loadAvatarLibrary,
  uploadAvatarFiles,
  deleteAvatarIds,
  validateAvatarFile: () => '',
}))

const avatars = [
  { id: 'avatar_001', source: 'bundled', src: '/avatars/avatar_001.png' },
  { id: 'avatar_002', source: 'bundled', src: '/avatars/avatar_002.png' },
  { id: 'avatar_custom-one', source: 'uploaded', src: 'https://example.com/one.png' },
]

beforeEach(() => {
  loadAvatarLibrary.mockReset()
  uploadAvatarFiles.mockReset()
  deleteAvatarIds.mockReset()
  loadAvatarLibrary.mockResolvedValue(avatars)
  uploadAvatarFiles.mockResolvedValue({ uploaded: [{ id: 'avatar_custom-new', name: 'new.png' }], failed: [] })
  deleteAvatarIds.mockResolvedValue({ deleted: ['avatar_001'], failed: [] })
})

it('does not expose avatar management actions to non-admin users', async () => {
  const { AvatarLibraryManagement } = await import('./AvatarLibraryManagement')
  render(<AvatarLibraryManagement isAdmin={false} />)

  expect(screen.getByRole('alert')).toHaveTextContent(/admin access required/i)
  expect(screen.queryByRole('button', { name: /upload avatar/i })).not.toBeInTheDocument()
  expect(loadAvatarLibrary).not.toHaveBeenCalled()
})

it('previews a single file and uploads it once', async () => {
  const user = userEvent.setup()
  const { AvatarLibraryManagement } = await import('./AvatarLibraryManagement')
  render(<AvatarLibraryManagement isAdmin />)

  const file = new File(['image'], 'new.png', { type: 'image/png' })
  await user.upload(screen.getByLabelText('Upload Avatar file'), file)
  expect(screen.getByText('new.png')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Upload Avatar' })).toBeEnabled()
  await user.click(screen.getByRole('button', { name: 'Upload Avatar' }))

  expect(uploadAvatarFiles).toHaveBeenCalledWith([file])
  expect(await screen.findByRole('status')).toHaveTextContent(/uploaded successfully/i)
})

it('uploads a batch and reports partial results', async () => {
  const user = userEvent.setup()
  uploadAvatarFiles.mockResolvedValue({
    uploaded: [{ id: 'avatar_custom-one', name: 'one.png' }],
    failed: [{ name: 'two.png', error: 'Invalid image' }],
  })
  const { AvatarLibraryManagement } = await import('./AvatarLibraryManagement')
  render(<AvatarLibraryManagement isAdmin />)

  const files = [
    new File(['one'], 'one.png', { type: 'image/png' }),
    new File(['two'], 'two.png', { type: 'image/png' }),
  ]
  await user.upload(screen.getByLabelText('Upload Multiple Avatars files'), files)
  await user.click(screen.getByRole('button', { name: 'Upload Multiple Avatars' }))

  expect(uploadAvatarFiles).toHaveBeenCalledWith(files)
  expect(await screen.findByRole('status')).toHaveTextContent(/1 avatar uploaded successfully.*1 failed/i)
})

it('selects all, shows the count, and deletes only after confirmation', async () => {
  const user = userEvent.setup()
  const { AvatarLibraryManagement } = await import('./AvatarLibraryManagement')
  render(<AvatarLibraryManagement isAdmin />)

  await waitFor(() => expect(screen.getByText('3 avatars available')).toBeInTheDocument())
  await user.click(screen.getByRole('button', { name: 'Select All' }))
  expect(screen.getByText('3 avatars selected')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Delete Selected (3)' }))
  expect(screen.getByRole('heading', { name: 'Delete 3 selected avatars?' })).toBeInTheDocument()
  expect(deleteAvatarIds).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Delete 3 Avatars' }))

  expect(deleteAvatarIds).toHaveBeenCalledWith(['avatar_001', 'avatar_002', 'avatar_custom-one'])
  expect(await screen.findByRole('status')).toHaveTextContent(/deleted successfully/i)
})

it('confirms a single avatar deletion separately', async () => {
  const user = userEvent.setup()
  const { AvatarLibraryManagement } = await import('./AvatarLibraryManagement')
  render(<AvatarLibraryManagement isAdmin />)

  await user.click(await screen.findByRole('button', { name: 'Delete avatar_001' }))
  expect(screen.getByRole('heading', { name: 'Delete this avatar?' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Delete' }))

  expect(deleteAvatarIds).toHaveBeenCalledWith(['avatar_001'])
})
