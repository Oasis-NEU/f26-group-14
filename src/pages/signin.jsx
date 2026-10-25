import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail.endsWith('@northeastern.edu')) {
      setMessage('Please use your Northeastern email address to sign in.')
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { emailRedirectTo: window.location.origin },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your Northeastern email for a login link!')
    }
  }

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="you@northeastern.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send Login Link</button>
      </form>
      <p>{message}</p>
    </div>
  )
}
