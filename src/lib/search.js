// Turns what someone typed in the search bar into a pattern for Postgres `ilike`.
// In `ilike`, % means "anything" and _ means "any one character", so a search for "100%"
// would match far too much. A backslash in front makes them plain characters again.
// Returns '' when there's nothing to search for.
export function toSearchPattern(text) {
  const trimmed = text.trim()
  if (trimmed === '') return ''
  const escaped = trimmed.replace(/[\\%_]/g, (character) => `\\${character}`)
  return `%${escaped}%`
}
