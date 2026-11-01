# Code review

Reviewing is part of the job, not a favor. Review within one working day. Review pairs are in [branches-and-prs.md](branches-and-prs.md#review-pairs).

## Tools (run them before a human looks)

| Who | Run | When |
|---|---|---|
| Author | `/code-review` | Before marking a PR ready. Fix what it finds or explain why not |
| Author | `/security-review` | The PR touches auth, user data, tables, storage, headers, or secrets |
| Reviewer | `/pr-review-toolkit:review-pr` or `/coderabbit:code-review` | To get a second read. Then **check every finding yourself** before posting it |

Claude's review findings are suggestions, not verdicts. Don't paste one into the PR unless you've confirmed it's real.

## Reviewer checklist

**Correctness**
- [ ] Does it do what the task in the plan says? Are edge cases handled: empty, error, loading, a slow network?
- [ ] Do the required tests from [testing.md](testing.md#required-tests-by-feature) exist and test real behavior? Would they fail if the feature broke?

**Security** (Zane does an extra pass on these)
- [ ] New tables have RLS **and** pgTAP tests in the same PR
- [ ] Nothing is enforced *only* in React when it should be enforced on the server
- [ ] No secrets anywhere; only `VITE_SUPABASE_*` in `VITE_` variables
- [ ] User text is rendered as text; uploads check type and size

**Fit**
- [ ] UI is built from its template and from `src/components/ui/`. No one-off styles, raw hex codes, or hard-coded animation timings (Austin checks this)
- [ ] Data access goes through `src/lib/*` helpers and the one Supabase client
- [ ] Plain `.jsx`, matching the surrounding code

**Docs**
- [ ] The plan is updated, there's a log entry, and an ADR exists if a real decision was made

## Writing comments

- Prefix each comment: **`blocking:`** must be fixed before merge · **`suggestion:`** worth doing, author decides · **`nit:`** tiny, optional · **`question:`** you want to understand something.
- Say what's wrong and why, and suggest a fix if you have one.
- Approve once every `blocking:` comment is resolved. Don't hold a PR back over nits.
