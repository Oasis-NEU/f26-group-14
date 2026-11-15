import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import VerifyCodeForm from '../components/auth/VerifyCodeForm'
import PageShell from '../components/ui/PageShell'
import TopBar from '../components/ui/TopBar'
import Button from '../components/ui/Button'




export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [unverified, setUnverified] = useState(false)
  const [needsVerifying, setNeedsVerifying] = useState(false)
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

    if (!error) return

    if (error.code === 'email_not_confirmed') {
      setMessage("Your account isn't verified yet.")
      setUnverified(true)
    } else if (error.code === 'invalid_credentials') {
      setMessage('Wrong email or password.')
    } else {
      setMessage(error.message)
    }
  }

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
      <PageShell variant="hero" decorated>
        <TopBar />
        <div className="form-card">
          <h1 style={{ fontSize: 32, marginBottom: 16 }}>Verify your email</h1>
          <VerifyCodeForm
            email={email}
            type="email"
            onResend={() => supabase.auth.resend({ type: 'signup', email })}
          />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell variant="hero" decorated>
      <TopBar loginTo="/signup" />
      <div className="form-card">
        <h1 style={{ fontSize: 36, marginBottom: 24 }}>Sign in</h1>

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

          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {message && <p className="form-message" style={{ marginTop: 16 }}>{message}</p>}
        {unverified && (
          <div style={{ marginTop: 12 }}>
            <Button variant="outline" onClick={handleSendVerifyCode}>
              Email me a verification code
            </Button>
          </div>
        )}

        <p className="auth-footer">
          New to HuskyExchange? <Link to="/signup" state={location.state}>Create an account</Link>
        </p>
        <p className="auth-footer">
          <Link to="/reset-password">Forgot your password?</Link>
        </p>
      </div>
    </PageShell>
  )
}
