# 0007. Transactional email through Resend from Edge Functions

- **Status:** Proposed
- **Date:** 2026-11-01
- **Owner:** Zane
- **Related tasks:** MAIL-01 through MAIL-09

## Context

We need to email students: "someone's interested", move-out reminders, a welcome email, and the sign-in links. Resend's API key is a secret. Per ADR-0002, a secret can't go in a `VITE_` variable because Vite builds those into the browser bundle.

## Options considered

1. **Supabase Edge Function calls Resend**: the key stays a Supabase secret, and the function can be triggered by a database webhook (for example, on an `interests` insert) or on a schedule (`pg_cron`).
2. **Vercel serverless function calls Resend**: also secure, but splits our backend across two platforms.
3. **Call Resend from the browser**: leaks the key. Rejected.

## Decision (proposed)

- One `send-email` Edge Function. `RESEND_API_KEY` is set with `supabase secrets set` and never stored in the repo.
- Triggers:
  - an `interests` insert → seller email (MAIL-05)
  - a daily `pg_cron` job → expiry and move-out reminders (MAIL-06)
  - first sign-in → welcome email (MAIL-07)
- Templates are built with React Email and use Austin's design tokens.
- Supabase Auth's SMTP is also pointed at Resend, so the sign-in emails share the same verified domain (MAIL-03).

## Consequences

- Zane needs Supabase access to deploy functions (coordinate with Sanket).
- The function checks the user's notification preferences (SET-04) before sending, and enforces one email per buyer per listing (MAIL-09).
- A verified sending domain is required before launch. Until then, dev uses Resend's test sender.
