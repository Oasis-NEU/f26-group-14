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

**HuskyExchange** is a marketplace where university students buy and sell items with each other: pickup points, item types, move-out timing, and in-person payment. See [README.md](README.md) for the requirements list.

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

### Layout

- [src/main.jsx](src/main.jsx): entry point
- [src/App.jsx](src/App.jsx): nav bar plus one `<Route>` per page. To add a page, create it in `src/pages/`, import it here, and add a `<Link>` and a `<Route>`.
- [src/pages/](src/pages/): one file per route: `home`, `feed`, `listing`, `editlisting`, `sell`, `profile`, `settings`, `signin`, `signup`, `resetpassword`
- [src/components/](src/components/):
  - `ui/`: generic building blocks with no app logic (Austin's design system lives here)
  - `auth/`: `RequireAuth`, `VerifyCodeForm`
  - `listings/`: `ListingCard`, `ListingForm`, `PriceRangeFilter`
- [src/lib/](src/lib/): non-UI helpers (`formatPrice`, `listingOptions`, `listingPhotos`, `shrinkImage`). Logic goes here so it can be unit tested
- [src/lib/supabase.js](src/lib/supabase.js): the one shared Supabase client. Import `supabase` from here; never create a second client.
- [supabase/migrations/](supabase/migrations/): timestamped schema changes. **Read [supabase/README.md](supabase/README.md) before your first `supabase db push`.** Never edit a migration that's already been applied.
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

## Project plan, ADRs, and work logs

Each developer owns one workstream and has a subagent for it. Start a session with: *"Use the `<agent>` agent to pick up my next task."*

| Dev | Subagent | Owns | Stack to connect (`/mcp`) |
|---|---|---|---|
| Austin | `design-system` | Full-time frontend: design system, 5 page templates (`/templates/*`) everyone copies, motion | frontend-design, Playwright |
| Adel | `account-and-deploy` | Sign-in, Settings, Home, Vercel deploys, CI | Vercel, Supabase Auth |
| Sanket | `feed-and-data` | Schema, RLS, storage, Feed, listing detail, auth hook, Vitest | Supabase |
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
