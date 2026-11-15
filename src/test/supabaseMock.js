import { vi } from 'vitest'

// A fake Supabase client for tests, so tests never touch the real database.
//
// Use it at the top of a test file, with the path to src/lib/supabase from that file:
//
//   import { createSupabaseMock } from '../test/supabaseMock'
//   const mock = vi.hoisted(() => ({ supabase: null }))
//   vi.mock('../lib/supabase', async () => {
//     const { createSupabaseMock } = await import('../test/supabaseMock')
//     mock.supabase = createSupabaseMock()
//     return { supabase: mock.supabase }
//   })
//
// Then, in a test, choose what the next query returns and check what was asked:
//
//   mock.supabase.setResult({ data: [{ id: 1, title: 'Lamp' }], error: null })
//   ...render the page...
//   expect(mock.supabase.from).toHaveBeenCalledWith('listings')
//   expect(mock.supabase.query.eq).toHaveBeenCalledWith('status', 'available')
//
// Pages should mostly mock the helpers in src/lib/ instead (see testing.md, rule 3).
// This mock is for testing those helpers, and for pages that still query Supabase directly.
export function createSupabaseMock() {
  let result = { data: null, error: null }

  // Every query method (select, eq, order, ...) returns the same object, so they can be chained
  // like the real client: supabase.from('listings').select('*').eq('id', 1).
  // `await`ing the chain gives back `result`.
  const query = {}
  for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'in', 'overlaps',
    'gte', 'lte', 'ilike', 'order', 'limit', 'range']) {
    query[method] = vi.fn(() => query)
  }
  query.single = vi.fn(() => Promise.resolve(result))
  query.maybeSingle = vi.fn(() => Promise.resolve(result))
  query.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject)

  return {
    from: vi.fn(() => query),
    query,
    setResult(newResult) {
      result = newResult
    },
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      verifyOtp: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      resend: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      updateUser: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        remove: vi.fn(() => Promise.resolve({ data: [], error: null })),
        getPublicUrl: vi.fn((path) => ({ data: { publicUrl: `https://example.test/${path}` } })),
      })),
    },
  }
}
