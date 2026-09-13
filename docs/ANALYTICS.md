# Analytics

## Current state

**Nothing is measured yet.** `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is empty, so:

- no analytics code is shipped,
- no third-party request is made,
- **the cookie banner does not appear at all**, because there is nothing to
  consent to.

Set the variable and the whole chain activates. That is the only switch.

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

| Event | Parameters | Question it answers |
| --- | --- | --- |
| `article_view` | `content_type`, `content_path`, `locale`, `category`, `days_since_verified` | Which guides get read, and does freshness correlate with engagement |
| `news_view` | same | Is the news section worth keeping |
| `internal_search` | `search_term_length`, `results_count`, `locale` | What people expect to find and do not |
| `related_content_click` | `from_type`, `to_type`, `position`, `locale` | Does the related rail work |
| `language_change` | `from_locale`, `to_locale` | Are the translations reaching the right audience |
| `external_link` | `link_domain`, `link_context` | Do readers follow through to official sources |
| `map_interaction` | `place_kind`, `locale` | Is the map worth the weight |
| `affiliate_click` | `partner`, `placement`, `locale` | Phase 5 |
| `useful_feedback` | `is_useful`, `content_type`, `locale` | The quality signal that is not a pageview |
| `newsletter_signup` | `placement`, `locale` | Retention |

### Privacy rules, enforced by the types

- **No personal data.** No email, no name, no user id, no IP.
- **No raw search terms.** `internal_search` sends the *length* of the query and
  the number of results, never the text. A search term is user-entered free text
  and can contain anything.
- **No URLs with query strings.** `safePath()` strips query and hash before any
  path is sent.
- GA4 snake_case parameter names, so they map to custom dimensions without a
  transformation layer.

`track()` is a silent no-op when consent has not been granted or no measurement
id is set. Analytics must never break a page, so it is wrapped in a `try`.

## Setting GA4 up

1. Create a GA4 property. Data stream: Web, `https://www.catalunyainfo.com`.
2. Set `NEXT_PUBLIC_GA4_MEASUREMENT_ID` in Vercel → **Production only**. Leaving
   it out of Preview keeps test traffic out of the property.
3. In the property, register custom dimensions (event-scoped) for:
   `content_type`, `locale`, `category`, `days_since_verified`, `link_context`,
   `is_useful`, `results_count`. Unregistered parameters are collected but not
   reportable.
4. Set data retention to 14 months. Disable Google Signals unless there is a
   reason — it adds a consent surface for no benefit here.
5. Mark `newsletter_signup` as a key event when a newsletter exists.

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
