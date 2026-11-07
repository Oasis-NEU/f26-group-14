# HuskyExchange

A marketplace where Northeastern students buy and sell things to each other: textbooks, furniture, dorm gear, and anything else. Only people with a `@northeastern.edu` email can sign up, so you're always meeting another student. Built by Oasis group 14 (Fall 2026).

## What it does

- **Northeastern-only accounts:** sign up with your NEU email and a password; a one-time code confirms the email is yours.
- **Sell in a minute:** title, price, condition, category, a photo (straight from your phone camera), your campus, and a meetup spot on that campus.
- **Browse and filter** by campus (all 14 NEU campuses), category, price, and payment method. You can browse before signing up.
- **Listing pages** with seller profiles, plus edit / mark sold / delete for your own listings.
- **Payment happens in person.** Sellers pick which methods they accept (cash, Zelle, Cash App, Venmo). HuskyExchange never handles money or card details.

In progress: in-app messaging, the design system and page templates, Resend email delivery, and deployment. See [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md).

## Tech

React 19 + Vite, React Router 7, and Supabase (Postgres, Auth, Storage, row-level security). There's no custom server ([ADR-0002](docs/adr/0002-react-vite-supabase-spa.md)).

## Run it locally

1. `npm install`
2. Create `.env` in the project root (ask a teammate for the values, and **never commit it**):
   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=...
   ```
3. `npm run dev`, then open the address it prints.

`npm run lint` checks the code; `npm run build` makes a production build.

### Try it without an account

`npm install`, then `npm run demo`, then open http://localhost:5181. This runs the app against a fake Supabase ([scripts/demo.js](scripts/demo.js)) with sample listings, so it needs no `.env`. Sign in with any `@northeastern.edu` email and any password. You can browse, search, post, mark sold, and delete. Everything resets when you stop it. Sign-up, emails, and the database's security rules are **not** simulated, so test those against the real project.

## For the team

- [CLAUDE.md](CLAUDE.md): setup, conventions, and gotchas (read this first)
- [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md): who's doing what, with task IDs
- [docs/workflow/](docs/workflow/README.md): branches, PRs, reviews, and required tests
- [docs/adr/](docs/adr/README.md): why things are built the way they are
- [docs/ui-redesign/](docs/ui-redesign/README.md): the Canva-based look (gradient, glass panels, fonts) and how it's built
- [supabase/](supabase/): the SQL that's live in the database
