# Sanket — Workstream log

- **Owns:** Supabase schema, migrations, RLS, storage, Feed, listing detail, profiles, **messaging**, server-side email-domain hook, reports, test runner
- **Claude subagent:** [`feed-and-data`](../../.claude/agents/feed-and-data.md). Start a session with *"Use the `feed-and-data` agent to pick up my next task."*
- **Stack connection:** **Supabase**: run `/mcp` and sign in to supabase
- **ADRs owned:** [0006 Data model & RLS](../adr/0006-data-model-and-rls.md), [0010 Campuses & option lists in code](../adr/0010-campuses-and-option-lists-in-code.md); messaging (0011) is next
- **Tasks:** see your section in [PROJECT_PLAN.md](../PROJECT_PLAN.md)

## Current focus

_Next up: merge the docs-sync PR, then **OPS-05** (Vitest, which everyone's tests depend on) and **TEST-01** (backfill tests for what's built), then **MSG-01** (messaging ADR). Keep an eye on **MAIL-02** (the Resend DNS check)._

## Open questions / blockers

- **Email delivery:** new users can't receive sign-up codes until Resend's `mail.huskyexchange.app` verifies (MAIL-02 → MAIL-03 with Zane and Adel). Meanwhile, use auto-confirmed test users.
- **DATA-12:** does the team still want retail price, move-out dates, and payment handles? They block SET-02/03/04, SELL-05, and MAIL-06.
- **"Leaked password protection"** is the last security-advisor warning (AUTH-08, Adel). It may need a paid Supabase plan.

## Log

Newest entry first, one per working session or PR. Your Claude writes these and you skim and correct them. Use this format:

