-- Only lets people create an account with a @northeastern.edu email.
-- Run this in the Supabase dashboard (SQL Editor), then turn it on under
-- Authentication -> Hooks -> Before User Created (type: Postgres, function: restrict_to_northeastern).
-- This file is a record of what's set up in Supabase; it doesn't run from here.

create or replace function public.restrict_to_northeastern(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  user_email text;
begin
  user_email := lower(event->'user'->>'email');

  -- "is null" catches signups with no email at all (like phone sign-up).
  -- Without it, the "not like" check below would let them through.
  if user_email is null or user_email not like '%@northeastern.edu' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Please use your Northeastern email address.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

-- Only Supabase's login system may run this function, not regular users.
grant execute on function public.restrict_to_northeastern to supabase_auth_admin;
revoke execute on function public.restrict_to_northeastern from authenticated, anon, public;
