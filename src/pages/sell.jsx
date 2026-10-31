import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CATEGORIES, CONDITIONS, PAYMENT_METHODS, MEETUP_LOCATIONS } from '../lib/listingOptions'
import { shrinkImage } from '../lib/shrinkImage'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 MB, same limit as the storage bucket
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Form for posting a new listing. Saves the photo to Supabase Storage,
// then saves the listing itself to the "listings" table.
export default function Sell({ session }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [meetupLocation, setMeetupLocation] = useState('')
  const [paymentMethods, setPaymentMethods] = useState([])
  const [photo, setPhoto] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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
    setPhoto(smallFile)
    setPreviewUrl(URL.createObjectURL(smallFile))
    input.value = '' // so picking the same photo again still triggers onChange
  }

  function handleRemovePhoto() {
    URL.revokeObjectURL(previewUrl)
    setPhoto(null)
    setPreviewUrl('')
  }

  // Returns an error message if something is wrong with the form, or '' if it's all good.
  function validate() {
    if (title.trim() === '') return 'Please add a title.'
    if (price === '' || Number(price) < 0) return 'Please enter a price of 0 or more.'
    if (category === '') return 'Please pick a category.'
    if (condition === '') return 'Please pick a condition.'
    if (meetupLocation === '') return 'Please pick a meetup location.'
    if (paymentMethods.length === 0) return 'Please pick at least one payment method.'
    if (photo && !ALLOWED_PHOTO_TYPES.includes(photo.type)) return 'Photo must be a JPEG, PNG, or WebP image.'
    if (photo && photo.size > MAX_PHOTO_SIZE) return 'Photo must be under 5 MB.'
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

    // Step 1: upload the photo (if there is one) into this user's folder in the bucket.
    let photoUrl = null
    let photoPath = null
    if (photo) {
      const extension = photo.name.split('.').pop()
      photoPath = `${session.user.id}/${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('listing-photos')
        .upload(photoPath, photo)

      if (uploadError) {
        setError(uploadError.message)
        setSaving(false)
        return
      }

      photoUrl = supabase.storage.from('listing-photos').getPublicUrl(photoPath).data.publicUrl
    }

    // Step 2: save the listing. seller_id and seller_email are filled in by the database.
    const { error: insertError } = await supabase.from('listings').insert({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      condition,
      meetup_location: meetupLocation,
      payment_methods: paymentMethods,
      photo_url: photoUrl,
    })

    if (insertError) {
      // The listing didn't save, so remove the photo we just uploaded instead of leaving it behind.
      if (photoPath) {
        await supabase.storage.from('listing-photos').remove([photoPath])
      }
      setError(insertError.message)
      setSaving(false)
      return
    }

    // TODO: once the listing detail page exists, go to the new listing instead.
    navigate('/feed')
  }

  return (
    <div>
      <h1>Sell an item</h1>

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
          Meetup location
          <select value={meetupLocation} onChange={(e) => setMeetupLocation(e.target.value)}>
            <option value="">Choose a spot on campus</option>
            {MEETUP_LOCATIONS.map((place) => (
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
            Take photo
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

          {previewUrl && (
            <div>
              <img className="photo-preview" src={previewUrl} alt="Preview of your listing photo" />
              <button type="button" onClick={handleRemovePhoto}>Remove photo</button>
            </div>
          )}
        </fieldset>

        <button type="submit" disabled={saving}>
          {saving ? 'Posting...' : 'Post listing'}
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  )
}
