# Technical SEO

Everything here is implemented and verifiable in a production build. Sources are
Google Search Central and schema.org; nothing below rests on a rule Google has
never published.

## URLs

```
https://www.catalunyainfo.com/{locale}/{…localised segments}/
```

- One locale prefix, always: `/ca/`, `/es/`, `/en/`. No language query strings.
- **Trailing slash on every URL**, enforced by `trailingSlash: true`. One
  spelling per URL means no duplicate content and no redirect chains from the
  sitemap.
- Lowercase, hyphenated, accent-free segments. Validated on save by
  `pathSchema` — an editor cannot create `/ca/Com_Arribar/`.
- **Localised slugs, not translated route prefixes.** The brief's example works
  exactly as written:

  ```
  /ca/montserrat/com-arribar-hi/
  /es/montserrat/como-llegar/
  /en/montserrat/how-to-get-there/
  ```

  These are three rows in `entry_translations` pointing at one `entries` row, so
  they are automatically each other's `hreflang` alternates.

Section hubs are localised too:

| Section | ca | es | en |
| --- | --- | --- | --- |
| News | `/ca/actualitat/` | `/es/actualidad/` | `/en/news/` |
| Guides | `/ca/guies/` | `/es/guias/` | `/en/guides/` |
| Destinations | `/ca/destinacions/` | `/es/destinos/` | `/en/destinations/` |
| Events | `/ca/agenda/` | `/es/agenda/` | `/en/events/` |
| Routes | `/ca/rutes/` | `/es/rutas/` | `/en/routes/` |
| Search | `/ca/cerca/` | `/es/buscar/` | `/en/search/` |

The bare `/` issues a **307** to a locale root based on `Accept-Language`, with
`Vary: Accept-Language, Cookie`. 307 and not 308: the destination depends on the
visitor, so it must never be cached as permanent.

## Canonical

- Every page emits a **self-referencing absolute canonical** on the production
  host: `https://www.catalunyainfo.com/…`.
- The origin used for canonicals is `SITE.productionOrigin`, a constant. A
  preview deployment cannot leak a `*.vercel.app` canonical, and a test asserts
  the constant is never a vercel.app host.
- An editor can override the canonical per translation, for the rare case of
  syndicated or duplicated material. Left empty, it is self-referential.

## hreflang

Built by `buildAlternates()` in `src/lib/seo/metadata.ts`.

- Only **published, indexable** translations are listed. A Spanish draft does
  not appear in the Catalan page's alternates.
- Every set is **self-referential** — the page lists itself.
- `x-default` points at the **English** edition when it exists, falling back to
  Catalan. Reasoning: a visitor whose language matches none of ca/es/en is by
  definition international.
- The same alternates are repeated in the sitemap, which is what Google
  recommends when a page can be reached by several routes.

Verified output for `/ca/`:

```html
<link rel="canonical" href="https://www.catalunyainfo.com/ca/"/>
<link rel="alternate" hreflang="ca" href="https://www.catalunyainfo.com/ca/"/>
<link rel="alternate" hreflang="es" href="https://www.catalunyainfo.com/es/"/>
<link rel="alternate" hreflang="en" href="https://www.catalunyainfo.com/en/"/>
<link rel="alternate" hreflang="x-default" href="https://www.catalunyainfo.com/en/"/>
```

## Crawlable HTML

The single most important fix relative to version 1. The initial HTML of every
content page contains, server-rendered:

- the `<h1>`;
- the standfirst;
- the complete body, every block;
- breadcrumbs, and the matching `BreadcrumbList` JSON-LD;
- the navigation and footer links;
- the language switcher as real `<a hreflang>` anchors, not a JavaScript widget;
- the sources register.

There is no client-side data fetching in the public site at all. Confirmed on a
production build: `/ca/` returns 200 with `<h1 class="ci-measure">La guia
digital més útil sobre Catalunya`, and **zero** occurrences of
`Carregant`/`Loading`/`Cargando`.

## Indexing control

A single environment variable, `NEXT_PUBLIC_ALLOW_INDEXING`, gates three layers
at once. Indexing is allowed only when it is `"true"` **and** `VERCEL_ENV` is
`production`.

| Layer | Off state | On state |
| --- | --- | --- |
| `robots.txt` | `User-Agent: * / Disallow: /` | Allow, with exclusions |
| `sitemap.xml` | Empty `<urlset>` | Full |
| Page `robots` meta | `noindex, nofollow, nocache` | `index, follow, max-image-preview:large` |
| `X-Robots-Tag` header | `noindex, nofollow, noarchive` | absent |

**Preview deployments can never be indexed.** `VERCEL_ENV` is `preview`, so the
header is sent regardless of the variable. This matters more than robots.txt: a
`Disallow` stops crawling but not indexing of a URL discovered elsewhere, while
the header removes it.

Permanently excluded, on every deployment:

- `/admin` and everything under it
- `/api/`
- internal search, under all three localised spellings and the internal
  `/internal-search/` route
- anything with a query string (`Disallow: /*?*`)
- demo fixtures (`entries.is_demo`), excluded from queries and the sitemap

## Sitemap

`src/app/sitemap.ts`, revalidated hourly and on publish.

- Only genuinely indexable URLs: published, `noindex = false`, publish date in
  the past, entry not demo.
