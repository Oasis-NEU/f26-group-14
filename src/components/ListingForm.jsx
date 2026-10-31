import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CATEGORIES, CONDITIONS, PAYMENT_METHODS, CAMPUS_NAMES, getMeetupSpots } from '../lib/listingOptions'
import { shrinkImage } from '../lib/shrinkImage'
import { LISTING_PHOTOS_BUCKET, getListingPhotoPath } from '../lib/listingPhotos'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 MB, same limit as the storage bucket
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// The form for posting a listing (Sell page) and for editing one (Edit page).
//   session         - the logged-in user
//   existingListing - (optional) the listing being edited. Leave it out to post a new one.
// Saves the photo to Supabase Storage, then saves the listing to the "listings" table,
// then opens the listing's page.
export default function ListingForm({ session, existingListing }) {
  const isEditing = Boolean(existingListing)
  // When editing, every field starts with the listing's current value.
  const [title, setTitle] = useState(existingListing?.title ?? '')
  const [description, setDescription] = useState(existingListing?.description ?? '')
  const [price, setPrice] = useState(existingListing ? String(existingListing.price) : '')
  const [category, setCategory] = useState(existingListing?.category ?? '')
  const [condition, setCondition] = useState(existingListing?.condition ?? '')
  const [campus, setCampus] = useState(existingListing?.campus ?? '')
  const [meetupLocation, setMeetupLocation] = useState(existingListing?.meetup_location ?? '')
  const [paymentMethods, setPaymentMethods] = useState(existingListing?.payment_methods ?? [])
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(existingListing?.photo_url ?? '') // already uploaded
  const [newPhoto, setNewPhoto] = useState(null) // picked but not uploaded yet
  const [previewUrl, setPreviewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const userId = session.user.id

  // For new listings, start the Campus dropdown on the campus saved in the user's profile.
  useEffect(() => {
    if (isEditing) return
    let ignore = false

    async function loadProfileCampus() {
      const { data } = await supabase.from('profiles').select('campus').eq('id', userId).single()
      // Only fill it in if the user hasn't already picked a campus themselves.
      if (!ignore && data?.campus) setCampus((current) => current || data.campus)
    }

    loadProfileCampus()
    return () => {
      ignore = true
    }
  }, [userId, isEditing])

  // Meetup spots depend on the campus, so changing campus clears the old spot.
  function handleCampusChange(newCampus) {
    setCampus(newCampus)
    setMeetupLocation('')
  }

  // Checking a box adds that method to the list; unchecking removes it.
  function togglePaymentMethod(method) {
    if (paymentMethods.includes(method)) {
      setPaymentMethods(paymentMethods.filter((m) => m !== method))
    } else {
      setPaymentMethods([...paymentMethods, method])
    }
  }

  // Runs when a photo is taken or picked. Shrinks it, keeps it, and makes a temporary preview link for it.
  async function handlePhotoChange(event) {
    const input = event.target
    const file = input.files[0]
    if (!file) return // they closed the camera/picker without choosing anything

    const smallFile = await shrinkImage(file)

    if (previewUrl) URL.revokeObjectURL(previewUrl) // free the old preview
    setNewPhoto(smallFile)
    setPreviewUrl(URL.createObjectURL(smallFile))
    input.value = '' // so picking the same photo again still triggers onChange
  }

  // Removes both a newly picked photo and (when editing) the photo already on the listing.
  function handleRemovePhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setNewPhoto(null)
    setPreviewUrl('')
    setExistingPhotoUrl('')
  }

  // Returns an error message if something is wrong with the form, or '' if it's all good.
  function validate() {
    if (title.trim() === '') return 'Please add a title.'
    if (price === '' || Number(price) < 0) return 'Please enter a price of 0 or more.'
    if (category === '') return 'Please pick a category.'
    if (condition === '') return 'Please pick a condition.'
    if (campus === '') return 'Please pick your campus.'
    if (meetupLocation === '') return 'Please pick a meetup location.'
    if (paymentMethods.length === 0) return 'Please pick at least one payment method.'
    if (newPhoto && !ALLOWED_PHOTO_TYPES.includes(newPhoto.type)) return 'Photo must be a JPEG, PNG, or WebP image.'
    if (newPhoto && newPhoto.size > MAX_PHOTO_SIZE) return 'Photo must be under 5 MB.'
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }

    setSaving(true)
    setError('')

    // Step 1: upload the new photo (if one was picked) into this user's folder in the bucket.
    let newPhotoPath = null
    let photoUrl = existingPhotoUrl || null
    if (newPhoto) {
      const extension = newPhoto.name.split('.').pop()
      newPhotoPath = `${userId}/${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from(LISTING_PHOTOS_BUCKET)
        .upload(newPhotoPath, newPhoto)

      if (uploadError) {
        setError(uploadError.message)
        setSaving(false)
        return
      }

      photoUrl = supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(newPhotoPath).data.publicUrl
    }

    // Step 2: save the listing. seller_id and seller_email are filled in by the database.
    const fields = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      condition,
      campus,
      meetup_location: meetupLocation,
      payment_methods: paymentMethods,
      photo_url: photoUrl,
    }

    // .select('id').single() asks the database to send back the saved listing's id.
    const { data, error: saveError } = isEditing
      ? await supabase.from('listings').update(fields).eq('id', existingListing.id).select('id').single()
      : await supabase.from('listings').insert(fields).select('id').single()

    if (saveError) {
      // The listing didn't save, so remove the photo we just uploaded instead of leaving it behind.
      if (newPhotoPath) {
        await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove([newPhotoPath])
      }
      setError(saveError.message)
      setSaving(false)
      return
    }

    // When editing, if the old photo was replaced or removed, delete the old file from storage.
    const oldPhotoUrl = existingListing?.photo_url
    if (oldPhotoUrl && oldPhotoUrl !== photoUrl) {
      await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove([getListingPhotoPath(oldPhotoUrl)])
    }

    navigate(`/listing/${data.id}`)
  }

  const shownPhoto = previewUrl || existingPhotoUrl

  return (
    <>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            maxLength={100}
            placeholder="e.g. Calculus textbook, mini fridge"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label>
          Description
          <textarea
            maxLength={2000}
            placeholder="Details, size, any wear and tear..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          Price ($)
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Choose a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Condition
          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">Choose a condition</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Campus
          <select value={campus} onChange={(e) => handleCampusChange(e.target.value)}>
            <option value="">Choose your campus</option>
            {CAMPUS_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <label>
          Meetup location
          <select
            value={meetupLocation}
            onChange={(e) => setMeetupLocation(e.target.value)}
            disabled={campus === ''}
          >
            <option value="">{campus === '' ? 'Pick a campus first' : 'Choose a spot on campus'}</option>
            {getMeetupSpots(campus).map((place) => (
              <option key={place} value={place}>{place}</option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>Payment methods you accept</legend>
          {PAYMENT_METHODS.map((method) => (
            <label key={method}>
              <input
                type="checkbox"
                checked={paymentMethods.includes(method)}
                onChange={() => togglePaymentMethod(method)}
              />
              {method}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Photo (optional)</legend>

          {/* On phones, capture="environment" opens the back camera directly.
              On laptops it's ignored, so both buttons just open the file picker. */}
          <label className="photo-button">
            {shownPhoto ? 'Take new photo' : 'Take photo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handlePhotoChange}
            />
          </label>
          <label className="photo-button">
            Choose from library
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
            />
          </label>

          {shownPhoto && (
            <div>
              <img className="photo-preview" src={shownPhoto} alt="Your listing photo" />
              <button type="button" onClick={handleRemovePhoto}>Remove photo</button>
            </div>
          )}
        </fieldset>

        <button type="submit" disabled={saving}>
          {isEditing ? (saving ? 'Saving...' : 'Save changes') : (saving ? 'Posting...' : 'Post listing')}
        </button>
      </form>

      {error && <p>{error}</p>}
    </>
  )
}
