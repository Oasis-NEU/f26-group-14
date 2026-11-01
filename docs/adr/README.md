# Architecture Decision Records

An ADR is a short note explaining **why** we built something a certain way. Code shows what we did. ADRs keep the reasoning, so a new teammate (or their Claude) doesn't undo a decision without knowing why it was made.

## When to write one

Write an ADR when you pick between real options: a library, a schema shape, where code runs, how auth works, or a security trade-off. Small choices like a variable name or a CSS tweak don't need one.

## How

1. Copy [0000-template.md](0000-template.md) to the next number: `NNNN-short-title.md`.
2. Set the status to **Proposed**, fill it in, and add a row to the index below.
3. Open a PR. At least one teammate reviews it.
4. When it merges, set the status to **Accepted**. If a later ADR replaces it, set the old one to **Superseded by NNNN** and leave the file in place.

## Index

| # | Title | Status | Owner |
|---|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted | Team |
| [0002](0002-react-vite-supabase-spa.md) | React + Vite SPA on Supabase, no custom server | Accepted | Team |
| [0003](0003-hosting-on-vercel.md) | Host the frontend on Vercel | Proposed | Adel |
| [0004](0004-security-headers.md) | Security headers at the host (Helmet-equivalent) | Proposed | Zane |
| [0005](0005-auth-school-email-magic-link.md) | School-email-only sign-in (passwords, as built) | Proposed | Adel |
| [0006](0006-data-model-and-rls.md) | Data model and row-level security | Proposed | Sanket |
| [0007](0007-email-via-resend-edge-function.md) | Transactional email through Resend from Edge Functions | Proposed | Zane |
| [0008](0008-design-system-and-styling.md) | Design system and styling approach | Proposed | Austin |
| [0009](0009-motion-and-animation.md) | Motion and animation approach | Proposed | Austin |
