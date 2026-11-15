// `npm run demo`: runs the app with sample data and no Supabase account or .env needed.
// It starts a small fake Supabase on port 54321 that answers the calls the app makes
// (listings, profiles, sign-in, photo uploads), then starts Vite on port 5181 pointed at it.
// Everything lives in memory and resets when you stop it. Never point real users at this.
//
// Sign in with any @northeastern.edu email and any password. You'll be "Demo Husky",
// who already has a few listings, so HotDeals, Orders, and Sell all have something to show.

import http from 'node:http'
import { createServer } from 'vite'

const API_PORT = 54321
const APP_PORT = 5181
const API_URL = `http://localhost:${API_PORT}`

const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001'
const OTHER_USER_ID = '00000000-0000-4000-8000-000000000002'
const DAY_MS = 24 * 60 * 60 * 1000

const profiles = [
  { id: DEMO_USER_ID, first_name: 'Demo', last_name: 'Husky', bio: 'Moving out in May, everything must go.', avatar_url: null, campus: 'Boston', created_at: '2026-09-01T00:00:00Z' },
  { id: OTHER_USER_ID, first_name: 'Paws', last_name: 'Student', bio: '', avatar_url: null, campus: 'Boston', created_at: '2026-09-15T00:00:00Z' },
]

const samples = [
  ['Mini fridge', 60, 'Furniture', 'Good', 'Barely used, fits under a dorm desk. Freezer box works great.', DEMO_USER_ID, 'available'],
  ['Calculus textbook', 25, 'Textbooks', 'Fair', 'Stewart 9th edition, some highlighting in chapter 3.', OTHER_USER_ID, 'available'],
  ['Desk lamp', 0, 'Dorm & Kitchen', 'Like new', 'Free! LED, three brightness levels.', DEMO_USER_ID, 'available'],
  ['Swivel desk chair', 35, 'Furniture', 'Good', 'Comfy and adjustable. Easiest if you can carry it from West Village.', OTHER_USER_ID, 'available'],
  ['Twin XL mattress topper', 20, 'Dorm & Kitchen', 'Good', 'Memory foam, cover just washed.', DEMO_USER_ID, 'available'],
  ['Rice cooker', 18, 'Dorm & Kitchen', 'Like new', 'Small 3-cup cooker, works perfectly.', DEMO_USER_ID, 'sold'],
  ['Wireless headphones', 45, 'Electronics', 'Good', 'Noise cancelling, comes with the case.', OTHER_USER_ID, 'available'],
]
const photoColors = ['#f2c14e', '#7ec4cf', null, '#e07a5f', '#81b29a', '#9d8df1', '#f4a261']

let nextId = 1
const listings = samples.map(([title, price, category, condition, description, sellerId, status], i) => ({
  id: nextId++,
  seller_id: sellerId,
  seller_email: sellerId === DEMO_USER_ID ? 'demo.husky@northeastern.edu' : 'paws.student@northeastern.edu',
  title,
  description,
  price,
  category,
  condition,
  campus: 'Boston',
  meetup_location: ['Snell Library', 'Curry Student Center', 'Marino Center'][i % 3],
  payment_methods: ['Cash', 'Venmo'],
  photo_url: photoColors[i] ? `${API_URL}/demo-photo/${i}.svg` : null,
  status,
  created_at: new Date(Date.now() - i * DAY_MS).toISOString(),
}))

// Photos uploaded through the Sell form, kept in memory: path -> { type, bytes }.
const uploads = new Map()

// ---------- PostgREST-style filtering (just what the app uses) ----------

