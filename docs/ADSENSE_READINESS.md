# AdSense readiness

## Verdict

```
NOT READY
```

Because there is no editorial content yet. That is the expected state at the end
of the platform phase, not a problem to solve in code.

Run `npm run audit:readiness` for the live checklist, or open `/admin` — the
dashboard shows the same report.

## The three states

| State | Meaning |
| --- | --- |
| `NOT READY` | A blocking check fails. Do not apply. |
| `TECHNICALLY READY` | Nothing blocking fails, but warnings remain. Address them. |
| `READY FOR MANUAL REVIEW` | Every check passes. **Now do the human audit below.** |

There is no fourth state. `GUARANTEED APPROVAL` does not exist and will never be
reported: a Google policy specialist makes a judgement about originality and
usefulness that no script can score.

## What is checked

`src/lib/admin/readiness.ts`. Blocking checks gate the verdict; the rest are
warnings.

| Check | Blocking | Passes when |
| --- | --- | --- |
| Database configured | yes | `DATABASE_URL` is set |
| Published pages | yes | At least one page is published |
| Legal and editorial pages | yes | Legal notice, privacy, cookies, editorial policy, corrections, sources, accessibility, about and contact — published **in all three languages** |
| Identified authors | yes | At least one author has a real biography |
| Indexing enabled | yes | `NEXT_PUBLIC_ALLOW_INDEXING=true` on production |
| Cited sources | no | ≥ 80% of entries cite at least one source |
| Verification dates | no | ≥ 80% of published pages record `last_verified_at` |
| Substantial pages | no | No published page under 250 words |
| Image attribution | no | Every image has a credit and alt text |
| No demo data | no | No `is_demo` rows remain |
| No ad code | — | Always passes; enforced by a test |

### On the 250-word warning

Length is **not** a ranking factor, and no Google documentation sets a minimum.
The threshold is here because a page that answers less than the search snippet
already did has no reason to exist — which is what a reviewer calls low value.
A genuinely complete 200-word answer is fine; ignore the warning and note why.

### On article counts

There is no minimum article count in AdSense policy, in the Search Essentials,
or anywhere else Google publishes. "You need 30 posts" is folklore. This
checklist contains no such threshold and no traffic or age threshold either.

## Why v1 was rejected, and what changed

| v1 | v2 |
| --- | --- |
| 42 auto-generated news items, ~500 words, no byline | No content until the team writes it. The CMS has no generation feature. |
| No authors | Author entity with per-language biographies, rendered on every page and in `Person` structured data |
| No sources | Reusable source records, a numbered register on the page, `citation` in JSON-LD |
| No indication of freshness | `last_verified_at` as a first-class field, rendered as the page's most prominent trust element |
| Client-rendered homepage, no `<h1>` | Static HTML with the full body, verified in a production build |
| Catalan only | ca / es / en, each with its own slugs and correct `hreflang` |
| Competing with national newspapers | A practical reference that national newspapers do not produce |
| **Ad code already live on a rejected site** | No ad code anywhere. Not disabled — absent. |

The last row matters for the reapplication. The AdSense script is currently
serving on the rejected site; it should be removed when v2 goes live, which
happens automatically since v2 does not contain it.

## The human audit

Run this only when the command says `READY FOR MANUAL REVIEW`. Open the site as
a stranger would, on a phone, and answer honestly:

1. **Pick any page. Could a generic travel aggregator have produced it?** If
   yes, that page is not ready. The defensible content is what a well-informed
   resident knows and an aggregator cannot: which car park fills first, which
   entrance is step-free, what closes in February.
2. **Is the answer visible without scrolling?** On a phone. If the practical
   answer is below three paragraphs of scene-setting, restructure it.
3. **Who wrote this, and would I believe them?** Click the byline. Is there a
   real person with a real biography?
4. **Where did the facts come from?** Is the source official and primary, and is
   the access date recent?
5. **Does anything look automated?** Repeated sentence shapes, templated
   openings, near-identical pages differing only by a place name. One such
   cluster undermines everything else.
6. **Do the three languages all read like they were written by a speaker?** A
   machine translation that has not been edited is worse than not offering the
   language.
7. **Do the legal pages contain real details?** A registered name, a real
   address, a working contact route. Placeholders are an immediate fail.
8. **Does navigation work?** Can you get from the homepage to any page in three
   clicks, and back?

## Before applying

- [ ] `npm run audit:readiness` reports `READY FOR MANUAL REVIEW`
- [ ] The human audit above is done, by a person, on a phone
- [ ] Legal pages contain the company's real details, reviewed by whoever is
      responsible for them
- [ ] Search Console shows the site indexed, with the v1 articles dropped
- [ ] Analytics shows real users reaching real pages, not just the homepage
- [ ] The old AdSense snippet is gone from production (it is not in this
      codebase, so this is automatic once v2 is live)
- [ ] Someone has decided this is worth doing now rather than after another
      content cluster

Applying and being rejected a second time is materially worse than applying late.

## When ads are eventually enabled

The technical groundwork exists, deliberately inert:

- `adSlot` blocks reserve in-article positions and **render nothing**.
- The consent model already has an `ads` category, denied by default.
- Consent Mode v2 advertising signals are wired and set to denied.

Still required at that point, and **not** built here:

- A **Google-certified CMP** integrated with the IAB TCF. The current banner is
  a first-party consent tool — correct for analytics, not sufficient for
  personalised ads to EEA/UK users.
- `ads.txt`.
- A CSP revision: `script-src` and `frame-src` would need the ad domains, and
  that change should be reviewed rather than pasted.
- A layout policy decision: how many units, and where. Ad density is itself a
  policy surface, and a page that is mostly ads is a rejection reason of its own.

See `MONETIZATION.md` for the sequencing.
