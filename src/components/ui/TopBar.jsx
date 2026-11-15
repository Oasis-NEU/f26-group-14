import { Link } from 'react-router-dom'
import Button from './Button'

// Minimal top bar for the landing page (1.png): just a LOGIN button on the
// right. Used when the user isn't signed in yet.
export default function TopBar({ loginTo = '/signin' }) {
  return (
    <div className="topbar">
      <Button as={Link} to={loginTo} variant="primary">
        Login
      </Button>
    </div>
  )
}