- Each URL carries its `alternates.languages` map including `x-default`.
- **Hub pages appear only when the section has content.** Submitting an empty
  listing page is asking Google to crawl a soft 404.
- The search page never appears (excluded at the source, in `allSystemPaths`).
- Empty on any non-production deployment.

## Structured data

`src/lib/seo/jsonld.ts`. One `@graph` per page. The rule throughout: **never
emit a property we cannot back with a real value.** Fabricated structured data
is a manual-action risk, not a ranking trick.

| Emitted | When |
| --- | --- |
| `Organization` | Every page (site-wide graph) |
| `WebSite` + `SearchAction` | Every page |
| `BreadcrumbList` | Every page with a trail |
| `NewsArticle` | `type = news` |
| `Article` | Guides and long-form |
| `TouristAttraction` / `Museum` / `Beach` | `type = destination` or `place`, chosen from `places.kind` |
| `Event` | `type = event` |
| `FAQPage` | **Only** when the body actually contains a FAQ block |
| `HowTo` | **Only** when the body actually contains a steps block |
| `citation` | Only when the entry has sources with URLs |

`author` is emitted only when the entry has an author, and points at that
author's profile page. `dateModified` comes from `updated_at`; `datePublished`
from `published_at`, which the CMS **never** rewrites on a re-edit.

## Redirects and removals

`migration/redirects.csv` is the human-readable source of truth, carrying a
decision and a reason for every legacy URL. `npm run build:redirects` projects it
into a typed module used by the edge, and `prebuild` runs it, so the CSV and the
served behaviour cannot drift. Tests assert row counts, uniqueness, no
redirect/gone overlap, no loops and locale-prefixed destinations.

| Legacy | Action | Reason |
| --- | --- | --- |
| `catalunyainfo.com/*` | **308** → `www` | Was a 307. Consolidates the host permanently. |
| `/ultimahora/`, `/politica/`, `/economia/`, `/societat/`, `/esports/`, `/tecnologia/`, `/cultura/`, `/successos/`, `/opinio/` | **308** → `/ca/actualitat/` | Closest live equivalent hub |
| `/calendari/` | **308** → `/ca/agenda/` | Direct equivalent |
| `/sobre-nosaltres.html`, `/contacte.html` | **308** → `/ca/qui-som/`, `/ca/contacte/` | Direct equivalents |
| `/legal/*.html` (5) | **308** → `/ca/legal/*/` | Direct equivalents; terms merged into the legal notice |
| `/article/*.html` (42) | **410 Gone** | See below |

**Why 410 and not a redirect for the articles.** These are the auto-generated
news items that caused the rejection. They have no equivalent on the new site.
Redirecting 42 stale, unrelated URLs into a hub page is the classic soft-404
pattern and would pass nothing useful; 410 tells Google the removal is
deliberate, which drops them from the index faster and stops months of
re-crawling. If Search Console later shows any of them carrying real backlinks
or impressions, individual rows can be changed to a redirect and the table
regenerated.

**Slug changes after publication are handled automatically.** When an editor
changes a path, `saveTranslation` inserts a permanent redirect from the old URL
before saving, so a published URL never breaks.

## 404s

`/ca/no-existeix/` returns a genuine **404** status with a real page — not a
200 soft 404, and not a redirect to the homepage. Verified on a production
build.

## Performance levers

Targets: LCP ≤ 2.5 s, INP < 200 ms, CLS < 0.1, Lighthouse ≥ 95 across the board.
What the build does to get there:

- Static HTML from the CDN for every content page; the database is never on the
  request path for a cache hit.
- **Zero third-party requests before consent.** No GA, no fonts from Google, no
  ad script. The single biggest LCP lever on a content page.
- Fonts self-hosted through `next/font`, with `display: swap` and metric
  fallbacks so there is no layout shift when they load.
- `next/image` with AVIF then WebP, explicit `width`/`height` on every image,
  blur placeholders from stored LQIP, and `priority` only on the one
  above-the-fold image.
- Maps and embeds are **behind a disclosure** — the OpenStreetMap frame loads
  only when the reader opens it. The coordinates, which are the useful part,
  are in the HTML immediately.
- Almost no JavaScript: three small client components on the whole public site.
- `text-wrap: balance` on headings and `pretty` on paragraphs; no animation on
  load; `prefers-reduced-motion` respected globally.

## Verification checklist

Run against production after each significant release:

```bash
curl -sI https://www.catalunyainfo.com/ca/ | grep -i x-robots-tag
curl -s  https://www.catalunyainfo.com/ca/ | grep -c -iE 'carregant|loading'   # must be 0
curl -s  https://www.catalunyainfo.com/ca/ | grep -oE '<h1[^>]*>[^<]*'         # must exist
curl -sI https://catalunyainfo.com/        | head -1                           # 308
curl -so /dev/null -w '%{http_code}\n' https://www.catalunyainfo.com/article/<any>.html   # 410
curl -s  https://www.catalunyainfo.com/robots.txt
curl -s  https://www.catalunyainfo.com/sitemap.xml | head -20
```

Then in Search Console: URL Inspection on one page per language, checking that
the rendered HTML contains the body and that the user-declared canonical matches
the Google-selected one.
