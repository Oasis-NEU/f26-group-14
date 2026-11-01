# Zane — Workstream log

- **Owns:** Sell flow, photo upload, listing expiry, all transactional email, security (Helmet-equivalent headers, RLS review, secrets, scans), Sentry
- **Claude subagent:** [`sell-email-security`](../../.claude/agents/sell-email-security.md). Start a session with *"Use the `sell-email-security` agent to pick up my next task."*
- **Stack connection:** **Resend** and **Sentry**: run `/mcp` and sign in to both. Supabase Edge Functions (ask Sanket for access)
- **ADRs owned:** [0004 Security headers](../adr/0004-security-headers.md), [0007 Email via Resend](../adr/0007-email-via-resend-edge-function.md)
- **Tasks:** see your section in [PROJECT_PLAN.md](../PROJECT_PLAN.md)

## Current focus

_Next up: MAIL-01 and MAIL-02 (Resend domain) and SEC-01 (finalize the headers ADR) while Sanket finalizes the schema, then SELL-01 from TPL-04._

## Open questions / blockers

- **Already built by Sanket and merged to `main` (#6), so don't rebuild it:** the Sell / Edit form (`src/components/ListingForm.jsx`) with campus → meetup spot, a camera / library photo shrunk in the browser, and edit / mark sold / delete on the listing page (SELL-01/03/04). Resend domain `mail.huskyexchange.app` is added and waiting on DNS (MAIL-02); Supabase Auth SMTP currently uses Gmail and needs switching to Resend (MAIL-03). "I'm interested" became in-app messaging, so MAIL-05 is now the new-message email.

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

### 2026-11-01 — Reassigned

- **Did:** Took over SEC-01..06, SEC-09 (security headers, RLS review, secrets, scan), and OPS-06 (Sentry) from Austin. Subagent `sell-and-email` was renamed to `sell-email-security`.
- **Decisions:** none (team reshuffle; see the note at the top of PROJECT_PLAN.md)

### 2026-11-01 — Workstream created

- **Did:** Assigned in the project plan; subagent and log created.
- **Next / blocked on:** Phase 0 setup.
