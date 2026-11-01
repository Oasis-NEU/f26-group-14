import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ListingForm from '../components/ListingForm'

// Edit one of your own listings: /listing/<id>/edit.
// Loads the listing, makes sure it's yours, then shows the same form as the Sell page, pre-filled.
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
  }, [id])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Something went wrong: {error}</p>
  if (!listing) return <p>This listing doesn't exist.</p>

  // The database would refuse to save someone else's listing anyway; this just explains why.
  if (listing.seller_id !== session.user.id) return <p>You can only edit your own listings.</p>

  return (
    <div>
      <p>
        <Link to={`/listing/${listing.id}`}>← Back to listing</Link>
      </p>
      <h1>Edit listing</h1>
      <ListingForm session={session} existingListing={listing} />
    </div>
  )
}
