# 0009. Motion and animation approach

- **Status:** Proposed. Austin finalizes this (MOTION-01)
- **Date:** 2026-11-01
- **Owner:** Austin
- **Related tasks:** DS-02, MOTION-01 through MOTION-05, TPL-01 through TPL-05

## Context

We want the app to feel smooth: page changes, opening things, confirming actions. Most students will use it on phones, so animation has to stay cheap. The `frontend-design` skill also warns that motion everywhere (fade-and-slide-up on each section, hover effects on every card) reads as generic and AI-generated. Motion should answer what the user did, plus at most one orchestrated moment per page.

## Options considered

1. **CSS transitions and keyframes, plus the View Transitions API** through React Router 7's `viewTransition` prop: zero dependencies, runs on the compositor, and handles page changes and shared elements (card photo → detail hero). Browsers without support just navigate instantly.
2. **The `motion` library** (formerly Framer Motion): great for gestures, drag-to-reorder, and layout animations, but it adds a dependency and some bundle weight.
3. **A mix:** option 1 by default, and `motion` only for the few spots CSS handles badly.

## Decision (proposed)

Option 3:
- Durations and easings are **tokens** in `src/styles/tokens.css` (`--motion-fast`, `--motion-base`, `--ease-out`, …). Components never hard-code timings.
- Page changes and the card → detail photo morph use **View Transitions** (React Router `viewTransition`).
- Modals, drawers, toasts, button presses, and skeleton → content use **CSS transitions**.
- Only reach for **`motion`** for gestures like photo drag-to-reorder (SELL-04 / TPL-04). Install it then, and update this ADR.
- **Only animate `transform` and `opacity`.**
- **`prefers-reduced-motion: reduce` sets every motion token to 0ms.**

## Consequences

- Every template shows its motion on `/styleguide`, so teammates copy it instead of inventing their own.
- MOTION-05 checks performance with a 4x CPU-throttled DevTools trace before launch.
- Adding `motion` later is a small, contained change because timing lives in tokens.
