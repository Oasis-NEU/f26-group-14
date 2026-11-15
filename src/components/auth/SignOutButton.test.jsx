// SH-07: Austin's new nav (d053ca6) dropped the only Sign out button, so nobody could sign out.
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SignOutButton from './SignOutButton'

const mock = vi.hoisted(() => ({ supabase: null }))
vi.mock('../../lib/supabase', async () => {
  const { createSupabaseMock } = await import('../../test/supabaseMock')
  mock.supabase = createSupabaseMock()
  return { supabase: mock.supabase }
})

function renderOnSettings() {
  render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<SignOutButton />} />
        <Route path="/signin" element={<h1>Sign in page</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SignOutButton', () => {
  it('signs the user out and goes to the sign-in page', async () => {
    renderOnSettings()

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(mock.supabase.auth.signOut).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('heading', { name: 'Sign in page' })).toBeInTheDocument()
  })

  it('stays put and shows the error if signing out fails', async () => {
    mock.supabase.auth.signOut.mockResolvedValueOnce({ error: { message: 'Network error' } })
    renderOnSettings()

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(await screen.findByText('Network error')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Sign in page' })).not.toBeInTheDocument()
  })
})
