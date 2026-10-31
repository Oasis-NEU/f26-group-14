import { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import RequireAuth from './components/RequireAuth'
import Home from './pages/home'
import Feed from './pages/feed'
import Sell from './pages/sell'
import Settings from './pages/settings'
import SignIn from './pages/signin'
import SignUp from './pages/signup'
import ResetPassword from './pages/resetpassword'
import Profile from './pages/profile'
import './App.css'

// App shell: top nav plus one route per page in src/pages/.
// To add a page, create it in src/pages/, import it here, and add a <Link> and <Route>.
// Also tracks the logged-in user (session) so the nav can show sign in / sign out.
// Home and Feed are open to guests; pages wrapped in RequireAuth need a login.
function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  // If RequireAuth sent the user to /signin, it remembers where they were headed.
  // Once they're logged in, send them back there (or Home if there's nowhere to return to).
  const returnTo = location.state?.from ?? '/'

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/feed">Feed</Link> |{' '}
        <Link to="/sell">Sell</Link> |{' '}
        {!loading && (session ? (
          <>
            <Link to={`/profile/${session.user.id}`}>My profile</Link> |{' '}
            <Link to="/settings">Settings</Link> |{' '}
            <button onClick={handleSignOut}>Sign out</button>
          </>
        ) : (
          <>
            <Link to="/signin">Sign in</Link> |{' '}
            <Link to="/signup">Create account</Link>
          </>
        ))}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<Feed />} />
        <Route
          path="/sell"
          element={
            <RequireAuth session={session} loading={loading}>
              <Sell session={session} />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth session={session} loading={loading}>
              <Settings session={session} />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <RequireAuth session={session} loading={loading}>
              <Profile session={session} />
            </RequireAuth>
          }
        />
        <Route
          path="/signin"
          element={session ? <Navigate to={returnTo} replace /> : <SignIn />}
        />
        <Route
          path="/signup"
          element={session ? <Navigate to={returnTo} replace /> : <SignUp />}
        />
        {/* No redirect here: entering the reset code logs you in, and you still need to pick a new password. */}
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </>
  )
}

export default App