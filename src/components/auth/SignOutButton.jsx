import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Button from '../ui/Button'

// Signs the user out, then sends them to /signin. App.jsx hears the sign-out through
// onAuthStateChange and clears the session, so the rest of the app updates on its own.
export default function SignOutButton() {
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')

  async function handleSignOut() {
    setSigningOut(true)
    setError('')
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
      setSigningOut(false)
      return
    }
    navigate('/signin')
  }

  return (
    <div>
      <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
        {signingOut ? 'Signing out...' : 'Sign out'}
      </Button>
      {error && <p className="form-message" role="alert">{error}</p>}
    </div>
  )
}
