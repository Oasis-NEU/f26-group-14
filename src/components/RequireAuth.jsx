import { Navigate, useLocation } from 'react-router-dom'

// Wraps a page that needs a logged-in user to access it. Sends logged-out users to /signin,
// and remembers which page they wanted so they can be sent back after signing in.
export default function RequireAuth({ session, loading, children }) {
  const location = useLocation()

  if (loading) {
    return <p>Loading...</p>
  }

  if (!session) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }

  return children
}
