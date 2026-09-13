# Monetisation

## Position

Nothing is monetised today, and nothing should be until the site is worth
visiting twice. The order is deliberate:

```
useful content → returning readers → revenue
```

Reversed, it produces exactly what version 1 produced: a site optimised for ad
placement with nothing worth placing ads against, and a rejection.

## Why this product can eventually earn

A practical guide has better economics than a news site at this scale:

- **Evergreen pages compound.** A guide to getting to Montserrat earns for
  years. A news item earns for two days.
- **Commercial intent is naturally present.** Someone planning a trip is close
  to booking something. That is worth more per impression than a reader
  scrolling headlines.
- **Seasonal demand is predictable**, so content can be prepared ahead of it.
- **It does not compete with national newspapers**, which is the only reason a
  small operation can win the query at all.

## Revenue streams, in the order they should arrive

### 1. Display advertising (AdSense)

**Status: not enabled. No ad code exists in this build.**

The groundwork is in place and inert: `adSlot` blocks reserve in-article
positions and render nothing; the consent model already has an `ads` category,
denied by default; Consent Mode v2 advertising signals are wired to denied.

Still required before ads can run, and **not** built here:

- A **Google-certified CMP** integrated with the IAB TCF. The banner in this
  build is a first-party consent tool — correct for analytics, not sufficient
  for personalised ads to EEA/UK users.
- `ads.txt`.
- A CSP revision for the ad domains, reviewed rather than pasted.
- A density decision: how many units, and where. Ad density is itself a policy
  surface; a page that is mostly ads is a rejection reason of its own.

The gate is `docs/ADSENSE_READINESS.md`, whose best possible verdict is
`READY FOR MANUAL REVIEW`.

### 2. Affiliate links

Likely to out-earn display advertising here, because the intent is stronger.

Candidates that fit the content: accommodation, tickets and guided visits,
transport passes, equipment for routes.

Rules, non-negotiable:

- **Relevance first.** An affiliate link goes on a page because a reader
  planning that trip needs it, not because the page needed a link.
- `rel="sponsored nofollow"` on every one. Google requires it, and it protects
  the site.
- **Disclosed in the page**, not only in a policy. Spanish and EU consumer law
  require it, and readers deserve it.
- Tracked as `affiliate_click` with a partner and placement — the event already
  exists in the contract.
- **No page exists because of an affiliate programme.** The moment that changes,
  the site is an affiliate farm with a guide attached, and both the reader and
  Google will notice.

### 3. Newsletter

Not revenue on its own, but the thing that makes a site a destination rather
than a search result. A seasonal digest — what is open, what is closed, what is
worth a trip this month — is genuinely useful for this subject.

The `newsletter_signup` event exists. Nothing else is built: it needs a provider
decision and a privacy-policy update before it collects a single address.

### 4. Later, if the audience justifies it

- **Direct sponsorship** by a tourism board or a regional operator. Higher value
  than programmatic, but needs an audience worth pitching and clear labelling.
- **Licensed structured data.** If the destination, event and route data becomes
  genuinely comprehensive, it has value beyond the website.

## What will not be done

Stated so it is a decision rather than a temptation:

- No content written to place an ad against.
- No pagination or splitting an answer across pages to multiply impressions.
- No interstitials or layout shifts from ads. They break Core Web Vitals and
  they are hostile.
- No sponsored content presented as editorial.
- No affiliate link without disclosure.
- No AI-generated content to increase inventory. That is the specific failure
  being corrected.

## Measuring whether it is working

Before revenue, the metrics that predict it:

| Signal | Where | Why it matters |
| --- | --- | --- |
| Returning visitors | GA4 | Are people coming back, or is this a one-search site |
| `useful_feedback` positive rate | `page_feedback` table | The quality signal that is not a pageview |
| Pages per session | GA4 | Do the clusters and the related rail work |
| Impressions on position 8–20 | Search Console | Real demand, nearly won — the best improvement targets |
| `internal_search` with 0 results | GA4 | What readers expect and do not find; the content backlog, from readers |

`internal_search` with zero results is the most directly actionable metric on
this list, and it is the reason internal search was built server-side rather
than skipped.
