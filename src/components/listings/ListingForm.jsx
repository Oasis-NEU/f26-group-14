import { useEffect, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { CATEGORIES, CONDITIONS, PAYMENT_METHODS, CAMPUS_NAMES, getMeetupSpots } from '../../lib/listingOptions'
import { shrinkImage } from '../../lib/shrinkImage'
import { LISTING_PHOTOS_BUCKET, getListingPhotoPath } from '../../lib/listingPhotos'
import { formatPrice } from '../../lib/formatPrice'
import Button from '../ui/Button'
import ItemCard from '../ui/ItemCard'

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

  const submitLabel = isEditing ? (saving ? 'Saving...' : 'Save changes') : (saving ? 'Posting...' : 'Post listing')

  return (
    <div className="sell-layout">
      <form className="glass glass--panel form-stack sell-form" onSubmit={handleSubmit} noValidate>
        <section className="sell-section">
          <h2 className="sell-section__title">The item</h2>

          <label>
            Title
            <input
              type="text"
              maxLength={100}
              placeholder="Calculus textbook, mini fridge..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label>
            Description
            <textarea
              maxLength={2000}
              placeholder="Size, edition, any wear and tear"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className="sell-price">
            Price
            <span className="sell-price__field">
              <span aria-hidden="true">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0 for free"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </span>
          </label>

          <ChipChoice legend="Category" options={CATEGORIES} value={category} onChange={setCategory} />
          <ChipChoice legend="Condition" options={CONDITIONS} value={condition} onChange={setCondition} />
        </section>

        <section className="sell-section">
          <h2 className="sell-section__title">Meetup</h2>
          <div className="sell-row">
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
              Meetup spot
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
          </div>

          <fieldset className="chip-filter">
            <legend>Payment you accept</legend>
            {PAYMENT_METHODS.map((method) => (
              <label key={method} className={paymentMethods.includes(method) ? 'chip chip-selected' : 'chip'}>
                <input
                  type="checkbox"
                  checked={paymentMethods.includes(method)}
                  onChange={() => togglePaymentMethod(method)}
                />
                {method}
              </label>
            ))}
          </fieldset>
          <p className="form-help">Payment happens in person when you meet. HuskyExchange never handles money.</p>
        </section>

        <section className="sell-section">
          <h2 className="sell-section__title">Photo <span className="sell-section__hint">optional</span></h2>

          <div className="sell-photo">
            <label className="sell-photo__drop">
              {shownPhoto ? (
                <img src={shownPhoto} alt="Your listing photo" />
              ) : (
                <span className="sell-photo__empty">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="9" cy="10" r="1.6" />
                    <path d="M21 16l-5-5-8 8" />
                  </svg>
                  Choose a photo
                  <small>JPEG, PNG, or WebP · up to 5 MB</small>
                </span>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
            </label>

            <div className="sell-photo__actions">
              {/* On phones, capture="environment" opens the back camera directly.
                  On laptops it's ignored and just opens the file picker. */}
              <label className="btn btn--outline btn--sm sell-photo__camera">
                {shownPhoto ? 'Retake photo' : 'Take photo'}
                <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handlePhotoChange} />
              </label>
              {shownPhoto && (
                <Button variant="ghost" size="sm" onClick={handleRemovePhoto}>
                  Remove photo
                </Button>
              )}
            </div>
          </div>
        </section>

        {error && <p className="form-message" role="alert">{error}</p>}

        <div className="sell-submit">
          <Button type="submit" size="lg" disabled={saving}>
            {submitLabel}
          </Button>
        </div>
      </form>

      <aside className="sell-preview" aria-label="Preview">
        <p className="sell-preview__caption">How it shows in the feed</p>
        <ItemCard
          title={title.trim() || 'Your item'}
          price={price === '' ? '' : formatPrice(price)}
          description={campus ? [campus, meetupLocation].filter(Boolean).join(' · ') : 'Pick a campus and meetup spot'}
          photoUrl={shownPhoto}
        />
      </aside>
    </div>
  )
}

// Single-select version of the feed's filter chips: radio buttons styled as pills,
// so keyboard arrows and screen readers still treat them as one choice.
function ChipChoice({ legend, options, value, onChange }) {
  const name = useId()
  return (
    <fieldset className="chip-filter">
      <legend>{legend}</legend>
      {options.map((option) => (
        <label key={option} className={value === option ? 'chip chip-selected' : 'chip'}>
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          {option}
        </label>
      ))}
    </fieldset>
  )
}
