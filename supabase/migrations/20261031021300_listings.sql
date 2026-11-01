-- The listings table (everything people post for sale) plus a storage bucket for photos.
-- Run this once in the Supabase dashboard (SQL Editor).
-- This file is a record of what's set up in Supabase; it doesn't run from here.


-- ============ The listings table ============

create table public.listings (
  id bigint generated always as identity primary key,

  -- Who posted it. Both default to the logged-in user, so the app doesn't have to send them.
  seller_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  seller_email text not null default (auth.jwt() ->> 'email'),

  title text not null check (char_length(title) between 1 and 100),
  description text not null default '' check (char_length(description) <= 2000),
  price numeric(10, 2) not null check (price >= 0),
  category text not null
    check (category in ('Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Dorm & Kitchen', 'Other')),
  condition text not null
    check (condition in ('New', 'Like new', 'Good', 'Fair')),
  meetup_location text not null,
  payment_methods text[] not null
    check (cardinality(payment_methods) >= 1
      and payment_methods <@ array['Cash', 'Zelle', 'Cash App', 'Venmo']),
  photo_url text,
  status text not null default 'available' check (status in ('available', 'sold')),
  created_at timestamptz not null default now()
);

-- Indexes make common lookups fast: the feed (newest available first) and "my listings".
create index listings_status_created_at_idx on public.listings (status, created_at desc);
create index listings_seller_id_idx on public.listings (seller_id);


-- ============ Security rules (Row Level Security) ============
-- With RLS on, nobody can do anything with this table unless a policy below allows it.
-- (select auth.uid()) is the id of whoever is logged in. Wrapping it in "select" makes
-- Postgres look it up once per query instead of once per row.

alter table public.listings enable row level security;

-- Logged-in students can see all listings. Logged-out visitors can't (keeps seller emails private).
create policy "Logged-in users can view listings"
  on public.listings for select
  to authenticated
  using (true);

-- You can only post a listing as yourself.
create policy "Users can create their own listings"
  on public.listings for insert
  to authenticated
  with check (
    seller_id = (select auth.uid())
    and seller_email = (select auth.jwt() ->> 'email')
  );

-- You can only edit your own listings (e.g. mark as sold), and can't hand them to someone else.
create policy "Users can update their own listings"
  on public.listings for update
  to authenticated
  using (seller_id = (select auth.uid()))
  with check (
    seller_id = (select auth.uid())
    and seller_email = (select auth.jwt() ->> 'email')
  );

-- You can only delete your own listings.
create policy "Users can delete their own listings"
  on public.listings for delete
  to authenticated
  using (seller_id = (select auth.uid()));


-- ============ Photo storage ============
-- A "bucket" is a folder in Supabase Storage. Public = anyone with a photo's link can view it,
-- which is what lets <img> tags show the photos. Limited to 5 MB images.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Each user uploads into a folder named after their user id, e.g. listing-photos/<user id>/desk.jpg.
-- These rules make sure you can only add, change, or delete files in your own folder.
create policy "Users can upload photos to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update their own photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
