# 0006. Data model and row-level security

- **Status:** Proposed. Revised 2026-11-01 to match what #6 built. Sanket finalizes this with Zane and Austin (SH-01)
- **Date:** 2026-11-01
- **Owner:** Sanket
- **Related tasks:** DATA-01 through DATA-12, AUTH-07, SELL-01, FEED-06, SEC-04

## Context

The README requirements: pickup points, item types, timing and move-out dates, prices with in-person payment, retail price, and residence-hall guidelines. Per ADR-0002, RLS is the only real access control we have.

The first version of this ADR proposed a schema before any code existed. #6 then merged Sanket's working schema. This revision describes **what's built**, the decisions it made, and **what's still planned**. When the two disagree, what's built wins until a migration changes it.

## Built (in `supabase/migrations/`)

| Table | Columns |
|---|---|
| `profiles` | `id` (= `auth.users.id`), `first_name`, `last_name`, `bio`, `avatar_url`, `campus`, `created_at`. A row is created by the `handle_new_user` trigger at signup |
| `listings` | `id` (bigint identity), `seller_id` → profiles, `seller_email` (from the JWT), `title`, `description`, `category` (text check list), `condition` (`New`/`Like new`/`Good`/`Fair`), `price numeric(10,2)`, `campus`, `meetup_location` (free text), `payment_methods` (Cash / Zelle / Cash App / Venmo), `photo_url`, `status` (`available`/`sold`), `created_at` |

Storage buckets:
- `listing-photos`: public, 5 MB, jpeg/png/webp, users write only to their own `<uid>/` folder
- `avatars`: public, 2 MB

### Decisions the built schema made

- **Prices are `numeric(10,2)` dollars**, not integer cents. Postgres `numeric` is exact, so there's no float rounding in the database. In JS, format with `src/lib/formatPrice.js` and don't add up money with floats.
- **Guest browsing:** signed-out visitors can view listings (`20261031134400_guest_browsing.sql`). Column grants hide `seller_email` and `seller_id` from them. This replaces the original "signed-in users only" proposal.
- **Campuses:** listings and profiles carry one of Northeastern's 14 campuses, and meetup spots depend on the campus (`src/lib/listingOptions.js`). This wasn't in the original proposal.
- **Categories and conditions** are text check lists, not lookup tables. That's simple, and fine until we need to edit them without a migration.

## Still planned

| Change | Task |
|---|---|
| `interests` (buyer → listing, unique pair) to replace `mailto:` contact | DATA-02, FEED-06 |
| `reports` | DATA-02, SEC-07 |
| `listing_images` (several photos per listing, ordered) | DATA-02, SELL-04 |
| `retail_price`, `available_from`, `gone_by` on listings | DATA-02, SELL-01, SELL-05 |
| Profile fields: residence hall, move-out date, grad year, payment handles, notification preferences | DATA-02, SET-01..04 |
| `residence_halls` (move-out dates, guidelines), `pickup_points` (if meetup spots move into the DB) | DATA-02, DATA-06 |
| More statuses (`pending`, `expired`, `removed`) | SELL-05 |

## RLS: built vs. target

| Table | Built | Target |
|---|---|---|
| `listings` read | Signed-in users: **every row and column, including `seller_email`**. Guests: every row, column grants hide email and seller ID | Guests and signed-in users read listing fields. **Seller email is never readable through the table** (DATA-09) |
| `listings` write | Insert/update/delete only your own rows (checks `seller_id`, `seller_email`) | Same, **plus column grants** so users can't set `created_at`, `seller_id`, or `seller_email` (DATA-10) |
| `profiles` | Anyone can read display fields; you update your own allowed columns; no user insert/delete | Same. Payment handles readable by signed-in users only, once added |
| `interests` | (doesn't exist) | Readable by the buyer or the listing's seller; insert your own, not on your own listing |
| `reports` | (doesn't exist) | Insert only; readable by nobody except the service role |

## Known issues (from the #6 security audit)

1. Any signed-in user can collect every seller's email through the API → **DATA-09**
2. Sellers can set `created_at` and pin their listing to the top of the feed → **DATA-10**
3. `photo_url` and `avatar_url` accept any URL (tracking pixels, files that skip the bucket limits) → **DATA-11**
4. `listing-photos` has no SELECT policy, so deleting old photos may fail silently → **DATA-12**
5. Email changes skip the domain check → **AUTH-07** (ADR-0005)

## Consequences

- Any new table ships **with** its RLS policies and pgTAP tests in the same migration. Zane reviews them (SEC-04).
- Never edit an applied migration. Add a new one ([supabase/README.md](../../supabase/README.md)).
- **No user Stripe secret keys, ever.** If we add Stripe, we store a Payment Link URL instead (see the Backlog in the project plan).
