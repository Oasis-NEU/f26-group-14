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
4. **Keep logic out of components.** Money, dates, validation, and query-building go in pure functions in `src/lib/` (for example `format.js`, `validation.js`, `listings.js`). Pure functions are fast and easy to test. Whoever needs a shared helper first writes it, with its tests.
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
| **DS-05** `ListingCard` | Shows the price through `formatPrice` (`0` → `Free`, `12.5` → `$12.50`); shows "campus · meetup spot"; shows "by <first name>" only when a seller is passed; shows the Sold badge only when `status` is `sold`; links to `/listing/:id`; the image's alt text is the title, and "No photo" shows when there's no photo. *(Savings % and "moving out soon" tests come with DATA-12.)* |
| **MOTION-02** | The reduced-motion hook/switch: returns true when `matchMedia('(prefers-reduced-motion: reduce)')` matches (mocked), and components skip animation classes when it's on. |
| **TPL-01..05** | **Every template:** renders with exactly one `h1`, and its landmark regions are present.<br>**TPL-02:** the filter controls and the list are present; the empty and error states render.<br>**TPL-04:** the stepper moves forward on valid input and stops on invalid input with an error shown; the review step shows what was entered.<br>**TPL-05:** a row action opens a confirm modal; confirming fires the handler. |
| **MOTION-03/04/05** | No unit tests. Check these with screenshots and the 4x-throttled performance trace, and attach both to the PR. |

### Adel: sign-in, Settings, Home, deploy

| Task | Required tests |
|---|---|
| **AUTH-02** | `isAllowedEmail()` (pull it out of `signup.jsx`) accepts `a@northeastern.edu` (any case, surrounding whitespace trimmed). It rejects `a@gmail.com`, `a@northeastern.edu.evil.com`, `a@evilnortheastern.edu`, and an empty string.<br>**Sign up:** doesn't call `signUp` on invalid input (bad domain, password under 8 characters, passwords that don't match, no first name); calls it **once** with `first_name`, `last_name`, and `campus` in `options.data`; shows the code step on success; shows "already exists" when `identities` is empty.<br>**Code step (`VerifyCodeForm`):** calls `verifyOtp` with the right `type`; shows the error on a wrong code; "Send a new code" calls `onResend`.<br>**Sign in:** calls `signInWithPassword`; `invalid_credentials` shows "Wrong email or password"; `email_not_confirmed` shows the resend button.<br>**Reset password:** email → code (`type: 'recovery'`) → new password calls `updateUser` once. |
| **AUTH-04** | `useSession`: starts in a loading state, picks up the session from `getSession`, updates on `onAuthStateChange`, and unsubscribes on unmount. |
| **AUTH-05** | `<RequireAuth>`: with no session, redirects to `/signin` and keeps the return path; with a session, renders its children; while loading, shows a spinner and does **not** redirect. |
| **AUTH-06** | Sign out calls `signOut` and goes to `/`. |
| **SET-01** (built) | Saving calls `profiles.update` with the **exact** payload (blank last name and campus become `null`). A new picture uploads to `avatars/<uid>/avatar` with `upsert`. An empty first name is rejected. **Change password:** an empty current password, a new password under 8 characters, mismatched passwords, or a new password equal to the current one are all rejected before any call; a wrong current password shows "Current password is incorrect" and never calls `updateUser`. |
| **SET-02..04** | Validation: the payment link must be an `https://` URL, the Venmo handle format is checked, and the move-out date can't be in the past. Saving calls the profile helper with the **exact** payload. Success shows a toast, failure shows an error. The payment section says the handles are visible to signed-in students. |
| **SET-05** | Deleting the account requires the confirm modal. Canceling does nothing. |
| **HOME-01/02** | Signed out: shows the sign-in CTA. Signed in: shows recent listings (mocked helper) and an empty state when there are none. |
| **OPS-03** | `vercel.json` has the SPA rewrite to `/index.html` (a Vitest test that reads the file). |
| **SEC-08** | Smoke test: the Terms page renders the in-person-only and never-prepay rules. |

### Sanket: data, Feed, server-side auth

