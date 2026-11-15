import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import ProfileIcon from './ProfileIcon'

// The avatar in the top-right of the nav. Clicking it opens a small menu with
// the signed-in user's name plus View profile / Edit profile / My listings /
// Log out. Closes on outside click, Escape, or navigating somewhere.
//
//   session - the Supabase session (required; guests get a plain sign-in link instead)
export default function ProfileMenu({ session }) {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const wrapperRef = useRef(null)
  const buttonRef = useRef(null)
  const menuId = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const userId = session.user.id

  // Name + avatar for the menu header and the circle itself.
  useEffect(() => {
    let ignore = false

    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', userId)
        .maybeSingle()
      if (!ignore) setProfile(data)
    }

    loadProfile()
    return () => {
      ignore = true
    }
  }, [userId])

  // Close whenever the route changes (e.g. after picking a menu item).
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  async function handleLogOut() {
    setOpen(false)
    // Leave the members-only page first so RequireAuth doesn't bounce us to /signin.
    navigate('/', { replace: true })
    await supabase.auth.signOut()
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  return (
    <div className="profile-menu" ref={wrapperRef}>
      <ProfileIcon
        ref={buttonRef}
        url={profile?.avatar_url}
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Account menu"
      />

      {open && (
        <div className="profile-menu__panel" id={menuId} role="menu">
          <div className="profile-menu__who">
            <span className="profile-menu__name">{fullName || 'Your account'}</span>
            <span className="profile-menu__email">{session.user.email}</span>
          </div>

          <Link role="menuitem" className="profile-menu__item" to={`/profile/${userId}`}>
            View profile
          </Link>
          <Link role="menuitem" className="profile-menu__item" to="/settings">
            Edit profile
          </Link>
          <Link role="menuitem" className="profile-menu__item" to="/sell/listings">
            My listings
          </Link>

          <button
            type="button"
            role="menuitem"
            className="profile-menu__item profile-menu__item--logout"
            onClick={handleLogOut}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
