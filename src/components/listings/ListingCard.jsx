import { Link } from 'react-router-dom'
import { formatPrice } from '../../lib/formatPrice'

// One listing shown as a glass card, laid out like the Canva mockups:
// title, price, and a short description on top, then the photo in a rounded frame.
// Clicking it opens the listing's own page. Used on HotDeals, the Item Browser, Orders, and profiles.
export default function ListingCard({ listing }) {
  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      <div className="listing-card-info">
        <h3 className="listing-card-title">
          {listing.title}
          {listing.status === 'sold' && <span className="sold-badge">Sold</span>}
        </h3>
        <p className="listing-card-price">{formatPrice(listing.price)}</p>
        {/* Not every page fetches the description, and not every listing has one. */}
        {listing.description && <p className="listing-card-description">{listing.description}</p>}
        <p className="listing-card-meta">
          {listing.campus} · {listing.meetup_location}
        </p>
        {/* Only the Item Browser fetches the seller's name; on a profile page we already know whose listings they are. */}
        {listing.seller && <p className="listing-card-meta">by {listing.seller.first_name}</p>}
      </div>

      <div className="listing-card-photo">
        {listing.photo_url ? (
          <img src={listing.photo_url} alt={listing.title} loading="lazy" />
        ) : (
          <div className="listing-card-no-photo">No photo</div>
        )}
      </div>
    </Link>
  )
}
