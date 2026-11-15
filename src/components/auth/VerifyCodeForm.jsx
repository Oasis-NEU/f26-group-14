import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Button from '../ui/Button'

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
      <p style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
        We sent a code to <strong>{email}</strong>. Check Junk if you don't see it.
      </p>

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

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Checking...' : 'Verify'}
        </Button>
        <Button variant="outline" onClick={handleResend} disabled={loading}>
          Send a new code
        </Button>
      </div>

      {message && <p className="form-message">{message}</p>}
    </form>
  )
}
