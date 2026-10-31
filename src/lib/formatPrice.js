// Turns a price number into text for the screen: 0 -> "Free", 25 -> "$25", 12.5 -> "$12.50".
export function formatPrice(price) {
  const amount = Number(price)
  if (amount === 0) return 'Free'
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`
}
