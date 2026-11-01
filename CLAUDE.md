# CLAUDE.md — Uni Swap (f26-group-14)

Guidance for Claude Code (and humans) working in this repo.

## Claude: set up the team toolkit first

This team shares one set of Claude Code plugins and skills so everyone's Claude works the same way.

**At the start of a session, check that the plugins listed in [.claude/settings.json](.claude/settings.json) are installed and enabled.** If any are missing, tell the user which ones and give them the steps below before doing other work. Then use the skills in the table under "Which skill to use when". Don't skip a skill because a task looks small.

### Setup (once per teammate)

1. Pull `main` and open this folder in Claude Code. When it asks whether to trust the folder, say yes.
2. Claude Code reads `.claude/settings.json` and offers to install the `trailofbits` marketplace and every plugin under `enabledPlugins`. Accept the prompt.
   - If no prompt appears, install them yourself:
     ```
     /plugin marketplace add trailofbits/skills
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
- **remember**: keeps memory between sessions. Note that it writes a `.remember/` folder, so don't commit that folder.

## Project

**Uni Swap** is a marketplace where university students buy and sell items with each other: pickup points, item types, move-out timing, and in-person payment. See [README.md](README.md) for the requirements list.

### Stack

- React 19 + Vite 8, plain JavaScript (`.jsx`, no TypeScript)
- React Router 7 (`react-router-dom`)
- Supabase (`@supabase/supabase-js`) for the backend, auth, and database

### Commands

```
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run lint     # ESLint
```

There's no test runner yet. Check your work with `npm run lint`, `npm run build`, and by opening the app.

### Layout

- [src/main.jsx](src/main.jsx): entry point
- [src/App.jsx](src/App.jsx): nav bar plus one `<Route>` per page. To add a page, create it in `src/pages/`, import it here, and add a `<Link>` and a `<Route>`.
- [src/pages/](src/pages/): `home`, `feed`, `sell`, `settings`, `signin`
- [src/lib/supabase.js](src/lib/supabase.js): the one shared Supabase client. Import `supabase` from here; never create a second client.

### Environment

Create a `.env` in the repo root (it's gitignored; **never commit it**):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Ask a teammate for the values. Only the publishable (anon) key belongs in the frontend. Never put the service-role key in a `VITE_` variable, because Vite bundles those into the browser.

### Conventions

- Keep commit messages short and in the imperative mood, e.g. "Add page routing with react-router".
