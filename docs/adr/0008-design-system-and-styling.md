# 0008. Design system and styling approach

- **Status:** Proposed. Adel picks the option and gets a 👍 from the team (DS-01)
- **Date:** 2026-11-01
- **Owner:** Adel
- **Related tasks:** DS-01 through DS-08

## Context

Four people build pages at the same time. If each one styles their pages their own way, the app ends up looking like four apps. Adel builds one template (tokens, components, and a `/styleguide` page), and everyone copies it.

## Options considered

1. **Plain CSS with custom properties**: no new dependencies, and it matches what's in the repo now. Class names can collide across files.
2. **CSS Modules + global `tokens.css`**: built into Vite, so no install. Styles are scoped to each component and theming still uses CSS variables.
3. **Tailwind**: fast to write and naturally consistent, but adds a dependency and its own conventions everyone has to learn.

## Decision (proposed)

Option 2: **CSS Modules for components, with design tokens as CSS custom properties** in `src/styles/tokens.css`. Shared components go in `src/components/ui/`, and the `/styleguide` route is the reference everyone copies.

Rules for everyone:
- Use tokens (`var(--space-3)`, `var(--color-accent)`), not raw hex codes or pixel values.
- If a component exists in `src/components/ui/`, use it instead of building another one.
- Need a new shared component? Add it to `ui/` and the styleguide page, or ask Adel.

## Consequences

- Teammates copy patterns from `/styleguide` and `src/components/ui/README.md`.
- Dark mode is a token swap under `prefers-color-scheme`, not separate CSS.
