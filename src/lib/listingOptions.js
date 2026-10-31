// The choices shown in the Sell form (and later in Feed filters).
// CATEGORIES, CONDITIONS and PAYMENT_METHODS must match the "check" rules in
// supabase/listings.sql exactly, or the database will reject the listing.

export const CATEGORIES = ['Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Dorm & Kitchen', 'Other']

export const CONDITIONS = ['New', 'Like new', 'Good', 'Fair']

export const PAYMENT_METHODS = ['Cash', 'Zelle', 'Cash App', 'Venmo']

// Safe, public places on campus to meet. Safe to edit: the database doesn't restrict these.
export const MEETUP_LOCATIONS = [
  'Curry Student Center',
  'Snell Library',
  'Marino Recreation Center',
  'ISEC',
  'International Village',
  'West Village Quad',
  'Centennial Common',
]
