import { NavLink } from 'react-router-dom'

// The "New listing / My listings" switch at the top of the Sell section.
// Same look as the Orders toggle, but each tab is its own route so the
// browser back button and shared links work.
const TABS = [
  { to: '/sell', label: 'New listing' },
  { to: '/sell/listings', label: 'My listings' },
]

export default function SellTabs() {
  return (
    <nav className="orders-toggle" aria-label="Sell">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) => (isActive ? 'btn btn--primary' : 'btn btn--outline')}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
