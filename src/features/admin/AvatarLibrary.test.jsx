import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { AvatarLibrary } from './AvatarLibrary'
import { deleteAvatarIds, loadAvatarLibrary, uploadAvatarFiles } from '../../lib/avatarAdminApi'

vi.mock('../../lib/avatarAdminApi', () => ({
  loadAvatarLibrary: vi.fn(),
  uploadAvatarFiles: vi.fn(),
  deleteAvatarIds: vi.fn(),
}))

vi.mock('../profile/avatarCatalog', () => ({
  avatarUrl: id => `/avatar/${id}`,
}))

beforeEach(() => {
  vi.clearAllMocks()
  loadAvatarLibrary.mockResolvedValue([
    { id: 'avatar_001', source: 'static', storage_path: null, original_filename: null },
    { id: 'avatar_002', source: 'static', storage_path: null, original_filename: null },
  ])
  uploadAvatarFiles.mockResolvedValue([{ id: 'uploaded_test.webp' }])
  deleteAvatarIds.mockResolvedValue({ deletedIds: ['avatar_001', 'avatar_002'], cleanupWarning: '' })
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

it('blocks the avatar library when the viewer is not an admin', () => {
  render(<AvatarLibrary isAdmin={false} />)
  expect(screen.getByRole('heading', { name: 'Avatar Library' })).toBeInTheDocument()
  expect(screen.getByRole('alert')).toHaveTextContent(/admin access is required/i)
  expect(loadAvatarLibrary).not.toHaveBeenCalled()
})

it('supports single upload, multiple upload, and batch deletion for admins', async () => {
  const user = userEvent.setup()
  render(<AvatarLibrary isAdmin />)

  expect(await screen.findByText('avatar_001')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Upload One' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Upload Multiple' })).toBeInTheDocument()

  const oneFile = new File(['one'], 'one.webp', { type: 'image/webp' })
  await user.upload(screen.getByLabelText('Upload one avatar'), oneFile)
  await waitFor(() => expect(uploadAvatarFiles).toHaveBeenCalledWith(expect.any(FileList)))

  const first = new File(['first'], 'first.png', { type: 'image/png' })
  const second = new File(['second'], 'second.jpg', { type: 'image/jpeg' })
  await user.upload(screen.getByLabelText('Upload multiple avatars'), [first, second])
  await waitFor(() => expect(uploadAvatarFiles).toHaveBeenCalledTimes(2))

  await user.click(screen.getByRole('checkbox', { name: /select all/i }))
  expect(screen.getByRole('button', { name: /delete selected \(2\)/i })).toBeEnabled()
  await user.click(screen.getByRole('button', { name: /delete selected \(2\)/i }))

  await waitFor(() => expect(deleteAvatarIds).toHaveBeenCalledWith(['avatar_001', 'avatar_002']))
})
