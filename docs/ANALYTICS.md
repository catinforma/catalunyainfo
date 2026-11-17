# Analytics

## Current state

**Live since 2026-09-15.**

| | |
| --- | --- |
| Google tag loaded | `GT-KTR3FB62` |
| Destinations it feeds | `G-FQ089T86TN` (CatalunyaInfo web, the new property) and `G-TXB0TDCZ2X` (the version-1 property) |
| Property | `properties/554310792` (CatalunyaInfo web) |
| Stream id | 15781356691 |
| Event data retention | 14 months |
| Custom dimensions | All seven registered, event-scoped |
| Env var | `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, production only |

### Why the tag id is not the measurement id

The obvious thing to configure is the new stream's measurement id,
`G-FQ089T86TN`. That does not work, and fails silently:

```
GET googletagmanager.com/gtag/js?id=G-FQ089T86TN   404
GET googletagmanager.com/gtag/js?id=GT-KTR3FB62    200
```

When the stream was created, Google attached it as a **destination** of the
Google tag that already existed on the domain from version 1, rather than
giving it a tag of its own. A destination id is not servable. The browser
requested the file, got a 404, and the library never ran - so `dataLayer`
looked perfectly correct, no console error appeared, `window.gtag` was a
function, and yet not one hit was ever sent. The giveaway is that
`gtag("get", id, "client_id", cb)` never calls back.

Loading the tag id instead fans out to every destination, which is verified:
one `page_view` arrives at each of the two properties per page.

**Consequence worth knowing:** the version-1 property also receives this
traffic. To stop that, remove its destination from the Google tag, or give the
new stream its own tag - then switch this variable to `G-FQ089T86TN`.

## Why not Google Tag Manager

The brief asked for GTM only if it earns its place. It does not, yet.

**What GTM would cost.** A container to download and execute on every page, in
front of the analytics it loads. A second place where tags can be added without
code review — which is precisely the hole that lets a stray ad pixel or a
third-party script onto a site that is trying to demonstrate quality. Another
consent integration to get right. And a debugging surface where "the event
didn't fire" can mean the code, the trigger, the variable or the container
version.

**What it would buy.** The ability to add tags without a deploy. With one
destination, a typed event list and a deploy that takes two minutes, that is not
worth the above.

**When to revisit.** A second genuine destination (a conversion pixel for a real
campaign, a Meta or affiliate tag), or non-developers needing to change
measurement. At that point GTM's server-side container is the option to look at,
since it also removes the client-side weight.

Until then GA4 is loaded directly, gated on consent, with a typed event
contract that lives in the repository and is reviewed like any other code.

## Consent

Implemented in `src/components/ConsentGate.tsx` and
`src/lib/analytics/consent.ts`.

1. **Denied by default.** On a first visit, no Google tag is inserted. Nothing
   third-party is requested on the first page view — which is also the single
   biggest lever on the LCP of a content page.
2. **The visitor chooses.** Accept all, or necessary only. The choice is stored
   in a first-party cookie for 180 days.
3. **Consent Mode v2** signals are set at the top of the same script that
   initialises the tag, so `gtag('consent','default',…)` always runs before the
   first `config` command, as Google requires.
4. On consent, `analytics_storage` is granted; the advertising signals stay
   denied, because there is no advertising.

The consent state is read through `useSyncExternalStore`, not copied into React
state in an effect, so the banner cannot flash at a visitor who has already
answered.

### EEA note, for when ads are eventually considered

Serving personalised ads to EEA/UK users requires a **Google-certified CMP**
integrated with the IAB TCF. The banner here is a first-party consent tool, not
a certified CMP. It is correct for analytics; it is not sufficient for ads. That
is a Phase-5 decision, recorded in `MONETIZATION.md`.

## The event contract

`src/lib/analytics/events.ts`. A discriminated union — an event that is not in
the list cannot be sent, which is what keeps a GA4 property from filling up with
ad-hoc names nobody can interpret six months later.

### Tracking plan (updated 17 Nov 2026)

Inventory before this update (GA4, 28 days to 16 Nov 2026): only two of the
contract's events had ever fired, `share` (8) and `useful_feedback` (5). The
rest of the traffic is GA4's own: `page_view`, `session_start`, `first_visit`,
`user_engagement`, and enhanced measurement's `click` (outbound, 3,122),
`scroll` (782), `file_download` (101), `form_start`/`form_submit` (the search
form) and `view_search_results` (45).

Every event below goes through `track()`, so nothing is sent before the visitor
accepts measurement. "Dimension" is the GA4 dimension that makes a parameter
reportable: *built-in* needs nothing, *registered* is already set up in the
property, **register** means the owner must create it (Admin → Custom
definitions → Create custom dimension, scope Event) before the data counts —
registration is not retroactive.

| Event | Trigger | Parameters | Dimension | Question it answers | Status |
| --- | --- | --- | --- | --- | --- |
| `calculator_use` | First change of a calculator's result caused by the visitor's own input; once per tab session per calculator (`lib/analytics/calculator-use.ts`, hook `use-calculator-use.ts`). The server-rendered example and a result restored from a shared `#hash` link do not count. | `calculator_id` (`CALCULATOR_USE_IDS`), `locale` | `calculator_id`: **register** ("Calculadora"); `locale`: registered | Which tools are used, not just read about; use rate per tool = users with the event ÷ users on the page | New |
| `whatsapp_channel_click` | Click on our channel link (`FollowChannel.tsx`) | `link_context` = `article_box` \| `daily_box` \| `footer` \| `other`, `locale` | registered (`link_context`) | Which placement grows the owned audience | New |
| `share` | Share bar: a channel link, the copy button, or a completed native share sheet (`ShareControls.tsx`). This is the plan's *share_click*, under GA4's recommended name so it feeds the built-in reports. | `method`, `content_type`, `item_id` (path, no query), `locale` | built-in (`method`); registered (`content_type`, `locale`) | Which pages readers pass on, and through which channel. The shared URL carries `utm_source=share&utm_medium=<method>` | Live since 12 Nov |
| `internal_search` | Search results page rendered with a query of 2+ characters (`SearchAnalytics.tsx`) | `search_term_length`, `results_count` (articles + direct pages), `locale` | registered (`results_count`, `locale`) | How often a search finds nothing. The term itself is **not** sent by us: enhanced measurement's `view_search_results` already carries it (see below) | New |
| `outbound_official_source_click` | Click on a link in a page's source list (`.ci-sources`, any domain: by house rule every listed source is official or primary), or on an official domain anywhere else (`OFFICIAL_DOMAINS` in `lib/analytics/clicks.ts`) | `link_domain` (host only, never the URL), `link_context` = `sources` \| `calculator` \| `content`, `locale` | built-in (`link_domain` → "Link domain"); registered (`link_context`) | Do readers check the official source, and from where | New (replaces the never-wired `external_link`) |
| `ics_subscribe_click` | Click in the town/city "Add to your calendar" block (`CalendarSubscribe.tsx`), recognised from the href | `method` = `apple` (webcal) \| `google` \| `download`, `locale` | built-in (`method`) | Is the calendar feed product used, and which app | New |
| `useful_feedback` | "Was this useful?" yes/no (`PageFeedback.tsx`). This is the plan's *page_feedback*; the name is kept so the history since September stays in one series. | `is_useful`, `content_type`, `locale` | registered | The quality signal that is not a pageview | Live |
| `article_view`, `news_view`, `related_content_click`, `language_change`, `map_interaction`, `affiliate_click`, `newsletter_signup` | — | see `events.ts` | — | — | Declared, not wired |

