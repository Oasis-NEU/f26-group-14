# 0004. Security headers at the host (Helmet-equivalent)

- **Status:** Proposed
- **Date:** 2026-11-01
- **Owner:** Austin
- **Related tasks:** SEC-01, SEC-02, SEC-03

## Context

We want the protections that [Helmet](https://helmetjs.github.io/) gives an Express app: CSP, HSTS, clickjacking protection, and the rest. But Helmet is **Express middleware**, and per ADR-0002 we have no Express server. Installing it in a Vite SPA does nothing, because the static files are served by the host, not by our code.

## Decision (proposed)

1. Set Helmet's default headers ourselves in `vercel.json` (ADR-0003).
2. Ship the CSP as `Content-Security-Policy-Report-Only` first. Watch the console on the preview deploy, then switch it to enforcing.
3. If we ever add a Node/Express server, it uses `helmet()` with the same policy.

| Header | Starting value | Why |
|---|---|---|
| `Content-Security-Policy` | see below | Blocks injected scripts (XSS) |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS only |
| `X-Content-Type-Options` | `nosniff` | Stops MIME sniffing |
| `X-Frame-Options` | `DENY` | Clickjacking (older browsers) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Keeps listing URLs from leaking to other sites |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | We use none of these |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolates our window from popups |

Starting CSP. Replace `<ref>` with the Supabase project ref:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://<ref>.supabase.co;
connect-src 'self' https://<ref>.supabase.co wss://<ref>.supabase.co;
font-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none'
```

Sketch for `vercel.json` (Austin finalizes it in SEC-02):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy-Report-Only", "value": "default-src 'self'; ..." },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

## Consequences

- **Adding a third-party origin means editing the CSP.** Google Fonts, Sentry's ingest URL, and Stripe all need entries, or the browser blocks them. Every PR that adds an origin updates this ADR's CSP too.
- The Vite dev server doesn't send these headers. Test them on a preview deploy.
- Headers stop XSS from doing damage, but they don't replace RLS (ADR-0006).
