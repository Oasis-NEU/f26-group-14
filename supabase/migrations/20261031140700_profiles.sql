-- User profiles (name, bio, profile picture), created automatically when someone signs up.
-- Run this once in the Supabase dashboard (SQL Editor), after listings.sql and guest_browsing.sql.
-- This file is a record of what's set up in Supabase; it doesn't run from here.


-- ============ The profiles table ============
-- One row per user. Its id IS the user's login id, so the two are always linked.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 50),
  last_name text check (char_length(last_name) <= 50), -- optional, so it can be empty (null)
  bio text not null default '' check (char_length(bio) <= 500),
  avatar_url text,
  created_at timestamptz not null default now()
);


-- ============ Security rules ============

alter table public.profiles enable row level security;

-- Everyone may look at profile rows; the column permissions below limit what guests see.
create policy "Anyone can view profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- You can only edit your own profile.
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Guests only get first names (for "Posted by Alex" on listings). Logged-in users get everything.
revoke select on public.profiles from anon;
grant select (id, first_name) on public.profiles to anon;

-- Logged-in users can only change these four columns (not their id or created_at).
revoke update on public.profiles from authenticated;
grant update (first_name, last_name, bio, avatar_url) on public.profiles to authenticated;

-- Nobody creates or deletes profiles directly: the trigger below creates them,
-- and deleting a user deletes their profile automatically (on delete cascade).
revoke insert, delete on public.profiles from anon, authenticated;
revoke update on public.profiles from anon;


-- ============ Create a profile automatically at sign up ============
-- The sign up form sends first_name and last_name along with the email and password.
-- Supabase stores those in raw_user_meta_data. This trigger copies them into profiles.
-- "security definer" lets it write to profiles even though users can't insert directly.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(left(nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''), 50), 'Husky'),
    left(nullif(trim(new.raw_user_meta_data ->> 'last_name'), ''), 50)
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Give anyone who signed up before this file existed a profile too (they can rename themselves in Settings).
insert into public.profiles (id, first_name)
select id, 'Husky' from auth.users
on conflict (id) do nothing;


-- ============ Link listings to profiles ============
-- Lets the app ask for a listing together with its seller's name in one request.

alter table public.listings
  add constraint listings_seller_id_profiles_fkey
  foreign key (seller_id) references public.profiles (id) on delete cascade;

-- Guests need seller_id to look up the seller's first name. (seller_email stays hidden from them.)
grant select (seller_id) on public.listings to anon;


-- ============ Profile picture storage ============
-- Each user has one picture at avatars/<user id>/avatar. Public so <img> tags can show it.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- You can only add, replace, or delete the picture in your own folder.
-- (Replacing an existing file needs "select" permission as well as "update".)
create policy "Users can view their own avatar files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can replace their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