The three link events (`whatsapp_channel_click`, `outbound_official_source_click`,
`ics_subscribe_click`) come from one delegated click listener mounted in the
layout (`components/AnalyticsClicks.tsx`), so the server-rendered links stay
plain links. Everything else outbound is left to enhanced measurement's own
`click`, so nothing is counted twice under our names.

Suggested key events (Admin → Events → Mark as key event), once a week of data
shows the volumes: `calculator_use` and `whatsapp_channel_click`.

### Search terms (owner decision)

Enhanced measurement's site search is on, so `view_search_results` sends the raw
`search_term`, and the search page's `page_location` carries `?q=` as well. In
the 28 days to 16 Nov 2026 the 36 distinct terms were place names, topics and one
postal code; none was personal. That is GA4's default behaviour and is left as
it is. If it should ever change: Admin → Data streams → the web stream →
Redact data → add `q` to the query parameters to redact, then check in
DebugView whether `view_search_results` still carries a term.

### AI assistant and shared-link traffic: GA4 admin, no code

GA4's default channel group already has an **AI Assistant** channel (28 days to
16 Nov 2026: chatgpt.com 624 sessions, gemini.google.com 38, perplexity.ai 5,
claude.ai 1). A few visits fall outside it: `perplexity` as a bare source
(Unassigned, 2), chatgpt.com as Referral (3), notebook.google.com (1). And the
share bar's own visits (`utm_source=share`) land in **Unassigned** (6), because
GA4 has no default rule for that medium list.

