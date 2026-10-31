import { useState } from 'react'
import { supabase } from '../lib/supabase'

// The "enter the code we emailed you" step. Used by sign up, sign in, and password reset.
//   email      - the address the code was sent to
//   type       - 'email' to confirm a new account, 'recovery' for a password reset
//   onResend   - function that sends a fresh code
//   onVerified - (optional) runs after the code is accepted
export default function VerifyCodeForm({ email, type, onResend, onVerified }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type })
    setLoading(false)

    // A correct code logs the user in. App.jsx notices and updates the session by itself.
    if (error) {
      setMessage(error.message)
    } else if (onVerified) {
      onVerified()
    }
  }

  async function handleResend() {
    setLoading(true)
    const { error } = await onResend()
    setLoading(false)
    setMessage(error ? error.message : 'New code sent. Check your inbox (and Junk).')
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <p>We sent a code to <strong>{email}</strong>. Check Junk if you don't see it.</p>

      <label>
        Code
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Checking...' : 'Verify'}
      </button>{' '}
      <button type="button" onClick={handleResend} disabled={loading}>
        Send a new code
      </button>

      {message && <p>{message}</p>}
    </form>
  )
}
