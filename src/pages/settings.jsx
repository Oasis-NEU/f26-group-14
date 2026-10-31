import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { shrinkImage } from '../lib/shrinkImage'
import Avatar from '../components/Avatar'

const AVATAR_SIZE = 400 // profile pictures are shown small, so 400px is plenty
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Edit your own profile: name, bio, and profile picture.
export default function Settings({ session }) {
  const userId = session.user.id
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('') // the picture already saved
  const [newAvatar, setNewAvatar] = useState(null) // a picture picked but not saved yet
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Fill the form with the profile as it is now.
  useEffect(() => {
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, bio, avatar_url')
        .eq('id', userId)
        .single()

      if (ignore) return
      if (error) {
        setMessage(error.message)
      } else {
        setFirstName(data.first_name)
        setLastName(data.last_name ?? '')
        setBio(data.bio)
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

    // Step 1: if there's a new picture, upload it over the old one.
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

      // The file name never changes, so browsers might keep showing the old picture.
      // Adding ?v=<time> makes the link different each time, which forces a fresh download.
      const { publicUrl } = supabase.storage.from('avatars').getPublicUrl(path).data
      savedAvatarUrl = `${publicUrl}?v=${Date.now()}`
    }

    // Step 2: save the text fields and the picture link.
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
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

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Settings</h1>
      <p>
        <Link to={`/profile/${userId}`}>View my profile</Link>
      </p>

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
          <input type="text" maxLength={50} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </label>

        <label>
          Last name (optional)
          <input type="text" maxLength={50} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </label>

        <label>
          Bio
          <textarea
            maxLength={500}
            placeholder="Year, major, what you usually sell..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <small>{bio.length}/500</small>
        </label>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      {message && <p>{message}</p>}

      <ChangePasswordForm email={session.user.email} />
    </div>
  )
}

const MIN_PASSWORD_LENGTH = 8

// Separate small form for changing your password while logged in.
// Asks for the current password first, so someone using your unlocked laptop can't change it.
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
      setMessage('New passwords don\'t match.')
      return
    }
    if (newPassword === currentPassword) {
      setMessage('New password must be different from your current one.')
      return
    }

    setSaving(true)
    setMessage('')

    // Step 1: check the current password by signing in with it. If it's wrong, stop here.
    const { error: checkError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    if (checkError) {
      setSaving(false)
      setMessage(checkError.code === 'invalid_credentials' ? 'Current password is incorrect.' : checkError.message)
      return
    }

    // Step 2: it was right, so save the new password.
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
      <h2>Change password</h2>
      <label>
        Current password
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </label>
      <label>
        New password (at least {MIN_PASSWORD_LENGTH} characters)
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </label>
      <label>
        Confirm new password
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </label>
      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Update password'}
      </button>
      {message && <p>{message}</p>}
    </form>
  )
}
