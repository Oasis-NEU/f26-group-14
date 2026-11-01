-- Adds a campus to listings (required) and to profiles (optional).
-- Run this once in the Supabase dashboard (SQL Editor), after profiles.sql.
-- This file is a record of what's set up in Supabase; it doesn't run from here.
-- The campus names must match CAMPUSES in src/lib/listingOptions.js exactly.


-- ============ Listings: which campus the item is at ============
-- Existing listings were all posted with Boston meetup spots, so they start as 'Boston'.
-- The default is then removed, so every new listing has to say its campus.

alter table public.listings
  add column campus text not null default 'Boston'
  check (campus in (
    'Boston', 'Arlington', 'Burlington', 'Charlotte', 'London', 'Miami', 'Nahant',
    'New York City', 'Oakland', 'Portland, Maine', 'Seattle', 'Silicon Valley', 'Toronto', 'Vancouver'
  ));

alter table public.listings alter column campus drop default;

-- Guests may see which campus an item is at.
grant select (campus) on public.listings to anon;


-- ============ Profiles: the user's home campus (optional) ============
-- Guests already can't read this: they only have access to profiles.id and first_name.

alter table public.profiles
  add column campus text
  check (campus in (
    'Boston', 'Arlington', 'Burlington', 'Charlotte', 'London', 'Miami', 'Nahant',
    'New York City', 'Oakland', 'Portland, Maine', 'Seattle', 'Silicon Valley', 'Toronto', 'Vancouver'
  ));

-- Let users change their own campus in Settings.
grant update (campus) on public.profiles to authenticated;


-- ============ Sign up: save the campus picked on the sign up form ============
-- Same as the version in profiles.sql, plus campus. An unknown campus is saved as empty (null)
-- instead of breaking the sign up.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  picked_campus text := new.raw_user_meta_data ->> 'campus';
begin
  insert into public.profiles (id, first_name, last_name, campus)
  values (
    new.id,
    coalesce(left(nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''), 50), 'Husky'),
    left(nullif(trim(new.raw_user_meta_data ->> 'last_name'), ''), 50),
    case
      when picked_campus in (
        'Boston', 'Arlington', 'Burlington', 'Charlotte', 'London', 'Miami', 'Nahant',
        'New York City', 'Oakland', 'Portland, Maine', 'Seattle', 'Silicon Valley', 'Toronto', 'Vancouver'
      ) then picked_campus
      else null
    end
  );
  return new;
end;
$$;
