// Small helpers for the "listing-photos" storage bucket.

export const LISTING_PHOTOS_BUCKET = 'listing-photos'

// A photo's public link looks like .../storage/v1/object/public/listing-photos/<user id>/<file>.
// Storage needs just the "<user id>/<file>" part (the path) to delete it.
export function getListingPhotoPath(photoUrl) {
  return photoUrl.split(`/${LISTING_PHOTOS_BUCKET}/`)[1]
}
