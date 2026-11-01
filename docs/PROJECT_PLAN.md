# HuskyExchange: Project Plan

This is the team's to-do list, and it changes as we go. Everyone updates it, and so does everyone's Claude.

**Team:** Adel · Sanket · Zane · Austin  **Plan created:** 2026-11-01  **Last synced with the code:** 2026-11-01 (PR #6)  **Demo day:** around Nov 13–20

> **2026-11-01 reshuffle:** Austin moved to full-time frontend: the design system, five page templates, and motion. Adel's design-template tasks (DS-\*) moved to Austin. Austin's auth, security, and ops tasks were split between Adel, Sanket, and Zane. Task IDs didn't change, and moved tasks say *(from …)*.
>
> **2026-11-01 sync:** the app was renamed from Uni Swap to **HuskyExchange** (Uniswap is a crypto product). This plan was also updated to match the code already built on `page-setup` (see below). Tasks that are already done are ticked `(#6)`, the PR that merged them, and tasks whose description no longer matched the real app were rewritten.

---

## Where things stand (read this first)

Most of the core app is **already built** (merged to `main` in PR #6) and runs against the live Supabase project. Sanket built it while the rest of the team was away. **Before you start a task, check whether it's ticked**, so nobody rebuilds working code. What's left on built pages is mostly **restyling them onto Austin's templates** and **backfilling the required tests** (TEST-01).

**Working today:**
- **Accounts:** sign up (first name, optional last name, optional campus, NEU email, password) → 6-digit code emailed once → log in with email and password. Also forgot password and change password (current password required). Northeastern-only is enforced on the server.
- **Profiles** `/profile/:id`: picture, name, campus, bio, and items for sale and sold. Edited in Settings.
- **Sell** `/sell` and **Edit** `/listing/:id/edit`: campus → meetup spot (per campus), category, condition, price, payment methods, and one photo (camera or library, shrunk in the browser).
- **Feed** `/feed`: filters for campus, category, price (two-handle slider plus number boxes), and payment method. Defaults to the user's campus if one is set. Guests can browse.
- **Listing page** `/listing/:id`: all details plus seller info. Buyers get "Email seller" and "Make an offer" (mailto links for now, to be replaced by messaging). The owner gets Edit, Mark sold/available, and Delete.
- **Security:** RLS on every table and bucket. Guests can't read seller emails or profile details. The Supabase security advisor is clean except "leaked password protection".

**Biggest risks for the demo:**
1. **Email delivery.** Auth codes sent through Gmail never reached northeastern.edu inboxes, so new users can't finish signing up. We're switching to Resend at `mail.huskyexchange.app`, and its DNS verification is pending (MAIL-02, MAIL-03).
2. **No test runner yet** (OPS-05), and the built features have no tests (TEST-01).
3. **In-app messaging** (MSG-\*), which replaces the mailto buttons and the old "I'm interested" idea.
4. **Templates and styling** (Austin). Pages use temporary styles in `src/App.css`.
5. **Deploy** (OPS-\*).

---

## How to use this file

- **Find your section** under [Workstreams](#workstreams). Every task has an ID, like `FEED-03`. Put the ID in your branch name, PR title, and commits. For example, branch `feed-03-search` and commit "FEED-03: Add full-text search to feed".
- **Statuses:**
  - `- [ ]` not started
  - `- [ ] 🚧 (branch-name)` in progress
  - `- [x] (#PR)` merged to `main`
  - **(partial)** means part of the task is done, and the rest is spelled out on the task
- **Adding work:** put new tasks in your own section with the next free ID. If a task isn't clearly yours, put it in [Backlog](#backlog-unclaimed) and claim it by adding your name.
- **Edit your own section only.** Four people changing the same lines means merge conflicts. Cross-team items go in [Shared](#shared).
- **Decisions go in ADRs** ([docs/adr/](adr/)). If you picked between real options (a library, a schema shape, where code runs), write an ADR. Small choices don't need one.
- **Your Claude keeps your log** in [docs/workstreams/](workstreams/). See [Documentation rules](#documentation-rules).
- **How work gets done** (the session loop, branches and PRs, review pairs, and **the tests each task requires**) is in [docs/workflow/](workflow/README.md).

---

## Team and ownership

| Person | Owns | Stack connection (connect with `/mcp`) | Claude subagent | Log |
|---|---|---|---|---|
| **Austin** | **Full-time frontend:** design system, **5 page templates** everyone copies, motion and animation | `frontend-design` skill (learn it first); Playwright / Chrome DevTools MCP for screenshots and performance traces (no sign-in needed) | [`design-system`](../.claude/agents/design-system.md) | [austin.md](workstreams/austin.md) |
| **Adel** | Sign-in and sessions, Settings, Home, Vercel deploys, CI, Terms page | **Vercel** MCP plus `vercel:*`; Supabase Auth | [`account-and-deploy`](../.claude/agents/account-and-deploy.md) | [adel.md](workstreams/adel.md) |
| **Sanket** | Database schema, RLS, storage, Feed, listing detail, profiles, **messaging**, the server-side email-domain hook, reports, test runner | **Supabase** MCP plus `supabase:supabase` and `supabase:supabase-postgres-best-practices` | [`feed-and-data`](../.claude/agents/feed-and-data.md) | [sanket.md](workstreams/sanket.md) |
| **Zane** | Sell flow, all transactional email, **security** (Helmet-equivalent headers, RLS review, secrets, scans), Sentry | **Resend** and **Sentry** MCPs plus `resend:*`, `sentry:*`; `/security-review`, `claude-security` | [`sell-email-security`](../.claude/agents/sell-email-security.md) | [zane.md](workstreams/zane.md) |

To start a session in your area, tell Claude: *"Use the `<your-agent>` agent to pick up my next task."*

---

## Phases and critical path

```
Phase 0  Setup (day 1, everyone)
         SH-05 ✅ page-setup merged to main (#6). Pull main before starting
Phase 1  Foundations: unblocks everyone else
         OPS-05 test runner (every task needs tests: docs/workflow/testing.md) → TEST-01 backfill
         FE-01..02 learn frontend-design · DS-01..06 tokens+components · MOTION-01..02
         DATA schema+RLS ✅ · AUTH sign-in ✅ · MAIL-02/03 Resend 🚧 · OPS-01..04 deploy+CI
Phase 2  Templates and core flows
         TPL-02 → TPL-04 → TPL-03 → TPL-05 → TPL-01 (order follows who needs which first)
         Restyle built pages onto templates · MSG-* messaging · FEED-03..05 · SET-02..05 · HOME-* · MAIL-04..09 · SEC-* · MOTION-03..05
Phase 3  Hardening and launch
         SH-03 end-to-end test · SEC-09 security scan · FE-03 template review · OPS-07 prod deploy · SH-04 launch
```

**Dependencies to know about**

- **`page-setup` is merged (#6).** Pull `main` and branch new work off it.
- **No one waits on the templates.** Most pages already work with plain markup. When the matching template lands, copy its layout and swap in components from `src/components/ui/`, without changing behavior.
- **Which template each page copies:**

  | Template (Austin) | Copied by | Page already built? |
  |---|---|---|
  | TPL-01 Landing | HOME-01 (Adel) | No |
  | TPL-02 Browse | FEED-01..05 (Sanket) | Yes: `src/pages/feed.jsx` |
  | TPL-03 Detail | FEED-06 (Sanket) | Yes: `src/pages/listing.jsx` |
  | TPL-04 Form flow | SELL-01/02 (Zane), SET-01..04 and AUTH-02 (Adel) | Yes: `ListingForm.jsx`, `settings.jsx`, `signin/signup/resetpassword.jsx` |
  | TPL-05 Manage | SELL-03 (Zane), SET-05 (Adel) | Partly: actions live on the listing page and profile |

- **Sell writes to the tables Sanket owns.** The real columns are in ADR-0006. Ask Sanket before adding or changing a column.
- **Campus, category, condition, and payment-method lists live in `src/lib/listingOptions.js`** and must match the database `check` rules (ADR-0010).
- **Messaging crosses three people.** Sanket owns the tables, RLS, and pages (MSG-\*). Zane owns the "you have a new message" email (MAIL-05). Austin's TPL-03 shows the "Message seller" bar.
- **Sign-in emails go through Resend SMTP.** The domain `mail.huskyexchange.app` is added in Resend and waiting on DNS (MAIL-02). Supabase Auth SMTP gets switched from Gmail to Resend once it's verified (MAIL-03, Zane with Adel).
- **`vercel.json` has two owners.** Adel creates it (SPA rewrite, OPS-03) and Zane adds the security headers (SEC-02). Whoever goes second rebases.
- **Every table needs RLS before it ships.** Sanket writes the policies and Zane reviews them (SEC-04).

---

## Phase 0: Setup (everyone, first day)

Copy this block into your own log and tick it off there.

- [ ] Pull `main`, open in Claude Code, and accept the plugin install prompt ([CLAUDE.md](../CLAUDE.md) → Setup)
- [ ] Get the `.env` values from a teammate. **Never commit `.env`.** `VITE_SUPABASE_URL` ends at `.supabase.co`, with no `/rest/v1/`.
- [ ] Run `/mcp` and sign in to **your** stack provider (table above)
- [ ] Check your subagent loads: *"Use the `<your-agent>` agent to summarize my workstream and first task"*
- [ ] Make sure `npm run dev` shows the app
- [ ] Make a test account until email delivery works: Supabase → Authentication → Users → Add user → `yourname.test@northeastern.edu`, with "Auto Confirm User" checked

---

## Workstreams

### Austin: Frontend (full time). Design system, 5 page templates, motion

**Stack:** `frontend-design:frontend-design` for all UI work, which you learn first (FE-01). Playwright or Chrome DevTools MCP to screenshot at phone (390px) and desktop (1280px) widths, and to record performance traces. Use `context7` for React Router 7 view transitions.
**Subagent:** `design-system` · **ADRs:** [0008](adr/0008-design-system-and-styling.md), [0009](adr/0009-motion-and-animation.md)

> **Everyone copies what you build.** Get FE-01, FE-02, and DS-01 through DS-04 out first, then build the templates in the order given under Phases. Most real pages already exist with temporary styles in `src/App.css`, so open them (`/feed`, `/listing/1`, `/sell`, `/settings`, `/profile/<id>`, `/signup`) to see the real content each template must hold.

**Learn the frontend-design skill**
- [ ] **FE-01** Read the `frontend-design` skill from start to finish, then use it to build a throwaway practice page on a scratch branch. In your log, write down three things: its two-pass process (token plan → critique against the brief → build), its list of "generic AI look" defaults to avoid, and its motion rule (one orchestrated moment; motion answers what the user did; no fade-up on every section)
- [ ] **FE-02** Write `docs/guides/frontend-design.md`, the team's brief for the skill. Cover:
  - the subject (a Northeastern marketplace across 14 campuses)
  - the audience (students, mostly on phones)
  - the primary job (find or sell something fast)
  - our aesthetic direction, the dos and don'ts, and a copy-paste prompt
  - Everyone reads it before building UI

**Design system** *(DS-\* from Adel)*
- [ ] **DS-01** Finalize ADR-0008 (styling approach) and get a 👍 from the team
- [ ] **DS-02** Design tokens in `src/styles/tokens.css`: colors (light and dark), type scale, spacing, radius, shadows, **motion** (durations and easings). Remove the leftover Vite starter styles (`.counter`, `.hero`, …) from `index.css` and `App.css`. Keep the page classes until their pages are restyled (listed in ADR-0008)
- [ ] **DS-03** App shell: responsive nav with a mobile menu, a HuskyExchange wordmark, page container, footer. This replaces the `|`-separated links in [App.jsx](../src/App.jsx). The nav differs for guests (Sign in, Create account) and members (My profile, Settings, Sign out)
- [ ] **DS-04** Core components in `src/components/ui/`: Button, Input/Textarea/Select, Card, Badge, Avatar (move `src/components/ui/Avatar.jsx` here), Modal, Drawer, Toast, EmptyState, Spinner/Skeleton
- [ ] **DS-05** Restyle the existing [`ListingCard`](../src/components/listings/ListingCard.jsx): photo, price, title, campus · meetup spot, seller first name, Sold badge. Price-vs-retail and "moving out soon" badges wait on DATA-12. Agree on its props with Sanket
- [ ] **DS-06** `/styleguide` page: every component, every state, every motion token
- [ ] **DS-07** `src/components/ui/README.md`: how to use each component, dos and don'ts, how to add a new one
- [ ] **DS-08** Accessibility pass: focus rings, labels, contrast, keyboard navigation, `prefers-reduced-motion`

**Motion**
- [ ] **MOTION-01** Finalize ADR-0009 (CSS plus View Transitions first, the `motion` library only if needed)
- [ ] **MOTION-02** Motion tokens and a global `prefers-reduced-motion` switch that turns them off
- [ ] **MOTION-03** Page transitions with React Router's `viewTransition`, including the listing photo morphing from the card in Browse into the hero image in Detail
- [ ] **MOTION-04** Motion that answers what the user did:
  - modal and drawer open/close
  - toast in/out
  - button press
  - skeleton crossfading into content
  - a "Published" confirmation
  - photo reorder in the Sell form (once SELL-06 exists)
- [ ] **MOTION-05** Performance check: only animate `transform`/`opacity`. Record a Chrome DevTools performance trace at 4x CPU throttle and confirm no dropped frames

**Five page templates.** Each one is a route at `/templates/<name>`, uses real HuskyExchange copy and fake data, and is responsive, accessible, and animated.
- [ ] **TPL-01 Landing** (signed-out home): a hero that shows real-looking listings, how it works, and Sign in / Create account calls to action. This page gets the app's **one** orchestrated page-load moment
- [ ] **TPL-02 Browse**: filter bar (it becomes a drawer on mobile) holding the **real filters**: campus select, category chips, two-handle price slider plus number boxes, payment-method chips. Plus a responsive card grid, skeletons, empty / no-matches / error states, and an infinite-scroll loader
- [ ] **TPL-03 Detail**: photo (gallery later, DATA-13), price, condition, category, campus, meetup spot, accepted payment methods, seller card (avatar and name linking to the profile), a sticky **"Message seller" / "Make an offer"** bar on mobile, owner actions (Edit, Mark sold, Delete), safety tips, and the shared-element transition from Browse
- [ ] **TPL-04 Form flow**: multi-step form with a stepper, inline validation, photo picker (camera + library) with preview, dependent selects (campus → meetup spot), review step, success state
- [ ] **TPL-05 Manage**: a "my stuff" list with status badges, row actions, confirm modal, toasts
- [ ] **FE-03** Template review: when each teammate's page lands, compare it to its template (screenshots at 390px and 1280px) and leave PR comments

---

### Adel: Sign-in, Settings, Home, Deploy

**Stack:** Vercel MCP (`/mcp` → vercel) with `vercel:deploy` and `vercel:env`, plus Supabase Auth (through the `supabase:supabase` skill). Build every page from Austin's templates. Run `/security-review` on auth PRs.
**Subagent:** `account-and-deploy` · **ADRs:** [0003](adr/0003-hosting-on-vercel.md), [0005](adr/0005-auth-school-email-magic-link.md)

> **Sign-in and the Settings profile are already built** (see the revised ADR-0005). Please review and restyle them rather than rebuild. Your biggest open items are deploy (OPS-\*), Home, and the rest of Settings.

**Sign-in and sessions** *(from Austin)*
- [ ] **AUTH-01** Review the revised ADR-0005 (email and password, plus a 6-digit code to verify the email once) and mark it Accepted, or push back
- [x] **AUTH-02** (#6) `/signin` (email and password), `/signup` (name, campus, email, password → code), `/reset-password` (email → code → new password). The shared code step is `src/components/auth/VerifyCodeForm.jsx`. **Still to do:** restyle onto TPL-04, plus tests (TEST-01)
- [ ] **AUTH-04** (partial) The session lives in `App.jsx` and is passed to pages as a prop. **Still to do:** move it into an `AuthProvider` and a `useSession()` hook in `src/lib/auth.jsx`, subscribed to `onAuthStateChange`
- [x] **AUTH-05** (#6) `<RequireAuth>` guards `/sell`, `/settings`, `/profile/:id`, and `/listing/:id/edit`, and sends users back to where they were after signing in
- [ ] **AUTH-06** (partial) Sign out works (nav button). **Still to do:** go to `/` after signing out, and handle expired sessions gracefully
- [x] **AUTH-07** (#6) Change password in Settings requires the current password
- [ ] **AUTH-08** Turn on "Prevent use of leaked passwords" in Supabase Auth, if the plan allows it (the last open security-advisor warning)

**Settings page (`/settings`)**
- [x] **SET-01** (#6) Profile: first and last name, avatar upload (`avatars` bucket, shrunk to 400px), bio, campus. *(Residence hall and grad year were dropped; see DATA-12.)* **Still to do:** restyle onto TPL-04
- [ ] **SET-02** Move-out date. It drives the "moving out soon" urgency badges (needs DATA-12)
- [ ] **SET-03** Payment handles: Venmo, Zelle, payment link (shown on your listings). **Never ask for card numbers or API keys** (needs DATA-12)
- [ ] **SET-04** Notification preferences (new-message emails, reminders). Zane's emails read these (needs DATA-12)
- [ ] **SET-05** Account: delete account. *(Sign out is in the nav)*

**Home page (`/`)**
- [ ] **HOME-01** Signed-out landing, copied from TPL-01
- [ ] **HOME-02** Signed-in home: recent listings from your campus (reuse Sanket's feed helpers) and a "moving out soon" strip once DATA-12 exists

**Deploy and CI** *(from Austin)*
- [ ] **OPS-01** Finalize ADR-0003. Link the repo to Vercel and turn on a preview deploy for every PR
- [ ] **OPS-02** Env vars in Vercel (`vercel:env`) for preview and production
- [ ] **OPS-03** Create `vercel.json` with the SPA rewrite so deep links like `/feed` and `/listing/7` don't 404 (Zane adds headers to it in SEC-02)
- [ ] **OPS-04** GitHub Action that runs `npm ci`, `npm run lint`, and `npm run build` on every PR (add `npm test` once OPS-05 lands)
- [ ] **OPS-08** Protect `main` on GitHub: require a PR, 1 approval, and green CI; no direct pushes ([branches-and-prs.md](workflow/branches-and-prs.md))
- [ ] **OPS-07** Production deploy on a custom domain (for example, `huskyexchange.app`, the domain used for email). Add the production URL to Supabase Auth's allowed redirect URLs
- [ ] **SEC-08** *(from Austin)* (partial) The listing page already shows safety tips. **Still to do:** a Terms and fraud-prevention page: in-person payment only, meet in public campus spots, never prepay, common scams

---

### Sanket: Data model, Supabase, Feed, profiles, messaging

**Stack:** Supabase MCP (`/mcp` → supabase) with the `supabase:supabase` and `supabase:supabase-postgres-best-practices` skills. You own the schema. Anyone else changes tables only after checking with you.
**Subagent:** `feed-and-data` · **ADRs:** [0006](adr/0006-data-model-and-rls.md), [0010](adr/0010-campuses-and-option-lists-in-code.md)

**Test runner** *(from Austin)*
- [ ] **OPS-05** **Do this first: everyone's tests depend on it.** Add Vitest, React Testing Library, user-event, jest-dom, and jsdom; add `npm test` and `npm run test:watch`; add a shared mock for `src/lib/supabase.js`. Follow the stack in [testing.md](workflow/testing.md)
- [ ] **TEST-01** Backfill the required tests for features already built (merged in #6) (see "Already built: backfill" in [testing.md](workflow/testing.md)). Each owner writes the tests for their area. Sanket writes the shared mock and the first examples

**Data**
- [x] **DATA-01** (#6) ADR-0006 rewritten to match the live schema (`listings`, `profiles`, two buckets, policies). Zane and Austin review it in the docs-sync PR
- [ ] **DATA-02** (partial) Schema is live. The SQL is now ordered, timestamped files in `supabase/migrations/` (moved in the reorganize PR). **Still to do:** set up the Supabase CLI and run `supabase migration repair` so the remote history matches ([supabase/README.md](../supabase/README.md)). Then confirm a fresh project rebuilds in one command
- [x] **DATA-03** (#6) RLS on every table and bucket: `listings` (guests and members read, guests without `seller_email`; owner writes), `profiles` (guests get `id` and `first_name` only; owner updates 5 columns), `listing-photos` and `avatars` buckets (owner's folder only). **Still to do:** pgTAP tests (TEST-01) and Zane's review (SEC-04)
- [x] **DATA-04** (#6) Trigger `on_auth_user_created` creates a `profiles` row from the sign-up form (first name, last name, campus)
- [x] **DATA-05** (#6) Storage bucket **`listing-photos`** (public read, 5 MB, JPEG/PNG/WebP, `<uid>/` folders) plus an **`avatars`** bucket (2 MB)
- [ ] **DATA-06** (partial) Campuses, meetup spots, categories, and conditions live in `src/lib/listingOptions.js` (ADR-0010). **Still to do:** a seed script with fake listings across campuses for dev and the demo
- [ ] **DATA-07** (partial) Indexes exist on `(status, created_at desc)` and `seller_id`. **Still to do:** check whether `campus` / `category` filters need indexes once there's real data (`EXPLAIN`)
- [ ] **DATA-08** Data helpers in `src/lib/listings.js` (`fetchFeed`, `fetchListing`, `fetchProfile`, …), so pages stop writing raw queries. Today Feed, listing, profile, and ListingForm each query Supabase directly
- [x] **DATA-09** (#6) Campuses: required `listings.campus` and optional `profiles.campus`, checked against the 14 NEU campuses. Guests can see a listing's campus but not a profile's
- [x] **DATA-10** (#6) Guest browsing: the `anon` role gets column-level `select` on `listings` (no `seller_email`) and on `profiles` (`id`, `first_name`)
- [x] **DATA-11** (#6) Security-advisor fixes: pinned `search_path` on `restrict_to_northeastern`, revoked API access to `rls_auto_enable`, blocked sign-ups with no email
- [ ] **DATA-12** Plan-era columns that aren't built yet. Add them only if the team still wants them: `retail_price`, `available_from` / `gone_by` (listings), `move_out_date`, `venmo_handle`, `zelle_contact`, `payment_link_url`, notification preferences (profiles). These unblock SET-02/03/04, SELL-05, and MAIL-06
- [ ] **DATA-13** Multiple photos per listing (`listing_images` table with a `position` order). Pairs with SELL-06

**Security fixes from the audit of #6** (Zane reviews them under SEC-04; each one needs a pgTAP test, see testing.md)
- [ ] **DATA-14** Signed-in users can read **every seller's email** straight from the API. The `authenticated` select policy on `listings` is `using (true)` with no column grants, unlike `anon`. Either give signed-in users column grants too, or serve the email only through the listing page's contact action
- [ ] **DATA-15** `listings` has no column-level insert/update grants (`profiles` has them). A seller can set `created_at` to a future date and pin their listing to the top of the feed, which sorts by `created_at desc`. Grant insert/update only on the columns users should set
- [ ] **DATA-16** `photo_url` and `avatar_url` take any URL, and every viewer's browser loads it, guests included. That allows tracking pixels or files that skip the bucket limits. Store bucket paths, or add a check that the URL is in our own storage. Cap `meetup_location` length too
- [ ] **DATA-17** `listing-photos` has insert, update, and delete policies but no SELECT policy. Storage `remove()` may need SELECT, so deleting a replaced photo could fail silently and leave orphaned public files. Test it, and add an owner-only SELECT policy if needed
- [ ] **AUTH-09** The "before user created" hook only runs at signup. Check what stops a user from changing their email to a non-NEU address (`updateUser({ email })`), and block it on the server if nothing does
- [x] **AUTH-03** *(from Austin)* (#6) The school email domain is enforced **on the server** by the "before user created" hook `public.restrict_to_northeastern`. It rejects non-`@northeastern.edu` emails and missing emails. Checked with direct calls. **Still to do:** a pgTAP test (TEST-01)
- [ ] **SEC-07** *(from Austin)* Abuse: tune the Supabase auth rate limits; add a "Report listing" button and `reports` flow

**Feed (`/feed`)**
- [x] **FEED-01** (#6) Feed grid of `ListingCard`s, newest first, available only, with loading, empty, no-matches, and error states. Open to guests. **Still to do:** restyle onto TPL-02
- [x] **FEED-02** (#6) Filters: campus (defaults to the user's profile campus), category chips, price range (two-handle slider plus number boxes), accepted payment methods. Debounced; filtering happens in the database. *(Condition and move-out filters aren't built.)* **Still to do:** keep the filters in the URL query string
- [ ] **FEED-03** Search on title and description (Postgres full-text)
- [ ] **FEED-04** Sort: newest, price low→high, high→low
- [ ] **FEED-05** Pagination or infinite scroll
- [x] **FEED-06** (#6) Listing detail at **`/listing/:id`**: photo, price, condition, category, campus, meetup spot, payment methods, description, and seller (name and picture linking to the profile for members; first name only for guests). The owner gets Edit, Mark sold/available, and Delete. Includes safety tips. *"I'm interested" is replaced by messaging (MSG-03).* **Still to do:** restyle onto TPL-03
- [ ] **FEED-07** *(stretch)* Realtime: new listings show up without a refresh
- [ ] **FEED-08** *(stretch)* Save/favorite listings
- [x] **FEED-09** (#6) Profile page `/profile/:id` (login required): picture, name, campus, member since, bio, for-sale and sold listings

**Messaging** *(claimed from the Backlog, 2026-11-01)*
- [ ] **MSG-01** ADR-0011: messaging design (a conversation per listing and buyer, Supabase Realtime vs. polling, RLS so only the two people in a conversation can read it)
- [ ] **MSG-02** `conversations` and `messages` tables plus RLS and pgTAP tests, in the same migration
- [ ] **MSG-03** "Message seller" and "Make an offer" on the listing page start or open a conversation. They replace the current mailto links
- [ ] **MSG-04** Inbox page (all your conversations, latest message, unread marker) and a conversation page
- [ ] **MSG-05** Live updates with Supabase Realtime
- [ ] **MSG-06** Abuse guards: can't message your own listing, a message length cap, report a conversation (with SEC-07)

---

### Zane: Sell flow, Email (Resend), Security

**Stack:** Resend MCP (`/mcp` → resend) with `resend:resend`, `resend:react-email`, and `resend:email-best-practices`. Sentry MCP with `sentry:*`. Run `/security-review` and `claude-security` for the security work. Ask Sanket for access to deploy Supabase Edge Functions.
**Subagent:** `sell-email-security` · **ADRs:** [0004](adr/0004-security-headers.md), [0007](adr/0007-email-via-resend-edge-function.md)

> **Sell is already built** ([`src/components/listings/ListingForm.jsx`](../src/components/listings/ListingForm.jsx), shared by `/sell` and `/listing/:id/edit`). Your open Sell work is restyling onto TPL-04, the extras below, and tests. Email and security are wide open.

**Sell (`/sell`)**
- [x] **SELL-01** (#6) Create-listing form: title, description, category, condition, price, campus → meetup spot, accepted payment methods, one photo. *(Original retail price and available/gone-by dates wait on DATA-12.)* **Still to do:** restyle onto TPL-04
- [ ] **SELL-02** (partial) Validation and friendly error messages are done (inline in `ListingForm.jsx`). **Still to do:** move validation into a tested `validateListing()` in `src/lib/`, and add a preview step before publishing
- [x] **SELL-03** (#6) Edit, mark sold, mark available again (relist), and delete, all on the listing page. "My listings" is currently the user's profile page. **Still to do:** a TPL-05 "My listings" page with confirm modals, if the team wants one
- [x] **SELL-04** (#6) Photos: take with the camera or pick from the library, resized to 1600px JPEG in the browser (`src/lib/shrinkImage.js`), preview, remove. Old files are deleted from storage when replaced. *(Multiple photos and reordering moved to SELL-06)*
- [ ] **SELL-05** Auto-expire listings after their gone-by date (needs DATA-12; pair with Sanket: `pg_cron` or a query filter)
- [ ] **SELL-06** Multiple photos per listing with reorder (needs DATA-13)

**Email**
- [ ] **MAIL-01** Finalize ADR-0007: send from a Supabase Edge Function with `RESEND_API_KEY` stored as a Supabase secret, **never** in a `VITE_` variable
- [ ] **MAIL-02** 🚧 (Sanket) Domain **`mail.huskyexchange.app`** added in Resend, waiting on DNS verification. Then add a DMARC record
- [ ] **MAIL-03** (partial) Supabase Auth already uses custom SMTP (currently Gmail, which Northeastern's Outlook drops), with templates that send a 6-digit `{{ .Token }}` and no links. **Still to do (pair with Adel):** switch SMTP to Resend (`smtp.resend.com`, port 465, user `resend`) once MAIL-02 verifies, test delivery to a husky inbox, then delete the Gmail app password
- [ ] **MAIL-04** `send-email` Edge Function plus React Email templates matching Austin's tokens
- [ ] **MAIL-05** "You have a new message" email, fired by a `messages` insert (MSG-02). This replaces the old "someone is interested" email
- [ ] **MAIL-06** Scheduled reminder: "your listing expires in 3 days / you move out soon" (needs DATA-12)
- [ ] **MAIL-07** Welcome email after first sign-in
- [ ] **MAIL-08** Respect notification preferences (SET-04) and include an unsubscribe link
- [ ] **MAIL-09** Abuse guard: don't send more than one new-message email per conversation per hour

**Security** *(from Austin)*
- [ ] **SEC-01** Finalize ADR-0004. Helmet is Express middleware and we have no Express server, so the same headers go in `vercel.json`
- [ ] **SEC-02** Add the headers to `vercel.json` (after Adel's OPS-03): CSP (Report-Only first), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'`, `Permissions-Policy`, COOP. Check them with securityheaders.com and a Playwright assertion. The CSP's `img-src` must allow the Supabase storage URL (listing photos and avatars)
- [ ] **SEC-03** If we ever add a Node/Express server (for example, Stripe webhooks), use `helmet()` there. Note it in ADR-0004
- [ ] **SEC-04** (partial) Supabase security advisors run and fixed (DATA-11). Guest access was checked with curl (seller emails are denied). **Still to do:** review every policy in `supabase/migrations/*.sql`, and prove an anon key can't read private data or write anything
- [ ] **SEC-05** (partial) No `dangerouslySetInnerHTML` anywhere; uploads are checked for type and size; text lengths are capped in the database and the forms. **Still to do:** the ESLint ban and the tests in testing.md
- [ ] **SEC-06** (partial) `.env` is gitignored and only the publishable key is in `VITE_` variables. **Still to do:** add `.remember/` to `.gitignore` and turn on GitHub secret scanning
- [ ] **SEC-09** Run a `claude-security` scan before launch and fix or ticket every finding
- [ ] **OPS-06** *(from Austin)* Sentry for React: errors and releases, with PII scrubbed. Add Sentry's ingest URL to the CSP

---

## Shared

- [x] **SH-01** (#6) `listings` columns recorded in ADR-0006. Zane and Austin review them in the docs-sync PR
- [ ] **SH-02** Weekly check-in: everyone's plan section and log are current, plus a 5-minute demo each
- [ ] **SH-03** End-to-end Playwright test: sign up → create listing → shows in feed → message the seller → seller sees the message (and the email function is called)
- [ ] **SH-04** Launch checklist: all P1 tasks done, security scan clean, prod env vars set, rollback plan written
- [x] **SH-05** (#6) `page-setup` merged to `main`, so everyone builds on the real app
- [ ] **SH-06** Delete the unused local `server/` Express folder (never committed). ADR-0002 says there's no custom server

---

## Backlog (unclaimed)

Add your name to claim one, then move it into your section with an ID.

- **Stripe "for show."** The seller pastes a Stripe **Payment Link** URL, and we show it next to Venmo and Zelle. ⚠️ The old README said to collect "their stripe API key". **Don't.** A secret key lets whoever holds it move the seller's money, and storing them makes us a target. A Payment Link gives the same button with no secret.
- ~~Buyer↔seller messaging inside the app~~ → claimed by Sanket (MSG-\*)
- Residence-hall move-out guidelines page
- Bundles ("moving-out sale": several items, one pickup)
- Suggested price based on retail price and condition
- Admin view for reported listings
- Installable PWA
- Laptop webcam capture on Sell (phones already open the camera)

---

## Documentation rules

These apply to every teammate **and their Claude**. [CLAUDE.md](../CLAUDE.md) repeats them so every Claude session follows them automatically.

1. **Before you start:** read your section here and the latest entries in your `docs/workstreams/<name>.md`.
2. **Starting a task:** mark it `🚧 (branch-name)` here.
3. **After each working session or PR:** add a dated entry to your workstream log (what you did, files touched, decisions, what's next or blocking you).
4. **When you made a real decision:** copy [docs/adr/0000-template.md](adr/0000-template.md) to the next number with status **Proposed** and add it to [the index](adr/README.md). A teammate reviews it in the PR, and it becomes **Accepted** when merged.
5. **On merge:** tick `[x]` and add the PR number.
6. **Found new work?** Add it to your section with the next ID, or to the Backlog.
