import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import RequireAuth from './components/auth/RequireAuth'
import Home from './pages/home'
import Feed from './pages/feed'
import Sell from './pages/sell'
import MyListings from './pages/mylistings'
import Orders from './pages/orders'
import Settings from './pages/settings'
import SignIn from './pages/signin'
import SignUp from './pages/signup'
import ResetPassword from './pages/resetpassword'
import Profile from './pages/profile'
import Listing from './pages/listing'
import EditListing from './pages/editlisting'
import './App.css'

// App shell: just routing + session tracking.
// Each page brings its own chrome (TopNav / TopBar from src/components/ui/),
// so there's no shared nav here anymore — this keeps the UI fully decoupled
// per page and matches the prototype where the landing page has a different
// chrome from the member pages.
function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
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

  return (
    <Routes>
      <Route path="/" element={<Home session={session} />} />
      <Route path="/feed" element={<Feed session={session} />} />
      <Route path="/orders" element={
        <RequireAuth session={session} loading={loading}>
          <Orders session={session} />
        </RequireAuth>
      } />
      <Route path="/sell" element={
        <RequireAuth session={session} loading={loading}>
          <Sell session={session} />
        </RequireAuth>
      } />
      <Route path="/sell/listings" element={
        <RequireAuth session={session} loading={loading}>
          <MyListings session={session} />
        </RequireAuth>
      } />
      <Route path="/settings" element={
        <RequireAuth session={session} loading={loading}>
          <Settings session={session} />
        </RequireAuth>
      } />
      <Route path="/listing/:id" element={<Listing session={session} />} />
      <Route path="/listing/:id/edit" element={
        <RequireAuth session={session} loading={loading}>
          <EditListing session={session} />
        </RequireAuth>
      } />
      <Route path="/profile/:id" element={
        <RequireAuth session={session} loading={loading}>
          <Profile session={session} />
        </RequireAuth>
      } />
      <Route path="/signin" element={session ? <Navigate to={returnTo} replace /> : <SignIn />} />
      <Route path="/signup" element={session ? <Navigate to={returnTo} replace /> : <SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  )
}

export default App
