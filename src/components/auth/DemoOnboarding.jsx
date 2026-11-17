import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Logo from '../layout/Logo'
import Ribbons from '../layout/Ribbons'

// What a new student learns before signing in: the three things the app does.
const STEPS = [
  { title: 'Browse', text: 'Textbooks, furniture, and dorm gear from students on your campus.' },
  { title: 'Sell', text: 'Snap a photo, add a description, and post it in under a minute.' },
  { title: 'Meet up', text: 'Message the seller, pick a campus spot, and pay in person.' },
]

// The home page for guests in demo mode (`npm run demo`): a welcome plus the sign-in form, so
// signing in drops the user straight into the app. App.jsx notices the new session and Home
// switches to HotDeals on its own, so there's nothing to navigate to here.
export default function DemoOnboarding() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail.endsWith('@northeastern.edu')) {
      setError('Use your @northeastern.edu email.')
      return
    }
    if (password === '') {
      setError('Enter a password.')
      return
    }

    setSigningIn(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
    if (signInError) {
      setError(signInError.message)
      setSigningIn(false)
    }
  }

  return (
    <section className="hero-wrap onboarding">
      <Ribbons />
      <div className="glass onboarding-panel">
        <div className="onboarding-intro">
          <h1 className="hero-title">
            <Logo />
          </h1>
          <p className="hero-tagline">The marketplace for Northeastern students</p>
          <ol className="onboarding-steps">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="onboarding-step-number" aria-hidden="true">{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <form className="form-stack onboarding-form" onSubmit={handleSubmit} noValidate>
          <h2>Sign in</h2>
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
          <button type="submit" className="btn-primary btn-lg" disabled={signingIn}>
            {signingIn ? 'Signing in...' : 'Sign in'}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
          <p className="onboarding-note">
            Demo mode: any @northeastern.edu email and any password works. Nothing you post is saved.
          </p>
        </form>
      </div>
    </section>
  )
}
