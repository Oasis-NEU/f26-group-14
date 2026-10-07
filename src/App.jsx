import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/home'
import Feed from './pages/feed'
import Sell from './pages/sell'
import Settings from './pages/settings'
import SignIn from './pages/signin'
import './App.css'

// App shell: top nav plus one route per page in src/pages/.
// To add a page, create it in src/pages/, import it here, and add a <Link> and <Route>.
function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/feed">Feed</Link> |{' '}
        <Link to="/sell">Sell</Link> |{' '}
        <Link to="/settings">Settings</Link> |{' '}
        <Link to="/signin">Sign in</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  )
}

export default App