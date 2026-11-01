# CLAUDE.md — HuskyExchange (f26-group-14)

Guidance for Claude Code (and humans) working in this repo.

## Claude: set up the team toolkit first

This team shares one set of Claude Code plugins and skills so everyone's Claude works the same way.

**At the start of a session, check that the plugins listed in [.claude/settings.json](.claude/settings.json) are installed and enabled.** If any are missing, tell the user which ones and give them the steps below before doing other work. Then use the skills in the table under "Which skill to use when". Don't skip a skill because a task looks small.

### Setup (once per teammate)

1. Pull `main` and open this folder in Claude Code. When it asks whether to trust the folder, say yes.
2. Claude Code reads `.claude/settings.json` and offers to install every plugin under `enabledPlugins`. They all come from Anthropic's official marketplace. Accept the prompt.
   - If no prompt appears, install them yourself:
     ```
     /plugin install superpowers@claude-plugins-official
     ```
     Repeat `/plugin install <name>` for each entry in `.claude/settings.json`, or open `/plugin` and pick them from the list.
3. Restart Claude Code. Run `/plugin` to confirm they're enabled. Then type `/` and check that `onboard-repo` is listed.
4. Some plugins connect to outside services and need you to sign in (run `/mcp`). Only sign in to the ones you use: Supabase, Vercel, Railway, Sentry, Resend.

**Project skills** in [.claude/skills/](.claude/skills/) load automatically with no install step. Right now that's `onboard-repo`.

## Which skill to use when

| When you're… | Use |
|---|---|
| New to the repo, or need to understand a part of it | `/onboard-repo` (add a question to focus it: `/onboard-repo how does sign-in work`) |
| Starting any new feature, page, or design | `superpowers:brainstorming`, then `superpowers:writing-plans` |
| Carrying out a plan | `superpowers:executing-plans` or `superpowers:subagent-driven-development` |
| Writing a feature or fixing a bug | `superpowers:test-driven-development` |
| Facing a bug or anything unexpected | `superpowers:systematic-debugging` (before proposing fixes) |
| About to say "done" or open a PR | `superpowers:verification-before-completion` |
| Building or restyling UI | `frontend-design:frontend-design` |
| Working with the database, auth, RLS, storage, or migrations | `supabase:supabase` and `supabase:supabase-postgres-best-practices` |
| Deploying or managing env vars | `vercel:deploy`, `vercel:env` (or `railway:use-railway` if we deploy there) |
| Looking up library docs (React 19, React Router 7, supabase-js) | `context7` (it serves current docs, not memory) |
| Committing, pushing, or opening a PR | `/commit`, `/commit-push-pr` |
| Reviewing a PR | `/code-review`, `/pr-review-toolkit:review-pr`, `/coderabbit:code-review` |
| Cleaning up code you just wrote | `code-simplifier` |
| Changing auth, payments, or user data | `/security-review`, `claude-security` |
| Testing the app in a browser | `playwright` or `chrome-devtools-mcp` |
| Updating this file | `claude-md-management:revise-claude-md` |

### Optional (personal, not auto-enabled)

- **archify**: turns architecture, flows, and ERDs into interactive HTML diagrams. Install it from https://github.com/tt-a1i/archify into `~/.claude/skills/archify`.
- **explanatory-output-style**: Claude explains its choices as it works. Good for learning; install it with `/plugin` if you want it.
- **Trail of Bits security skills** (`audit-context-building`, `agentic-actions-auditor`): these come from a third-party marketplace, so they're left out of the shared settings on purpose. To install them for yourself only: `/plugin marketplace add trailofbits/skills`, then `/plugin install <name>@trailofbits`.
- **remember**: keeps memory between sessions. Note that it writes a `.remember/` folder, so don't commit that folder.

## Project

**HuskyExchange** (renamed from Uni Swap, which is also a crypto product) is a marketplace where Northeastern students buy and sell items with each other. It covers all 14 NEU campuses, campus meetup spots, and in-person payment only (cash, Zelle, Cash App, Venmo). There's no payment processing. Most core features are already built; see "Where things stand" in [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md).

### Stack

- React 19 + Vite 8, plain JavaScript (`.jsx`, no TypeScript)
- React Router 7 (`react-router-dom`)
- Supabase (`@supabase/supabase-js`) for the backend, auth, and database
- There's no Express server, so Helmet doesn't apply. Security headers go in `vercel.json` ([ADR-0004](docs/adr/0004-security-headers.md)).
- Secrets (the Resend key, any Stripe secret) live only in Supabase Edge Function secrets, never in `VITE_` variables. RLS is the real access control ([ADR-0002](docs/adr/0002-react-vite-supabase-spa.md)).

### Commands

```
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run lint     # ESLint
```

The test runner (Vitest, `npm test`) is being added in task OPS-05. Every feature has required tests listed in [docs/workflow/testing.md](docs/workflow/testing.md); write them first. Until `npm test` exists, check your work with `npm run lint`, `npm run build`, and by opening the app.

- **Test accounts without email:** Supabase dashboard → Authentication → Users → Add user, with "Auto Confirm User" checked. The email must still be `@northeastern.edu`.
- **Check guest access:** use `curl "$VITE_SUPABASE_URL/rest/v1/listings?select=..." -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY"` after `set -a; . ./.env`. Asking for `seller_email` should return 42501 (permission denied).
- **After any schema change:** run the Supabase security advisors (Supabase MCP `get_advisors`).

### Layout

