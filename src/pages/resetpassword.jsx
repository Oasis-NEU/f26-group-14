import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import VerifyCodeForm from '../components/auth/VerifyCodeForm'
import PageShell from '../components/ui/PageShell'
import TopBar from '../components/ui/TopBar'
import Button from '../components/ui/Button'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPassword() {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  async function handleSendCode(event) {
    event.preventDefault()
    const cleanEmail = email.trim().toLowerCase()

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail)
    setLoading(false)

    if (error) {
      setMessage(error.message)
    } else {
      setEmail(cleanEmail)
      setMessage('')
      setStep('code')
    }
  }

  async function handleSavePassword(event) {
    event.preventDefault()

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (error) {
      setMessage(error.message)
    } else {
      navigate('/')
    }
  }

  return (
    <PageShell variant="hero" decorated>
      <TopBar loginTo="/signin" />
      <div className="form-card">
        <h1 style={{ fontSize: 32, marginBottom: 24 }}>Reset your password</h1>

        {step === 'email' && (
          <form className="form-stack" onSubmit={handleSendCode}>
            <label>
              Northeastern email
              <input type="email" autoComplete="email" placeholder="you@northeastern.edu" value={email}
                onChange={(e) => setEmail(e.target.value)} />
            </label>
            <Button type="submit" variant="primary" size="lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send code'}
            </Button>
          </form>
        )}

        {step === 'code' && (
          <VerifyCodeForm
            email={email}
            type="recovery"
            onResend={() => supabase.auth.resetPasswordForEmail(email)}
            onVerified={() => setStep('password')}
          />
        )}

        {step === 'password' && (
          <form className="form-stack" onSubmit={handleSavePassword}>
            <label>
              New password (at least {MIN_PASSWORD_LENGTH} characters)
              <input type="password" autoComplete="new-password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} />
            </label>
            <label>
              Confirm new password
              <input type="password" autoComplete="new-password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} />
            </label>
            <Button type="submit" variant="primary" size="lg" disabled={loading}>
              {loading ? 'Saving...' : 'Save new password'}
            </Button>
          </form>
        )}

        {message && <p className="form-message" style={{ marginTop: 16 }}>{message}</p>}

        <p className="auth-footer">
          <Link to="/signin">Back to sign in</Link>
        </p>
      </div>
    </PageShell>
  )
}
