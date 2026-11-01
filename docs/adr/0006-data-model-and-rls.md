# 0006. Data model and row-level security

- **Status:** Proposed. Sanket finalizes this with Zane and Austin (SH-01)
- **Date:** 2026-11-01
- **Owner:** Sanket
- **Related tasks:** DATA-01 through DATA-08, SELL-01, FEED-06, SEC-04

## Context

The README requirements: pickup points, item types, timing and move-out dates, prices with in-person payment (Venmo, Zelle, payment link), retail price, and residence-hall guidelines. Per ADR-0002, RLS is the only real access control we have.

## Decision (proposed starting schema)

All tables live in `public`, have **RLS enabled**, and are created through migrations in `supabase/migrations/`.

| Table | Key columns |
|---|---|
| `profiles` | `id` (= `auth.users.id`), `display_name`, `avatar_path`, `residence_hall_id`, `move_out_date`, `grad_year`, `venmo_handle`, `zelle_contact`, `payment_link_url`, `notify_on_interest`, `notify_reminders`, `created_at` |
| `listings` | `id`, `seller_id` → profiles, `title`, `description`, `category_id`, `condition` (`new`/`like_new`/`good`/`fair`), `price_cents`, `retail_price_cents`, `pickup_point_id`, `available_from`, `gone_by`, `payment_methods` (text[]), `status` (`active`/`pending`/`sold`/`expired`/`removed`), `created_at`, `updated_at` |
| `listing_images` | `id`, `listing_id`, `storage_path`, `position` |
| `categories` | `id`, `slug`, `name` |
| `pickup_points` | `id`, `name`, `building`, `notes` |
| `residence_halls` | `id`, `name`, `move_out_date`, `guidelines_url` |
| `interests` | `id`, `listing_id`, `buyer_id`, `message`, `created_at`, **unique(listing_id, buyer_id)** |
| `reports` | `id`, `listing_id`, `reporter_id`, `reason`, `created_at` |

Money is stored as **integer cents**, never floats.

### RLS policy matrix (starting point)

| Table | Read | Insert | Update / delete |
|---|---|---|---|
| `listings` | signed-in users: `status = 'active'`, or your own | signed-in, with `seller_id = auth.uid()` | owner only |
| `listing_images` | same as the parent listing | owner of the parent listing | owner of the parent listing |
| `profiles` | signed-in users (display fields and payment handles) | trigger only (DATA-04) | self only |
| `interests` | the buyer, or the listing's seller | signed-in, `buyer_id = auth.uid()`, not your own listing | buyer can delete |
| `reports` | nobody (service role only) | signed-in, `reporter_id = auth.uid()` | nobody |
| lookup tables | signed-in users | nobody (migrations only) | nobody |

Storage bucket `listing-images`: users can only write to the `<uid>/...` folder, images only, ≤ 5 MB.

## Consequences

- Payment handles are visible to every signed-in student. That's intended (it's how payment happens), and the Settings page has to say so (SET-03).
- Any new table ships **with** its RLS policies in the same migration. Zane reviews each one (SEC-04).
- **No user Stripe secret keys, ever.** If we add Stripe, we store a Payment Link URL instead (see the Backlog in the project plan).
