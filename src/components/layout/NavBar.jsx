import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'

// The bar across the top of every page (Canva: "HuskyExchange  HotDeals  Item Browser  Orders  Sell  👤").
//   session  - the logged-in user, or null for guests
//   loading  - true until we know whether someone is logged in (hides the right side so it doesn't flicker)
//   onSignOut
// Guests on the landing page only see a LOGIN button, because the page itself shows the big logo.
export default function NavBar({ session, loading, onSignOut }) {
  const location = useLocation()
  const isLanding = location.pathname === '/' && !session

  return (
    <header className={isLanding ? 'site-header site-header-landing' : 'site-header'}>
      {!isLanding && (
        <Link to="/" className="site-logo" aria-label="HuskyExchange home">
          <Logo />
        </Link>
      )}

      {!isLanding && (
        <nav className="site-nav" aria-label="Main">
          <NavLink to="/" end>
            Hot<strong>Deals</strong>
          </NavLink>
          <NavLink to="/feed">Item Browser</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/sell">Sell</NavLink>
        </nav>
      )}

      <div className="site-account">
        {!loading &&
          (session ? (
            // <details> opens and closes the menu without any extra state. Keying it on the path
            // closes it again whenever the user goes to another page.
            <details className="account-menu" key={location.pathname}>
              <summary aria-label="Account menu">
                <ProfileIcon />
              </summary>
              <div className="account-menu-list">
                <Link to={`/profile/${session.user.id}`}>My profile</Link>
                <Link to="/settings">Settings</Link>
                <button type="button" className="btn-ghost" onClick={onSignOut}>
                  Sign out
                </button>
              </div>
            </details>
          ) : (
            <Link to="/signin" className="btn">
              Login
            </Link>
          ))}
      </div>
    </header>
  )
}

// The round person icon from the Canva header.
function ProfileIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="20" cy="15.5" r="6" fill="currentColor" />
      <path d="M8.5 31.5c2.6-4.6 6.6-7 11.5-7s8.9 2.4 11.5 7" fill="currentColor" />
    </svg>
  )
}