Steps for the owner (Admin → Data display → Channel groups → Create new channel
group, start from a copy of the default):

1. Add a channel **AI assistants** with the condition *Source matches regex*
   `chatgpt|openai|perplexity|copilot|gemini|bard|claude|anthropic|mistral|deepseek|notebooklm|notebook\.google|meta\.ai|grok|phind`
   and move it above Referral.
2. Add a channel **Shared links** with *Source exactly matches* `share`, above
   Unassigned.
3. Save. The new group applies to past data too and is chosen in reports'
   dimension picker. Nothing in the site's code changes.

Traffic from assistants that arrives without a referrer shows as Direct, so
treat the channel as a floor, not the total.

### Privacy rules, enforced by the types

- **No personal data.** No email, no name, no user id, no IP.
- **No raw search terms from our code.** `internal_search` sends the *length* of
  the query and the number of results, never the text. A search term is
  user-entered free text and can contain anything.
- **No URLs with query strings.** `safePath()` strips query and hash before any
  path is sent; outbound links are reported by host only (`link_domain`), and
  placement and method parameters are closed lists, never free text
  (tests/analytics-events.test.ts checks both).
- **Calculator inputs never leave the page.** `calculator_use` says *that* a
  tool was used, not with which salary, dates or amounts.
- GA4 snake_case parameter names, so they map to custom dimensions without a
  transformation layer.

`track()` is a silent no-op when consent has not been granted or no measurement
id is set. Analytics must never break a page, so it is wrapped in a `try`. It
returns whether the event was handed to gtag, so `calculator_use` is not marked
as sent for the session while consent is still missing.

### Validating the 17 Nov events after deploy

1. Register `calculator_id` first (see the table), so the first day counts.
2. With consent accepted and `?debug_mode=true` (DebugView): change a value in
   `/es/calculadoras/sueldo-neto/` (one `calculator_use`; a second change sends
   nothing), click the footer WhatsApp link, a BOE link in a source list, the
   three calendar links on `/ca/festius/sabadell/`, and search `/es/buscar/?q=zzzz`
   (`internal_search` with `results_count` 0).
3. Reject consent and repeat: no request to `googletagmanager.com` or
   `google-analytics.com` at all.

## Setting GA4 up

1. Create a GA4 property. Data stream: Web, `https://www.catalunyainfo.com`.
2. Set `NEXT_PUBLIC_GA4_MEASUREMENT_ID` in Vercel → **Production only**. Leaving
   it out of Preview keeps test traffic out of the property.
3. Register the event-scoped custom dimensions. Done via the Admin API rather
   than seven forms; the parameter name must match the event contract exactly,
   and an unregistered parameter is collected but never reportable. Note that
   `displayName` rejects an apostrophe, which is easy to trip over in Catalan.
4. Set event data retention to 14 months. Two is the default, which makes last
   autumn invisible by the time this autumn matters. Leave Google Signals off:
   it adds a consent surface for no benefit here.
5. Mark `newsletter_signup` as a key event when a newsletter exists.

### On the "0% consent" warning in tag diagnostics

Google flags the tag as *Urgent* because 100% of consent signals come back
denied. That is correct and should not be "fixed": the diagnostic weighs
advertising consent, and this site denies `ad_storage`, `ad_user_data` and
`ad_personalization` permanently because it carries no advertising. What
matters is the analytics signal, and the hit confirms it:

```
gcs=G101   ad_storage denied · analytics_storage granted
```

Revisit only if advertising is ever switched on — at which point a certified
CMP is required anyway.

### Validating, in order

1. **DebugView** — check the shape of each event, once each.
2. **Realtime** — confirm delivery from a real page load with consent granted.
3. **After 48 hours** — confirm the custom dimensions are populated, not `(not
   set)`.
