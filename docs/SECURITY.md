# Security

## Threat model

A small editorial site with a handful of privileged accounts and no personal
data about readers. The realistic risks, in order:

1. Someone takes over a CMS account and publishes or defaces content.
2. Stored content becomes a script-injection vector for readers.
3. The site accidentally collects personal data it did not intend to hold.
4. Secrets leak through the repository or a preview deployment.

Card data, authentication of readers and user-generated content are all out of
scope, because none exist.

## Authentication

- **scrypt** from the Node standard library, with OWASP's minimum parameters
  (N=2^16, r=8, p=1, 64-byte key). No native dependency to compile on Vercel and
  no third-party hashing package to keep patched.
- Verification is constant-time (`timingSafeEqual`), and a failed lookup still
  performs a hash so a non-existent account and a wrong password take comparable
  time. The error message is identical either way, so the form cannot be used to
  enumerate addresses.
- **Sessions are opaque random tokens; only their SHA-256 is stored.** A leaked
  database hands an attacker no usable sessions. Sessions expire after 12 hours
  and can be revoked by deleting one row — which a stateless JWT could not do
  without a second store anyway.
- The cookie is `httpOnly`, `secure` in production, `sameSite=lax`, path `/`.
- **Login throttling** counts failed attempts in `audit_log`: 8 failures per
  address in 15 minutes. That table is shared across serverless instances; an
  in-memory counter would reset on every cold start and protect nothing.
- **No self-service sign-up.** Accounts exist only because an administrator ran
  `npm run admin:create-user`.

## Authorisation

Role checks are in the **server actions**, never only in the UI:

```ts
const user = await requireUser("author");
if (data.status === "published") await requireUser("editor");
```

The proxy's `/admin` gate only checks that a session cookie is *present*. It is
a cheap early bounce to avoid rendering the CMS shell, not the security
boundary — the cookie is verified against the database inside every action and
every admin page.

## Input validation

Every server action validates with Zod before touching the database. Server
actions are public endpoints; nothing is trusted because it came from our own
form.

- Paths and slugs are regex-constrained to lowercase hyphenated segments, so an
  editor cannot create a URL that collides with a system route.
- Block bodies are parsed against a discriminated union. `parseBody` **drops**
  anything malformed rather than throwing, so a bad row can never take down a
  page.
- Drizzle parameterises every query. The one place raw SQL is composed is the
  full-text search config name, which comes from a fixed three-way match on the
  locale — never from user input.

## Cross-site scripting

**No stored content is ever rendered as HTML.**

- Block bodies are structured JSON rendered as React elements.
- Inline formatting (`**bold**`, `[link](url)`) is parsed into React nodes by
  `src/lib/content/inline.tsx`, never into an HTML string.
- Link hrefs go through `safeHref`, which accepts only `http:`, `https:`,
  `mailto:` and site-relative paths. `javascript:` and `data:` are rejected, and
  that is unit-tested.
- Embeds take a provider from a closed allowlist plus an **id**, never a URL, so
  nothing arbitrary can be framed.
- `dangerouslySetInnerHTML` appears in exactly one component, for JSON-LD
  produced by `JSON.stringify` with `<` escaped. **A test fails the build if it
  appears anywhere else.**

## Content Security Policy

Set per response in `src/proxy.ts`:

```
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none';
form-action 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:;
connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com
  https://*.vercel-insights.com;
frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com
  https://www.openstreetmap.org https://open.spotify.com;
media-src 'self'; manifest-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
```

### `script-src 'unsafe-inline'` — the trade-off, stated plainly

This is the weakest part of the policy and it is deliberate.

The App Router streams its RSC payload through inline `<script>` tags. A
nonce-based policy therefore requires generating a nonce **per response**, which
means every page is dynamically rendered and cannot be cached at the CDN. And a
nonce that is reused across a cached response protects nothing, so the two goals
are architecturally incompatible — not merely inconvenient together.

Given that the brief ranks crawlable static HTML and Core Web Vitals as
first-order requirements, and given the compensating control below, inline
script is allowed and everything else is locked down.

**The compensating control** is that the injection route `unsafe-inline` would
widen does not exist here: no stored content is ever converted to HTML, as
described above and enforced by a test. `object-src 'none'`, `base-uri 'self'`,
`frame-ancestors 'none'` and a closed `frame-src` allowlist remain in force.

**Revisit this if** any of the following becomes true: reader-submitted content
is rendered, a third-party script is embedded in a page, or Next gains a way to
emit its bootstrap without inline script. At that point the calculation changes
and the policy should change with it.

## Other headers

| Header | Value | Why |
| --- | --- | --- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Two years, subdomains included |
| `X-Content-Type-Options` | `nosniff` | No MIME sniffing |
| `X-Frame-Options` | `DENY` | Plus `frame-ancestors 'none'` for modern browsers |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | No paths leak to third parties |
| `Permissions-Policy` | camera, microphone, payment, usb off; geolocation self; `interest-cohort` and `browsing-topics` off | Opts out of Topics/FLoC explicitly |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolates the browsing context |
| `X-Robots-Tag` | `noindex, nofollow, noarchive` on non-production and on admin, API and search | See `SEO.md` |

`dangerouslyAllowSVG` is **off** in the image config: SVGs can carry script and
must never pass through the optimiser.

## CSRF

Next validates the `Origin` header against the `Host` for Server Actions, which
covers the CMS's mutations. `form-action 'self'` prevents a form on our pages
from posting elsewhere. Session cookies are `sameSite=lax`, so a cross-site POST
carries no session.

The one non-action endpoint, `/api/feedback`, is intentionally unauthenticated —
it stores a path, a language and a boolean, so a forged request achieves nothing
of value.

## Rate limiting

- Login: 8 failures per address per 15 minutes, counted in the database.
- The cron endpoint requires a bearer secret compared in constant time.
- Everything else is static and served from the CDN, so there is little to
  exhaust. If `/api/feedback` is ever abused, add a per-path daily cap in the
  same table.

## Secrets

- `.gitignore` excludes `.env`, `.env*.local`, `*.pem` and `.vercel`.
- `.env.example` is annotated and contains **no values**.
- Secrets live in Vercel's environment variables, scoped per environment.
- No secret is exposed to the browser. `NEXT_PUBLIC_*` variables are the GA4 id,
  the indexing switch and the site-verification token — all of which are public
  by nature.
- **Never set `NEXT_PUBLIC_ALLOW_INDEXING` in Preview.**

## Personal data

The deliberate position is to hold as little as possible.

- **Readers**: no accounts, no profiles, no tracking before consent. Page
  feedback stores a path, a language and a boolean — no identifier, no session,
  no IP, so it cannot become a personal-data store by accident.
- **Analytics**: nothing is sent before consent. The event contract's types
  forbid personal data, and internal search sends the *length* of a query, never
  its text.
- **Cookies**: `ci_consent` (180 days), `ci_locale` (1 year), `ci_session`
  (12 hours, staff only). The first two are first-party and functional; the
  third is strictly necessary.
- **Staff**: name, email, scrypt hash, last login. `audit_log` keeps actions and
  a lowercased email for throttling.

## Backups

Not configured here — it is a property of the database provider. Whichever is
chosen, confirm:

- point-in-time recovery is on (Neon and Vercel Postgres both offer it),
- the retention window is at least 7 days,
- **a restore has actually been tested**, because a backup nobody has restored
  is a hypothesis.

Content additionally has `entry_revisions`, which lets a single page be rolled
back without touching the database backup.

## Reporting

Add a `/.well-known/security.txt` with a contact address when the site goes
live. Until there is a monitored inbox, `SITE.contactEmail` is the route.
