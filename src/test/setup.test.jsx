// OPS-05: proves the test setup works, so later test failures mean real bugs.
// Checks the three pieces testing.md asks for: the fake browser (jsdom), the extra
// jest-dom checks, and the shared Supabase mock.
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const mock = vi.hoisted(() => ({ supabase: null }))
vi.mock('../lib/supabase', async () => {
  const { createSupabaseMock } = await import('./supabaseMock')
  mock.supabase = createSupabaseMock()
  return { supabase: mock.supabase }
})

function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
}

describe('test setup', () => {
  it('renders a component in the fake browser and handles clicks', async () => {
    render(<Counter />)
    const button = screen.getByRole('button', { name: 'Clicked 0 times' })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)

    expect(button).toHaveTextContent('Clicked 1 times')
  })

  it('replaces the real Supabase client with the shared mock', async () => {
    mock.supabase.setResult({ data: [{ id: 1, title: 'Lamp' }], error: null })

    const { data, error } = await supabase.from('listings').select('id, title').eq('status', 'available')

    expect(error).toBeNull()
    expect(data).toEqual([{ id: 1, title: 'Lamp' }])
    expect(mock.supabase.from).toHaveBeenCalledWith('listings')
    expect(mock.supabase.query.eq).toHaveBeenCalledWith('status', 'available')
  })
})
