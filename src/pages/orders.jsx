import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/listings/ListingCard'

// My Orders (Canva screen 4).
//   Outgoing - things I'm selling: "Listed/Pending" are still available, "Fulfilled" are sold.
//   Incoming - things I'm buying. There's no purchases table yet (buyers and sellers will
//              arrange sales through messaging, MSG-*), so this tab says so instead of
//              showing made-up data.
export default function Orders({ session }) {
  const [tab, setTab] = useState('outgoing')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = session.user.id

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, description, price, photo_url, status, campus, meetup_location')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })

      if (ignore) return
      if (error) {
        setError(error.message)
      } else {
        setListings(data)
      }
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [userId])

  const listed = listings.filter((listing) => listing.status === 'available')
  const fulfilled = listings.filter((listing) => listing.status === 'sold')

  return (
    <div>
      <div className="orders-header">
        <h1 className="page-title page-title-bold">My Orders</h1>
        {/* Two buttons that act as tabs; aria-pressed tells screen readers which one is on. */}
        <div className="orders-tabs" role="group" aria-label="Order type">
          <button type="button" aria-pressed={tab === 'outgoing'} onClick={() => setTab('outgoing')}>
            Outgoing
          </button>
          <button type="button" aria-pressed={tab === 'incoming'} onClick={() => setTab('incoming')}>
            Incoming
          </button>
        </div>
      </div>

      {tab === 'incoming' ? (
        <div className="glass empty-state">
          <p>Things you buy will show up here once in-app messaging launches.</p>
          <Link to="/feed" className="btn btn-primary">Browse items</Link>
        </div>
      ) : loading ? (
        <p className="status-text">Loading your listings...</p>
      ) : error ? (
        <p className="status-text">Something went wrong: {error}</p>
      ) : (
        <>
          <OrderSection title="Listed/Pending" listings={listed} empty="Nothing listed right now.">
            <Link to="/sell" className="btn btn-primary">Sell an item</Link>
          </OrderSection>
          <OrderSection title="Fulfilled" listings={fulfilled} empty="No sales yet." />
        </>
      )}
    </div>
  )
}

// One heading plus a grid of cards, or a short message (and optional button) when it's empty.
function OrderSection({ title, listings, empty, children }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {listings.length === 0 ? (
        <div className="glass empty-state">
          <p>{empty}</p>
          {children}
        </div>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  )
}
