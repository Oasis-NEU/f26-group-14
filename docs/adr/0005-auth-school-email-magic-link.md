# 0005. School-email-only sign-in: password, plus a one-time code to verify the email

- **Status:** Proposed. Revised 2026-11-01 to match what's built; Adel to review (AUTH-01)
- **Date:** 2026-11-01
- **Owner:** Adel (since the 2026-11-01 reshuffle); built by Sanket
- **Related tasks:** AUTH-01 through AUTH-08, MAIL-03

## Context

HuskyExchange only works if everyone on it is a verified Northeastern student. That's what makes meeting a stranger on campus reasonable.

The first version of this ADR proposed **passwordless** sign-in (a magic link or code every time). While building, we hit two problems with that:
- **Email deliverability.** Northeastern's Outlook silently dropped our login emails. If every sign-in needs an email, any delivery problem locks everyone out.
- **Magic links get "pre-clicked"** by Outlook's link scanner, which uses up the one-time link before the student clicks it.

## Options considered

1. **Magic link or code on every sign-in**: no passwords to store, but every login depends on email arriving.
2. **Email and password, with a one-time 6-digit code to verify the email at sign-up**: needs email once per account, and every later login works even if email is having a bad day.
3. **University SSO**: the strongest identity check, but needs approval from university IT. Too slow for this semester.

## Decision

Option 2, built on Supabase Auth:

- **Sign up** (`/signup`): first name, optional last name, optional campus, `@northeastern.edu` email, and password (min 8 characters, confirmed). Supabase emails a **6-digit code**, and the account can't sign in until the code is entered (`verifyOtp`, type `email`). "Confirm email" is turned on in Supabase.
- **Sign in** (`/signin`): email and password. Unverified accounts get a button to resend the code.
- **Forgot password** (`/reset-password`): email → 6-digit code (type `recovery`) → new password.
- **Change password** (Settings): requires the current password, which the app checks by signing in with it first.
- Email templates (Confirm signup, Reset Password) contain **only a code, no links**. That avoids Outlook's link scanner and looks less like phishing.
- **The domain is enforced on the server** with the "before user created" auth hook `public.restrict_to_northeastern`. It rejects any email that doesn't end in `@northeastern.edu`, including a missing email. The check in the form is only for UX.
- Auth emails go through custom SMTP, moving from Gmail to Resend at `mail.huskyexchange.app` (MAIL-02, MAIL-03).

## Consequences

- We store password hashes (Supabase handles this) and support resets.
- Still needs working email **once per account**, plus for resets. Until Resend is verified, new students can't finish signing up. For testing, create auto-confirmed users in the Supabase dashboard.
- The change-password check happens in the browser, so it stops someone using an unlocked laptop but not someone with a stolen session token. Supabase's "Secure password change" setting can enforce it on the server once email works.
- `<RequireAuth>` guards the login-only pages and sends users back where they were after signing in (AUTH-05). The session currently lives in `App.jsx`; moving it into `useSession()` is AUTH-04. The server-side hook is Sanket's (AUTH-03).
- A student who loses access to their school inbox can still sign in with their password, but can't reset it.
