import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, PAYMENT_METHODS, CAMPUS_NAMES } from '../lib/listingOptions'
import { toSearchPattern } from '../lib/search'
import ListingCard from '../components/listings/ListingCard'
import ChipFilter from '../components/ui/ChipFilter'
import PriceRangeFilter from '../components/listings/PriceRangeFilter'

const FILTER_DELAY_MS = 300 // wait until the user pauses before asking the database again

// The Item Browser: every listing for sale, newest first, with a title search and filters
// for campus, category, price, and payment method.
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

  // Re-run the search whenever a filter changes.
  useEffect(() => {
    let ignore = false

    // Dragging the slider or typing a price changes the filters many times a second.
    // Waiting a moment means we only ask the database once the user pauses.
    const timer = setTimeout(async () => {
      // Only ask for columns guests are allowed to see (no seller_email).
      // "seller:profiles(first_name)" also fetches each seller's first name from their profile.
      let query = supabase
        .from('listings')
        .select('id, title, description, price, photo_url, status, campus, meetup_location, seller:profiles(first_name)')
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

    // If a filter changes again before the timer fires, cancel the old search.
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

  return (
    <div>
      <div className="browser-header">
        <h1 className="page-title">Item browser</h1>

        <label className="search-bar">
          <SearchIcon />
          <span className="visually-hidden">Search listings</span>
          <input
            type="search"
            placeholder="Search for a mini fridge, textbook, lamp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <button
          type="button"
          className="icon-button"
          aria-expanded={filtersOpen}
          aria-controls="feed-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <FilterIcon />
          <span className="visually-hidden">Filters</span>
          {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
        </button>
      </div>

      <div className={filtersOpen ? 'feed-layout feed-layout-open' : 'feed-layout'}>
        {filtersOpen && (
          <div id="feed-filters" className="glass feed-filters">
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
            {minAboveMax && <p className="form-error">Min price is higher than max price.</p>}
            <ChipFilter
              legend="Accepts"
              options={PAYMENT_METHODS}
              selected={paymentMethods}
              onChange={setPaymentMethods}
            />

            {activeFilterCount > 0 && (
              <button type="button" className="btn-ghost" onClick={clearFilters}>Clear filters</button>
            )}
          </div>
        )}

        <section>
          {loading ? (
            <p className="status-text">Loading listings...</p>
          ) : error ? (
            <p className="status-text">Something went wrong: {error}</p>
          ) : listings.length === 0 ? (
            activeFilterCount > 0 || isSearching ? (
              <div className="glass empty-state">
                <p>No listings match your search.</p>
                <button type="button" onClick={clearFilters}>Clear search and filters</button>
              </div>
            ) : (
              <p className="glass empty-state">Nothing for sale yet. Be the first to post something!</p>
            )
          ) : (
            <>
              <p className="result-count">{listings.length} {listings.length === 1 ? 'listing' : 'listings'}</p>
              <div className="listing-grid">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

// The magnifying glass inside the Canva search bar.
function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="search-icon">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

// The three-slider icon next to the Canva search bar.
function FilterIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      {[10, 20, 30].map((y, i) => (
        <g key={y}>
          <path d={`M4 ${y}h32`} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={[12, 28, 16][i]} cy={y} r="4" fill="#0a2149" stroke="currentColor" strokeWidth="2.5" />
        </g>
      ))}
    </svg>
  )
}
