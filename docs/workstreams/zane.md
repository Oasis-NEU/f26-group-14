# Zane — Workstream log

- **Owns:** Sell flow, photo upload, listing expiry, all transactional email, security (Helmet-equivalent headers, RLS review, secrets, scans), Sentry
- **Claude subagent:** [`sell-email-security`](../../.claude/agents/sell-email-security.md). Start a session with *"Use the `sell-email-security` agent to pick up my next task."*
- **Stack connection:** **Resend** and **Sentry**: run `/mcp` and sign in to both. Supabase Edge Functions (ask Sanket for access)
- **ADRs owned:** [0004 Security headers](../adr/0004-security-headers.md), [0007 Email via Resend](../adr/0007-email-via-resend-edge-function.md)
- **Tasks:** see your section in [PROJECT_PLAN.md](../PROJECT_PLAN.md)

## Current focus

_Next up: MAIL-01 and MAIL-02 (Resend domain) and SEC-01 (finalize the headers ADR) while Sanket finalizes the schema, then SELL-01 from TPL-04._

## Open questions / blockers

- **Already built by Sanket and merged to `main` (#6), so don't rebuild it:** the Sell / Edit form (`src/components/listings/ListingForm.jsx`) with campus → meetup spot, a camera / library photo shrunk in the browser, and edit / mark sold / delete on the listing page (SELL-01/03/04). Resend domain `mail.huskyexchange.app` is added and waiting on DNS (MAIL-02); Supabase Auth SMTP currently uses Gmail and needs switching to Resend (MAIL-03). "I'm interested" became in-app messaging, so MAIL-05 is now the new-message email.

## Log

Newest entry first, one per working session or PR. Your Claude writes these and you skim and correct them. Use this format:

```
### YYYY-MM-DD — Short title (TASK-IDs)
- **Did:** what changed, in a sentence or two
- **Files:** key files touched
- **Verified:** lint / build / screenshots / advisors / test email (what you actually ran)
- **Decisions:** ADR link, or "none"
- **Next / blocked on:** ...
```

### 2026-11-16 — Demo onboarding, Messages tab, new Sell flow (ui-canva-restyle)
- **Did:** Added a slowly moving background, a sign-in onboarding screen as the demo's home page, Messages and Settings tabs, and a "Message seller" button on listings. Sell is now a hub with "+ New listing" (`/sell/new`). The form needs a photo, a description, and your Northeastern email, which must match the signed-in account (the same rule as the `listings` RLS policy).
- **Files:** `src/index.css`, `src/App.css`, `src/App.jsx`, `NavBar.jsx`, `ListingForm.jsx`, `DemoOnboarding.jsx` (new), `pages/messages.jsx` (new), `lib/conversations.js` + test (new), `pages/sell.jsx`, `pages/home.jsx`, `pages/listing.jsx`, `scripts/demo.js`
- **Verified:** `npm run lint`, `npm run build`, `npx vitest@3.2.4 run` (14 pass). Ran the demo in a headless browser: onboarding, non-NEU email rejected, each required field's error, posting with a photo, Message seller → send, Settings, 375px with no sideways scroll, no console errors.
- **Decisions:** Messages reads a `messages` table (`listing_id, sender_id, recipient_id, body, created_at`) that only the demo has. On the real database the tab says "coming soon". The table, RLS, and realtime are Sanket's MSG-* work; this is a proposed shape for it.
- **Next / blocked on:** MSG-* migration + RLS for `messages`; test the email rule against the real project.

### 2026-11-07 — Restyle the app to the Canva mockups (ui-canva-restyle)

- **Did:** Replaced the leftover Vite starter CSS with the Canva design: page gradient, glass panels, Inter + IBM Plex Mono, a new nav bar. Built the landing and HotDeals home, search and a hidden-by-default filter panel in the Item Browser, and a new `/orders` page.
- **Files:** `src/index.css`, `src/App.css`, `src/App.jsx`, `src/components/layout/*`, `src/pages/{home,feed,sell,orders}.jsx`, `src/lib/{hotDeals,search}.js`, `docs/ui-redesign/`
- **Verified:** lint and build pass; 9 Vitest tests pass with `npx vitest@3.2.4 run`. Every page checked in a browser at 1280px and 375px against a local stand-in for Supabase. Not yet run against the real project.
- **Decisions:** fonts are self-hosted from npm to keep the CSP at `'self'` (see [docs/ui-redesign/README.md](../ui-redesign/README.md))
- **Next / blocked on:** Austin's review (FE-03); a smarter `pickHotDeals()` rule; SEC-01/02 headers on their own branch

### 2026-11-01 — Reassigned

- **Did:** Took over SEC-01..06, SEC-09 (security headers, RLS review, secrets, scan), and OPS-06 (Sentry) from Austin. Subagent `sell-and-email` was renamed to `sell-email-security`.
- **Decisions:** none (team reshuffle; see the note at the top of PROJECT_PLAN.md)

### 2026-11-01 — Workstream created

- **Did:** Assigned in the project plan; subagent and log created.
- **Next / blocked on:** Phase 0 setup.
