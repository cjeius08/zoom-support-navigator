import { beforeEach, expect, it, vi } from 'vitest'

const from = vi.fn()
const invoke = vi.fn()
const getPublicUrl = vi.fn()

vi.mock('./supabaseClient', () => ({
  supabaseConfigured: true,
  supabase: {
    from,
    functions: { invoke },
    storage: { from: () => ({ getPublicUrl }) },
  },
}))

beforeEach(() => {
  from.mockReset()
  invoke.mockReset()
  getPublicUrl.mockReset()
})

it('loads bundled and uploaded avatar rows as picker-ready records', async () => {
  const order = vi.fn().mockResolvedValue({
    data: [
      { id: 'avatar_001', source: 'static', storage_path: null, original_filename: null },
      { id: 'avatar_custom-one', source: 'storage', storage_path: 'avatar_custom-one.png', original_filename: 'one.png' },
    ],
    error: null,
  })
  from.mockReturnValue({ select: () => ({ order }) })
  getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/zoom-avatars/avatar_custom-one.png' } })

  const { loadAvatarLibrary } = await import('./avatarLibraryApi')
  const records = await loadAvatarLibrary()

  expect(records).toEqual([
    expect.objectContaining({ id: 'avatar_001', source: 'bundled', src: expect.stringContaining('avatars/avatar_001.png') }),
    expect.objectContaining({ id: 'avatar_custom-one', source: 'uploaded', src: 'https://example.supabase.co/storage/v1/object/public/zoom-avatars/avatar_custom-one.png' }),
  ])
})

it('sends single and batch uploads through the protected avatar Edge Function', async () => {
  invoke.mockResolvedValue({ data: { uploaded: [{ id: 'avatar_custom-one', name: 'one.png' }], failed: [] }, error: null })
  const file = new File(['image'], 'one.png', { type: 'image/png' })
  const { uploadAvatarFiles } = await import('./avatarLibraryApi')

  await expect(uploadAvatarFiles([file])).resolves.toEqual(expect.objectContaining({ uploaded: expect.any(Array) }))
  expect(invoke).toHaveBeenCalledWith('avatar-library', { body: expect.any(FormData) })
  const body = invoke.mock.calls[0][1].body
  expect(body.get('action')).toBe('upload')
  expect(body.getAll('files')).toHaveLength(1)
})

it('sends selected avatar ids to the protected Edge Function for deletion', async () => {
  invoke.mockResolvedValue({ data: { deleted: ['avatar_custom-one'], failed: [] }, error: null })
  const { deleteAvatarIds } = await import('./avatarLibraryApi')

  await expect(deleteAvatarIds(['avatar_custom-one'])).resolves.toEqual({ deleted: ['avatar_custom-one'], failed: [] })
  expect(invoke).toHaveBeenCalledWith('avatar-library', {
    body: { action: 'delete', avatar_ids: ['avatar_custom-one'] },
  })
})
