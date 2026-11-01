# Testing requirements

**Short version:** every feature task has the required tests listed below, and they're written **before** the code (`superpowers:test-driven-development`). A PR that's missing a required test isn't done.

> **Prerequisite:** the test runner is Sanket's **OPS-05**, and it's the first Phase 1 task. Until it lands, write your tests anyway. They'll run as soon as `npm test` exists.

## Test layers

| Layer | Tool | Where tests live | How to run | Who |
|---|---|---|---|---|
| Unit and component | Vitest, React Testing Library, user-event, jest-dom (jsdom) | next to the file: `Button.jsx` → `Button.test.jsx` | `npm test` (watch mode: `npm run test:watch`) | everyone |
| Database and RLS | pgTAP | `supabase/tests/*.sql` | `supabase test db` | Sanket writes, Zane reviews |
| Edge Functions | `deno test` | `supabase/functions/<fn>/*.test.ts` | `deno test` in that folder | Zane |
| End-to-end | Playwright | `e2e/` | SH-03 | shared, before launch |
| Visual and motion | screenshots at 390px and 1280px; DevTools performance trace | attached to the PR | by hand | the author; Austin reviews |

## Rules

1. **Test first.** Write the test, watch it fail for the right reason, then write the code. If a test passes on the first run, it might not be testing anything.
2. **Test what the user sees and does.** Query by role, label, or text (`getByRole('button', { name: 'Publish' })`), never by class name or internal state. Use `user-event`, not `fireEvent`.
3. **Unit tests never call real services.** Mock at the edge:
   - Page and component tests mock the **`src/lib/*` helpers** (`vi.mock('../lib/listings')`).
   - Helper tests mock **`src/lib/supabase.js`**.
   - Edge Function tests stub `fetch` to Resend.
4. **Keep logic out of components.** Money, dates, validation, and query-building go in pure functions in `src/lib/` (for example `formatPrice.js`, `shrinkImage.js`, and the planned `listings.js`). Pure functions are fast and easy to test. Whoever needs a shared helper first writes it, with its tests.
5. **Pin time.** Anything that depends on "today" (move-out badges, expiry) uses `vi.useFakeTimers()` and `vi.setSystemTime(...)`.
6. **No UI snapshot tests.** Austin will keep changing the visuals, so snapshots would break constantly without catching real bugs. Screenshots in the PR cover appearance.
7. **Bug fix = regression test** that fails without the fix.
8. **Never skip or delete a test to get CI green.** If you have to use `.skip`, add a comment with the task ID that will fix it.
9. **Coverage targets:** about 90% for `src/lib/`. For components and pages there's no percentage target, but every required test below must exist.

## Required tests by feature

Each task's PR must include the tests in its row. You can add more, but not fewer.

### Austin: design system and templates

| Task | Required tests |
|---|---|
| **DS-04** components | **Every component:** renders with an accessible name; disabled state can't be clicked.<br>**Button:** calls `onClick`.<br>**Input:** the error text is linked through `aria-describedby`.<br>**Modal / Drawer:** opens; Esc closes it; focus moves inside and **returns to the trigger** on close.<br>**Toast:** has `role="status"` and auto-dismisses (fake timers). |
| **DS-05** `ListingCard` | Formats the price with `formatPrice` (`12.5` → `$12.50`); shows the savings % only when retail is higher than price; shows the "moving out soon" badge only when `gone_by` is within N days (pinned date); links to `/listings/:id`; the image's alt text is the title. |
| **MOTION-02** | The reduced-motion hook/switch: returns true when `matchMedia('(prefers-reduced-motion: reduce)')` matches (mocked), and components skip animation classes when it's on. |
| **TPL-01..05** | **Every template:** renders with exactly one `h1`, and its landmark regions are present.<br>**TPL-02:** the filter controls and the list are present; the empty and error states render.<br>**TPL-04:** the stepper moves forward on valid input and stops on invalid input with an error shown; the review step shows what was entered.<br>**TPL-05:** a row action opens a confirm modal; confirming fires the handler. |
| **MOTION-03/04/05** | No unit tests. Check these with screenshots and the 4x-throttled performance trace, and attach both to the PR. |

### Adel: sign-in, Settings, Home, deploy

| Task | Required tests |
|---|---|
| **AUTH-02** | `isAllowedEmail()` accepts `a@northeastern.edu` (any case, surrounding whitespace trimmed). It rejects `a@gmail.com`, `a@northeastern.edu.evil.com`, `a@evilnortheastern.edu`, and an empty string. The form doesn't call `signInWithOtp` on invalid input, calls it **once** on valid input, shows the "check your email" state on success, and shows an error on failure. |
| **AUTH-04** | `useSession`: starts in a loading state, picks up the session from `getSession`, updates on `onAuthStateChange`, and unsubscribes on unmount. |
| **AUTH-05** | `<RequireAuth>`: with no session, redirects to `/signin` and keeps the return path; with a session, renders its children; while loading, shows a spinner and does **not** redirect. |
| **AUTH-06** | Sign out calls `signOut` and goes to `/`. |
| **SET-01..04** | Validation: the payment link must be an `https://` URL, the Venmo handle format is checked, and the move-out date can't be in the past. Saving calls the profile helper with the **exact** payload. Success shows a toast, failure shows an error. The payment section says the handles are visible to signed-in students. |
| **SET-05** | Deleting the account requires the confirm modal. Canceling does nothing. |
| **HOME-01/02** | Signed out: shows the sign-in CTA. Signed in: shows recent listings (mocked helper) and an empty state when there are none. |
| **OPS-03** | `vercel.json` has the SPA rewrite to `/index.html` (a Vitest test that reads the file). |
| **SEC-08** | Smoke test: the Terms page renders the in-person-only and never-prepay rules. |

