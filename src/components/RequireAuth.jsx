import { Navigate } from 'react-router-dom'

// Wraps a page that needs a logged-in user to access it. Sends logged-out users to /signin.
export default function RequireAuth({ session, loading, children }) {
  if (loading) {
    return <p>Loading...</p>
  }

  if (!session) {
    return <Navigate to="/signin" replace />
  }

  return children
}
