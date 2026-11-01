# 0003. Host the frontend on Vercel

- **Status:** Proposed
- **Date:** 2026-11-01
- **Owner:** Adel
- **Related tasks:** OPS-01, OPS-02, OPS-03, SEC-02

## Context

We need to host a static Vite build, get a preview deploy for each PR, and set custom response headers (ADR-0004). The team already has the Vercel and Railway plugins set up.

## Options considered

1. **Vercel**: free for static sites, preview deploy per PR, headers and SPA rewrites in one `vercel.json`, and the `vercel:deploy` / `vercel:env` skills are already installed.
2. **Railway**: runs containers. A good fit if we need a long-running server, but more than a static SPA needs.
3. **Netlify / Cloudflare Pages**: comparable to Vercel, but nobody has them set up.

## Decision (proposed)

Vercel. If we later need a long-running server (for example, Stripe webhooks), we either put it on Railway or use a Supabase Edge Function, and record that in a new ADR.

## Consequences

- `vercel.json` holds the SPA rewrite (OPS-03) and the security headers (SEC-02).
- Env vars are managed with `vercel env`. Preview and production get separate values.
