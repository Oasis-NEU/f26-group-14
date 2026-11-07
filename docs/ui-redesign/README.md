# UI redesign: the Canva look

**Author:** Zane · **Branch:** `ui-canva-restyle` · **Date:** 2026-11-07

This restyles HuskyExchange to match Zane's Canva mockups ([canva/](canva/)). Before this change the app still used the Vite starter template's CSS: a purple accent, everything centered inside a bordered 1126px column, and a bare `<h1>Home</h1>` for a home page. All of Sanket's data code (queries, RLS-safe column lists, the Sell form's upload logic) is unchanged. This change is mostly how things look, plus three screens that didn't exist yet.

| Canva screen | Route | File |
|---|---|---|
| [1 · Landing](canva/1-landing.png) | `/` (guests) | `src/pages/home.jsx` → `Landing` |
| [2 · HotDeals](canva/2-hotdeals.png) | `/` (signed in) | `src/pages/home.jsx` → `HotDeals` |
| [3 · Item browser](canva/3-item-browser.png) | `/feed` | `src/pages/feed.jsx` |
| [4 · My Orders](canva/4-my-orders.png) | `/orders` (new) | `src/pages/orders.jsx` |
| [5 · Sell Items](canva/5-sell.png) | `/sell` | `src/pages/sell.jsx` |

Sign in, Sign up, Reset password, Settings, Profile, Edit, and the listing page weren't in the mockups. They get the same look automatically, because they reuse the shared classes (`.form-stack`, `.listing-page`, buttons, and fields).

## The design system in four ideas

All of it lives in two files. [`src/index.css`](../../src/index.css) holds the tokens and base elements, and [`src/App.css`](../../src/App.css) holds layout and components.

1. **One gradient for the whole page.** `body` fades `#000000 → #0a2149 → #1c66d4 → #b4e4ef` from top to bottom, like every Canva screen. It's set on `body`, not the window, so long pages stretch it the same way the tall Canva frames do.
2. **Frosted glass panels.** `.glass` combines a white-to-clear gradient, a 1.5px see-through white border, rounded corners, and `backdrop-filter: blur(14px)`. The blur is what makes it look like glass: whatever is behind the panel (the gradient, the ribbons) gets blurred.
3. **Two fonts with two jobs.**
   - **Inter** (tight letter spacing) for headings and the logo.
   - **IBM Plex Mono** in uppercase for buttons, labels, prices, and card text.

   That split is the main thing that makes it look like the mockup.
4. **Tokens, not hard-coded colors.** Every color is a CSS variable on `:root` (`--blue`, `--navy`, `--glass-border`, and so on). To change the brand blue, you change one line.

### Buttons

| Look | How | Used for |
|---|---|---|
| Navy (default) | any `<button>` or `.btn` | Browse, Login, most actions |
| Bright blue | add `.btn-primary` | the main action on a screen (Get started, Post listing) |
| Outline | add `.btn-ghost` | quiet actions (Clear filters, Sign out) |
| Big | add `.btn-lg` | hero buttons |

## What's new beyond styling

