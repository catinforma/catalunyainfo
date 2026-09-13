# CatalunyaInfo 2.0

The digital guide to Catalonia. A practical, sourced, multilingual reference —
not a news feed.

This repository is a **complete rebuild**. Version 1 was rejected by Google
AdSense for low-value content, and it had a matching technical problem: the
homepage shipped an empty HTML shell and loaded its content from an API in the
browser, so crawlers saw `Carregant…` and no `<h1>`. Both problems are addressed
at the root here rather than patched.

**There is no editorial content in this repository.** No article, no news item,
no guide, no placeholder prose pretending to be one. The platform is built so
that real content, written by the team, can be added through the CMS.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in DATABASE_URL if you want the CMS
npm run dev                    # http://localhost:3000
```

The site builds, boots and renders **without a database**. Public pages show
honest empty states and the CMS explains what is missing. Add `DATABASE_URL` to
turn the CMS on:

```bash
npm run db:push                # create the schema
npm run db:seed:taxonomy       # categories and tags — structure only, no content
CI_PASSWORD='a long passphrase' npm run admin:create-user -- \
  --email you@example.com --name "Your Name" --role admin
```

Then sign in at `/admin`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (regenerates the legacy redirect table first) |
| `npm run check` | Typecheck, lint and tests — run this before pushing |
| `npm test` | Unit tests (Node test runner, no framework) |
| `npm run db:push` | Apply the schema to the database |
| `npm run db:generate` / `db:migrate` | Versioned migrations for production |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:seed:taxonomy` | Categories and the controlled tag vocabulary |
| `npm run admin:create-user` | Create or update a CMS account |
| `npm run audit:readiness` | AdSense readiness checklist |
| `npm run build:redirects` | Rebuild the edge redirect table from `migration/redirects.csv` |

## How it is put together

- **Next.js 16 (App Router) on Vercel.** Every public page is statically
  rendered and revalidated (ISR), so the HTML a crawler receives is complete.
- **Postgres + Drizzle.** A domain model with real entities — Entry, Place,
  Event, Route, Source, Author — not a pile of generic posts.
- **Three languages from the first line of code.** `/ca/`, `/es/`, `/en/`, each
  with its own natural slugs, correct `hreflang`, and independent workflow state.
- **A purpose-built CMS** at `/admin`, with a block editor, a seven-state
  workflow, revisions, scheduling, translation drafts and per-page verification
  dates.
- **Zero ad code.** Ad *placements* exist as layout placeholders; no ad script
  is loaded anywhere, and a test enforces that.

Read `docs/ARCHITECTURE.md` for why, and `docs/PROJECT_PLAN.md` for what happens
next.

## Documentation

| File | Subject |
| --- | --- |
| [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) | Phases, decisions taken, what is left |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack choice, rendering, data flow |
| [docs/CONTENT_MODEL.md](docs/CONTENT_MODEL.md) | Entities, blocks, localisation |
| [docs/EDITORIAL_WORKFLOW.md](docs/EDITORIAL_WORKFLOW.md) | How a page gets published |
| [docs/SEO.md](docs/SEO.md) | URLs, canonical, hreflang, structured data |
| [docs/ANALYTICS.md](docs/ANALYTICS.md) | GA4, consent, the event contract, why not GTM |
| [docs/SEARCH_CONSOLE.md](docs/SEARCH_CONSOLE.md) | Verification, sitemaps, what to watch |
| [docs/MONETIZATION.md](docs/MONETIZATION.md) | Revenue model and its sequencing |
| [docs/ADSENSE_READINESS.md](docs/ADSENSE_READINESS.md) | The checklist and current verdict |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel, domains, DNS, environments |
| [docs/SECURITY.md](docs/SECURITY.md) | Headers, CSP, auth, data handling |

## The content rule

While the platform is being built, **nothing editorial is generated here**. If
you need sample data to develop a component, create it with the `isDemo` flag
set: demo rows are excluded from every public query, from the sitemap, and from
production rendering entirely. Delete them before launch — the readiness check
will tell you if any remain.