```
### 2026-11-01 — Folders reorganized; security audit tasks (written by Ryan's Claude)

- **Did:** Moved `supabase/*.sql` into `supabase/migrations/`, with timestamps from the commit that added each file. Moved the components into `src/components/{ui,auth,listings}/`. Only import paths changed. Added `supabase/README.md`.
- **Decisions:** none. The move is the file half of DATA-02.
- **Next / blocked on:**
  - **Before any `supabase db push`, run the `migration repair` command in [supabase/README.md](../../supabase/README.md).** Otherwise the CLI will try to re-run the hand-applied SQL.
  - Five new tasks from the audit of #6: DATA-14 (signed-in users can read every seller's email), DATA-15 (sellers can set `created_at`), DATA-16 (URL columns accept anything), DATA-17 (no storage SELECT policy), AUTH-09 (email change skips the domain check). Zane reviews them under SEC-04.

### YYYY-MM-DD — Short title (TASK-IDs)
- **Did:** what changed, in a sentence or two
- **Files:** key files touched
- **Verified:** lint / build / screenshots / advisors / test email (what you actually ran)
- **Decisions:** ADR link, or "none"
- **Next / blocked on:** ...
```

### 2026-11-01 — Plan and docs synced with the built app (DATA-01, SH-01)

- **Did:** With the team lead's OK, updated the plan, ADRs, testing requirements, agents, and CLAUDE.md to match the code merged in #6. Ticked finished tasks, rewrote tasks that no longer matched (auth method, prices, routes, bucket names, "I'm interested" → messaging), added DATA-09..13, FEED-09, MSG-01..06, AUTH-07/08, SELL-06, TEST-01, SH-05/06, and moved messaging from the Backlog to my section.
- **Files:** `docs/PROJECT_PLAN.md`, `docs/adr/0005`, `0006`, `0007`, `0008`, new `0010-campuses-and-option-lists-in-code.md`, `docs/adr/README.md`, `docs/workflow/testing.md`, `.claude/agents/*.md`, `CLAUDE.md`, all four workstream logs
- **Verified:** the live schema, policies, buckets, and trigger checked with the Supabase MCP before rewriting ADR-0006
- **Decisions:** [ADR-0005](../adr/0005-auth-school-email-magic-link.md) revised (password plus a code once), [ADR-0006](../adr/0006-data-model-and-rls.md) rewritten (live schema), [ADR-0010](../adr/0010-campuses-and-option-lists-in-code.md) added
- **Next / blocked on:** SH-05, OPS-05

### 2026-11-01 — Security advisor fixes, Resend domain, team setup (DATA-11, MAIL-02, AUTH-03)

- **Did:** Ran the Supabase security advisors and fixed two warnings (pinned `search_path` on `restrict_to_northeastern`; revoked API access to `rls_auto_enable`). Found and fixed the live hook still allowing sign-ups with **no email**. Added `mail.huskyexchange.app` in Resend (DNS pending). Installed the team plugins and connected the Supabase, Resend, and context7 MCPs. Merged the team's CLAUDE.md, plan, and workflow docs into `page-setup`.
- **Files:** `supabase/security_fixes.sql`, `supabase/restrict_to_northeastern.sql`
- **Verified:** advisors re-run (only "leaked password protection" left). Hook called directly: `Test@Gmail.com` and a payload with no email are rejected, `Husky.H@Northeastern.edu` is accepted, and only `postgres`, `service_role`, and `supabase_auth_admin` can execute it.
- **Decisions:** none
- **Next / blocked on:** Resend DNS

### 2026-11-01 — Reassigned

- **Did:** Took over AUTH-03 (server-side school-email hook), SEC-07 (reports/abuse), and OPS-05 (Vitest) from Austin. Feed and Detail now copy Austin's TPL-02 and TPL-03.
- **Decisions:** none (team reshuffle; see the note at the top of PROJECT_PLAN.md)

### 2026-11-01 — Workstream created

- **Did:** Assigned in the project plan; subagent and log created.
- **Next / blocked on:** Phase 0 setup.

### 2026-10-31 — Listing page, campuses, accounts, profiles, Feed, rename (FEED-01/02/06/09, DATA-03/04/05/09/10, AUTH-02/05/07, SET-01, SELL-01/03/04)

- **Did:** Built most of the app in one push:
  - `listings` table plus RLS and a `listing-photos` bucket
  - Sell (photo from camera or library, shrunk in the browser), later moved into a shared `ListingForm` for Sell and Edit
  - guest browsing with column-level grants (no seller emails)
  - password accounts: sign up, sign in, reset password, change password with current-password check
  - `profiles` with an auto-create trigger, an `avatars` bucket, a profile page, and Settings
  - Feed with category / price slider / payment filters
  - 14 campuses with per-campus meetup spots (`listings.campus`, `profiles.campus`); the Feed defaults to your campus
  - listing page with Edit, Mark sold, and Delete (deletes the photo file too)
  - switched login codes to a 6-digit `{{ .Token }}` with no links, after Northeastern dropped emails
  - renamed the app to HuskyExchange
- **Files:** `supabase/listings.sql`, `guest_browsing.sql`, `profiles.sql`, `campuses.sql`; `src/pages/*`; `src/components/*`; `src/lib/*`; `src/App.jsx`; `src/App.css`
- **Verified:** `npm run lint` and `npm run build` after each step. Guest Feed and listing queries tested with curl and the anon key (they return listings and the seller's first name; `seller_email` is denied). Tested by hand in the browser.
- **Decisions:** guests can browse; prices are `numeric(10,2)`; option lists live in code ([ADR-0010](../adr/0010-campuses-and-option-lists-in-code.md)); passwords plus a code once ([ADR-0005](../adr/0005-auth-school-email-magic-link.md))
- **Next / blocked on:** email delivery to northeastern.edu

### 2026-10-30 — Server-side Northeastern-only rule (AUTH-03)

- **Did:** Added the "before user created" hook `public.restrict_to_northeastern`, so Supabase refuses to create accounts for non-`@northeastern.edu` emails.
- **Files:** `supabase/restrict_to_northeastern.sql`
- **Verified:** tested by temporarily skipping the form check; a Gmail address got the server's error
- **Decisions:** enforce on the server, not just in the form
- **Next / blocked on:** —

### 2026-10-25 — First login and route guard (AUTH-02, AUTH-05)

- **Did:** Built the magic-link login with Supabase, the session in `App.jsx`, sign out, and `RequireAuth` for Sell and Settings. Fixed `.env` (`VITE_SUPABASE_URL` had a `/rest/v1/` suffix). Fixed the ESLint config (`globals` was declared twice).
- **Files:** `src/pages/signin.jsx`, `src/App.jsx`, `src/components/RequireAuth.jsx`, `eslint.config.js`
- **Verified:** lint, build, and a manual login
- **Decisions:** none
- **Next / blocked on:** Supabase's built-in email rate limit

### 2026-10-04 to 2026-10-18 — Project setup

- **Did:** Vite + React app, Supabase client, page routing. Tried an Express server (`server/`, never committed); it isn't needed (ADR-0002, SH-06).
- **Files:** `src/lib/supabase.js`, `src/App.jsx`, `src/pages/*`
- **Decisions:** none