### Sanket: data, Feed, server-side auth

| Task | Required tests |
|---|---|
| **DATA-03** RLS (pgTAP) | **One test per cell of the ADR-0006 policy matrix.** At minimum:<br>• anon can't select listings<br>• user A can't update or delete B's listing<br>• a user can't insert a listing with someone else's `seller_id`<br>• a buyer can't create an interest on their own listing<br>• a seller can read interests on their own listings, and others can't<br>• `reports` can't be read by users<br>• a user can't upload to another user's storage folder |
| **DATA-04** | pgTAP: inserting an auth user creates a `profiles` row. |
| **AUTH-03** | pgTAP or a hook test: a non-school email is rejected and a school email is accepted. |
| **DATA-08** helpers | `fetchFeed` applies each filter (category, price range, pickup point, condition, moving-out-within-N-days), only returns `active` listings, and uses the right sort and page range. Every helper returns the same `{ data, error }` shape. `createInterest` turns a unique violation (`23505`) into a friendly "already interested" error. |
| **`src/lib/formatPrice.js`** (and any date helpers) | `12.5` → `$12.50`, `0` → `$0.00` (or "Free", whichever the UI uses); savings % (no retail, retail lower than price, and zero all handled); `daysUntil` across month boundaries (pinned date). |
| **FEED-01..05** | Renders cards from the mocked helper. Shows the loading skeleton, then content. Shows the empty state, and the error state with a working retry. Changing a filter or sort calls `fetchFeed` with the new params **and** updates the URL query string. "Load more" fetches the next page. |
| **FEED-06** | Shows the listing fields and payment handles. "I'm interested" calls `createInterest` once and is disabled afterward. It's hidden on your own listing. A missing ID shows the not-found state. |
| **SEC-07** | The report button inserts once; a duplicate report shows a friendly message. |
| **DATA-09..11, AUTH-07** (pgTAP) | Signed-in users can't read another seller's `seller_email` directly. A seller can't set `created_at`, `seller_id`, or `seller_email`. `photo_url` and `avatar_url` reject anything outside our buckets. Changing your email to a non-`@northeastern.edu` address is rejected. |
| **DATA-12** | Replacing a listing photo removes the old file from `listing-photos` (an integration check against the dev project). |
| **OPS-05** | A sample test proves jsdom, jest-dom matchers, and the `src/lib/supabase.js` mock all work. |

### Zane: Sell, email, security

| Task | Required tests |
|---|---|
| **SELL-01/02** | `validateListing()`: required fields; price `"12.5"` → `12.5` with at most 2 decimals; negative or non-numeric prices rejected; retail is optional; `gone_by` must be on or after `available_from`; at most 8 photos. The preview shows the entered values. Submit calls `createListing` with the **exact** payload and shows errors on failure. |
| **SELL-03** | Mark sold, delete, and relist each go through the confirm modal and call the right helper. |
| **SELL-04** | `fitWithin(w, h, max)` keeps the aspect ratio. Non-image files and files over 5 MB are rejected. The reorder function moves items correctly. |
| **SELL-05** | `isExpired(listing, today)` at the boundary: the day before, the day of, and the day after (pinned date). |
| **MAIL-04..09** (`deno test`) | Each template builds the right subject, recipient, and body from its data. Nothing is sent when the user's preference is off. A second interest from the same buyer on the same listing doesn't send again. The unsubscribe link is present. The API key never shows up in logs or errors. `fetch` to Resend is stubbed. |
| **SEC-02** | A Vitest test reads `vercel.json` and checks that every header in ADR-0004 is present. The CSP must contain `frame-ancestors 'none'` and `object-src 'none'`, and must not contain `'unsafe-eval'`. |
| **SEC-05** | A listing title like `<script>alert(1)</script>` renders as literal text. An ESLint rule bans `dangerouslySetInnerHTML`. |
| **OPS-06** | Sentry's `beforeSend` scrubber removes email addresses and auth tokens from events. |

### Shared

| Task | Required tests |
|---|---|
| **SH-03** | Playwright: sign in (test inbox or OTP stub) → create listing → it appears in the feed → "I'm interested" → the seller-email function was called. |

## Adding a new feature

When you add a task to the plan, add a row here in the same PR, listing its required tests. If you can't say what the tests are, the task isn't clear enough to start.
