// Picks which listings the HotDeals page shows.
//   listings - recent available listings, newest first. Each has id, title, price, created_at, ...
//   count    - how many to return
// Returns a new array of at most `count` listings and never changes the one passed in.
// For now that's simply the newest ones.
export function pickHotDeals(listings, count) {
  return listings.slice(0, count)
}
