# 0005. School-email-only sign-in

- **Status:** Proposed. Revised 2026-11-01 to match what #6 built. Adel and Sanket confirm (AUTH-01)
- **Date:** 2026-11-01
- **Owner:** Adel (UI and session) · Sanket (server hook)
- **Related tasks:** AUTH-01 through AUTH-07, MAIL-03

## Context

HuskyExchange only works if everyone on it is a verified Northeastern student. That's what makes meeting a stranger in a dorm lobby reasonable.

The first version of this ADR proposed passwordless sign-in. But before the plan existed, Sanket had already built **email and password accounts** (merged in #6). This revision records what's built and asks whether to keep it.

## Options considered

1. **Email + password, with an emailed code to confirm signup** (**built**): familiar to students, and works when email is slow. Supabase stores and hashes the passwords, not our code. Needs password reset, which is built (`src/pages/resetpassword.jsx`).
2. **Magic link or 6-digit OTP only**: no passwords at all, but every sign-in depends on email arriving quickly, and switching means reworking signup, sign-in, reset, and Settings' password change.
3. **University SSO**: the strongest identity check, but needs approval from university IT. Too slow for this semester.

## Decision (proposed)

- **Keep option 1, as built.**
  - Signup: `signUp` → the emailed code is checked by `verifyOtp` (`src/components/auth/VerifyCodeForm.jsx`).
  - Sign-in: `signInWithPassword`.
  - Reset and change password are both supported.
- **Allowed domain: `@northeastern.edu`**, enforced **on the server** by the *before user created* hook `public.restrict_to_northeastern` (`supabase/migrations/20261030132100_restrict_to_northeastern.sql`). The check in the signup form is only for UX.
- Auth emails (codes, resets) go through Resend SMTP (MAIL-03), because Supabase's built-in mailer has a very low hourly limit.

## Known gaps (tracked as tasks)

- The hook is **switched on by hand in the dashboard** and isn't stored in SQL. Anyone setting up a new environment has to enable it ([supabase/README.md](../../supabase/README.md)).
- The hook only runs at signup. **Changing your email** to a non-NEU address isn't checked yet (AUTH-07).
- The session is passed around as props from `App.jsx`. The planned `AuthProvider` / `useSession()` would replace that (AUTH-04).
- The domain is hard-coded in the hook's SQL. Adding another school means a new migration.

## Consequences

- We support password reset, and rate limits on sign-in attempts matter (SEC-07).
- `<RequireAuth>` (`src/components/auth/RequireAuth.jsx`) protects Sell, Settings, edit-listing, and profile pages. Feed and listing pages are public (see ADR-0006, guest browsing).
