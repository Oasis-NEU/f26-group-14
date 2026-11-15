import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PageShell from '../components/ui/PageShell'
import TopNav from '../components/ui/TopNav'
import Avatar from '../components/ui/Avatar'
import ItemCard from '../components/ui/ItemCard'
import { formatPrice } from '../lib/formatPrice'


export default function Profile({ session }) {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  
  useEffect(() => {
    let ignore = false
    async function load() {
      const [profileResult, listingsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name, bio, avatar_url, created_at, campus')
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('listings')
          .select('id, title, price, photo_url, status, campus, meetup_location')
          .eq('seller_id', id)
          .order('created_at', { ascending: false }),
      ])

      if (ignore) return
      if (profileResult.error || listingsResult.error) {
        setError((profileResult.error ?? listingsResult.error).message)
      } else {
        setProfile(profileResult.data)
        setListings(listingsResult.data)
      }
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [id])

  const forSale = listings.filter((listing) => listing.status === 'available')
  const sold = listings.filter((listing) => listing.status === 'sold')
  const fullName = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') : ''
  const memberSince = profile
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''
  const isMyProfile = profile && session.user.id === profile.id

  return (
    <PageShell variant="gradient">
      <TopNav profileHref={`/profile/${session.user.id}`} />

      {loading ? (
        <p className="state">Loading...</p>
      ) : error ? (
        <p className="state">Something went wrong: {error}</p>
      ) : !profile ? (
        <p className="state">This profile doesn't exist.</p>
      ) : (
        <>
          <div className="profile-header">
            <Avatar url={profile.avatar_url} name={profile.first_name} />
            <div>
              <h1 className="page-title" style={{ marginBottom: 6 }}>{fullName}</h1>
              {profile.campus && <p className="hero-eyebrow" style={{ margin: 0 }}>{profile.campus} campus</p>}
              <p className="hero-eyebrow" style={{ margin: 0 }}>Member since {memberSince}</p>
              {isMyProfile && (
                <p style={{ marginTop: 10 }}>
                  <Link to="/settings" className="auth-footer"><u>Edit profile</u></Link>
                </p>
              )}
            </div>
          </div>

          {profile.bio
            ? <p className="profile-bio">{profile.bio}</p>
            : isMyProfile && <p className="profile-bio">Add a bio in Settings so buyers know who you are.</p>}

          <h2 className="section-heading">For sale ({forSale.length})</h2>
          {forSale.length === 0 ? (
            <p className="state">Nothing for sale right now.</p>
          ) : (
            <div className="item-grid">
              {forSale.map((listing) => (
                <ItemCard
                  key={listing.id}
                  title={listing.title}
                  price={formatPrice(listing.price)}
                  description={`${listing.campus} · ${listing.meetup_location}`}
                  photoUrl={listing.photo_url}
                  to={`/listing/${listing.id}`}
                />
              ))}
            </div>
          )}



          {sold.length > 0 && (
            <>
              <h2 className="section-heading">Sold ({sold.length})</h2>
              <div className="item-grid">
                {sold.map((listing) => (
                  <ItemCard
                    key={listing.id}
                    title={listing.title}
                    price={formatPrice(listing.price)}
                    description={`${listing.campus} · ${listing.meetup_location}`}
                    photoUrl={listing.photo_url}
                    to={`/listing/${listing.id}`}
                    sold
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </PageShell>
  )
}
