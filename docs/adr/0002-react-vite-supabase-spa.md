# 0002. React + Vite SPA on Supabase, no custom server

- **Status:** Accepted (documents what's already in the repo)
- **Date:** 2026-11-01
- **Owner:** Team

## Context

The repo already has React 19, Vite 8, React Router 7, and `@supabase/supabase-js`, all in plain JavaScript. Supabase gives us Postgres, auth, file storage, and Edge Functions, so we don't have to run a backend of our own.

## Decision

- The app is a static single-page app. Every page talks to Supabase through the one client in `src/lib/supabase.js`.
- **No Express/Node server** unless a later ADR adds one.
- Code that needs a secret (like the Resend API key, or any future Stripe secret) runs in a **Supabase Edge Function**, never in the browser.

## Consequences

- **The browser is untrusted.** Anyone can call Supabase directly with the publishable key, so **row-level security (RLS) is our real access control**. A check that only lives in React code is a UX hint, not security. See ADR-0006.
- Security headers can't come from Express middleware like Helmet. They have to come from the host. See ADR-0004.
- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are allowed in `VITE_` variables, because Vite builds every `VITE_` variable into the browser bundle.
