-- Lets logged-out visitors ("guests") browse listings, WITHOUT seeing who posted them.
-- Run this once in the Supabase dashboard (SQL Editor), after listings.sql.
-- This file is a record of what's set up in Supabase; it doesn't run from here.

-- In Supabase, "anon" is the role for anyone who isn't logged in.

-- 1. Column permissions: guests may only read these columns. seller_email and seller_id
--    are left out, so students' emails can't be collected by people outside Northeastern.
revoke select on public.listings from anon;
grant select (
  id, title, description, price, category, condition,
  meetup_location, payment_methods, photo_url, status, created_at
) on public.listings to anon;

-- Guests can never add, change, or delete listings. (RLS already blocks this; this is a second lock.)
revoke insert, update, delete on public.listings from anon;

-- 2. Row permissions (RLS): guests may see every listing row, limited to the columns above.
create policy "Guests can view listings"
  on public.listings for select
  to anon
  using (true);
