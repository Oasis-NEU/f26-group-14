import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/formatPrice'
import PageShell from '../components/ui/PageShell'
import TopNav from '../components/ui/TopNav'
import OrdersToggle from '../components/ui/OrdersToggle'
import ItemCard from '../components/ui/ItemCard'
import Button from '../components/ui/Button'


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
        .select('id, title, price, photo_url, status, campus, meetup_location')
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
    <PageShell variant="gradient">
      <TopNav session={session} />

      <div className="page-title-row">
        <h1 className="page-title">My Orders</h1>
        <OrdersToggle value={tab} onChange={setTab} />
      </div>

      {tab === 'incoming' ? (
        <div className="state">
          <p style={{ marginBottom: 14 }}>Things you buy will show up here once in-app messaging launches.</p>
          <Button as={Link} to="/feed" variant="primary">Browse items</Button>
        </div>
      ) : loading ? (
        <p className="state">Loading your listings...</p>
      ) : error ? (
        <p className="state">Couldn't load your listings: {error}</p>
      ) : (
        <>
          <OrderSection title="Listed/Pending" listings={listed} empty="Nothing listed right now.">
            <Button as={Link} to="/sell" variant="primary">Sell an item</Button>
          </OrderSection>
          <OrderSection title="Fulfilled" listings={fulfilled} empty="No sales yet." sold />
        </>
      )}
    </PageShell>
  )
}

// One heading plus a grid of cards, or a short message (and optional button) when it's empty.
function OrderSection({ title, listings, empty, sold = false, children }) {
  return (
    <>
      <h2 className="section-heading">{title}</h2>
      {listings.length === 0 ? (
        <div className="state">
          <p style={{ marginBottom: children ? 14 : 0 }}>{empty}</p>
          {children}
        </div>
      ) : (
        <div className="item-grid">
          {listings.map((listing) => (
            <ItemCard
              key={listing.id}
              title={listing.title}
              price={formatPrice(listing.price)}
              description={`${listing.campus} · ${listing.meetup_location}`}
              photoUrl={listing.photo_url}
              to={`/listing/${listing.id}`}
              sold={sold}
            />
          ))}
        </div>
      )}
    </>
  )
}
