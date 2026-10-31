import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/formatPrice'
import { LISTING_PHOTOS_BUCKET, getListingPhotoPath } from '../lib/listingPhotos'
import Avatar from '../components/Avatar'

// What guests may see (no seller_email, and only the seller's first name).
const GUEST_COLUMNS =
  'id, seller_id, title, description, price, category, condition, campus, meetup_location, ' +
  'payment_methods, photo_url, status, created_at, seller:profiles(id, first_name)'

// Logged-in users also get the seller's email, full name, and picture.
const MEMBER_COLUMNS = GUEST_COLUMNS.replace(
  'seller:profiles(id, first_name)',
  'seller_email, seller:profiles(id, first_name, last_name, avatar_url)',
)

// One listing's full page: /listing/<id>. Open to guests.
// Buyers can contact the seller; the seller can edit, mark as sold, or delete it.
export default function Listing({ session }) {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false) // true while marking sold / deleting
  const location = useLocation()
  const navigate = useNavigate()

  const isValidId = /^\d+$/.test(id) // listing ids are whole numbers; anything else can't exist
  const isLoggedIn = Boolean(session)

  useEffect(() => {
    if (!isValidId) return
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('listings')
        .select(isLoggedIn ? MEMBER_COLUMNS : GUEST_COLUMNS)
        .eq('id', id)
        .maybeSingle()

      if (ignore) return
      if (error) {
        setError(error.message)
      } else {
        setListing(data)
      }
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [id, isValidId, isLoggedIn])

  // Switch between "available" and "sold".
  async function handleToggleSold() {
    const newStatus = listing.status === 'sold' ? 'available' : 'sold'
    setWorking(true)
    const { error } = await supabase.from('listings').update({ status: newStatus }).eq('id', listing.id)
    setWorking(false)

    if (error) {
      setError(error.message)
    } else {
      setListing({ ...listing, status: newStatus })
    }
  }

  async function handleDelete() {
    // window.confirm shows the browser's built-in "OK / Cancel" box and returns true for OK.
    if (!window.confirm('Delete this listing? This can\'t be undone.')) return

    setWorking(true)
    const { error } = await supabase.from('listings').delete().eq('id', listing.id)
    if (error) {
      setWorking(false)
      setError(error.message)
      return
    }

    // The listing is gone, so delete its photo too.
    if (listing.photo_url) {
      await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove([getListingPhotoPath(listing.photo_url)])
    }
    navigate(`/profile/${session.user.id}`)
  }

  if (!isValidId) return <p>This listing doesn't exist.</p>
  if (loading) return <p>Loading...</p>
  if (error) return <p>Something went wrong: {error}</p>
  if (!listing) return <p>This listing doesn't exist or was deleted.</p>

  const isMine = session?.user.id === listing.seller_id
  const isSold = listing.status === 'sold'
  const seller = listing.seller
  const sellerName = [seller.first_name, seller.last_name].filter(Boolean).join(' ')
  const postedOn = new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // mailto: links open the user's email app with the address, subject, and message filled in.
  // encodeURIComponent makes spaces and symbols safe to put inside a link.
  const emailSubject = encodeURIComponent(`UniSwap: ${listing.title}`)
  const offerBody = encodeURIComponent(
    `Hi ${seller.first_name}! I saw your "${listing.title}" on UniSwap. Would you take $__ for it?`,
  )

  return (
    <div className="listing-page">
      <div className="listing-photo">
        {listing.photo_url ? (
          <img src={listing.photo_url} alt={listing.title} />
        ) : (
          <div className="listing-card-no-photo">No photo</div>
        )}
      </div>

      <div className="listing-details">
        <h1>
          {listing.title}
          {isSold && <span className="sold-badge">Sold</span>}
        </h1>
        <p className="listing-price">{formatPrice(listing.price)}</p>

        <dl className="listing-facts">
          <dt>Condition</dt>
          <dd>{listing.condition}</dd>
          <dt>Category</dt>
          <dd>{listing.category}</dd>
          <dt>Campus</dt>
          <dd>{listing.campus}</dd>
          <dt>Meetup spot</dt>
          <dd>{listing.meetup_location}</dd>
          <dt>Accepts</dt>
          <dd>{listing.payment_methods.join(', ')}</dd>
          <dt>Posted</dt>
          <dd>{postedOn}</dd>
        </dl>

        {listing.description && <p className="listing-description">{listing.description}</p>}

        {/* Seller: logged-in users can open their profile; guests just see the first name. */}
        <div className="listing-seller">
          {isLoggedIn ? (
            <Link to={`/profile/${seller.id}`} className="listing-seller-link">
              <Avatar url={seller.avatar_url} name={seller.first_name} size={40} />
              <span>
                Sold by <strong>{sellerName}</strong>
              </span>
            </Link>
          ) : (
            <span>
              Sold by <strong>{seller.first_name}</strong>
            </span>
          )}
        </div>

        {/* What you can do depends on who you are. */}
        <div className="listing-actions">
          {isMine ? (
            <>
              <Link to={`/listing/${listing.id}/edit`}>Edit</Link>
              <button type="button" onClick={handleToggleSold} disabled={working}>
                {isSold ? 'Mark as available' : 'Mark as sold'}
              </button>
              <button type="button" onClick={handleDelete} disabled={working}>
                Delete
              </button>
            </>
          ) : isSold ? (
            <p>This item has been sold.</p>
          ) : isLoggedIn ? (
            <>
              <a href={`mailto:${listing.seller_email}?subject=${emailSubject}`}>Email seller</a>
              <a href={`mailto:${listing.seller_email}?subject=${emailSubject}&body=${offerBody}`}>Make an offer</a>
            </>
          ) : (
            // Guests are sent to sign in, then brought back to this listing.
            <Link to="/signin" state={{ from: location.pathname }}>
              Sign in to contact the seller
            </Link>
          )}
        </div>

        {!isMine && (
          <aside className="safety-tips">
            <strong>Stay safe</strong>
            <ul>
              <li>Meet in a busy, public spot on campus.</li>
              <li>Check the item before you pay.</li>
              <li>Never pay before meeting in person.</li>
            </ul>
          </aside>
        )}
      </div>
    </div>
  )
}
