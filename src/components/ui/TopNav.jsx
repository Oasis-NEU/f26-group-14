import { Link, NavLink } from 'react-router-dom'
import ProfileIcon from './ProfileIcon'
import ProfileMenu from './ProfileMenu'

// Logged-in top nav from screens 3-5: HuskyExchange | HotDeals | Item Browser
// | Orders | Sell | profile icon. Links are hardcoded here on purpose — the
// nav shape doesn't change per page, only the active route.
//
//   session - the Supabase session. Signed in: the avatar opens the account
//             menu (profile, edit profile, log out). Guest: it links to /signin.
const NAV_LINKS = [
  { to: '/', label: 'HotDeals' },
  { to: '/feed', label: 'Item Browser' },
  { to: '/orders', label: 'Orders' },
  { to: '/sell', label: 'Sell' },
]

export default function TopNav({ session }) {
  return (
    <nav className="topnav">
      <Link to="/" className="topnav__brand">
        Husky<strong>Exchange</strong>
      </Link>

      <div className="topnav__links">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              isActive ? 'topnav__link topnav__link--active' : 'topnav__link'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="topnav__right">
        {session ? (
          <ProfileMenu session={session} />
        ) : (
          <ProfileIcon as={Link} to="/signin" aria-label="Sign in" />
        )}
      </div>
    </nav>
  )
}
