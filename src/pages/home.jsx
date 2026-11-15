import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { pickHotDeals } from '../lib/hotDeals'
import { formatPrice } from '../lib/formatPrice'
import PageShell from '../components/ui/PageShell'
import TopBar from '../components/ui/TopBar'
import TopNav from '../components/ui/TopNav'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import UserPill from '../components/ui/UserPill'
import ItemCard from '../components/ui/ItemCard'


const RECENT_LISTINGS_TO_CHECK = 24
const HOT_DEALS_SHOWN = 3



export default function Home({ session }) {
  if (!session) return <GuestLanding />
  return <MemberHotDeals session={session} />
}

function GuestLanding() {
  return (
    <PageShell variant="hero" decorated>
      <TopBar />
      <GlassCard variant="hero">
        <div className="hero-copy">
          <h1 className="hero-title">
            <span className="hero-title__light">Husky</span>Exchange
          </h1>
          <p className="hero-eyebrow">Buy and sell dorm essentials</p>
          <div className="hero-actions">
            <Button as={Link} to="/signup" variant="primary" size="lg">
              Get started
            </Button>
            <Button as={Link} to="/feed" variant="outline" size="lg">
              Browse
            </Button>
          </div>
        </div>
      </GlassCard>
    </PageShell>
  )
}

function MemberHotDeals({ session }) {
  const username =
    session?.user?.user_metadata?.first_name ||
    session?.user?.email?.split('@')[0] ||
    '{username}'

  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadDeals() {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, photo_url, status, campus, meetup_location, created_at')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(RECENT_LISTINGS_TO_CHECK)

      if (ignore) return
      if (error) {
        setError(error.message)
      } else {
        setDeals(pickHotDeals(data, HOT_DEALS_SHOWN))
      }
      setLoading(false)
    }

    loadDeals()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <PageShell variant="hero" decorated>
      <TopNav session={session} />

      <GlassCard variant="hero">
        <div className="hotdeals-greeting">
          <UserPill username={username.toUpperCase()} />
        </div>
        <div className="hero-copy">
          <h1 className="hero-title">
            Hot<span className="hero-title__light">Deals</span>
          </h1>
          <p className="hero-eyebrow" style={{ marginTop: 20, marginBottom: 6 }}>
            Not sure where to start?
          </p>
          <p className="hero-eyebrow" style={{ margin: 0 }}>
            Here are some of our current offerings:
          </p>
          <div className="hero-actions">
            <Button as={Link} to="/feed" variant="primary">
              Go to browser
            </Button>
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <p className="state">Loading deals...</p>
      ) : error ? (
        <p className="state">Couldn't load deals: {error}</p>
      ) : deals.length === 0 ? (
        <div className="state">
          <p style={{ marginBottom: 14 }}>Nothing for sale yet. Be the first!</p>
          <Button as={Link} to="/sell" variant="primary">Sell an item</Button>
        </div>
      ) : (
        <div className="hotdeals-grid">
          {deals.map((listing) => (
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
    </PageShell>
  )
}
