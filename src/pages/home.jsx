import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { pickHotDeals } from '../lib/hotDeals'
import ListingCard from '../components/listings/ListingCard'
import Logo from '../components/layout/Logo'
import Ribbons from '../components/layout/Ribbons'

// How many recent listings HotDeals looks through before picking the few it shows.
const RECENT_LISTINGS_TO_CHECK = 24
const HOT_DEALS_SHOWN = 3

// "/" shows the landing page to guests and the HotDeals page to logged-in users.
export default function Home({ session }) {
  return session ? <HotDeals session={session} /> : <Landing />
}

// Canva screen 1: big logo, tagline, and two buttons.
function Landing() {
  return (
    <section className="hero-wrap">
      <Ribbons />
      <div className="glass hero">
        <h1 className="hero-title">
          <Logo />
        </h1>
        <p className="hero-tagline">Buy and sell dorm essentials</p>
        <div className="hero-actions">
          <Link to="/signup" className="btn btn-primary btn-lg">Get started</Link>
          <Link to="/feed" className="btn btn-lg">Browse</Link>
        </div>
      </div>
    </section>
  )
}

// Canva screen 2: "Hello {name}", a short intro, and a few listings worth a look.
function HotDeals({ session }) {
  const [firstName, setFirstName] = useState('')
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = session.user.id

  useEffect(() => {
    let ignore = false

    async function load() {
      const [profileResult, listingsResult] = await Promise.all([
        supabase.from('profiles').select('first_name').eq('id', userId).maybeSingle(),
        supabase
          .from('listings')
          .select('id, title, description, price, photo_url, status, campus, meetup_location, created_at')
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(RECENT_LISTINGS_TO_CHECK),
      ])

      if (ignore) return
      if (listingsResult.error) {
        setError(listingsResult.error.message)
      } else {
        setDeals(pickHotDeals(listingsResult.data, HOT_DEALS_SHOWN))
      }
      setFirstName(profileResult.data?.first_name ?? '')
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [userId])

  return (
    <>
      <section className="hero-wrap">
        <Ribbons />
        {firstName && <p className="hello-pill">Hello {firstName}</p>}
        <div className="glass hero">
          <h1 className="hero-title">
            Hot<strong>Deals</strong>
          </h1>
          <p className="hero-copy">Not sure where to start?</p>
          <p className="hero-copy">Here are some of our current offerings:</p>
          <div className="hero-actions">
            <Link to="/feed" className="btn btn-lg">Go to browser</Link>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Hot deals">
        {loading ? (
          <p className="status-text">Loading deals...</p>
        ) : error ? (
          <p className="status-text">Something went wrong: {error}</p>
        ) : deals.length === 0 ? (
          <div className="glass empty-state">
            <p>Nothing for sale yet. Be the first!</p>
            <Link to="/sell" className="btn btn-primary">Sell an item</Link>
          </div>
        ) : (
          <div className="listing-grid">
            {deals.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
