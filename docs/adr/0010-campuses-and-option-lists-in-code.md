# 0010. Campuses, meetup spots, and option lists live in code

- **Status:** Proposed
- **Date:** 2026-11-01
- **Owner:** Sanket
- **Related tasks:** DATA-06, DATA-09, SELL-01, FEED-02

## Context

Northeastern has 14 campuses: Boston, Arlington, Burlington, Charlotte, London, Miami, Nahant, New York City, Oakland, Portland (Maine), Seattle, Silicon Valley, Toronto, and Vancouver. Meetup spots differ by campus (Curry Student Center only exists in Boston). Listings also need fixed lists of categories, conditions, and payment methods. The first draft of ADR-0006 proposed lookup tables (`categories`, `pickup_points`).

## Options considered

1. **Lookup tables in Postgres**: editable without a deploy, but every page needs an extra query or join, every table needs RLS, and the lists rarely change.
2. **Lists in one JS file, plus `check` constraints in the database**: zero extra queries, and the database still rejects bad values. Changing a list means editing two places.
3. **Lists in JS only**: simplest, but anyone calling the API directly could store junk values.

## Decision

Option 2.

- `src/lib/listingOptions.js` exports `CATEGORIES`, `CONDITIONS`, `PAYMENT_METHODS`, and `CAMPUSES` (each campus with its `meetupSpots`), plus the helpers `CAMPUS_NAMES` and `getMeetupSpots()`.
- Postgres `check` constraints enforce `category`, `condition`, `payment_methods`, and `campus` with the same values.
- **Meetup spots are not constrained** in the database, so they can be corrected without a schema change. Smaller campuses list their building lobby plus a nearby public spot. These were researched from university pages and should be checked with students at each campus.

## Consequences

- Adding or renaming a campus, category, or condition means editing `listingOptions.js` **and** the matching `check` in SQL. Otherwise inserts fail.
- Changing campus in the Sell form clears the chosen meetup spot.
- If the team later wants admins to edit meetup spots without a deploy, move just `meetupSpots` into a table. Campuses can stay as a check.
