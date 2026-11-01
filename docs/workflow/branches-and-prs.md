# Branches, commits, and PRs

## Branches

- Format: `<task-id>-<short-slug>`, all lowercase. Examples: `feed-03-search`, `tpl-02-browse`, `sec-02-headers`.
- Branch from a fresh `main`. **Never push directly to `main`.** Every change goes through a PR.
- One task per branch. If you have a few small, closely related tasks, you can do them in one branch and list every ID in the PR.
- Rebase on `main` before asking for review: `git fetch && git rebase origin/main`. On **your own** branch, push with `--force-with-lease`. Never force-push anyone else's branch.

## Commits

- Start with the task ID, then a short message in the imperative: `FEED-03: Add full-text search to feed`.
- Each commit should be one logical step. Squash-merge combines them anyway, so don't spend time polishing history.
- **Never commit** `.env`, `.remember/`, build output, or any secret. If you do, tell the team right away, because the secret has to be rotated, not just deleted.

## Pull requests

- **Title:** `TASK-ID: what it does`. It becomes the squash commit message.
- **Size:** aim for under about 400 changed lines, not counting lockfiles and migrations. Split anything bigger. A big PR gets a shallow review.
- **Template:** fill in every section of [the PR template](../../.github/pull_request_template.md). Write "N/A" where a section doesn't apply instead of deleting it.
- **CI must be green.** Lint, build, and tests run on every PR once OPS-04 lands.
- **Draft PRs** are welcome for early feedback. Mark the PR "Ready for review" once it meets the [definition of done](definition-of-done.md).

## Review pairs

Every PR needs **one approval** from the assigned reviewer. Some PRs need an extra reviewer.

| Author | Reviewer | Extra reviewer when… |
|---|---|---|
| Austin | Adel | n/a |
| Adel | Austin | the PR touches auth or sessions: **Zane** |
| Sanket | Zane | n/a (Zane already reviews all RLS, per SEC-04) |
| Zane | Sanket | n/a |

- **Any PR that changes UI:** Austin checks it against its template (FE-03).
- **Any PR that touches RLS, auth, storage policies, `vercel.json` headers, or secrets:** Zane reviews it.
- **Turnaround:** review within one working day. If you're blocked waiting, say so in the team chat.

## Merging

- **Squash and merge**, then delete the branch.
- The author merges after approval and green CI.
- Right after merging, check that the task shows `[x] (#PR)` in [PROJECT_PLAN.md](../PROJECT_PLAN.md). Tick it in the PR itself before merging, so `main` is never out of date.
