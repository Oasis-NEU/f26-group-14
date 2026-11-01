# 0006. Data model and row-level security

- **Status:** Proposed. Rewritten 2026-11-01 to match the live database. Zane and Austin review it in the docs-sync PR (SH-01)
- **Date:** 2026-11-01
- **Owner:** Sanket
- **Related tasks:** DATA-01 through DATA-13, AUTH-03, SELL-01, FEED-06, MSG-02, SEC-04, TEST-01

## Context

Per ADR-0002, RLS is the only real access control we have. The first draft of this ADR proposed eight tables with lookup tables, integer cents, and move-out data. What actually got built is smaller, and it's been running since late October. This version records the **live** schema (checked against the database with the Supabase MCP on 2026-11-01) and lists what's still planned.

The SQL that created everything is in `supabase/*.sql`: `listings.sql`, `guest_browsing.sql`, `profiles.sql`, `campuses.sql`, `restrict_to_northeastern.sql`, and `security_fixes.sql`. It was applied by hand. Moving it to CLI migrations is DATA-02.

## Decision: live schema

### `listings`

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` identity PK | Used in URLs: `/listing/7` |
| `seller_id` | `uuid` not null, default `auth.uid()` | FK → `auth.users` and → `profiles` (both `on delete cascade`) |
| `seller_email` | `text` not null, default from JWT | **Never readable by guests** |
| `title` | `text` | 1–100 characters |
| `description` | `text` default `''` | ≤ 2000 characters |
| `price` | `numeric(10,2)` | ≥ 0, so free items are allowed |
| `category` | `text` | check: Textbooks, Electronics, Furniture, Clothing, Dorm & Kitchen, Other |
| `condition` | `text` | check: New, Like new, Good, Fair |
| `campus` | `text` not null | check: the 14 NEU campuses (ADR-0010) |
| `meetup_location` | `text` | Free text; the form offers per-campus spots |
| `payment_methods` | `text[]` | ≥ 1, subset of Cash, Zelle, Cash App, Venmo |
| `photo_url` | `text` null | One photo (multi-photo is DATA-13) |
| `status` | `text` default `available` | check: `available`, `sold` |
| `created_at` | `timestamptz` default `now()` | |

Indexes: `(status, created_at desc)` for the feed, and `(seller_id)` for profile pages.

### `profiles`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | = `auth.users.id`, `on delete cascade` |
| `first_name` | `text` | 1–50 characters (default `Husky` if missing) |
| `last_name` | `text` null | ≤ 50 characters |
| `bio` | `text` default `''` | ≤ 500 characters |
| `avatar_url` | `text` null | Public URL plus `?v=` cache-buster |
| `campus` | `text` null | Same check as `listings.campus` |
| `created_at` | `timestamptz` | |

The trigger `on_auth_user_created` → `public.handle_new_user()` (security definer, `search_path = ''`) inserts the profile from sign-up metadata (`first_name`, `last_name`, `campus`). An unknown campus is saved as null instead of failing the sign-up.

### Storage

| Bucket | Public read | Limit | Write rule |
|---|---|---|---|
| `listing-photos` | yes | 5 MB, JPEG/PNG/WebP | Only into your own `<uid>/` folder |
| `avatars` | yes | 2 MB, JPEG/PNG/WebP | Only `<uid>/avatar` (upsert) |

### RLS and grants

| Table | Guests (`anon`) | Signed-in users | Owner |
|---|---|---|---|
| `listings` | Read every row, **only** the columns `id, seller_id, title, description, price, category, condition, campus, meetup_location, payment_methods, photo_url, status, created_at` (column grants) | Read everything, including `seller_email` | Insert as yourself (`seller_id` and `seller_email` must match the JWT); update and delete your own rows |
| `profiles` | Read `id`, `first_name` only | Read everything | Update your own row, only `first_name, last_name, bio, avatar_url, campus` |
| storage | Public URLs | — | Your own folder only |

`auth.uid()` is wrapped as `(select auth.uid())` in every policy, so Postgres evaluates it once per query.

### Why it differs from the first draft

- **Money stays `numeric(10,2)`, not integer cents.** Postgres `numeric` is exact decimal (it isn't a float), so it has the same safety as cents without converting at every boundary. Revisit only if we add real payment processing.
- **Categories, conditions, campuses, and meetup spots are `check` constraints plus a list in code**, not lookup tables. That's simpler for a fixed list. See ADR-0010.
- **Guests can browse** (product decision, 2026-10-31). They see items and first names but never emails, last names, bios, or profile campuses.
- **`interests` is replaced by messaging** (MSG-*). "Message seller" starts a conversation instead.

## Still planned (not built)

- **DATA-12:** `retail_price`, `available_from` / `gone_by` on listings; `move_out_date`, payment handles, and notification preferences on profiles. Add these only if the team still wants them.
- **DATA-13:** a `listing_images` table for multiple photos.
- **MSG-02:** `conversations` and `messages`, with RLS so only the two participants can read them (design in ADR-0011).
- **SEC-07:** `reports` (insert-only for signed-in users; read by the service role).

## Consequences

- **Any query a guest can trigger must list columns explicitly.** `select('*')` on `listings` or `profiles` fails for `anon`.
- Adding a category, condition, or campus means changing both the SQL `check` and `src/lib/listingOptions.js`.
- Any new table ships **with** its RLS policies in the same file or migration. Zane reviews each one (SEC-04). RLS changes ship with pgTAP tests (`docs/workflow/testing.md`). Run the Supabase security advisors after every schema change.
- **No user Stripe secret keys, ever.** If we add Stripe, we store a Payment Link URL instead (see the Backlog in the project plan).
