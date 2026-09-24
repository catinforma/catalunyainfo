# Current architecture

What is actually deployed, as of 24 September 2026. Written from the repository
and from production, not from intent.

For the reasoning behind the original decisions see `ARCHITECTURE.md`; this
file is the map of what exists now.

---

## The shape of it

```
Request
  │
  ├─ src/proxy.ts ......... edge: legacy 410s, / → locale, admin gate,
  │                         CSP and security headers, X-Robots-Tag
  │
  ├─ (public)/[locale]/[...slug]  one catch-all route resolves everything:
  │     │                         hub, author index, topic index, or entry
  │     └─ resolve()
  │          ├─ section segment + 1 → hub
  │          └─ otherwise → url index lookup in the database
  │
  └─ (admin)/admin/* ...... session-gated editorial panel
```

**One public route handles every content URL.** There is no folder per page,
which is what makes fully localised slugs possible: `/ca/pobles/…`,
`/es/pueblos/…` and `/en/villages/…` are one entry with three translations.

## Data model, in brief

- `entries` — language-independent: type, key, category, hero image, flags.
- `entry_translations` — one row per language: status, slug, **path**, SEO
  fields, body, dates. `UNIQUE (locale, path)` is the URL index.
- Body is a **typed block array in JSONB**, never stored HTML. 17 block types.
  Nothing from the database is ever rendered as markup; a test enforces it.
- `media`, `sources`, `entry_sources`, `categories`, `tags`, `redirects`,
  `contact_messages`, `page_feedback`, `users`, `sessions`, `audit_log`.

## Where content lives

Articles ship as **code**, in `src/lib/content/`:

| Directory | What |
| --- | --- |
| `features/` | The ten feature guides + `shared.ts` link registry |
| `weekend/` | The weekly agenda article |
| `mushrooms/` | The weekly mycological report |
| `autumn/` | The autumn colour guide |
| `pages/` | The ten institutional/legal pages |
| `publish-article.ts` | The shared idempotent publisher |
| `images.ts` | **Generated.** Image manifest with attribution |

Publishing is `POST /api/admin/publish/?only=<group>`, secret-guarded. It is
idempotent: everything is keyed on a stable identifier, so re-running updates
the same rows and the same URLs.

`?only=` exists because publishing everything exceeds the function time limit,
and a publish that times out half way is worse than one that never started.

## Routing and URLs

- `/{locale}/{...localised segments}/`, always trailing-slashed.
- Section segments are localised and declared in `src/lib/i18n/routes.ts`.
- Content paths are free-form and resolved against the database, which is why
  articles can live under `escapades/`, `natura/`, `pobles/` without a route.
- No query strings for content. No JavaScript content-swapping.

## SEO surface

| Piece | Where | Note |
| --- | --- | --- |
| Metadata | `src/lib/seo/metadata.ts` | canonical, 4 hreflang, OG, Twitter, `max-image-preview:large` via the `googlebot` tag |
| JSON-LD | `src/lib/seo/jsonld.ts` | Article, BreadcrumbList, WebSite, Organization |
| Sitemap | `src/app/sitemap.ts` | 87 URLs; content wins over system paths; empty hubs and empty indexes excluded |
| robots | `src/app/robots.ts` | `/_next/image` explicitly allowed — see below |
| Redirects | `src/lib/migration/legacy-redirects.ts` | generated from `migration/redirects.csv` at build |

**The `/_next/image` allow matters.** Every content image is served through the
optimiser, whose URLs carry a query string, and the blanket `Disallow: /*?*`
was hiding all of them from Googlebot until 24 September 2026.

## Navigation

Built from data, not from a list. `nonEmptySections()` asks which hubs have
content, and the header and footer render only those. A section disappears when
empty and returns on its own when its first entry is published.

A hub claims entries by **primary category as well as entry type**
(`SECTION_CATEGORY_KEYS`), because every editorial piece is an `article` and
would otherwise pile up in Guides alone.

Current state: Guides 13, Destinations 3, Agenda 3. News and Routes hidden.

## Images

`incoming/` → `npm run images:import` → `public/images/` + `images.ts`.

Two sources:

- **Wikimedia Commons**, via `npm run images:commons`. Only CC0, CC BY, CC
  BY-SA, PD and GFDL pass; NC and ND are rejected. Author, licence and source
  page are captured at download time into a sidecar, carried into the manifest,
  and printed under the photograph.
- **Supplied illustrations**, disclosed as AI-generated in every caption.

A test keys off the manifest: a file with a licence is a photograph and must
not claim to be generated; one without must say that it is.

## Analytics and consent

GA4 loaded through the Google tag `GT-KTR3FB62` — not the measurement id, which
404s. Consent Mode v2, denied by default; no third-party request is made before
the visitor accepts. Typed event contract in `src/lib/analytics/events.ts`; an
event not in the union cannot be sent.

## Security

scrypt password hashing, SHA-256-hashed opaque session tokens, DB-backed login
throttling, Zod validation in every server action and API route, CSP, HSTS.
The contact endpoint stores before it emails, so a mail provider failure cannot
lose a message.

## Tooling

| Command | What it does |
| --- | --- |
| `npm run check` | typecheck + lint + tests (81) |
| `npm run seo:links` | crawls production: broken links, orphans, pages reachable only from the menu, cross-language leaks |
| `npm run adsense:check` | PASS/WARNING/FAIL per readiness item, against the live site |
| `npm run images:commons` | fetches freely-licensed photographs, licence-checked |
| `npm run images:import` | optimises to WebP, generates the manifest |
| `npm run build:redirects` | regenerates the redirect table from CSV |

## Known gaps

- `authors` and `topics` render an index with nothing in it. Out of the
  sitemap; still reachable.
- `routes` has no content and no entry type in use.
- Fifteen pages are reachable only from the navigation, with no contextual link
  from any article — the hubs and the legal pages.
- Publisher legal identity is empty by design and blocks commercial activity.
  See `LEGAL_PAGES.md`.
