// Small helpers for the "listing-photos" storage bucket.
import { supabase } from './supabase'

export const LISTING_PHOTOS_BUCKET = 'listing-photos'

// A photo's public link looks like .../storage/v1/object/public/listing-photos/<user id>/<file>.
// Storage needs just the "<user id>/<file>" part (the path) to delete it.
export function getListingPhotoPath(photoUrl) {
  return photoUrl.split(`/${LISTING_PHOTOS_BUCKET}/`)[1]
}

// Deletes a listing's photo file. Returns { error }, which is null only if the file is really gone.
// Storage answers "no error" even when it deleted nothing (for example, when a policy hides the
// file), so we also check that it sent back the file it removed (DATA-17).
export async function removeListingPhoto(photoUrl) {
  const { data, error } = await supabase.storage
    .from(LISTING_PHOTOS_BUCKET)
    .remove([getListingPhotoPath(photoUrl)])

  if (error) return { error }
  if (!data?.length) return { error: { message: 'The photo file was not deleted.' } }
  return { error: null }
}
