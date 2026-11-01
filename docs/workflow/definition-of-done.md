# Definition of done

A task is **done** when it's merged to `main` **and** every box below is true. "Works on my machine" doesn't count. The [PR template](../../.github/pull_request_template.md) repeats this list.

## Always

- [ ] Every required test from [testing.md](testing.md#required-tests-by-feature) exists, and each one was seen failing before the code was written
- [ ] `npm test`, `npm run lint`, and `npm run build` pass locally and in CI
- [ ] `/code-review` was run and its findings were handled
- [ ] The task shows `[x] (#PR)` in [PROJECT_PLAN.md](../PROJECT_PLAN.md)
- [ ] There's an entry in your `docs/workstreams/<name>.md`
- [ ] An ADR was written or updated if you chose between real options
- [ ] The reviewer from your [review pair](branches-and-prs.md#review-pairs) approved

## If it changes UI

- [ ] It's built from its template (TPL-01..05) and `src/components/ui/`
- [ ] Screenshots at 390px and 1280px are in the PR
- [ ] Keyboard-only use works, focus is visible, and `prefers-reduced-motion` turns off animation
- [ ] Loading, empty, and error states all exist

## If it touches the database, auth, storage, headers, or secrets

- [ ] RLS and its pgTAP tests are in the same PR
- [ ] `/security-review` was run and the result is noted in the PR
- [ ] Zane reviewed it
- [ ] No secrets were committed; only `VITE_SUPABASE_*` in `VITE_` variables

## If it sends email

- [ ] It was tested only with Resend's test addresses or your own inbox
- [ ] It respects notification preferences and includes an unsubscribe link
