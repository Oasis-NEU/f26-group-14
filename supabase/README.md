# supabase/

Database schema for HuskyExchange. Sanket owns this folder ([ADR-0006](../docs/adr/0006-data-model-and-rls.md)).

## migrations/

Every schema change is a SQL file named `YYYYMMDDHHMMSS_short_name.sql`. Files run in name order, and each one builds on the ones before it, so **never edit a migration that's already been applied.** Add a new one instead.

| File | What it does |
|---|---|
| `20261030132100_restrict_to_northeastern.sql` | Auth hook function that rejects non-`@northeastern.edu` signups |
| `20261031021300_listings.sql` | `listings` table, RLS, `listing-photos` bucket and its storage policies |
| `20261031134400_guest_browsing.sql` | Lets signed-out visitors view listings |
| `20261031140700_profiles.sql` | `profiles` table, RLS, signup trigger, avatars bucket |
| `20261031143700_campuses.sql` | Campus column on listings and profiles; updates the signup trigger |
| `20261101123100_security_fixes.sql` | Security-advisor fixes: pins the email hook's `search_path`, and blocks API calls to `rls_auto_enable` |

## ⚠️ Before the first `supabase db push`

These six files were first run by hand in the Supabase SQL editor. Then, on 2026-11-01, they were moved here and given timestamps based on when each was committed. The Supabase CLI doesn't know they've already been applied, so `supabase db push` would try to run them again and fail partway through.

Run this once to mark them as applied:

```
supabase link --project-ref <ref>
supabase migration repair --status applied 20261030132100 20261031021300 20261031134400 20261031140700 20261031143700 20261101123100
supabase migration list   # every row should show both Local and Remote
```

After that, new migrations go through the normal flow: `supabase migration new <name>`, then `supabase db push`.

## Not stored in SQL

- **The email-domain hook has to be turned on in the dashboard.** Go to Authentication → Hooks → "Before User Created" → `public.restrict_to_northeastern`. The migration only creates the function.
- Auth settings (SMTP, rate limits, redirect URLs) are set in the dashboard. Write down any change you make in your workstream log.

## tests/ (coming)

pgTAP tests for RLS go in `supabase/tests/` and run with `supabase test db`. The required cases are listed in [docs/workflow/testing.md](../docs/workflow/testing.md).
