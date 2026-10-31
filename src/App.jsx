import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { supabase } from './lib/supabase'
import RequireAuth from './components/RequireAuth'
import Home from './pages/home'
import Feed from './pages/feed'
import Sell from './pages/sell'
import Settings from './pages/settings'
import SignIn from './pages/signin'
import './App.css'

// App shell: top nav plus one route per page in src/pages/.
// To add a page, create it in src/pages/, import it here, and add a <Link> and <Route>.
// Also tracks the logged-in user (session) so the nav can show sign in / sign out.
function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

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
        <Link to="/settings">Settings</Link> |{' '}
        {session ? (
          <>
            {session.user.email}{' '}
            <button onClick={handleSignOut}>Sign out</button>
          </>
        ) : (
          <Link to="/signin">Sign in</Link>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/feed"
          element={
            <RequireAuth session={session} loading={loading}>
              <Feed />
            </RequireAuth>
          }
        />
        <Route
          path="/sell"
          element={
            <RequireAuth session={session} loading={loading}>
              <Sell />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth session={session} loading={loading}>
              <Settings />
            </RequireAuth>
          }
        />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  )
}

export default App