# Team workflow

This is how work moves from a ticket to `main`. It applies to every teammate **and their Claude**. Each subagent in `.claude/agents/` is told to follow these docs.

| Doc | What it covers |
|---|---|
| [The session loop](#the-session-loop) (below) | The steps a Claude session follows for every task |
| [branches-and-prs.md](branches-and-prs.md) | Branch names, commits, PR size, review pairs, merging |
| [testing.md](testing.md) | The test stack, the rules, and **the tests each feature must have** |
| [code-review.md](code-review.md) | What reviewers check and which review tools to run |
| [definition-of-done.md](definition-of-done.md) | The checklist a task must pass before it counts as done |
| [../../.github/pull_request_template.md](../../.github/pull_request_template.md) | The PR template. GitHub fills it in automatically |

## The session loop

Follow these steps in order. Don't skip one because a task looks small.

1. **Start in your lane.** Tell Claude: *"Use the `<your-agent>` agent to pick up `<TASK-ID>`."* The agent reads your section of [PROJECT_PLAN.md](../PROJECT_PLAN.md) and the latest entries in your workstream log.
2. **Branch off a fresh `main`.**
   ```
   git switch main && git pull
   git switch -c feed-03-search
   ```
   Then mark the task `🚧 (feed-03-search)` in the plan.
3. **Design first if it's new.** Run `superpowers:brainstorming` for a new page, component, or flow, and `superpowers:writing-plans` if the work has several steps. For UI, also run `frontend-design:frontend-design` and start from Austin's template.
4. **Write the tests first.** Look up your task in [testing.md](testing.md#required-tests-by-feature), then follow `superpowers:test-driven-development`: write a test, watch it fail, write the code, watch it pass.
5. **Verify.** Run `npm test`, `npm run lint`, and `npm run build`. For UI changes, take screenshots at 390px and 1280px. Run `superpowers:verification-before-completion`, and only report what you actually ran.
6. **Review your own diff.** Run `/code-review`. If you touched auth, user data, tables, or secrets, also run `/security-review`. Run `code-simplifier` on code you just wrote.
7. **Document.** Update the task status in the plan, add an entry to your workstream log, and write or update an ADR if you made a real decision.
8. **Open the PR.** Use `/commit-push-pr`, fill in every section of the template, and request your review partner ([branches-and-prs.md](branches-and-prs.md#review-pairs)).
9. **Handle review comments** with `superpowers:receiving-code-review`. Check that each suggestion is right before applying it.
10. **Merge.** Squash-merge, delete the branch, and make sure the task shows `[x] (#PR)` in the plan.

## Bugs

1. Open a GitHub issue with the **Bug report** template, or add a `BUG-NN` task to the owner's section of the plan.
2. Use `superpowers:systematic-debugging` to find the root cause **before** proposing a fix.
3. Write a **regression test that fails** because of the bug. Then fix it. A bug-fix PR without a regression test isn't done.
