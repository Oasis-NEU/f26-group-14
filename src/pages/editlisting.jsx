import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ListingForm from '../components/listings/ListingForm'
import PageShell from '../components/ui/PageShell'
import TopNav from '../components/ui/TopNav'

export default function EditListing({ session }) {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('listings')
        .select('id, seller_id, title, description, price, category, condition, campus, meetup_location, payment_methods, photo_url')
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
  }, [id])

  return (
    <PageShell variant="deep">
      <TopNav session={session} />

      {loading ? (
        <p className="state">Loading...</p>
      ) : error ? (
        <p className="state">Something went wrong: {error}</p>
      ) : !listing ? (
        <p className="state">This listing doesn't exist.</p>
      ) : listing.seller_id !== session.user.id ? (
        <p className="state">You can only edit your own listings.</p>
      ) : (
        <>
          <p style={{ marginBottom: 12 }}>
            <Link to={`/listing/${listing.id}`} className="auth-footer">← Back to listing</Link>
          </p>
          <h1 className="page-title">Edit listing</h1>
          <ListingForm session={session} existingListing={listing} />
        </>
      )}
    </PageShell>
  )
}