| Task | Required tests |
|---|---|
| **DATA-03** RLS (pgTAP) | **One test per cell of the ADR-0006 policy matrix.** At minimum:<br>• anon **can** select listings but **can't** select `seller_email`<br>• anon can select only `id` and `first_name` from profiles, not `campus`, `bio`, or `last_name`<br>• anon can't insert, update, or delete anything<br>• user A can't update or delete B's listing<br>• a user can't insert a listing with someone else's `seller_id` or `seller_email`<br>• a user can only update their own profile, and only the 5 granted columns<br>• a user can't upload to another user's folder in `listing-photos` or `avatars`<br>• *(with MSG-02)* only the two people in a conversation can read its messages<br>• *(with SEC-07)* `reports` can't be read by users |
| **DATA-04** | pgTAP: inserting an auth user creates a `profiles` row. |
| **AUTH-03** (built) | pgTAP or a hook test on `public.restrict_to_northeastern`: `a@gmail.com` is rejected, `A@Northeastern.EDU` is accepted, a payload with no email is rejected, and `anon` / `authenticated` can't execute the function. |
| **DATA-08** helpers | `fetchFeed` applies each filter (campus, categories via `in`, payment methods via `overlaps`, min and max price), only returns `available` listings, never asks for `seller_email` or `*`, and uses the right sort and page range. Every helper returns the same `{ data, error }` shape. |
| **`src/lib/formatPrice.js`** (built) | `0` → `Free`, `25` → `$25`, `12.5` → `$12.50`, and `"20.26"` (a string from the database) → `$20.26`. *(Savings % and `daysUntil` tests come with DATA-12.)* |
| **`src/lib/listingOptions.js`** (built) | Every campus has at least one meetup spot; `getMeetupSpots('')` returns `[]`; `CAMPUS_NAMES` has 14 entries and no duplicates. |
| **FEED-01..05** | Renders cards from the mocked helper. Logged-in users start on their profile campus; guests start on "All campuses". The two price-slider handles can't cross. Shows the loading skeleton, then content. Shows the empty state, and the error state with a working retry. Changing a filter or sort calls `fetchFeed` with the new params **and** updates the URL query string. "Load more" fetches the next page. |
| **FEED-06** (built) | Shows the listing fields. Guests see the seller's first name and a "Sign in to contact the seller" link that carries the return path. Members see the seller's full name linking to `/profile/:id`. The owner sees Edit, Mark sold/available, and Delete, and buyers don't. Mark sold calls `update({ status })` and flips the button. Delete asks for confirmation and does nothing on cancel. `/listing/abc` and a missing ID show the not-found state. |
| **FEED-09** (built) | Profile shows the name, campus, and bio; splits listings into For sale and Sold; shows "Edit profile" only on your own profile; an unknown ID shows "doesn't exist". |
| **MSG-02..06** | pgTAP: only participants can read or insert messages; a buyer can't open a conversation on their own listing. Component: "Message seller" opens the existing conversation instead of making a second one; sending appends the message; the inbox shows the unread marker. |
| **SEC-07** | The report button inserts once; a duplicate report shows a friendly message. |
| **OPS-05** | A sample test proves jsdom, jest-dom matchers, and the `src/lib/supabase.js` mock all work. |

### Zane: Sell, email, security

| Task | Required tests |
|---|---|
| **SELL-01/02** | `validateListing()` (pull it out of `ListingForm.jsx`): required fields (title, price, category, condition, campus, meetup spot, at least one payment method); price `"12.5"` → `12.5`; negative or non-numeric prices rejected; photo type and the 5 MB limit. Changing campus clears the meetup spot. Submit calls `insert` (new) or `update` (edit) with the **exact** payload, and never sends `seller_id` or `seller_email`. On failure, a newly uploaded photo is removed. When editing, a replaced photo's old file is removed. *(Retail price and date rules come with DATA-12; the photo limit with SELL-06.)* |
| **SELL-03** | Mark sold, delete, and relist each go through the confirm modal and call the right helper. |
| **SELL-04** (built) | `shrinkImage(file, maxSide)` keeps the aspect ratio, never enlarges small images, outputs `image/jpeg` named `.jpg`, and returns the original file if decoding fails (mock `createImageBitmap`). Non-image files and files over 5 MB are rejected. *(The reorder test comes with SELL-06.)* |
| **SELL-05** | `isExpired(listing, today)` at the boundary: the day before, the day of, and the day after (pinned date). |
| **MAIL-04..09** (`deno test`) | Each template builds the right subject, recipient, and body from its data. Nothing is sent when the user's preference is off. A second new message in the same conversation within an hour doesn't send another email. The unsubscribe link is present. The API key never shows up in logs or errors. `fetch` to Resend is stubbed. |
| **SEC-02** | A Vitest test reads `vercel.json` and checks that every header in ADR-0004 is present. The CSP must contain `frame-ancestors 'none'` and `object-src 'none'`, and must not contain `'unsafe-eval'`. |
| **SEC-05** | A listing title like `<script>alert(1)</script>` renders as literal text. An ESLint rule bans `dangerouslySetInnerHTML`. |
| **OPS-06** | Sentry's `beforeSend` scrubber removes email addresses and auth tokens from events. |

### Shared

| Task | Required tests |
|---|---|
| **SH-03** | Playwright: sign in (an auto-confirmed test user) → create listing → it appears in the feed → message the seller → the seller sees the message, and the email function was called. |

## Already built: backfill (TEST-01)

These features were built (merged in #6) before the test rules existed. Each owner adds the tests in the rows marked **(built)** above as soon as OPS-05 lands. Pull logic out into `src/lib/` where the row says so, so it can be unit-tested.

| Feature | Files | Owner |
|---|---|---|
| Sign up, sign in, reset password, code step | `src/pages/signup.jsx`, `signin.jsx`, `resetpassword.jsx`, `src/components/VerifyCodeForm.jsx` | Adel |
| Route guard and return-after-sign-in | `src/components/RequireAuth.jsx`, `src/App.jsx` | Adel |
| Settings profile and change password | `src/pages/settings.jsx` | Adel |
| Server-side email-domain hook, RLS, profile trigger | `supabase/*.sql` → `supabase/tests/*.sql` | Sanket |
| Feed, filters, listing page, profile page | `src/pages/feed.jsx`, `listing.jsx`, `profile.jsx`, `src/components/ChipFilter.jsx`, `PriceRangeFilter.jsx`, `ListingCard.jsx` | Sanket |
| Price formatting, option lists | `src/lib/formatPrice.js`, `src/lib/listingOptions.js` | Sanket |
| Sell / Edit form, photo shrinking, photo cleanup | `src/components/ListingForm.jsx`, `src/lib/shrinkImage.js`, `src/lib/listingPhotos.js` | Zane |

## Adding a new feature

When you add a task to the plan, add a row here in the same PR, listing its required tests. If you can't say what the tests are, the task isn't clear enough to start.