// One query-string filter like "eq.Boston", "ilike.%lamp%", "in.(A,B)", "gte.10", "ov.{Cash}".
function matches(value, filter) {
  const dot = filter.indexOf('.')
  const op = filter.slice(0, dot)
  const arg = filter.slice(dot + 1)
  const list = (text) => text.slice(1, -1).split(',').map((item) => item.replace(/^"|"$/g, ''))

  if (op === 'eq') return String(value) === arg
  if (op === 'gte') return Number(value) >= Number(arg)
  if (op === 'lte') return Number(value) <= Number(arg)
  if (op === 'in') return list(arg).includes(String(value))
  if (op === 'ov') return list(arg).some((item) => value.includes(item))
  if (op === 'ilike') {
    const pattern = arg.replace(/\\([\\%_])|([%_])|([^\\%_]+)/g, (_, escaped, wildcard, text) =>
      escaped ? escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        : wildcard ? (wildcard === '%' ? '.*' : '.')
          : text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    return new RegExp(`^${pattern}$`, 'i').test(String(value))
  }
  return true
}

const NOT_FILTERS = new Set(['select', 'order', 'limit', 'offset', 'columns'])

function filterRows(rows, params) {
  let result = rows.filter((row) =>
    [...params].every(([key, filter]) => NOT_FILTERS.has(key) || matches(row[key], filter)))
  const order = params.get('order')
  if (order) {
    const [column, direction] = order.split('.')
    result = [...result].sort((a, b) => (a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0))
    if (direction === 'desc') result.reverse()
  }
  const limit = params.get('limit')
  return limit ? result.slice(0, Number(limit)) : result
}

// Listings come back with their seller's profile attached, like the app's `seller:profiles(...)` join.
function withSeller(listing) {
  return { ...listing, seller: profiles.find((profile) => profile.id === listing.seller_id) }
}

// ---------- Fake sign-in ----------

function base64url(object) {
  return Buffer.from(JSON.stringify(object)).toString('base64url')
}

function demoSession(email) {
  const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
  const user = {
    id: DEMO_USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email,
    email_confirmed_at: '2026-09-01T00:00:00Z',
    user_metadata: { first_name: 'Demo' },
    app_metadata: { provider: 'email' },
    created_at: '2026-09-01T00:00:00Z',
  }
  const accessToken = `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url({ sub: DEMO_USER_ID, email, role: 'authenticated', exp: expiresAt })}.demo`
  return { access_token: accessToken, token_type: 'bearer', expires_in: 7 * 24 * 60 * 60, expires_at: expiresAt, refresh_token: 'demo-refresh', user }
}

// ---------- HTTP server ----------

function readBody(request) {
  return new Promise((resolve) => {
    const chunks = []
    request.on('data', (chunk) => chunks.push(chunk))
    request.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

function send(response, status, body, type = 'application/json') {
  response.writeHead(status, { 'Content-Type': type })
  response.end(type === 'application/json' ? JSON.stringify(body) : body)
}

function authError(response, message) {
  send(response, 400, { code: 400, error_code: 'demo_mode', msg: message, message })
}

const api = http.createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  response.setHeader('Access-Control-Expose-Headers', 'Content-Range')
  if (request.method === 'OPTIONS') return response.end()

  const url = new URL(request.url, API_URL)
  const path = url.pathname
  const body = await readBody(request)
  const json = () => (body.length ? JSON.parse(body.toString()) : {})
  const wantsOne = (request.headers.accept ?? '').includes('vnd.pgrst.object')
  const reply = (rows) => send(response, 200, wantsOne ? rows[0] ?? null : rows)

  // Sample photos: a colored square with a soft circle.
  const sample = path.match(/^\/demo-photo\/(\d+)\.svg$/)
  if (sample) {
    return send(response, 200,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${photoColors[sample[1]] ?? '#7ec4cf'}"/><circle cx="50" cy="46" r="22" fill="#fff" opacity=".55"/></svg>`,
      'image/svg+xml')
  }

  // Auth
  if (path === '/auth/v1/token' && url.searchParams.get('grant_type') === 'password') {
    const { email = '' } = json()
    if (!email.trim().toLowerCase().endsWith('@northeastern.edu')) {
      return authError(response, 'Demo mode: sign in with any @northeastern.edu email and any password.')
    }
    return send(response, 200, demoSession(email.trim().toLowerCase()))
  }
  if (path === '/auth/v1/token') return send(response, 200, demoSession('demo.husky@northeastern.edu'))
  if (path === '/auth/v1/user') return send(response, 200, demoSession('demo.husky@northeastern.edu').user)
  if (path === '/auth/v1/logout') return send(response, 204, '', 'text/plain')
  if (path.startsWith('/auth/v1/')) {
    return authError(response, 'Demo mode: sign-up and emails are turned off. Sign in with any @northeastern.edu email instead.')
  }

  // Storage: uploads are kept in memory and served back from the public URL.
  const storage = path.match(/^\/storage\/v1\/object\/(public\/)?([^/]+)\/(.+)$/)
  if (storage) {
    const key = `${storage[2]}/${decodeURIComponent(storage[3])}`
    if (request.method === 'GET') {
      const file = uploads.get(key)
      return file ? send(response, 200, file.bytes, file.type) : send(response, 404, { message: 'Not found' })
    }
    uploads.set(key, { type: request.headers['content-type'] ?? 'image/jpeg', bytes: body })
    return send(response, 200, { Key: key, Id: key })
  }
  if (path.match(/^\/storage\/v1\/object\/[^/]+$/) && request.method === 'DELETE') {
    return send(response, 200, [])
  }

  // Tables
  if (path === '/rest/v1/profiles') {
    if (request.method === 'PATCH') {
      const changed = filterRows(profiles, url.searchParams)
      changed.forEach((profile) => Object.assign(profile, json()))
      return reply(changed)
    }
    return reply(filterRows(profiles, url.searchParams))
  }

  if (path === '/rest/v1/listings') {
    if (request.method === 'POST') {
      const listing = {
        ...json(),
        id: nextId++,
        seller_id: DEMO_USER_ID,
        seller_email: 'demo.husky@northeastern.edu',
        status: 'available',
        created_at: new Date().toISOString(),
      }
      listings.push(listing)
      return reply([withSeller(listing)])
    }
    const chosen = filterRows(listings, url.searchParams)
    if (request.method === 'PATCH') {
      chosen.forEach((listing) => Object.assign(listing, json()))
      return reply(chosen.map(withSeller))
    }
    if (request.method === 'DELETE') {
      chosen.forEach((listing) => listings.splice(listings.indexOf(listing), 1))
      return reply(chosen)
    }
    return reply(chosen.map(withSeller))
  }

  send(response, 404, { message: `Demo mode doesn't fake ${request.method} ${path}` })
})

// ---------- Start both ----------

api.on('error', (error) => {
  console.error(`Couldn't start the fake Supabase on port ${API_PORT}: ${error.message}`)
  process.exit(1)
})

api.listen(API_PORT, async () => {
  // Vite gives VITE_ variables that are already set priority over the .env file,
  // so the demo uses the fake Supabase even if you have a real .env.
  process.env.VITE_SUPABASE_URL = API_URL
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'demo-key'

  const vite = await createServer({ server: { port: APP_PORT, strictPort: true } })
  await vite.listen()
  console.log(`\n  HuskyExchange demo (sample data, nothing is saved): http://localhost:${APP_PORT}`)
  console.log('  Sign in with any @northeastern.edu email and any password. Ctrl+C to stop.\n')
})
