// Runs before every test file (see `test.setupFiles` in vite.config.js).
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
// Adds extra checks like expect(element).toBeInTheDocument() and .toHaveTextContent()
import '@testing-library/jest-dom/vitest'

// Remove whatever the last test drew on the fake page, so tests don't affect each other.
afterEach(() => {
  cleanup()
})
