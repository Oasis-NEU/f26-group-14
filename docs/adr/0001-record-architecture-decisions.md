# 0001. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-11-01
- **Owner:** Team

## Context

Four people work in parallel, and each has a Claude writing code. Without notes, decisions get made twice, or quietly undone by someone who didn't know the reason.

## Decision

Keep ADRs in `docs/adr/` using [the template](0000-template.md). Each developer's Claude writes an ADR whenever its work involves a real choice between options. The [project plan](../PROJECT_PLAN.md) links each ADR to the tasks it affects.

## Consequences

- A little writing on each real decision.
- Anyone can find out why something is the way it is by reading a few hundred words.
