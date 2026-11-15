import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, PAYMENT_METHODS, CAMPUS_NAMES } from '../lib/listingOptions'
import { formatPrice } from '../lib/formatPrice'
import { toSearchPattern } from '../lib/search'
import PageShell from '../components/ui/PageShell'
import TopNav from '../components/ui/TopNav'
import SearchBar from '../components/ui/SearchBar'
import ItemCard from '../components/ui/ItemCard'
import ChipFilter from '../components/ui/ChipFilter'
import PriceRangeFilter from '../components/listings/PriceRangeFilter'

const FILTER_DELAY_MS = 300 // wait until the user pauses before asking the database again

// Item Browser (screen 3.png): top nav, "Item browser" heading, search bar with the
// filter-sliders button, and a grid of item cards.
//
// Every listing for sale, newest first. The title search and the filter panel (campus,
// category, price, payment method) both run in the database query. The filter logic is
// Sanket's original feed (b920cde); the panel hidden behind the sliders button and the
// title search follow Zane's ui-canva-restyle branch.
// Open to guests. Filters start empty ("show everything"), except that logged-in users
// who set a campus in their profile start out seeing their own campus.
export default function Feed({ session }) {
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [campus, setCampus] = useState('') // '' means all campuses
  const [categories, setCategories] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // If the user is logged in and has a campus in their profile, start the campus filter on it.
  const userId = session?.user.id
  useEffect(() => {
    if (!userId) return
    let ignore = false

    async function loadProfileCampus() {
      const { data } = await supabase.from('profiles').select('campus').eq('id', userId).single()
      if (!ignore && data?.campus) setCampus(data.campus)
    }

    loadProfileCampus()
    return () => {
      ignore = true
    }
  }, [userId])

  // Re-run the search whenever the search text or a filter changes.
  useEffect(() => {
    let ignore = false

    // Typing, dragging the slider, or typing a price changes things many times a second.
    // Waiting a moment means we only ask the database once the user pauses.
    const timer = setTimeout(async () => {
      // Only ask for columns guests are allowed to see (no seller_email).
      // "seller:profiles(first_name)" also fetches each seller's first name from their profile.
      let query = supabase
        .from('listings')
        .select('id, title, price, photo_url, status, campus, meetup_location, seller:profiles(first_name)')
        .eq('status', 'available')

      // Add only the filters the user has actually set.
      const searchPattern = toSearchPattern(search)
      if (searchPattern !== '') query = query.ilike('title', searchPattern)
      if (campus !== '') query = query.eq('campus', campus)
      if (categories.length > 0) query = query.in('category', categories)
      if (paymentMethods.length > 0) query = query.overlaps('payment_methods', paymentMethods)
      if (minPrice !== '') query = query.gte('price', Number(minPrice))
      if (maxPrice !== '') query = query.lte('price', Number(maxPrice))

      const { data, error } = await query.order('created_at', { ascending: false })

      if (ignore) return
      if (error) {
        setError(error.message)
      } else {
        setError('')
        setListings(data)
      }
      setLoading(false)
    }, FILTER_DELAY_MS)

    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [search, campus, categories, paymentMethods, minPrice, maxPrice])

  function clearFilters() {
    setSearch('')
    setCampus('')
    setCategories([])
    setPaymentMethods([])
    setMinPrice('')
    setMaxPrice('')
  }

  const activeFilterCount =
    (campus !== '' ? 1 : 0) +
    categories.length + paymentMethods.length + (minPrice !== '' ? 1 : 0) + (maxPrice !== '' ? 1 : 0)
  const minAboveMax = minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice)
  const isSearching = search.trim() !== ''

  
  const results = (
    <section>
      {loading ? (
        <p className="feed-status">Loading listings...</p>
      ) : error ? (
        <p className="form-message">Couldn't load listings: {error}</p>
      ) : listings.length === 0 ? (
        activeFilterCount > 0 || isSearching ? (
          <p className="feed-status">
            No listings match your search.{' '}
            <button type="button" className="btn btn--ghost btn--sm" onClick={clearFilters}>
              Clear search and filters
            </button>
          </p>
        ) : (
          <p className="feed-status">Nothing for sale yet. Be the first to post something!</p>
        )
      ) : (
        <>
          <p className="feed-status">
            {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
          </p>
          <div className="item-grid">
            {listings.map((listing) => (
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
        </>
      )}
    </section>
  )

  return (
    <PageShell variant="gradient">
      <TopNav session={session} />

      <h1 className="page-title">Item browser</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        onFilterClick={() => setFiltersOpen(!filtersOpen)}
        placeholder="Search for a mini fridge, textbook, lamp..."
      />

      {filtersOpen ? (
        <div className="feed-layout">
          <div id="feed-filters" className="feed-filters">
            <h2 className="feed-filters__heading">
              Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
            </h2>

            <label className="campus-filter">
              <strong>Campus</strong>
              <select value={campus} onChange={(e) => setCampus(e.target.value)}>
                <option value="">All campuses</option>
                {CAMPUS_NAMES.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>

            <ChipFilter legend="Category" options={CATEGORIES} selected={categories} onChange={setCategories} />
            <PriceRangeFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={setMinPrice}
              onMaxChange={setMaxPrice}
            />
            {minAboveMax && <p className="form-message">Min price is higher than max price.</p>}
            <ChipFilter
              legend="Accepts"
              options={PAYMENT_METHODS}
              selected={paymentMethods}
              onChange={setPaymentMethods}
            />

            {activeFilterCount > 0 && (
              <button type="button" className="btn btn--outline btn--sm" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
          {results}
        </div>
      ) : (
        results
      )}
    </PageShell>
  )
}
