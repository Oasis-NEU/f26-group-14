import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Two-step sign in: (1) enter your Northeastern email and we email you a code,
// (2) type that code in to log in.
export default function SignIn() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Step 1: check the email is Northeastern, then ask Supabase to email a code.
  async function handleSendCode(event) {
    event.preventDefault()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail.endsWith('@northeastern.edu')) {
      setMessage('Please use your Northeastern email address to sign in.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email: cleanEmail })
    setLoading(false)

    if (error) {
      setMessage(error.message)
    } else {
      setEmail(cleanEmail)
      setCodeSent(true)
      setMessage('We sent a code to your Northeastern email. Check Junk if you don\'t see it.')
    }
  }

  // Step 2: send the code back to Supabase. If it matches, the user is logged in.
  async function handleVerifyCode(event) {
    event.preventDefault()

    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'email',
    })
    setLoading(false)

    // On success there's nothing to do here: logging in updates the session in App.jsx,
    // and the /signin route then sends the user on to where they were going.
    if (error) {
      setMessage(error.message)
    }
  }

  // Go back to step 1, e.g. if the email was mistyped.
  function handleUseDifferentEmail() {
    setCodeSent(false)
    setCode('')
    setMessage('')
  }

  return (
    <div>
      <h1>Sign In</h1>

      {codeSent ? (
        <form onSubmit={handleVerifyCode}>
          <p>Code sent to {email}</p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Checking...' : 'Sign in'}
          </button>
          <button type="button" onClick={handleUseDifferentEmail}>
            Use a different email
          </button>
        </form>
      ) : (
        <form onSubmit={handleSendCode}>
          <input
            type="email"
            placeholder="you@northeastern.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send code'}
          </button>
        </form>
      )}

      <p>{message}</p>
    </div>
  )
}
