# Project plan

## The premise

CatalunyaInfo is **the most useful digital guide to Catalonia**, not a
newspaper. It does not compete with La Vanguardia, 3Cat, ARA, El Nacional,
VilaWeb, El Periódico or Nació, and it does not try to win on publishing speed.

It wins on being the page someone actually needed: how to get to Montserrat on a
Sunday, which beaches have lifeguards in September, what the calendar of public
holidays is next year, what a comarca actually is. Content with a long life, a
named author, a cited source and a date on which a human last checked it.

That last part — the verification date — is the product's differentiator and the
reason the schema, the CMS and the design all treat it as a first-class field
rather than a footnote.

## Where the audit landed

Inspected `https://www.catalunyainfo.com` on 2026-09-13:

| Finding | Evidence | Consequence |
| --- | --- | --- |
| Content injected client-side | Homepage HTML contains `Carregant…` ×3 and **no `<h1>`** | Crawlers saw an empty page |
| 42 thin auto-generated news items | `/article/*.html`, ~500 words, no byline, no sources | The AdSense rejection |
| Single language | Catalan only, no `hreflang` | No reach beyond one audience |
| Ad code already live | `pagead2.googlesyndication.com`, `ca-pub-3574717751788007` | Ads on a rejected site |
| Apex → www as **307** | `curl -I https://catalunyainfo.com/` | Temporary redirect on a permanent move |
| Hosting | `Server: Vercel` | Vercel stays; the app is replaced |

`www` is already the indexed host, so **`https://www.catalunyainfo.com` stays
canonical**. Moving to the apex now would force a re-crawl of everything for no
benefit. The apex redirect becomes permanent.

## Decisions taken

| Decision | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 App Router | The CMS is an application, not a publishing surface. Full comparison against Astro in `ARCHITECTURE.md`. |
| Rendering | Static + ISR for all content | The v1 failure was client-side content. This makes it structurally impossible. |
| Data | Postgres + Drizzle | Domain-specific entities; no vendor holding the content. |
| CMS | Purpose-built, in-app | Off-the-shelf CMSs do not model places, routes, sources and verification dates. |
| Canonical host | `www.catalunyainfo.com` | Already indexed; changing costs equity for nothing. |
| `x-default` | English edition | Visitors matching none of ca/es/en are international by definition. |
| Legacy articles | **410 Gone**, not redirected | They are the content that caused the rejection. Funnelling 42 stale URLs into a hub is a soft-404 pattern. |
| GTM | Not used | One destination, one typed event contract. Revisit if a second destination appears. |
| Ads | None loaded at all | Not "disabled" — absent, and enforced by a test. |
| Indexing | Off until content exists | `NEXT_PUBLIC_ALLOW_INDEXING` gates robots.txt, the sitemap and every page's robots meta. |

## Phases

### Phase 1 — Platform ✅ complete

Everything in this repository.

- [x] Audit of v1: URLs, rendering, sitemap, headers, hosting
- [x] Stack decision with a written comparison
- [x] Domain model: 20 tables, per-language editions, type extensions
- [x] URL architecture: `/ca/`, `/es/`, `/en/` with independent natural slugs
- [x] Universal resolver: hubs, authors, topics, content, redirects, real 404
- [x] Block content model: 16 typed blocks, no stored HTML
- [x] Design system: cartographic palette, Fraunces + IBM Plex Sans, map-margin layout
- [x] Technical SEO: canonical, hreflang + x-default, sitemap with alternates, robots, JSON-LD
- [x] CMS: block editor, 7-state workflow, revisions, scheduling, translation drafts, media, redirects
- [x] Auth: scrypt, DB-backed sessions, role checks in the actions, login throttling
- [x] Security headers and CSP
- [x] Analytics layer: typed events, consent-gated GA4, Consent Mode v2
- [x] Migration: `migration/redirects.csv`, 17 redirects + 42 × 410
- [x] Readiness checker: script + CMS dashboard
- [x] 26 tests; typecheck and lint clean; production build verified

### Phase 2 — Launch infrastructure (needs credentials or a decision)

These are blocked on things only the owner can provide.