4. **Deny consent and reload** — the network panel should show **no** request to
   `googletagmanager.com` at all.

Once a GA4 MCP server is connected, steps 1–3 can be run from here directly.
**No such server is connected to this session**, so this document contains no
metrics — inventing them would be worse than having none.

## Vercel Analytics

Not enabled. Vercel's Speed Insights would give field Core Web Vitals without a
consent surface, since it sets no cookie. It is worth considering once there is
traffic; it costs a small script, so it is a deliberate decision rather than a
default. Search Console's Core Web Vitals report covers the same ground for free
and is already part of the launch checklist.

---

# Qualified search: the growth reporting layer

**Added 29 September 2026.** `npm run growth:report -- <rows.json> [previous.json]`

## The problem it solves

Search Console credits this property with impressions for strings like
`d'acord`, `check again`, `si`, `las dos cosas`, `para ir mañana`, `avui` and
`demà`, at positions 2–6, which are never clicked. Those are not searches. They
are consistent with fan-out sub-queries generated by an AI system, and GA4
independently reports an **AI Assistant** channel with real sessions.

Over 16–29 September they are 4.7% of impressions and 0% of clicks. That alone
moves site-wide CTR enough to make it useless as a KPI: the headline fell from
11.2% on 17 September to 2.5% on 27 September without any page getting worse.

**Site-wide CTR is therefore not a KPI on this site.** Anything decided from it
is decided from a robot's vocabulary.

## What the layer computes

It does not replace Search Console's figures. It is an analysis layer on top of
the same rows, and Search Console's own totals are printed alongside.

| Bucket | Definition |
| --- | --- |
| **HUMAN** | Contains a word from a cluster vocabulary |
| **BRAND** | Our own name, any spelling |
| **AI / FRAGMENT** | Every token is a confirmation, a deictic, a bare temporal word or a bare date, and the query is short |
| **UNCLASSIFIED** | None of the above. Never counted as qualified |

- **Qualified clicks** = clicks on HUMAN rows.
- **Qualified CTR** = HUMAN clicks ÷ HUMAN impressions.

Brand is excluded from qualified because brand CTR measures whether people
already know us, not whether the content works. Unclassified is excluded
because we do not know what it is, and guessing would be the error this layer
exists to remove.

## Order of checks

1. **Brand.**
2. **Topical.** A topical query is *always* human, however short — `bolets` is
   one word and is the most valuable query on the site.
3. **Noise.**
4. **Unclassified.**

A fragment next to a topical word stays human: `on trobar bolets avui` is a
real question. Matching is word-boundary, so `si` does not match inside
`sitges`.

## Auditability is the design constraint

Every query gets a `kind` **and a written reason**, and the report prints both
lists in full — what it called noise, and what it could not classify. A
classifier whose output cannot be disputed is worse than none, because it
launders a guess into a number.

This is not decoration. The first run on real data put five Easter queries —
`semana santa 2027 catalunya`, `divendres sant 2027`, `dilluns de pasqua 2027`,
`pasqua florida 2027`, `setmana santa catalunya 2027` — in the unclassified
list, all on page one. They belonged to the holiday-calendar cluster and the
vocabulary was missing them. Adding them moved that cluster from 64 to 112
impressions, and it is now the second-largest on the site.

## Opportunity score

A handful of additions, not a model, and every term is printed with the score.

| Term | Weight |
| --- | --- |
| Human query | +3 |
| Volume | +impressions ÷ 10, capped at 4 |
| Position 5–20 | +3 |
| Position 20–40 | +1.5 |
| Position over 40 | +0.5 |
| Position 3 or better | −4 (already won) |
| Three words or more | +2 (a general page answers it poorly) |
| Impressions with no clicks | +1 |
| Not a human query | score 0, flat |

**No search volume is invented.** Impressions are the only volume signal used,
because they are the only one measured. A test asserts the printed terms sum to
the printed score, so the explanation cannot drift from the number.

## Input

Search Console is read through an MCP client, not from this process, so the
report takes rows as JSON: either the raw MCP result or a bare array of
`{ query, clicks, impressions, ctr, position }`.

## Weekly reading

Compare 7 days against the previous 7 on **qualified** clicks, impressions and
CTR, plus cluster shares, new queries, and pages entering the top 10 and 11–20.
Never on site-wide CTR.
