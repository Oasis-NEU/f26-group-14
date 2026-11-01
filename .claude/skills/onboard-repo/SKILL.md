---
name: onboard-repo
description: Get up to speed on an unfamiliar codebase fast and safely. Read-only mapping with parallel subagents, every claim cited to file:line, independent verification, one flow traced end to end, and a short summary you can explain out loud. Use when the user says /onboard-repo, "map this repo", "help me understand this codebase", or is starting work in a repo they haven't seen before.
---

# Onboard to a repo

Goal: the user can explain this codebase out loud in 2 minutes, and every claim in the summary is backed by a file and line they can open.

## Rules

- **Read-only.** Do not edit, create, or delete files in the repo. Do not install dependencies, run migrations, or run anything that writes, deploys, or hits the network. If running tests would need any of that, ask first.
- **Cite everything.** Every claim about the code gets a `path/to/file:line` reference. If you can't cite it, list it as an open question instead of guessing.
- **Keep the user in the loop.** Explain what you're doing as you go, in plain language. The user should finish understanding the repo, not just holding a summary.
- If the user passed arguments (e.g. `/onboard-repo how does login work`), treat them as the focus: still do steps 1–3 briefly, then spend most of the effort on that question.

## Steps

### 1. Ground truth first (no AI guessing yet)

Read these directly before launching any subagents:

- `README*`, `CONTRIBUTING*`, `CLAUDE.md`, `AGENTS.md`, and any `docs/` index
- The manifest(s): `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, etc.
- The top two levels of the folder tree
- Recent history: `git log --oneline -15` and, if useful, `git log --since="2 weeks ago" --stat | head -80`

Then say in 2–3 sentences: what kind of project this is, the main language(s), and how it's built and tested.

### 2. Map in parallel

Launch 3 Explore subagents at the same time. Give each one this instruction: cite `file:line` for every claim, stay under 200 words, and list anything it's unsure about.

1. **Entry points and flow:** the main entry point(s), commands, routes or handlers, and how a request or command moves through the code.
2. **Core data and state:** the key types, models, config, where state lives, and external services or APIs it talks to.
3. **Tests, build, and conventions:** how to run tests, lint, and typecheck; the CI setup; and the project's conventions (commit style, release process, file layout rules).

### 3. Verify before trusting

- Pick the **2 claims that matter most** from the subagents and open those files yourself. Confirm or correct each one, and tell the user which.
- Launch **one fresh subagent with no prior context** and give it only the merged claims list. Ask it to check each claim against the code and flag anything wrong or unsupported.
- If it's safe and read-only, **run something**: the test suite, or the CLI's `--help`. Running code beats reading it. Report what happened.

### 4. Trace one real flow

Pick the single most important flow (for example, a CLI command from argv to output, or an API request from route to database). Trace it step by step, one line per hop, each with `file:line`.

### 5. Write the onboarding brief

Use this exact structure and keep it short:

```
## What this is
2–3 sentences.

## Architecture in 10 lines
- component → what it does (file:line)

## The main flow
1. step (file:line)
2. ...

## How to work here
- Run tests: `...`
- Lint/typecheck: `...`
- Conventions: commit style, where new code goes, anything CONTRIBUTING insists on

## Where a newcomer could break things
3 bullets: fragile spots, duplicated logic, security-sensitive code, or places tests don't cover.

## Verified vs. not
- Verified by reading/running: ...
- Corrected during verification: ...
- Open questions (not guessed): ...
```

### 6. Optional: draw it

If a diagram tool or skill is available (for example Playground or Archify), offer to render the architecture and the main flow as a diagram the user can click through. Don't generate it unless asked or clearly useful.

## Finish

End by asking the user one question that checks their understanding, such as "Where would you add a new X?" Point them to the file and line if they're unsure.
