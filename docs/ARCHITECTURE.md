# Architecture

## The problem being solved

Version 1 of CatalunyaInfo failed in two connected ways.

**Technically**, it was a static HTML shell that fetched its content from an API
in the browser. The homepage that Googlebot received contained `Carregant…`,
three script tags and no `<h1>`. Article pages were pre-rendered files, but the
homepage and every hub were effectively empty to a crawler.

**Editorially**, its 42 articles were short, auto-generated news items with no
author, no sources and no reason to exist next to La Vanguardia or 3Cat. That is
what "low value content" means in an AdSense rejection.

A rebuild has to fix the second problem with editorial work, and the first one
with architecture. This document covers the architecture, and the parts of the
system that make the editorial work possible.

## Stack decision

The brief explicitly said not to pick Next.js reflexively because we deploy to
Vercel. So here is the actual comparison.

| | Astro | Next.js (App Router) | SvelteKit |
| --- | --- | --- | --- |
| Static HTML for content | Excellent | Excellent | Good |
| ISR / on-demand revalidation on Vercel | Adapter-dependent, coarser | First-class | Adapter-dependent |
| Authenticated backoffice with mutations | Needs a second framework or heavy islands | Server Actions, same app | Good (form actions) |
| Per-locale routing with independent slugs | Manual | Manual either way | Manual |
| Image optimisation on Vercel | Via adapter | Native | Via adapter |
| Draft preview | Roll your own | Built in | Roll your own |
| Team familiarity / hiring | Moderate | Highest | Lower |

**Astro would win if this were only a publishing surface.** It is not: the brief
asks for a CMS with drafts, review, scheduling, translation linkage, media,
redirects and an audit trail. That is an application, and building it in Astro
means adding a React or Svelte island layer plus a separate mutation story —
which is Next.js with extra steps.

**Decision: Next.js 16, App Router, on Vercel.** The public site is statically
rendered with ISR; the CMS is dynamic and lives in a separate route tree so it
shares no bundle with the pages that have to be fast.

The cost is honest: a heavier framework than a pure content site needs, and one
that changes fast. The mitigation is that nothing outside `src/app` depends on
Next — the data layer, content model, SEO helpers and validation are plain
TypeScript and would survive a framework migration.

### Other choices

- **Postgres + Drizzle**, not a hosted CMS. The domain is specific (places with
  coordinates and opening hours, routes with elevation, events with recurrence,
  sources with access dates). Bending a generic CMS to that shape costs more
  than owning the schema, and it avoids a vendor holding the content.
- **No CSS framework beyond Tailwind's engine.** The design tokens in
  `globals.css` are the design system; Tailwind is used for layout utilities
  only. There is no component library, so nothing looks like a template.
- **Node test runner**, no Jest or Vitest. The tests that matter here are pure
  functions and repository invariants; a test framework would be dependency
  weight for no gain.

## Rendering

This is the part that failed last time, so it is enforced structurally.

```
Request → Vercel edge
            │
            ├─ proxy.ts (src/proxy.ts)
            │    410 for removed v1 URLs
            │    / → /{locale}/ by Accept-Language (307, Vary)
            │    /admin gate, security headers, X-Robots-Tag
            │
            ├─ next.config.ts redirects: apex → www, v1 → v2 (308)
            │
            └─ App Router
                 (public)/[locale]/…      static + ISR   ← all content
                 (public)/[locale]/internal-search  dynamic, noindex
                 (admin)/admin/…          dynamic, noindex, auth
                 api/…                    dynamic, noindex
```

Three rules keep the HTML complete:

1. **The locale is a route parameter, never a header.** The root layout lives at
   `(public)/[locale]/layout.tsx` and reads `params`. Had it read
   `headers()` to find the language, every page would have become dynamically
   rendered and lost CDN caching.
