# Content model

Defined in `src/lib/db/schema.ts`. The guiding decision: **content is not
"posts"**. A beach, a train route, a festival and a practical guide have
genuinely different fields, and flattening them into one table would push that
difference into free text where neither the CMS nor structured data can reach it.

## Shape

```
entries                     the language-independent work
  └── entry_translations     one row per language edition
        ├── status, title, slug, path        ← per language
        ├── body (jsonb: typed blocks)
        ├── SEO fields, canonical, noindex
        ├── published_at, updated_at
        ├── last_verified_at, review_due_at  ← the trust surface
        └── entry_revisions                  ← immutable snapshots

entries ──┬── places       destination | place   (geo, hours, pricing, official URL)
          ├── events       event                 (dates, recurrence, venue, tickets)
          └── routes       route                 (distance, ascent, duration, GPX)

entries ──┬── entry_categories → categories → category_translations
          ├── entry_tags       → tags       → tag_translations
          ├── entry_sources    → sources
          └── entry_relations  → entries

authors → author_translations        media       redirects      page_feedback
users → sessions, audit_log
```

## Why localisation is split this way

`entries` holds what does not change between languages (type, author, hero
image, coordinates, event dates). `entry_translations` holds everything that
does — **including status**.

That one choice buys a lot:

- Catalan can be live while English is still in review.
- Each language gets its own natural slug, so `/ca/montserrat/com-arribar-hi/`
  and `/en/montserrat/how-to-get-there/` are the same work without either being
  a translation-shaped URL.
- `hreflang` is derived, not maintained. The alternates of a page are the
  published siblings of its `entry_id`; they cannot fall out of sync.
- `UNIQUE (locale, path)` means the translation table *is* the URL index. There
  is no second routing table to keep consistent.

## Entry types

| Type | Extension | Structured data | Typical use |
| --- | --- | --- | --- |
| `guide` | — | `Article` | The core product: practical, evergreen |
| `article` | — | `Article` | Long-form, explainers |
| `news` | — | `NewsArticle` | Selected current affairs, not a feed |
| `destination` | `places` | `TouristAttraction` | An area: Montserrat, Costa Brava |
| `place` | `places` | `TouristAttraction` / `Museum` / `Beach` | A specific point of interest |
| `event` | `events` | `Event` | Dated, possibly recurring |
| `route` | `routes` | `Article` | Walking and cycling routes |
| `page` | — | none | About, contact, legal, editorial policy |

Legal and about pages are ordinary `page` entries resolved through the same
path lookup. There is no special case in the router, and the editorial team can
edit their own legal text without a deploy.

## The trust fields

These are the reason to build a custom model rather than use a blog CMS.

| Field | Meaning |
| --- | --- |
| `published_at` | Set once. `saveTranslation` deliberately preserves it across edits — rewriting the publish date to look fresh is exactly the pattern Google treats as deceptive. |
| `updated_at` | Every save. Feeds `dateModified`. |
| `last_verified_at` | **When a human last checked the facts.** Rendered as the verification stamp, the one element on the page with its own colour. |
| `review_due_at` | When it must be re-checked. The cron job flips overdue pages to `needs_update` so they surface in the CMS instead of quietly ageing in public. |
| `entry_sources` | Reusable source records with a per-entry note and access date. Feeds the numbered register on the page and `citation` in JSON-LD. |

A page whose verification is more than a year old renders its stamp in amber
rather than moss. Admitting a page is ageing is better than implying it is
current.

## Blocks

`entry_translations.body` is an ordered array of typed blocks — **never stored
HTML**. Schema in `src/lib/content/blocks.ts`, validated with Zod on save and
again on read (`parseBody` drops anything malformed rather than throwing).

Four things follow from that:

1. **No stored content is ever rendered as HTML.** `dangerouslySetInnerHTML`
   appears in exactly one component, for JSON-LD produced by `JSON.stringify`,
   and a test enforces it. This is the compensating control for the CSP
   trade-off described in `SECURITY.md`.
2. **Precise structured data.** A FAQ block emits `FAQPage`; a steps block emits
   `HowTo`. Neither is emitted speculatively.
3. **Responsive without reflowing arbitrary markup.** A table can scroll
   horizontally on a phone because the renderer knows it is a table.
4. **Automatic quality checks.** Word count, reading time and the readiness
   audit all read the plain-text projection, which is recomputed from the body
   on every save and so cannot drift from what is rendered.

| Block | Purpose |
| --- | --- |
| `paragraph` | Body text, optionally the standfirst |
| `heading` | H2–H4, anchored, feeds the contents list |
| `keyFacts` | **The answer, above the fold.** Label/value rows, each citable to a source |
| `list` | Bulleted or numbered |
| `table` | Timetables, prices, comparisons; scrolls on narrow screens |
| `steps` | Ordered procedure → `HowTo` |
| `faq` | Real questions → `FAQPage` |
| `callout` | Info, tip, warning, or a pointer to the official source |
| `quote` | With attribution |
| `image` / `gallery` | From the media library, with credit |
| `map` | Coordinates shown immediately; the frame loads on request |
| `embed` | Allowlisted providers only, by id — never a raw URL |
| `relatedLinks` | Internal links to other entries |
| `divider` | A rule |
| `adSlot` | Reserves a position. **Renders nothing.** No ad code exists in this build |

### Inline formatting

Text fields accept a deliberately tiny markdown subset: `**bold**`, `_italic_`,
`` `code` ``, `[label](url)`. It is parsed into React elements by
`src/lib/content/inline.tsx` — never into an HTML string. Link hrefs go through
`safeHref`, which accepts only `http:`, `https:`, `mailto:` and site-relative
paths; `javascript:` and `data:` are rejected, and that is unit-tested.

## Media

Images are records, not files. Every one carries:

- localised **alt text** per language,
- **credit**, credit URL and **licence**,
- intrinsic width and height (so `next/image` reserves space and CLS stays at 0),
- an LQIP blur placeholder,
- a focal point, so cropping never decapitates the subject.

Credit and alt are not optional in practice: the media list shows a red *falta*
where they are missing, and the readiness audit counts them.

## Taxonomy

- **Categories** are hierarchical, hang off a section, and are localised. Seeded
  by `npm run db:seed:taxonomy` — structure only, no content.
- **Tags are a closed vocabulary.** Editors pick from a seeded list; they cannot
  invent tags. This is what stops a tag archive from becoming hundreds of
  near-empty, near-duplicate pages — a classic thin-content generator.

## Revisions and audit

Every save writes the previous state to `entry_revisions` before updating, with
the user who caused it. Every meaningful action — sign-in, publish, status
change, redirect, media change — lands in `audit_log`. Failed sign-ins are
counted there too, which is what powers login throttling without extra
infrastructure.

## Demo data

`entries.is_demo` exists so a developer can build a component against realistic
shapes without that data ever reaching the public.

- Excluded from every public query, by the same predicate that filters
  unpublished content.
- Excluded from the sitemap.
- Refused entirely by the renderer in production.
- Counted by the readiness audit, which warns while any remain.

Prefer local fixtures where you can. If you must put demo rows in the database,
flag them and delete them before launch.
