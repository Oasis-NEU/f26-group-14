# 0005. School-email-only passwordless sign-in

- **Status:** Proposed
- **Date:** 2026-11-01
- **Owner:** Adel
- **Related tasks:** AUTH-01 through AUTH-06, MAIL-03

## Context

Uni Swap only works if everyone on it is a verified student. That's what makes meeting a stranger in a dorm lobby reasonable. We also don't want to store passwords.

## Options considered

1. **Magic link or 6-digit OTP to a school email (Supabase Auth)**: no passwords, and owning the inbox proves the person is a student. Depends on email deliverability.
2. **Email and password**: familiar, but we'd store password hashes, need resets, and still have to verify the email.
3. **University SSO**: the strongest identity check, but usually needs approval from university IT. Too slow for this semester.

## Decision (proposed)

- Sign in with a **magic link or 6-digit OTP** through Supabase Auth.
- Allowed domain: **`@northeastern.edu`**. Adding other schools later is one config change.
- **Enforce the domain on the server** with Supabase's *before user created* auth hook. The check in the form is only for UX, since anyone can call the Supabase auth API directly.
- Auth emails go out through Resend SMTP (MAIL-03). Supabase's built-in mailer has a very low hourly limit.

## Consequences

- A `useSession()` hook and a `<RequireAuth>` route guard (AUTH-04, AUTH-05) protect the pages that need sign-in.
- A student who loses access to their school inbox loses their account. That's acceptable for now.
