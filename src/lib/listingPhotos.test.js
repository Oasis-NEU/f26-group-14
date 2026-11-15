// DATA-17: deleting a listing photo used to "succeed" while leaving the file in storage.
import { describe, expect, it, vi } from 'vitest'
import { getListingPhotoPath, removeListingPhoto } from './listingPhotos'

const mock = vi.hoisted(() => ({ supabase: null }))
vi.mock('./supabase', async () => {
  const { createSupabaseMock } = await import('../test/supabaseMock')
  mock.supabase = createSupabaseMock()
  return { supabase: mock.supabase }
})

const PHOTO_URL =
  'https://abc.supabase.co/storage/v1/object/public/listing-photos/user-1/1700000000.jpg'

// Make storage.remove() answer the way Supabase would.
function storageRemoveReturns(result) {
  const remove = vi.fn(() => Promise.resolve(result))
  mock.supabase.storage.from.mockReturnValue({ remove })
  return remove
}

describe('getListingPhotoPath', () => {
  it('turns a public photo link into the storage path', () => {
    expect(getListingPhotoPath(PHOTO_URL)).toBe('user-1/1700000000.jpg')
  })
})

describe('removeListingPhoto', () => {
  it('deletes the file at that path from the listing-photos bucket', async () => {
    const remove = storageRemoveReturns({ data: [{ name: 'user-1/1700000000.jpg' }], error: null })

    const { error } = await removeListingPhoto(PHOTO_URL)

    expect(error).toBeNull()
    expect(mock.supabase.storage.from).toHaveBeenCalledWith('listing-photos')
    expect(remove).toHaveBeenCalledWith(['user-1/1700000000.jpg'])
  })

  it('reports an error when storage says OK but deleted nothing', async () => {
    // This is the DATA-17 bug: without a SELECT policy, Storage can't see the file,
    // deletes nothing, and still answers with no error.
    storageRemoveReturns({ data: [], error: null })

    const { error } = await removeListingPhoto(PHOTO_URL)

    expect(error).not.toBeNull()
  })

  it('passes on the error when storage refuses', async () => {
    storageRemoveReturns({ data: null, error: { message: 'Bucket not found' } })

    const { error } = await removeListingPhoto(PHOTO_URL)

    expect(error).toEqual({ message: 'Bucket not found' })
  })
})
