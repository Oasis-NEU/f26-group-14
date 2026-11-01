import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/formatPrice'

// One listing shown as a small card: photo, title, price, meetup spot.
// Clicking it opens the listing's own page. Used on profiles now, and the Feed next.
export default function ListingCard({ listing }) {
  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      {listing.photo_url ? (
        <img src={listing.photo_url} alt={listing.title} />
      ) : (
        <div className="listing-card-no-photo">No photo</div>
      )}

      <div className="listing-card-info">
        <strong>{formatPrice(listing.price)}</strong>
        {listing.status === 'sold' && <span className="sold-badge">Sold</span>}
        <div>{listing.title}</div>
        <small>{listing.campus} · {listing.meetup_location}</small>
        {/* Only the Feed fetches the seller's name; on a profile page we already know whose listings they are. */}
        {listing.seller && <small className="listing-card-seller">by {listing.seller.first_name}</small>}
      </div>
    </Link>
  )
}
