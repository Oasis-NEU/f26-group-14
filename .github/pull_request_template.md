<!-- Title: TASK-ID: what it does (e.g. "FEED-03: Add full-text search to feed") -->

## Task

<!-- Task ID(s) from docs/PROJECT_PLAN.md -->
Tasks:
Closes: <!-- issue number, if any -->

## What and why

<!-- A few sentences: what changed and why. Link the ADR if you made a decision. -->

## Screenshots (UI changes)

<!-- 390px and 1280px. Write N/A if there's no UI change. -->

| 390px | 1280px |
|---|---|
|   |   |

## Tests

<!-- List the tests you added. Each row of docs/workflow/testing.md for your task must be covered. -->

-

- [ ] Every required test from `docs/workflow/testing.md` for this task is included, and I saw each one fail first
- [ ] `npm test` passes
- [ ] `npm run lint` and `npm run build` pass

## Docs

- [ ] The task shows `[x] (#this PR)` in `docs/PROJECT_PLAN.md`
- [ ] There's an entry in `docs/workstreams/<me>.md`
- [ ] An ADR was added or updated (or N/A: no real decision)
- [ ] `docs/workflow/testing.md` has a row for any new task this PR adds

## Security (auth, user data, tables, storage, headers, secrets)

<!-- Write N/A if none of these are touched. -->

- [ ] RLS and its pgTAP tests are in this PR for any new or changed table
- [ ] No secrets committed; only `VITE_SUPABASE_*` in `VITE_` variables
- [ ] I ran `/security-review`. Result:

## UI

<!-- Write N/A if there's no UI change. -->

- [ ] Built from template TPL-0_ and `src/components/ui/`
- [ ] Keyboard navigation, visible focus, and reduced motion checked
- [ ] Loading, empty, and error states covered

## Review

- Reviewer (from the review pairs):
- Extra reviewer needed? <!-- Zane for auth/RLS/headers/secrets · Austin for UI template match -->

## How Claude was used

<!-- Which subagent and skills you used (e.g. feed-and-data; supabase, test-driven-development). Helps the reviewer know what to check closely. -->
