import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/formatPrice'
import PageShell from '../components/ui/PageShell'
import TopNav from '../components/ui/TopNav'
import ItemCard from '../components/ui/ItemCard'
import Button from '../components/ui/Button'
import SellTabs from '../components/listings/SellTabs'

// My listings (/sell/listings): everything the signed-in user has posted, split
// into "For sale" and "Sold", with Edit and Mark sold / Relist under each card.
export default function MyListings({ session }) {
  const userId = session.user.id
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, photo_url, status, campus, meetup_location')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })

      if (ignore) return
      if (error) setError(error.message)
      else setListings(data)
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [userId])

  async function toggleSold(listing) {
    const newStatus = listing.status === 'sold' ? 'available' : 'sold'
    setBusyId(listing.id)
    setError('')
    const { error } = await supabase.from('listings').update({ status: newStatus }).eq('id', listing.id)
    if (error) {
      setError(`Couldn't update "${listing.title}": ${error.message}`)
    } else {
      setListings((current) => current.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l)))
    }
    setBusyId(null)
  }

  const forSale = listings.filter((l) => l.status === 'available')
  const sold = listings.filter((l) => l.status === 'sold')

  return (
    <PageShell variant="deep">
      <TopNav session={session} />
      <div className="page-title-row">
        <h1 className="page-title">Sell Items</h1>
        <SellTabs />
      </div>

      {loading ? (
        <p className="state">Loading your listings...</p>
      ) : listings.length === 0 ? (
        <div className="state">
          {error ? (
            <p>Couldn't load your listings: {error}</p>
          ) : (
            <>
              <p style={{ marginBottom: 14 }}>You haven't listed anything yet.</p>
              <Button as={Link} to="/sell" variant="primary">Post your first listing</Button>
            </>
          )}
        </div>
      ) : (
        <>
          {error && <p className="form-message" role="alert">{error}</p>}
          <ListingGroup
            title="For sale"
            listings={forSale}
            empty="Nothing for sale right now."
            busyId={busyId}
            onToggleSold={toggleSold}
          />
          <ListingGroup
            title="Sold"
            listings={sold}
            empty="Nothing sold yet."
            busyId={busyId}
            onToggleSold={toggleSold}
          />
        </>
      )}
    </PageShell>
  )
}

function ListingGroup({ title, listings, empty, busyId, onToggleSold }) {
  return (
    <section>
      <h2 className="section-heading">
        {title} <span className="section-heading__count">{listings.length}</span>
      </h2>
      {listings.length === 0 ? (
        <p className="feed-status">{empty}</p>
      ) : (
        <div className="item-grid">
          {listings.map((listing) => {
            const isSold = listing.status === 'sold'
            return (
              <div key={listing.id} className="my-listing">
                <ItemCard
                  title={listing.title}
                  price={formatPrice(listing.price)}
                  description={`${listing.campus} · ${listing.meetup_location}`}
                  photoUrl={listing.photo_url}
                  to={`/listing/${listing.id}`}
                  sold={isSold}
                />
                <div className="my-listing__actions">
                  {!isSold && (
                    <Button as={Link} to={`/listing/${listing.id}/edit`} variant="outline" size="sm">
                      Edit
                    </Button>
                  )}
                  <Button
                    variant={isSold ? 'outline' : 'primary'}
                    size="sm"
                    disabled={busyId === listing.id}
                    onClick={() => onToggleSold(listing)}
                  >
                    {isSold ? 'Relist' : 'Mark sold'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
