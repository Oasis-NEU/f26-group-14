import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import VerifyCodeForm from '../components/VerifyCodeForm'
import { CAMPUS_NAMES } from '../lib/listingOptions'

const MIN_PASSWORD_LENGTH = 8

// Create an account: name, campus (optional), Northeastern email, password.
// Supabase then emails a code to prove the email is really theirs.
export default function SignUp() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [campus, setCampus] = useState('') // optional
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [codeSentTo, setCodeSentTo] = useState('')
  const location = useLocation()

  // Returns an error message if something is wrong with the form, or '' if it's all good.
  function validate(cleanEmail) {
    if (firstName.trim() === '') return 'Please enter your first name.'
    if (!cleanEmail.endsWith('@northeastern.edu')) return 'Please use your Northeastern email address.'
    if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    if (password !== confirmPassword) return 'Passwords don\'t match.'
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanEmail = email.trim().toLowerCase()

    const problem = validate(cleanEmail)
    if (problem) {
      setMessage(problem)
      return
    }

    setLoading(true)
    setMessage('')
    // "data" is extra info saved with the account. The profiles trigger in
    // supabase/campuses.sql copies first_name, last_name and campus into the new profile.
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { first_name: firstName.trim(), last_name: lastName.trim(), campus },
      },
    })
    setLoading(false)

    if (error) {
      setMessage(error.message)
    } else if (data.user && data.user.identities?.length === 0) {
      // Supabase doesn't say "this email is taken" outright (so strangers can't check
      // who has an account). An empty identities list is its quiet way of saying so.
      setMessage('An account with this email already exists. Try signing in or resetting your password.')
    } else {
      setCodeSentTo(cleanEmail)
    }
  }

  if (codeSentTo) {
    return (
      <div>
        <h1>Verify your email</h1>
        <VerifyCodeForm
          email={codeSentTo}
          type="email"
          onResend={() => supabase.auth.resend({ type: 'signup', email: codeSentTo })}
        />
      </div>
    )
  }

  return (
    <div>
      <h1>Create your account</h1>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          First name
          <input
            type="text"
            autoComplete="given-name"
            maxLength={50}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>

        <label>
          Last name (optional)
          <input
            type="text"
            autoComplete="family-name"
            maxLength={50}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>

        <label>
          Campus (optional)
          <select value={campus} onChange={(e) => setCampus(e.target.value)}>
            <option value="">Choose later</option>
            {CAMPUS_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>

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
          Password (at least {MIN_PASSWORD_LENGTH} characters)
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {message && <p>{message}</p>}

      <p>
        Already have an account? <Link to="/signin" state={location.state}>Sign in</Link>
      </p>
    </div>
  )
}
