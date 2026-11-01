# Uni Swap: Project Plan

This is the team's to-do list, and it changes as we go. Everyone updates it, and so does everyone's Claude.

**Team:** Adel · Sanket · Zane · Austin  **Plan created:** 2026-11-01

---

## How to use this file

- **Find your section** under [Workstreams](#workstreams). Every task has an ID, like `FEED-03`. Put the ID in your branch name, PR title, and commits. For example, branch `feed-03-filters` and commit "FEED-03: Add category filter".
- **Statuses:**
  - `- [ ]` not started
  - `- [ ] 🚧 (branch-name)` in progress
  - `- [x] (#PR)` merged to `main`
- **Adding work:** put new tasks in your own section with the next free ID. If a task isn't clearly yours, put it in [Backlog](#backlog-unclaimed) and claim it by adding your name.
- **Edit your own section only.** Four people changing the same lines means merge conflicts. Cross-team items go in [Shared](#shared).
- **Decisions go in ADRs** ([docs/adr/](adr/)). If you picked between real options (a library, a schema shape, where code runs), write an ADR. Small choices don't need one.
- **Your Claude keeps your log** in [docs/workstreams/](workstreams/). See [Documentation rules](#documentation-rules).

---

## Team and ownership

| Person | Owns | Stack connection (connect with `/mcp`) | Claude subagent | Log |
|---|---|---|---|---|
| **Adel** | The **design template** everyone copies, plus the Settings and Home pages | `frontend-design` plugin; Playwright / Chrome DevTools MCP for screenshots (no sign-in needed); Figma connector if we mock up there | [`design-system`](../.claude/agents/design-system.md) | [adel.md](workstreams/adel.md) |
| **Sanket** | Database schema, RLS, storage, Feed, listing detail | **Supabase** MCP plus `supabase:supabase` and `supabase:supabase-postgres-best-practices` | [`feed-and-data`](../.claude/agents/feed-and-data.md) | [sanket.md](workstreams/sanket.md) |
| **Zane** | Sell flow (create, edit, mark sold) and all transactional email | **Resend** MCP plus `resend:*` skills; Supabase Edge Functions | [`sell-and-email`](../.claude/agents/sell-and-email.md) | [zane.md](workstreams/zane.md) |
| **Austin** | Sign-in and auth, security headers (Helmet-equivalent), deploys, monitoring, CI | **Vercel** and **Sentry** MCPs plus `vercel:*` and `sentry:*`; `/security-review`, `claude-security` | [`auth-and-security`](../.claude/agents/auth-and-security.md) | [austin.md](workstreams/austin.md) |

To start a session in your area, tell Claude: *"Use the `<your-agent>` agent to pick up my next task."*

---

## Phases and critical path

```
Phase 0  Setup (day 1, everyone)
Phase 1  Foundations: unblocks everyone else
         DS-01..06 template · DATA-01..04 schema+RLS · AUTH-01..05 sign-in · OPS-01..04 deploy+CI · MAIL-01..03 email plumbing
Phase 2  Core flows
         FEED-* · SELL-* · SET-* · MAIL-04..09 · SEC-*
Phase 3  Hardening and launch
         SH-03 end-to-end test · SEC-09 security scan · OPS-07 prod deploy · SH-04 launch checklist
```

**Dependencies to know about**

- **No one waits on the template.** Write your logic with plain markup first. Switch to components from `src/components/ui/` once DS-04 lands, then copy the `/styleguide` page (DS-06).
- **Sell writes to the tables Sanket designs.** Sanket, Zane, and Adel agree on the `listings` columns in ADR-0006 (SH-01) before anyone builds UI against them.
- **"I'm interested" crosses three people.** Sanket owns the button (FEED-06), Sanket owns the `interests` table (DATA-02), and Zane owns the email that fires (MAIL-05).
- **Sign-in emails go through Resend SMTP.** Zane verifies the domain (MAIL-02) and Austin wires it into Supabase Auth (MAIL-03 / AUTH-02).
- **Every table needs RLS before it ships.** Sanket writes the policies and Austin reviews them (SEC-04).

---

## Phase 0: Setup (everyone, first day)

Copy this block into your own log and tick it off there.

- [ ] Pull `main`, open in Claude Code, and accept the plugin install prompt ([CLAUDE.md](../CLAUDE.md) → Setup)
- [ ] Get the `.env` values from a teammate. **Never commit `.env`.**
- [ ] Run `/mcp` and sign in to **your** stack provider (table above)
- [ ] Check your subagent loads: *"Use the `<your-agent>` agent to summarize my workstream and first task"*
- [ ] Make sure `npm run dev` shows the app

---

## Workstreams

### Adel: Design template, Settings, Home

**Stack:** `frontend-design:frontend-design` for all UI work. Playwright or Chrome DevTools MCP to screenshot at phone (390px) and desktop (1280px) widths.
**Subagent:** `design-system` · **ADR:** [0008](adr/0008-design-system-and-styling.md)

> **The template comes first.** Everyone else copies what you build in DS-02 through DS-07, so ship those before Settings.

**Design template**
- [ ] **DS-01** Finalize ADR-0008 (styling approach: plain CSS / CSS Modules / Tailwind) and get a 👍 from the team
- [ ] **DS-02** Design tokens in `src/styles/tokens.css`: colors (light and dark), type scale, spacing, radius, shadows. Remove the Vite starter styles from `index.css` and `App.css`
- [ ] **DS-03** App shell: responsive nav with a mobile menu, page container, footer. This replaces the `|`-separated links in [App.jsx](../src/App.jsx)
- [ ] **DS-04** Core components in `src/components/ui/`: Button, Input/Textarea/Select, Card, Badge, Avatar, Modal, Toast, EmptyState, Spinner/Skeleton
- [ ] **DS-05** `ListingCard`: photo, title, price vs. retail ("save 60%"), pickup point, "moving out soon" badge. Agree on its props with Sanket
- [ ] **DS-06** **`/styleguide` template page** showing every component plus one sample page layout. This is the page everyone copies
- [ ] **DS-07** `src/components/ui/README.md`: how to use each component, dos and don'ts, how to add a new one
- [ ] **DS-08** Accessibility pass: focus rings, labels, color contrast, keyboard navigation, `prefers-reduced-motion`

**Settings page (`/settings`)**
- [ ] **SET-01** Profile: display name, avatar upload (Supabase Storage), residence hall, grad year
- [ ] **SET-02** Move-out date. It drives the "moving out soon" urgency badges
- [ ] **SET-03** Payment handles: Venmo, Zelle, payment link (shown on your listings). **Never ask for card numbers or API keys**
- [ ] **SET-04** Notification preferences (interest emails, reminders). Zane's emails read these
- [ ] **SET-05** Account: sign out, delete account (pair with Austin)

**Home page (`/`)**
- [ ] **HOME-01** Signed-out landing: what Uni Swap is, how it works, sign-in button
- [ ] **HOME-02** Signed-in home: recent listings and a "moving out soon" strip (reuse Sanket's feed helpers)

---

### Sanket: Data model, Supabase, Feed

**Stack:** Supabase MCP (`/mcp` → supabase) with the `supabase:supabase` and `supabase:supabase-postgres-best-practices` skills. You own the schema. Anyone else changes tables only after checking with you.
**Subagent:** `feed-and-data` · **ADR:** [0006](adr/0006-data-model-and-rls.md)

**Data**
- [ ] **DATA-01** Finalize ADR-0006 (tables, relationships, RLS approach) with Zane and Adel (SH-01)
- [ ] **DATA-02** Set up the Supabase CLI in the repo. Migrations go in `supabase/migrations/`: `profiles`, `listings`, `listing_images`, `categories`, `pickup_points`, `residence_halls`, `interests`, `reports`
- [ ] **DATA-03** RLS on **every** table (see ADR-0006 for the policy matrix)
- [ ] **DATA-04** Trigger that creates a `profiles` row when a user signs up
- [ ] **DATA-05** Storage bucket `listing-images`: users can only write to their own folder, with size and MIME limits
- [ ] **DATA-06** Seed data: categories, campus pickup points (buildings, lobbies), residence halls with move-out dates, fake listings for dev
- [ ] **DATA-07** Indexes for the feed queries (status, category, created_at, pickup_point, gone_by)
- [ ] **DATA-08** Data helpers in `src/lib/listings.js` (`fetchFeed`, `fetchListing`, `createInterest`, …) so pages never write raw queries

**Feed (`/feed`)**
- [ ] **FEED-01** Feed grid built from `ListingCard`, with loading, empty, and error states
- [ ] **FEED-02** Filters: category, price range, pickup point, condition, "seller moves out within N days"
- [ ] **FEED-03** Search on title and description (Postgres full-text)
- [ ] **FEED-04** Sort: newest, price, ending soonest
- [ ] **FEED-05** Pagination or infinite scroll
- [ ] **FEED-06** Listing detail at `/listings/:id`: photos, price vs. retail, pickup point, availability, seller's payment handles, and an **"I'm interested"** button that inserts into `interests` (triggers MAIL-05)
- [ ] **FEED-07** *(stretch)* Realtime: new listings show up without a refresh
- [ ] **FEED-08** *(stretch)* Save/favorite listings

---

### Zane: Sell flow, Email (Resend)

**Stack:** Resend MCP (`/mcp` → resend) with `resend:resend`, `resend:react-email`, and `resend:email-best-practices`. Ask Sanket for access to deploy Supabase Edge Functions.
**Subagent:** `sell-and-email` · **ADR:** [0007](adr/0007-email-via-resend-edge-function.md)

**Sell (`/sell`)**
- [ ] **SELL-01** Create-listing form: title, description, category, condition, price, original retail price, photos, pickup point, available-from and must-be-gone-by dates, accepted payment methods
- [ ] **SELL-02** Validation, friendly error messages, and a preview step before publishing
- [ ] **SELL-03** "My listings": edit, mark sold, delete, relist
- [ ] **SELL-04** Photos: resize and compress in the browser before upload, reorder, remove. Uploads go to the DATA-05 bucket
- [ ] **SELL-05** Auto-expire listings after their gone-by date (pair with Sanket: `pg_cron` or a query filter)

**Email**
- [ ] **MAIL-01** Finalize ADR-0007: send from a Supabase Edge Function with `RESEND_API_KEY` stored as a Supabase secret, **never** in a `VITE_` variable
- [ ] **MAIL-02** Verify a sending domain in Resend (the Resend test sender is fine for dev)
- [ ] **MAIL-03** Point Supabase Auth's custom SMTP at Resend so magic-link emails don't hit Supabase's built-in rate limit (pair with Austin)
- [ ] **MAIL-04** `send-email` Edge Function plus React Email templates matching Adel's tokens
- [ ] **MAIL-05** "Someone is interested in your listing" email to the seller, fired by an `interests` insert
- [ ] **MAIL-06** Scheduled reminder: "your listing expires in 3 days / you move out soon"
- [ ] **MAIL-07** Welcome email after first sign-in
- [ ] **MAIL-08** Respect notification preferences (SET-04) and include an unsubscribe link
- [ ] **MAIL-09** Abuse guard: at most one interest email per buyer per listing

---

### Austin: Auth, Security, Deploy

**Stack:** Vercel MCP (`/mcp` → vercel) with `vercel:deploy` and `vercel:env`; Sentry MCP with `sentry:*`. Run `/security-review` on every auth or user-data PR.
**Subagent:** `auth-and-security` · **ADRs:** [0003](adr/0003-hosting-on-vercel.md), [0004](adr/0004-security-headers.md), [0005](adr/0005-auth-school-email-magic-link.md)

**Auth**
- [ ] **AUTH-01** Finalize ADR-0005 (sign-in method and allowed email domains)
- [ ] **AUTH-02** Sign-in page at `/signin`: magic link or 6-digit OTP through Supabase Auth
- [ ] **AUTH-03** Enforce school email **on the server** with Supabase's "before user created" auth hook. A check in the form alone is not enough
- [ ] **AUTH-04** `AuthProvider` and a `useSession()` hook in `src/lib/auth.jsx`, subscribed to `onAuthStateChange`
- [ ] **AUTH-05** `<RequireAuth>` guard for `/sell`, `/settings`, and listing actions. Send users back where they were after sign-in
- [ ] **AUTH-06** Sign out and expired-session handling

**Security**
- [ ] **SEC-01** Finalize ADR-0004. Helmet is Express middleware and we have no Express server, so the same headers go in `vercel.json`
- [ ] **SEC-02** Ship the headers: CSP (Report-Only first), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'`, `Permissions-Policy`, COOP. Check them with securityheaders.com and a Playwright assertion
- [ ] **SEC-03** If we ever add a Node/Express server (for example, Stripe webhooks), use `helmet()` there. Note it in ADR-0004
- [ ] **SEC-04** Review every RLS policy Sanket ships. Run the Supabase security advisors. Prove an anon key can't read private data or write anything
- [ ] **SEC-05** Input safety: no `dangerouslySetInnerHTML` with user content; check upload type and size; cap text lengths
- [ ] **SEC-06** Secrets hygiene: `.env` and `.remember/` gitignored, GitHub secret scanning on, only the publishable key in `VITE_` variables
- [ ] **SEC-07** Abuse: tune the Supabase auth rate limits; add a "Report listing" button and `reports` flow (with Sanket)
- [ ] **SEC-08** Terms and fraud-prevention page: in-person payment only, meet in public campus spots, never prepay, common scams
- [ ] **SEC-09** Run a `claude-security` scan before launch and fix or ticket every finding

**Ops**
- [ ] **OPS-01** Finalize ADR-0003. Link the repo to Vercel and turn on a preview deploy for every PR
- [ ] **OPS-02** Env vars in Vercel (`vercel:env`) for preview and production
- [ ] **OPS-03** SPA rewrite in `vercel.json` so deep links like `/feed` don't 404
- [ ] **OPS-04** GitHub Action that runs `npm ci`, `npm run lint`, and `npm run build` on every PR
- [ ] **OPS-05** Add Vitest and React Testing Library so the team can do TDD (`superpowers:test-driven-development`)
- [ ] **OPS-06** Sentry for React: errors and releases, with PII scrubbed
- [ ] **OPS-07** Production deploy and custom domain

---

## Shared

- [ ] **SH-01** Agree on the `listings` columns (Sanket, Zane, Adel) and record them in ADR-0006
- [ ] **SH-02** Weekly check-in: everyone's plan section and log are current, plus a 5-minute demo each
- [ ] **SH-03** End-to-end Playwright test: sign in → create listing → shows in feed → "I'm interested" → seller gets email
- [ ] **SH-04** Launch checklist: all P1 tasks done, security scan clean, prod env vars set, rollback plan written

---

## Backlog (unclaimed)

Add your name to claim one, then move it into your section with an ID.

- **Stripe "for show."** The seller pastes a Stripe **Payment Link** URL, and we show it next to Venmo and Zelle. ⚠️ The README says to collect "their stripe API key". **Don't.** A secret key lets whoever holds it move the seller's money, and storing them makes us a target. A Payment Link gives the same button with no secret.
- Buyer↔seller messaging inside the app
- Residence-hall move-out guidelines page (data comes from `residence_halls`)
- Bundles ("moving-out sale": several items, one pickup)
- Suggested price based on retail price and condition
- Admin view for reported listings
- Installable PWA

---

## Documentation rules

These apply to every teammate **and their Claude**. [CLAUDE.md](../CLAUDE.md) repeats them so every Claude session follows them automatically.

1. **Before you start:** read your section here and the latest entries in your `docs/workstreams/<name>.md`.
2. **Starting a task:** mark it `🚧 (branch-name)` here.
3. **After each working session or PR:** add a dated entry to your workstream log (what you did, files touched, decisions, what's next or blocking you).
4. **When you made a real decision:** copy [docs/adr/0000-template.md](adr/0000-template.md) to the next number with status **Proposed** and add it to [the index](adr/README.md). A teammate reviews it in the PR, and it becomes **Accepted** when merged.
5. **On merge:** tick `[x]` and add the PR number.
6. **Found new work?** Add it to your section with the next ID, or to the Backlog.
