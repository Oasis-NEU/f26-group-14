import { describe, expect, it } from 'vitest'
import { pickHotDeals } from './hotDeals'

function listing(id, price, daysAgo) {
  const created = new Date('2026-11-07T12:00:00Z')
  created.setUTCDate(created.getUTCDate() - daysAgo)
  return { id, title: `Item ${id}`, price, status: 'available', created_at: created.toISOString() }
}

const recent = [
  listing(1, 40, 0),
  listing(2, 0, 1),
  listing(3, 15, 2),
  listing(4, 120, 3),
  listing(5, 5, 9),
]

describe('pickHotDeals', () => {
  it('returns at most the number asked for', () => {
    expect(pickHotDeals(recent, 3)).toHaveLength(3)
    expect(pickHotDeals(recent.slice(0, 2), 3)).toHaveLength(2)
  })

  it('returns an empty list when there is nothing for sale', () => {
    expect(pickHotDeals([], 3)).toEqual([])
  })

  it('only returns listings it was given, with no repeats', () => {
    const ids = pickHotDeals(recent, 3).map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id) => expect(recent.map((l) => l.id)).toContain(id))
  })

  it('does not reorder or change the list passed in', () => {
    const before = recent.map((l) => l.id)
    pickHotDeals(recent, 3)
    expect(recent.map((l) => l.id)).toEqual(before)
  })
})
