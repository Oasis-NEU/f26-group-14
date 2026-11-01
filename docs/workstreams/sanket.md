# Sanket — Workstream log

- **Owns:** Supabase schema, migrations, RLS, storage, Feed, listing detail, server-side email-domain hook, reports, test runner
- **Claude subagent:** [`feed-and-data`](../../.claude/agents/feed-and-data.md). Start a session with *"Use the `feed-and-data` agent to pick up my next task."*
- **Stack connection:** **Supabase**: run `/mcp` and sign in to supabase
- **ADRs owned:** [0006 Data model & RLS](../adr/0006-data-model-and-rls.md)
- **Tasks:** see your section in [PROJECT_PLAN.md](../PROJECT_PLAN.md)

## Current focus

_Next up: **OPS-05 (Vitest) first, since everyone's tests depend on it**, then DATA-01 (agree on `listings` columns with Zane and Austin), DATA-02 migrations, and AUTH-03 (school-email hook)._

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

### 2026-11-01 — page-setup merged into `main` (#6); folders reorganized (#7)

- **Did:** Your `page-setup` work is on `main` (#6, merged as a merge commit to keep your history). The reorganize PR moved the SQL into `supabase/migrations/` (timestamps from commit dates) and the components into `src/components/{ui,auth,listings}/`. Done in the plan: AUTH-03, DATA-04, DATA-05. Partly built (◐): DATA-02/03/06/07, FEED-01/02/06.
- **Decisions:** [ADR-0006](../adr/0006-data-model-and-rls.md) now records the built schema: dollar prices, guest browsing, campuses. [ADR-0005](../adr/0005-auth-school-email-magic-link.md) records the password sign-in.
- **Next / blocked on:** **Before any `supabase db push`, run the `migration repair` command in [supabase/README.md](../../supabase/README.md)**, because those 6 files were applied by hand. Then OPS-05 (Vitest) and the security fixes DATA-09..12 and AUTH-07.

### 2026-11-01 — Reassigned

- **Did:** Took over AUTH-03 (server-side school-email hook), SEC-07 (reports/abuse), and OPS-05 (Vitest) from Austin. Feed and Detail now copy Austin's TPL-02 and TPL-03.
- **Decisions:** none (team reshuffle; see the note at the top of PROJECT_PLAN.md)

### 2026-11-01 — Workstream created

- **Did:** Assigned in the project plan; subagent and log created.
- **Next / blocked on:** Phase 0 setup.
