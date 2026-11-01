// The choices shown in the Sell form, Feed filters, Sign up, and Settings.
// CATEGORIES, CONDITIONS, PAYMENT_METHODS and the campus names must match the "check" rules
// in supabase/listings.sql and supabase/campuses.sql exactly, or the database will reject them.

export const CATEGORIES = ['Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Dorm & Kitchen', 'Other']

export const CONDITIONS = ['New', 'Like new', 'Good', 'Fair']

export const PAYMENT_METHODS = ['Cash', 'Zelle', 'Cash App', 'Venmo']

// Every Northeastern campus, with safe public places to meet on or near each one.
// Meetup spots are safe to edit: the database doesn't restrict them. Smaller campuses are
// mostly one building, so their list is the building's lobby plus a well-known spot nearby.
export const CAMPUSES = [
  {
    name: 'Boston',
    meetupSpots: [
      'Curry Student Center',
      'Snell Library',
      'Marino Recreation Center',
      'ISEC',
      'International Village',
      'West Village Quad',
      'Centennial Common',
    ],
  },
  {
    name: 'Arlington',
    meetupSpots: ['Arlington Tower lobby (1300 17th St N)', 'Rosslyn Metro station'],
  },
  {
    name: 'Burlington',
    meetupSpots: ['Innovation Campus lobby (147 S Bedford St)'],
  },
  {
    name: 'Charlotte',
    meetupSpots: ['Campus building lobby (2151 Hawkins St)'],
  },
  {
    name: 'London',
    meetupSpots: ['Devon House – Campus Hub', 'Devon House main entrance', 'St Katharine Docks', 'Tower Hill Underground station'],
  },
  {
    name: 'Miami',
    meetupSpots: ['Campus building lobby (230 NW 24th St)', 'Wynwood Walls entrance'],
  },
  {
    name: 'Nahant',
    meetupSpots: ['Marine Science Center main entrance'],
  },
  {
    name: 'New York City',
    meetupSpots: ['Main campus entrance (221 E 71st St)', 'Shanahan Library', '55th Street Residence Hall lobby', '68th St–Hunter College subway station'],
  },
  {
    name: 'Oakland',
    meetupSpots: ['Mills Hall (Main Quad)', 'F. W. Olin Library', 'Main campus entrance (5000 MacArthur Blvd)'],
  },
  {
    name: 'Portland, Maine',
    meetupSpots: ['Roux Institute lobby (100 Fore St)'],
  },
  {
    name: 'Seattle',
    meetupSpots: ['Campus building lobby (401 Terry Ave N)', 'Lake Union Park'],
  },
  {
    name: 'Silicon Valley',
    meetupSpots: ['Campus building lobby (75 E Santa Clara St, San Jose)'],
  },
  {
    name: 'Toronto',
    meetupSpots: ['Campus building lobby (100 King St W)', 'Union Station'],
  },
  {
    name: 'Vancouver',
    meetupSpots: ['Campus building lobby (410 W Georgia St)', 'Vancouver Public Library – Central Branch'],
  },
]

export const CAMPUS_NAMES = CAMPUSES.map((campus) => campus.name)

// The meetup spots for one campus, or an empty list if no campus is picked yet.
export function getMeetupSpots(campusName) {
  const campus = CAMPUSES.find((c) => c.name === campusName)
  return campus ? campus.meetupSpots : []
}
