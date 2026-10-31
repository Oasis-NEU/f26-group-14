import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, PAYMENT_METHODS } from '../lib/listingOptions'
import ListingCard from '../components/ListingCard'
import ChipFilter from '../components/ChipFilter'
import PriceRangeFilter from '../components/PriceRangeFilter'

const FILTER_DELAY_MS = 300 // wait until the user pauses before asking the database again

// Every listing for sale, newest first, with filters for category, price, and payment method.
// Open to guests. Filters start empty, which means "show everything".
export default function Feed() {
  const [categories, setCategories] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        .select('id, title, price, photo_url, status, meetup_location, seller:profiles(first_name)')
        .eq('status', 'available')

      // Add only the filters the user has actually set.
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
  }, [categories, paymentMethods, minPrice, maxPrice])

  function clearFilters() {
    setCategories([])
    setPaymentMethods([])
    setMinPrice('')
    setMaxPrice('')
  }

  const activeFilterCount =
    categories.length + paymentMethods.length + (minPrice !== '' ? 1 : 0) + (maxPrice !== '' ? 1 : 0)
  const minAboveMax = minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice)

  return (
    <div>
      <h1>Feed</h1>

      <div className="feed-layout">
        <details className="feed-filters" open>
          <summary>
            Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </summary>

          <ChipFilter legend="Category" options={CATEGORIES} selected={categories} onChange={setCategories} />
          <PriceRangeFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={setMinPrice}
            onMaxChange={setMaxPrice}
          />
          {minAboveMax && <p>Min price is higher than max price.</p>}
          <ChipFilter
            legend="Accepts"
            options={PAYMENT_METHODS}
            selected={paymentMethods}
            onChange={setPaymentMethods}
          />

          {activeFilterCount > 0 && (
            <button type="button" onClick={clearFilters}>Clear filters</button>
          )}
        </details>

        <section>
          {loading ? (
            <p>Loading listings...</p>
          ) : error ? (
            <p>Something went wrong: {error}</p>
          ) : listings.length === 0 ? (
            activeFilterCount > 0 ? (
              <p>
                No listings match your filters.{' '}
                <button type="button" onClick={clearFilters}>Clear filters</button>
              </p>
            ) : (
              <p>Nothing for sale yet. Be the first to post something!</p>
            )
          ) : (
            <>
              <p>{listings.length} {listings.length === 1 ? 'listing' : 'listings'}</p>
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