- **Nav bar** ([`components/layout/NavBar.jsx`](../../src/components/layout/NavBar.jsx)): the HuskyExchange wordmark, then HotDeals · Item Browser · Orders · Sell, then a profile icon. The current page is underlined (`NavLink` adds an `active` class). The profile icon opens a menu (My profile, Settings, Sign out) built with a plain `<details>` element, so it needs no state and works with the keyboard. Guests see a LOGIN button instead. On the landing page the bar shows only LOGIN, because the hero already shows the big logo.
- **HotDeals** shows "Hello {first name}" and three listings picked by `pickHotDeals()` in [`src/lib/hotDeals.js`](../../src/lib/hotDeals.js). For now it simply takes the 3 newest. The choice lives in its own pure function so the rule can change without touching the page.
- **Search in the Item Browser.** Search matches the title with Postgres `ilike`, using the feed's existing 300ms wait so it doesn't query on every keystroke. [`src/lib/search.js`](../../src/lib/search.js) escapes `%`, `_`, and `\`. Without that, searching "100%" would match everything.
- **The filter panel is hidden by default** behind the sliders icon, like the Canva screen. A badge on the icon counts the active filters.
- **My Orders** (`/orders`, login required):
  - **Outgoing** lists your own listings, split into *Listed/Pending* (available) and *Fulfilled* (sold).
  - **Incoming** (things you're buying) shows a short message instead. The database has no purchases table yet; that comes with messaging (MSG-\*). We chose not to show fake orders.
- **Listing cards** follow the Canva layout: the title, price, and description go on top, and the photo sits in a rounded frame below. Each card fades from navy at the top to sky at the bottom.
- **Decorative ribbons** ([`components/layout/Ribbons.jsx`](../../src/components/layout/Ribbons.jsx)): inline SVG, `aria-hidden`, hidden on phones so they don't cover content.

## Decisions and why

| Decision | Why |
|---|---|
| Fonts come from npm (`@fontsource-variable/inter@5.3.0`, `@fontsource/ibm-plex-mono@5.3.0`), not Google Fonts | Vite bundles the font files into our own build, so they load from our own domain. The CSP planned in [ADR-0004](../adr/0004-security-headers.md) can stay `font-src 'self'` and `style-src 'self'`. A Google Fonts link would need two more trusted outside sites, and every visitor would ping Google. |
| Kept every existing class name (`.form-stack`, `.listing-page`, `.chip`, ...) | Pages that weren't in the mockups got restyled without changing their code, which keeps this PR mostly CSS and avoids clashing with work in progress on those pages. |
| Orders "Incoming" says "coming soon" instead of using sample data | Made-up data in a real app is a bug waiting to happen. The tab is ready for when messaging adds purchases. |
| Card grid uses `minmax(min(300px, 100%), 1fr)` | That gives 3 columns on a laptop (like Canva), 2 on a tablet, and 1 on a phone, with no media queries. |
| `prefers-reduced-motion` turns off every transition | Accessibility rule from the definition of done. |

## Files changed

- `src/index.css`: rewritten (tokens, base elements, buttons, fields)
- `src/App.css`: rewritten (layout, glass, nav, hero, cards, forms, listing page). The unused Vite starter rules were deleted.
- `src/App.jsx`: `NavBar` replaces the old link list. Pages render inside `<main className="page">`. New `/orders` route.
- `src/main.jsx`: imports the fonts
- New files:
  - `src/components/layout/NavBar.jsx`, `Logo.jsx`, `Ribbons.jsx`
  - `src/pages/orders.jsx`
  - `src/lib/hotDeals.js` + test
  - `src/lib/search.js` + test
- `src/pages/home.jsx`, `feed.jsx`, `sell.jsx` and `src/components/listings/ListingCard.jsx`: new layouts. `ListingForm.jsx` only changed one class name.

## How it was checked

- `npm run lint` and `npm run build` pass.
- `npx vitest@3.2.4 run`: 9 tests pass (`search.test.js`, `hotDeals.test.js`). Once Sanket's OPS-05 adds `npm test`, they'll run there too.
- Every page was opened in a browser at 1280px and 375px against a local stand-in for Supabase with sample listings. That covered the landing page, HotDeals, the Item Browser with search and filters, Orders, Sell, a listing page, Sign in, and the account menu. There were no console errors.
- **Not yet checked against the real Supabase project.** Run `npm run dev` with the team `.env` before merging.

## Known limits and follow-ups

- **Austin owns the design system (DS-\*, TPL-\*).** These styles should become the starting tokens for it, not compete with it. Austin reviews this PR (FE-03).
- `pickHotDeals()` uses "newest 3" for now. A smarter rule (free items first, price drops, campus match) is a good next step and has tests waiting for it.
- The SEC-02 security headers (`vercel.json`) are a separate branch and aren't part of this change.
