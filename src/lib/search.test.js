import { describe, expect, it } from 'vitest'
import { toSearchPattern } from './search'

describe('toSearchPattern', () => {
  it('wraps the words so they match anywhere in the title', () => {
    expect(toSearchPattern('mini fridge')).toBe('%mini fridge%')
  })

  it('trims spaces around the search', () => {
    expect(toSearchPattern('  lamp  ')).toBe('%lamp%')
  })

  it('returns an empty string for a blank search', () => {
    expect(toSearchPattern('')).toBe('')
    expect(toSearchPattern('   ')).toBe('')
  })

  it('treats % and _ as plain characters, not wildcards', () => {
    expect(toSearchPattern('100%')).toBe('%100\\%%')
    expect(toSearchPattern('desk_lamp')).toBe('%desk\\_lamp%')
  })

  it('escapes backslashes too', () => {
    expect(toSearchPattern('a\\b')).toBe('%a\\\\b%')
  })
})
