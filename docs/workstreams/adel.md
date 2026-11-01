# Adel — Workstream log

- **Owns:** Sign-in and sessions, Settings, Home, Terms page, Vercel deploys, CI
- **Claude subagent:** [`account-and-deploy`](../../.claude/agents/account-and-deploy.md). Start a session with *"Use the `account-and-deploy` agent to pick up my next task."*
- **Stack connection:** **Vercel**: run `/mcp` and sign in to vercel. Supabase Auth (through the `supabase:supabase` skill)
- **ADRs owned:** [0003 Hosting](../adr/0003-hosting-on-vercel.md), [0005 Auth](../adr/0005-auth-school-email-magic-link.md)
- **Tasks:** see your section in [PROJECT_PLAN.md](../PROJECT_PLAN.md)

## Current focus

_Next up: OPS-01 (Vercel preview deploys) and AUTH-01, then AUTH-02, AUTH-04, and AUTH-05 so the others can test signed-in pages. Build pages from Austin's templates (TPL-04 for sign-in and Settings, TPL-01 for Home)._

## Open questions / blockers

- _none yet_

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

### 2026-11-01 — Sign-in and Settings already partly built (#6)

- **Did:** #6 merged Sanket's earlier work. Sign-in is **email and password** with an emailed signup code (ADR-0005 now records this). `RequireAuth` is done (AUTH-05). Partly built (◐): AUTH-02, AUTH-04, AUTH-06, SET-01, SET-05. Each ◐ note in the plan says what's left.
- **Next / blocked on:** Extend the existing pages instead of rebuilding them. AUTH-01 is now "confirm we keep passwords", together with Sanket.

### 2026-11-01 — Reassigned

- **Did:** Design template (DS-\*) moved to Austin. Took over AUTH-01/02/04/05/06, OPS-01/02/03/04/07, and SEC-08 from Austin. Subagent `design-system` was replaced by `account-and-deploy`.
- **Decisions:** none (team reshuffle; see the note at the top of PROJECT_PLAN.md)

### 2026-11-01 — Workstream created

- **Did:** Assigned in the project plan; subagent and log created.
- **Next / blocked on:** Phase 0 setup.
