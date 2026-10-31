import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import VerifyCodeForm from '../components/VerifyCodeForm'

// Log in with Northeastern email + password.
// If the account was never verified, offers to email a new code.
export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [unverified, setUnverified] = useState(false) // tried to sign in to an unverified account
  const [needsVerifying, setNeedsVerifying] = useState(false) // showing the code form
  const location = useLocation()

  async function handleSubmit(event) {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setUnverified(false)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    setLoading(false)

    // On success there's nothing to do here: App.jsx sees the new session and
    // the /signin route sends the user on to where they were going.
    if (!error) return

    if (error.code === 'email_not_confirmed') {
      setMessage('Your account isn\'t verified yet.')
      setUnverified(true)
    } else if (error.code === 'invalid_credentials') {
      setMessage('Wrong email or password.')
    } else {
      setMessage(error.message)
    }
  }

  // Sends a new sign up code, then switches to the code form.
  async function handleSendVerifyCode() {
    const cleanEmail = email.trim().toLowerCase()
    setEmail(cleanEmail)
    const { error } = await supabase.auth.resend({ type: 'signup', email: cleanEmail })
    if (error) {
      setMessage(error.message)
    } else {
      setNeedsVerifying(true)
    }
  }

  if (needsVerifying) {
    return (
      <div>
        <h1>Verify your email</h1>
        <VerifyCodeForm
          email={email}
          type="email"
          onResend={() => supabase.auth.resend({ type: 'signup', email })}
        />
      </div>
    )
  }

  return (
    <div>
      <h1>Sign in</h1>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Northeastern email
          <input
            type="email"
            autoComplete="email"
            placeholder="you@northeastern.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {message && <p>{message}</p>}
      {unverified && (
        <button type="button" onClick={handleSendVerifyCode}>Email me a verification code</button>
      )}

      {/* Pass location.state along so "send them back where they were going" still works after signing up. */}
      <p>
        New to UniSwap? <Link to="/signup" state={location.state}>Create an account</Link>
      </p>
      <p>
        <Link to="/reset-password">Forgot your password?</Link>
      </p>
    </div>
  )
}
