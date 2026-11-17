import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ListingForm from '../components/listings/ListingForm'
import ListingCard from '../components/listings/ListingCard'

// Sell tab: a clear "Post a new listing" action, plus the things you're selling right now.
export default function Sell({ session }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const userId = session.user.id

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data } = await supabase
        .from('listings')
        .select('id, title, description, price, photo_url, status, campus, meetup_location')
        .eq('seller_id', userId)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
      if (ignore) return
      setListings(data ?? [])
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [userId])

  return (
    <div>
      <h1 className="page-title page-title-bold">Sell Items</h1>

      <div className="glass sell-cta">
        <div>
          <h2>Have something to sell?</h2>
          <p>Add a photo, say what it is, and describe it. Students on your campus will see it right away.</p>
        </div>
        <Link to="/sell/new" className="btn btn-primary btn-lg">+ New listing</Link>
      </div>

      <section className="section" aria-label="Your active listings">
        <h2>Your active listings</h2>
        {loading ? (
          <p className="status-text">Loading your listings...</p>
        ) : listings.length === 0 ? (
          <p className="status-text">You aren't selling anything yet.</p>
        ) : (
          <div className="listing-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// /sell/new: the form for posting a listing. The form lives in components/listings/ListingForm.jsx,
// because the Edit page uses the same form.
export function NewListing({ session }) {
  return (
    <div>
      <Link to="/sell" className="back-link">← Back to Sell</Link>
      <h1 className="page-title page-title-bold">New listing</h1>
      <div className="glass form-panel">
        <ListingForm session={session} />
      </div>
    </div>
  )
}