- [src/main.jsx](src/main.jsx): entry point
- [src/App.jsx](src/App.jsx): holds the session (`getSession` + `onAuthStateChange`), the nav, and every `<Route>`. Pages that need it get `session` as a prop. To add a page, create it in `src/pages/`, import it here, and add a `<Route>`.
- **Routes:** public: `/`, `/feed`, `/listing/:id`, `/signin`, `/signup`, `/reset-password`. Login required (wrapped in `RequireAuth`): `/sell`, `/settings`, `/profile/:id`, `/listing/:id/edit`.
- [src/components/](src/components/):
  - `ui/`: generic pieces with no app logic: `Avatar`, `ChipFilter` (Austin's design system grows here)
  - `auth/`: `RequireAuth` (redirects to `/signin` and remembers where you were), `VerifyCodeForm`
  - `listings/`: `ListingForm` (shared by Sell and Edit), `ListingCard`, `PriceRangeFilter`
- [src/lib/supabase.js](src/lib/supabase.js): the one shared Supabase client. Import `supabase` from here; never create a second client.
- [src/lib/listingOptions.js](src/lib/listingOptions.js): categories, conditions, payment methods, and the 14 campuses with their meetup spots. These names **must match the `check` constraints in `supabase/migrations/*.sql`** ([ADR-0010](docs/adr/0010-campuses-and-option-lists-in-code.md)), or inserts fail. Meetup spots aren't constrained.
- [supabase/migrations/](supabase/migrations/): the SQL that's live in Supabase, one timestamped file per feature (`restrict_to_northeastern`, `listings`, `guest_browsing`, `profiles`, `campuses`, `security_fixes`). These were applied by hand or through the Supabase MCP, so **read [supabase/README.md](supabase/README.md) before the first `supabase db push`**: the remote history has to be marked as applied first (DATA-02). Never edit an applied migration; add a new one.
- [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md): the team to-do list, with owners and task IDs (`FEED-03`, `SEC-02`, …)
- [docs/adr/](docs/adr/): Architecture Decision Records. [docs/workstreams/](docs/workstreams/): one log per developer
- [.claude/agents/](.claude/agents/): one subagent per developer's workstream

### Environment

Create a `.env` in the repo root (it's gitignored; **never commit it**):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Ask a teammate for the values. Only the publishable (anon) key belongs in the frontend. Never put the service-role key in a `VITE_` variable, because Vite bundles those into the browser.

`VITE_SUPABASE_URL` must end at `.supabase.co`. A `/rest/v1/` suffix breaks auth with "Invalid path specified in request URL". Restart `npm run dev` after editing `.env`.

### Gotchas

- **Guests (the `anon` role) only have column-level grants on `listings` and `profiles`.** Any query a logged-out user can trigger must list columns explicitly. `select('*')` fails for guests, and `seller_email` is never granted to them.
- **Loading data in `useEffect`:** call `setState` only after an `await`, and use an `ignore` flag in the cleanup (see `src/pages/profile.jsx`). The react-hooks lint rules flag synchronous `setState` in effects.
- **Auth emails go through custom SMTP**, moving from Gmail to Resend (`mail.huskyexchange.app`). Northeastern's Outlook silently dropped Gmail-sent codes. Until Resend is verified, new sign-ups can't receive their code.
- **Supabase Auth:** sign-in is email and password, with a 6-digit code to verify the email once ([ADR-0005](docs/adr/0005-auth-school-email-magic-link.md)). "Confirm email" is on and the minimum password length is 8. The Confirm signup and Reset Password templates use `{{ .Token }}` (a code, no links).

## Project plan, ADRs, and work logs

Each developer owns one workstream and has a subagent for it. Start a session with: *"Use the `<agent>` agent to pick up my next task."*

| Dev | Subagent | Owns | Stack to connect (`/mcp`) |
|---|---|---|---|
| Austin | `design-system` | Full-time frontend: design system, 5 page templates (`/templates/*`) everyone copies, motion | frontend-design, Playwright |
| Adel | `account-and-deploy` | Sign-in, Settings, Home, Vercel deploys, CI | Vercel, Supabase Auth |
| Sanket | `feed-and-data` | Schema, RLS, storage, Feed, listing detail, profiles, messaging, auth hook, Vitest | Supabase |
| Zane | `sell-email-security` | Sell flow, transactional email, security headers, RLS review, Sentry | Resend, Sentry, Supabase Edge Functions |

UI work: build from Austin's templates and `src/components/ui/`, and read `docs/guides/frontend-design.md` (once it exists) before using the `frontend-design` skill.

**How work flows:** follow [docs/workflow/](docs/workflow/README.md). It covers the session loop, branch and commit names, the PR template (`.github/pull_request_template.md`), review pairs, the definition of done, and the tests required for each task.

**Every Claude session, whether it's a subagent or not, follows these rules:**

1. Before starting, read the dev's section in [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) and the latest entries in `docs/workstreams/<name>.md`.
2. When starting a task, mark it `🚧 (branch-name)` in the plan. Put the task ID in the branch name and the PR title.
3. After each session or PR, add a dated entry to the top of that dev's workstream log, using the format in the file.
4. When you chose between real options, copy [docs/adr/0000-template.md](docs/adr/0000-template.md) to the next number with status Proposed, and add it to the [ADR index](docs/adr/README.md).
5. When the PR merges, tick `[x] (#PR)`. Put newly found work in the dev's section with the next ID, or in the Backlog.
6. Edit only your own section of the plan; cross-team items go under Shared.

## Conventions

- Keep commit messages short and in the imperative mood, e.g. "Add page routing with react-router".
- **Claude: don't credit yourself on commits or PRs.** When committing, pushing, or opening a PR, leave out the `Co-Authored-By: Claude ...` trailer and the "Generated with Claude Code" line. Commits and PRs should list only the teammate who asked for them as the author.