- [ ] **Create the Postgres database** (Neon or Vercel Postgres), set
      `DATABASE_URL` in Vercel, run `npm run db:push`
- [ ] **Point the domain at the new project** in Vercel, with apex → www as a
      permanent redirect (`DEPLOYMENT.md`)
- [ ] **Create CMS accounts** with `npm run admin:create-user`
- [ ] **Fill in the real company details** for the legal pages: registered name,
      tax number, registered address, hosting provider, data-protection contact.
      The pages exist as CMS entries; the text is a legal matter, not a
      development one.
- [ ] **Decide the author identities** — real names and biographies. Anonymous
      content is one of the strongest low-value signals there is.
- [ ] Connect GA4 and Search Console (see below)

### Phase 3 — Content (the team's work, not this repository's)

The order matters more than the volume. Google publishes **no** minimum article
count, and none is assumed here.

1. **Trust pages first.** About, contact, editorial policy, corrections policy,
   sources policy, privacy, cookies, accessibility. In all three languages.
   The readiness check blocks on these.
2. **One cluster, done completely.** Pick a single subject — Montserrat is the
   obvious candidate — and publish the whole cluster: the destination page, how
   to get there, when to go, what it costs, where to eat, nearby routes. A
   complete cluster demonstrates the product far better than thirty orphans.
3. **Then the next cluster.** Repeat. Depth beats breadth for both readers and
   reviewers.
4. **Catalan first, then Spanish, then English.** The CMS creates translation
   drafts, but a draft is never published without a human reading it in the
   target language.

### Phase 4 — Indexing and measurement

Only once Phase 3 has produced real clusters:

- [ ] Set `NEXT_PUBLIC_ALLOW_INDEXING=true` in Production **only**
- [ ] Verify the property in Search Console, submit the sitemap
- [ ] Inspect a representative URL per language; confirm the rendered HTML
      contains the `<h1>` and the body (the v1 regression test)
- [ ] Watch that the 42 `/article/*` URLs drop out on 410
- [ ] Confirm GA4 receives `article_view` and `internal_search`

### Phase 5 — Monetisation

Not before Phase 4 has run for long enough to show real users on real pages.
See `MONETIZATION.md` and `ADSENSE_READINESS.md`. The readiness command is the
gate, and its best possible verdict is `READY FOR MANUAL REVIEW`.

## On MCP access

The brief anticipated using MCP servers for Search Console, GA4 and GTM, with a
standing instruction not to invent data from them.

**No such MCP server is connected to this session.** The only Google MCP
available here is `google-ads-mcp`, which covers Google Ads — a different
product from AdSense, Search Console and Analytics, and not useful for this
work. So this document contains no Search Console figures, no GA4 metrics and no
claims about current indexing status, because there is no way to obtain them
honestly.

To enable that work later, connect:

| Server | Used for |
| --- | --- |
| Search Console MCP | Coverage, queries, CTR, canonical detected, Core Web Vitals, sitemap submission, URL inspection |
| GA4 Data/Admin MCP | Property configuration, traffic, landing pages, event delivery |
| GTM MCP | Only if the GTM decision is ever revisited |

`SEARCH_CONSOLE.md` and `ANALYTICS.md` list exactly which queries to run once
they are available, so the audit is a matter of execution rather than design.

## Known gaps

Stated plainly rather than left to be discovered:

- **Topic pages are a stub.** `/ca/temes/` renders an empty state; per-tag
  archives are not built. They are worth building only once there is enough
  content for a tag archive not to be a thin page.
- **No media upload.** The media library registers images by URL with credit and
  alt text; it does not host uploads. Wire Vercel Blob when there is a real
  image workflow.
- **Pagination.** Hubs cap at 24 items. Fine now, needs paging past ~50 entries
  per section.
- **`CSP allows 'unsafe-inline'` for scripts.** A deliberate, documented
  trade-off — a per-request nonce is incompatible with CDN-cached static HTML.
  The compensating control is that no stored content is ever rendered as HTML,
  which is enforced by a test. Full reasoning in `SECURITY.md`.
- **Search uses `simple` text config for Catalan.** Postgres ships no Catalan
  dictionary, so Catalan search has no stemming. Spanish and English do.