2. **Internal search has its own route.** It is the only page that needs
   `searchParams`, so it is rewritten to `/{locale}/internal-search/` and the
   public URL stays `/ca/cerca/`. Without that split, reading `searchParams` in
   the shared catch-all would opt every content page into dynamic rendering.
3. **No content is fetched in the browser.** There is no client-side data
   fetching anywhere in the public site. The only client components are the
   language switcher, the consent gate and the page-feedback widget — none of
   which render content.

Result from an actual production build:

```
● /ca  /es  /en                    static, revalidate 10m
● /ca/actualitat  /ca/guies  …     static, revalidate 5m   (+18 more)
ƒ /[locale]/internal-search        dynamic (noindex)
ƒ /admin/*                         dynamic (noindex, auth)
```

## Request flow for a content page

```
/ca/montserrat/com-arribar-hi/
        │
        ├─ generateStaticParams()  → prerendered at build if published
        │
        └─ [...slug]/page.tsx
             resolve(locale, slug)
               1. section hub?      sectionFromSegment()
               2. author index/profile?
               3. topic index?
               4. entry_translations WHERE locale=? AND path=?
               5. editor-managed redirect → 301/307
               6. notFound() → real 404
             ↓
           resolvePath() returns EntryDetail
             + body blocks, sources, tags, related, translations,
               place/event/route extension, breadcrumb ancestors
             ↓
           EntryArticle renders server-side
             + JSON-LD built from the same data
```

Everything a page needs is resolved in `resolvePath` plus two batched follow-up
queries (`getMediaByIds`, `summariesByEntryIds`). No block issues a query of its
own, so a page with thirty blocks still costs a bounded number of round trips.

## Directory map

```
src/
  app/
    (public)/[locale]/        root layout #1 — the site
      page.tsx                homepage
      [...slug]/page.tsx      the universal resolver
      internal-search/        localised via rewrite, always noindex
      not-found.tsx
    (admin)/admin/            root layout #2 — the CMS
      login/ content/ media/ redirects/
    api/                      feedback, cron
    robots.ts  sitemap.ts  logo.png/  social-card.png/
    global-not-found.tsx
  components/                 presentation, mostly server components
    blocks/BlockRenderer.tsx  the block → React mapping
    pages/EntryArticle.tsx    the content page
  lib/
    site.ts                   canonical host, environment, indexing switch
    i18n/                     locales, localised route segments, dictionaries
    db/                       Drizzle schema and client
    content/                  block schema, safe inline renderer, repository
    seo/                      metadata, canonical, hreflang, JSON-LD
    analytics/                event contract, consent
    auth/                     scrypt hashing, sessions, throttling
    admin/                    validation, server actions, queries, readiness
    migration/                generated legacy redirect table
  proxy.ts                    edge proxy (Next 16's middleware convention)
```

Two root layouts is deliberate: the CMS never shares a layout, a font payload or
a bundle with the public site.

## Data flow on publish

```
Editor clicks Publish
  → saveTranslation()  (server action)
      requireUser("editor")                    role check, server-side
      Zod validation of every field
      snapshot previous state → entry_revisions
      recompute search_text from the body
      preserve the original published_at
      if the path changed → insert a permanent redirect
      revalidatePath: /{locale}, /{locale}/{path}, /{locale}/{section}, /sitemap.xml
  → Vercel serves fresh static HTML from the CDN on the next request
```

Scheduled publishing is a Vercel Cron hitting `/api/cron/publish-scheduled`
every 15 minutes. The same job flips pages whose re-verification date has passed
to `needs_update`, and prunes expired sessions.

## What is deliberately absent

- **No client-side rendering of content.** The failure mode of v1.
- **No ad code.** Not loaded, not configured, not dormant. See
  `docs/ADSENSE_READINESS.md`.
- **No Google Tag Manager.** One analytics destination and a typed event
  contract do not need a container. Reasoning in `docs/ANALYTICS.md`.
- **No AI-generated content pipeline.** The CMS has no "generate" button, by
  design.
