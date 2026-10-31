import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'
import ListingCard from '../components/ListingCard'

// A user's public profile: picture, name, bio, and everything they've listed.
// The URL says whose profile to show, e.g. /profile/<user id>.
export default function Profile({ session }) {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load the profile and their listings whenever the id in the URL changes.
  useEffect(() => {
    let ignore = false // set to true if we leave this profile before the data arrives

    async function load() {
      // Ask for both at the same time instead of one after the other.
      const [profileResult, listingsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name, bio, avatar_url, created_at')
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('listings')
          .select('id, title, price, photo_url, status, meetup_location')
          .eq('seller_id', id)
          .order('created_at', { ascending: false }),
      ])

      if (ignore) return

      if (profileResult.error || listingsResult.error) {
        setError((profileResult.error ?? listingsResult.error).message)
      } else {
        setProfile(profileResult.data) // null if there's no user with this id
        setListings(listingsResult.data)
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
  if (!profile) return <p>This profile doesn't exist.</p>

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const isMyProfile = session.user.id === profile.id
  const forSale = listings.filter((listing) => listing.status === 'available')
  const sold = listings.filter((listing) => listing.status === 'sold')

  return (
    <div>
      <div className="profile-header">
        <Avatar url={profile.avatar_url} name={profile.first_name} />
        <div>
          <h1>{fullName}</h1>
          <p>Member since {memberSince}</p>
          {isMyProfile && <Link to="/settings">Edit profile</Link>}
        </div>
      </div>

      {profile.bio ? <p className="profile-bio">{profile.bio}</p> : isMyProfile && <p>Add a bio in Settings so buyers know who you are.</p>}

      <h2>For sale ({forSale.length})</h2>
      {forSale.length === 0 ? (
        <p>Nothing for sale right now.</p>
      ) : (
        <div className="listing-grid">
          {forSale.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {sold.length > 0 && (
        <>
          <h2>Sold ({sold.length})</h2>
          <div className="listing-grid">
            {sold.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
