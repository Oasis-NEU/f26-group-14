-- Fixes for warnings from Supabase's security advisor (2026-11-01).
-- This file is a record of what's set up in Supabase; it doesn't run from here.

-- 1. Pin restrict_to_northeastern's search_path, so it always uses Postgres's built-in
--    functions (lower, like, ...) and can't be tricked into using a lookalike.
--    (restrict_to_northeastern.sql now includes this too, for anyone running it fresh.)
alter function public.restrict_to_northeastern(jsonb) set search_path = '';

-- 2. rls_auto_enable is Supabase's helper that turns on Row Level Security for every new table
--    automatically. It only needs to run as an event trigger, so nobody should be able to call
--    it through the API. Revoking EXECUTE doesn't stop the trigger from working.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
