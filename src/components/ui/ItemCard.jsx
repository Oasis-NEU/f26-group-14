import { Link } from 'react-router-dom'
import PhotoPlaceholder from './PhotoPlaceholder'

// Marketplace card used across Hot Deals, Item Browser, Orders, and Profile.
// Pure presentation: the parent passes plain data, not a Supabase row. When
// `to` is omitted the card still renders (useful for hardcoded demo items).
//
//   title       - item title text (e.g. "ITEM1")
//   price       - optional price text (e.g. "$25")
//   description - optional caption under the price
//   photoUrl    - optional image URL; falls back to the mountain placeholder
//   to          - optional router path; omit to render a static card
//   sold        - mark with a "Sold" pill
export default function ItemCard({ title, price, description, photoUrl, to, sold = false }) {
  const Inner = (
    <>
      <div>
        <div className="item-card__title">
          {title}
          {sold && <span className="item-card__sold">Sold</span>}
        </div>
        {price && <div className="item-card__meta">{price}</div>}
        {description && <div className="item-card__meta">{description}</div>}
      </div>
      <div className="item-card__photo">
        {photoUrl ? <img src={photoUrl} alt={title} /> : <PhotoPlaceholder />}
      </div>
    </>
  )

  if (to) {
    return (
      <Link to={to} className="item-card">
        {Inner}
      </Link>
    )
  }
  return <div className="item-card">{Inner}</div>
}
