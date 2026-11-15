import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { shrinkImage } from '../lib/shrinkImage'
import { CAMPUS_NAMES } from '../lib/listingOptions'
import Avatar from '../components/ui/Avatar'
import PageShell from '../components/ui/PageShell'
import TopNav from '../components/ui/TopNav'
import Button from '../components/ui/Button'



const AVATAR_SIZE = 400
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function Settings({ session }) {
  const userId = session.user.id
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [bio, setBio] = useState('')
  const [campus, setCampus] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [newAvatar, setNewAvatar] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, bio, avatar_url, campus')
        .eq('id', userId)
        .single()

      if (ignore) return
      if (error) {
        setMessage(error.message)
      } else {
        setFirstName(data.first_name)
        setLastName(data.last_name ?? '')
        setBio(data.bio)
        setCampus(data.campus ?? '')
        setAvatarUrl(data.avatar_url ?? '')
      }
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [userId])

  async function handleAvatarChange(event) {
    const input = event.target
    const file = input.files[0]
    if (!file) return

    const smallFile = await shrinkImage(file, AVATAR_SIZE)

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setNewAvatar(smallFile)
    setPreviewUrl(URL.createObjectURL(smallFile))
    input.value = ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (firstName.trim() === '') {
      setMessage('Please enter your first name.')
      return
    }
    if (newAvatar && !ALLOWED_PHOTO_TYPES.includes(newAvatar.type)) {
      setMessage('Profile picture must be a JPEG, PNG, or WebP image.')
      return
    }

    setSaving(true)
    setMessage('')

    let savedAvatarUrl = avatarUrl || null
    if (newAvatar) {
      const path = `${userId}/avatar`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, newAvatar, { upsert: true, contentType: newAvatar.type })

      if (uploadError) {
        setMessage(uploadError.message)
        setSaving(false)
        return
      }

      const { publicUrl } = supabase.storage.from('avatars').getPublicUrl(path).data
      savedAvatarUrl = `${publicUrl}?v=${Date.now()}`
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        campus: campus || null,
        bio: bio.trim(),
        avatar_url: savedAvatarUrl,
      })
      .eq('id', userId)

    setSaving(false)
    if (error) {
      setMessage(error.message)
      return
    }

    setAvatarUrl(savedAvatarUrl ?? '')
    setNewAvatar(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    setMessage('Saved!')
  }

  return (
    <PageShell variant="gradient">
      <TopNav session={session} />
      {loading ? (
        <p className="state">Loading...</p>
      ) : (
        <>
          <h1 className="page-title">Settings</h1>
          <p style={{ marginBottom: 16 }}>
            <Link to={`/profile/${userId}`} className="auth-footer"><u>View my profile</u></Link>
          </p>

          <div style={{ maxWidth: 560 }}>
            <form className="form-stack" onSubmit={handleSubmit}>
              <fieldset>
                <legend>Profile picture</legend>
                <Avatar url={previewUrl || avatarUrl} name={firstName || '?'} />
                <label className="photo-button">
                  Change picture
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} />
                </label>
              </fieldset>

              <label>
                First name
                <input type="text" maxLength={50} value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} />
              </label>

              <label>
                Last name (optional)
                <input type="text" maxLength={50} value={lastName}
                  onChange={(e) => setLastName(e.target.value)} />
              </label>

              <label>
                Campus (optional)
                <select value={campus} onChange={(e) => setCampus(e.target.value)}>
                  <option value="">Not set</option>
                  {CAMPUS_NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <small className="form-help">Fills in automatically when you sell, and shows your campus first in the Feed.</small>
              </label>

              <label>
                Bio
                <textarea maxLength={500} placeholder="Year, major, what you usually sell..."
                  value={bio} onChange={(e) => setBio(e.target.value)} />
                <small className="form-help">{bio.length}/500</small>
              </label>

              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </form>

            {message && <p className="form-message" style={{ marginTop: 16 }}>{message}</p>}

            <div style={{ marginTop: 40 }}>
              <ChangePasswordForm email={session.user.email} />
            </div>
          </div>
        </>
      )}
    </PageShell>
  )
}

const MIN_PASSWORD_LENGTH = 8

function ChangePasswordForm({ email }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    if (currentPassword === '') {
      setMessage('Please enter your current password.')
      return
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setMessage(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage("New passwords don't match.")
      return
    }
    if (newPassword === currentPassword) {
      setMessage('New password must be different from your current one.')
      return
    }

    setSaving(true)
    setMessage('')

    const { error: checkError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    if (checkError) {
      setSaving(false)
      setMessage(checkError.code === 'invalid_credentials' ? 'Current password is incorrect.' : checkError.message)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)

    if (error) {
      setMessage(error.message)
    } else {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage('Password updated!')
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <h2 className="section-heading" style={{ margin: '0 0 8px' }}>Change password</h2>
      <label>
        Current password
        <input type="password" autoComplete="current-password" value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)} />
      </label>
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
      <Button type="submit" variant="primary" disabled={saving}>
        {saving ? 'Saving...' : 'Update password'}
      </Button>
      {message && <p className="form-message">{message}</p>}
    </form>
  )
}
