import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/formatPrice'
import { removeListingPhoto } from '../lib/listingPhotos'
import PageShell from '../components/ui/PageShell'
import TopNav from '../components/ui/TopNav'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import PhotoPlaceholder from '../components/ui/PhotoPlaceholder'



const GUEST_COLUMNS =
  'id, seller_id, title, description, price, category, condition, campus, meetup_location, ' +
  'payment_methods, photo_url, status, created_at, seller:profiles(id, first_name)'

const MEMBER_COLUMNS = GUEST_COLUMNS.replace(
  'seller:profiles(id, first_name)',
  'seller_email, seller:profiles(id, first_name, last_name, avatar_url)',
)

export default function Listing({ session }) {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isValidId = /^\d+$/.test(id)
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
      if (error) setError(error.message)
      else setListing(data)
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [id, isValidId, isLoggedIn])

  async function handleToggleSold() {
    const newStatus = listing.status === 'sold' ? 'available' : 'sold'
    setWorking(true)
    const { error } = await supabase.from('listings').update({ status: newStatus }).eq('id', listing.id)
    setWorking(false)
    if (error) setError(error.message)
    else setListing({ ...listing, status: newStatus })
  }

  async function handleDelete() {
    if (!window.confirm("Delete this listing? This can't be undone.")) return
    setWorking(true)
    const { error } = await supabase.from('listings').delete().eq('id', listing.id)
    if (error) {
      setWorking(false)
      setError(error.message)
      return
    }
    if (listing.photo_url) {
      // The listing is already gone, so don't block the user; just make the leftover file visible.
      const { error: photoError } = await removeListingPhoto(listing.photo_url)
      if (photoError) console.error('Listing deleted, but its photo was not:', photoError.message)
    }
    navigate(`/profile/${session.user.id}`)
  }

  const profileHref = session ? `/profile/${session.user.id}` : '/signin'

  return (
    <PageShell variant="gradient">
      <TopNav profileHref={profileHref} />

      {!isValidId ? (
        <p className="state">This listing doesn't exist.</p>
      ) : loading ? (
        <p className="state">Loading...</p>
      ) : error ? (
        <p className="state">Something went wrong: {error}</p>
      ) : !listing ? (
        <p className="state">This listing doesn't exist or was deleted.</p>
      ) : (
        <ListingBody
          listing={listing}
          session={session}
          working={working}
          onToggleSold={handleToggleSold}
          onDelete={handleDelete}
          backTo={location.pathname}
        />
      )}
    </PageShell>
  )
}

function ListingBody({ listing, session, working, onToggleSold, onDelete, backTo }) {
  const isLoggedIn = Boolean(session)
  const isMine = session?.user.id === listing.seller_id
  const isSold = listing.status === 'sold'
  const seller = listing.seller
  const sellerName = [seller.first_name, seller.last_name].filter(Boolean).join(' ')
  const postedOn = new Date(listing.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const emailSubject = encodeURIComponent(`HuskyExchange: ${listing.title}`)
  const offerBody = encodeURIComponent(
    `Hi ${seller.first_name}! I saw your "${listing.title}" on HuskyExchange. Would you take $__ for it?`,
  )

  return (
    <div className="listing-page">
      <div className="listing-photo">
        {listing.photo_url ? (
          <img src={listing.photo_url} alt={listing.title} />
        ) : (
          <PhotoPlaceholder />
        )}
      </div>

      <div>
        <h1 className="page-title" style={{ marginBottom: 4 }}>
          {listing.title}
          {isSold && <span className="item-card__sold">Sold</span>}
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

        <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          {isLoggedIn ? (
            <Link to={`/profile/${seller.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
              <Avatar url={seller.avatar_url} name={seller.first_name} size={40} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                Sold by <strong>{sellerName}</strong>
              </span>
            </Link>
          ) : (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
              Sold by <strong>{seller.first_name}</strong>
            </span>
          )}
        </div>

        <div className="listing-actions">
          {isMine ? (
            <>
              <Button as={Link} to={`/listing/${listing.id}/edit`} variant="outline">Edit</Button>
              <Button variant="primary" onClick={onToggleSold} disabled={working}>
                {isSold ? 'Mark as available' : 'Mark as sold'}
              </Button>
              <Button variant="ghost" onClick={onDelete} disabled={working}>Delete</Button>
            </>
          ) : isSold ? (
            <p style={{ fontFamily: 'var(--mono)' }}>This item has been sold.</p>
          ) : isLoggedIn ? (
            <>
              <Button as="a" href={`mailto:${listing.seller_email}?subject=${emailSubject}`} variant="primary">
                Email seller
              </Button>
              <Button as="a" href={`mailto:${listing.seller_email}?subject=${emailSubject}&body=${offerBody}`} variant="outline">
                Make an offer
              </Button>
            </>
          ) : (
            <Button as={Link} to="/signin" state={{ from: backTo }} variant="primary">
              Sign in to contact the seller
            </Button>
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
