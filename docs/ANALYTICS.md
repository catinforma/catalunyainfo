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
| `whatsapp_channel_click` | Click on our channel link (`FollowChannel.tsx`) | `link_context` = `article_box` \| `daily_box` \| `footer` \| `return_step` \| `other`, `locale` | registered (`link_context`) | Which placement grows the owned audience | New |
| `share` | Share bar: a channel link, the copy button, or a completed native share sheet (`ShareControls.tsx`). This is the plan's *share_click*, under GA4's recommended name so it feeds the built-in reports. | `method`, `content_type`, `item_id` (path, no query), `locale` | built-in (`method`); registered (`content_type`, `locale`) | Which pages readers pass on, and through which channel. The shared URL carries `utm_source=share&utm_medium=<method>` | Live since 12 Nov |
| `internal_search` | Search results page rendered with a query of 2+ characters (`SearchAnalytics.tsx`) | `search_term_length`, `results_count` (articles + direct pages), `locale` | registered (`results_count`, `locale`) | How often a search finds nothing. The term itself is **not** sent by us: enhanced measurement's `view_search_results` already carries it (see below) | New |
| `outbound_official_source_click` | Click on a link in a page's source list (`.ci-sources`, any domain: by house rule every listed source is official or primary), or on an official domain anywhere else (`OFFICIAL_DOMAINS` in `lib/analytics/clicks.ts`) | `link_domain` (host only, never the URL), `link_context` = `sources` \| `calculator` \| `content`, `locale` | built-in (`link_domain` → "Link domain"); registered (`link_context`) | Do readers check the official source, and from where | New (replaces the never-wired `external_link`) |
| `ics_subscribe_click` | Click in the town/city "Add to your calendar" block (`CalendarSubscribe.tsx`), recognised from the href | `method` = `apple` (webcal) \| `google` \| `download`, `locale` | built-in (`method`) | Is the calendar feed product used, and which app | New |
| `useful_feedback` | "Was this useful?" yes/no (`PageFeedback.tsx`). This is the plan's *page_feedback*; the name is kept so the history since September stays in one series. | `is_useful`, `content_type`, `locale` | registered | The quality signal that is not a pageview | Live |
| `related_content_click` | Click on one of our own pages inside the "next useful step" box (`components/NextStep.tsx`, `data-ci-placement="next_step"`), the box right after a page's answer on six families (`lib/engagement/next-step.ts`), or inside a town's list of its other pages (`components/TownHub.tsx`, `data-ci-placement="town_hub"`, low on the holiday, Christmas fair and election town pages, since 18 Nov 2026: `lib/engagement/town-hub.ts`), or inside the strike pages' "Útil ahora" list (`components/UsefulNow.tsx`, `data-ci-placement="useful_now"`, after the body, since 23 Nov 2026: `lib/engagement/useful-now.ts`). Other internal links are not measured. | `link_context` = `next_step` \| `town_hub` \| `useful_now` (closed list `RELATED_LINK_CONTEXTS`), `link_url` (target path, no origin, query or hash), `locale` | registered (`link_context`, `locale`); built-in (`link_url` → "Link URL"); the page clicked on is GA4's own "Page path" | Does the box take readers to a second page, from which family, to which target. Read with `snapshot.py landing [start end]` (clicks per 100 page views per family) | New, 18 Nov 2026 (wired; was declared with `from_type`/`to_type`/`position`, never sent) |
| `next_step_click` | Click on any link of the "keep it" block of the strike and election pages (`components/ReturnStep.tsx`, `data-ci-placement="return_step"`, since 25 Nov 2026: `lib/engagement/return-step.ts`). One event per click, on top of the link's own (the WhatsApp link also sends `whatsapp_channel_click` with `link_context` = `return_step`). Attributes are read from `data-ci-position`, `data-ci-family` (the block) and `data-ci-target` (the link) and checked against closed lists (`RETURN_POSITIONS`, `RETURN_FAMILIES`, `RETURN_TARGETS`). | `block_position` = `after_answer` \| `after_intro`, `target_type` = `whatsapp_channel` \| `town_calendar` \| `holiday_today` \| `strikes_hub` \| `strikes_spain_hub` \| `spain_holidays`, `step_family` = `strikes` \| `elections`, `link_url` (our own pages only), `locale` | **register `block_position`, `target_type`, `step_family`** (event-scoped custom dimensions; not retroactive); `link_url` built-in; `locale` registered | Does an event reader take something they can reuse (alert, calendar, holiday check, hub), which one, from which family. Clicks per 100 sessions of strike/election landings; the old box's baseline was 0.4 per 100 (`related_content_click`, `link_context` = `next_step`) | New, 25 Nov 2026 |
| `town_select` | The visitor picks a municipality or a year in a selector that had no event: the municipal election results (`MunicipalResults.tsx`, once per municipality, at the full name matched, not per keystroke) and the pickers of the widget builder (`EmbedBuilder.tsx`) and of the working-days embed box (`WorkingDaysEmbedPicker.tsx`). The server-rendered default and a `#town` hash link do not count. | `tool` = `municipal_results` \| `embed_builder_town` \| `embed_builder_year` \| `embed_working_days` \| `market_square` (closed list `TOWN_SELECT_TOOLS`; `market_square` = the square or neighbourhood picker of the weekly-market pages, `NextMarket.tsx`, 25 Nov 2026), `locale`. The town is never sent. | **register `tool`**; `locale` registered | Is the municipal search used at all (audit Annex B §C: "no hi ha cap esdeveniment propi"); do webmasters who open the widget builder choose a town, which one tool | New, 25 Nov 2026 |
| `search_no_results` | The search results page (`SearchAnalytics.tsx`) rendered a query of 2+ characters and found 0 results and 0 direct pages. Sent next to `internal_search` (which carries `results_count` 0 and the term length). | `locale` only: no text, no length | `locale` registered | Searches that find nothing, as an event that can be marked or counted without a filter; read the text of the terms in `view_search_results` | New, 25 Nov 2026 |
| `school_region_jump` | A tap on a link of the "Ve a tu comunidad" list above the Spain school calendar's Christmas table (`BlockRenderer.tsx` `TableJumpList`, a same-page anchor; recognised by `data-ci-placement="school_jump"` and the `#ccaa-<slug>` hash in `AnalyticsClicks.tsx`). | `region` = community slug from the closed list `SCHOOL_JUMP_REGIONS`, `locale`. | **register `region`**; `locale` registered | Do families use the jump list on the hub, and which communities do they look for (to decide which regional pages to strengthen) | New, 25 Nov 2026 |
| `article_view`, `news_view`, `language_change`, `map_interaction`, `affiliate_click`, `newsletter_signup` | — | see `events.ts` | — | — | Declared, not wired |

The five link events (`whatsapp_channel_click`, `outbound_official_source_click`,
`ics_subscribe_click`, `related_content_click`, `next_step_click`) come from one delegated click
listener mounted in the layout (`components/AnalyticsClicks.tsx`), so the
server-rendered links stay plain links. Everything else outbound is left to
enhanced measurement's own `click`, so nothing is counted twice under our
names.

**Pages per session by family (18 Nov 2026).** `scripts/snapshot.py landing
[start end]` prints, for each landing-page family (strikes, elections,
holidays, Christmas, calculators, Barcelona practical, other; the regexes are
`LANDING_FAMILIES` in the script), sessions, views and views per session by
GA4's `landingPage`, plus page views by `pagePath` and the
`related_content_click` / `next_step` clicks on them (and, in a second column,
the `town_hub` ones). It also prints the
property totals, which are the "pages per session" figure (a session can be
counted under two landing pages, so the family rows add up to slightly more).
Baseline 4–17 Nov 2026 and the 2 Dec review: `docs/SEO_EXPERIMENTS.md`,
18 Nov 2026 entry. No GA4 configuration was added for it: `link_context` and
`locale` are registered already and `link_url` is a built-in parameter. Check
in the 48-hour step below that "Link URL" shows the target paths on this event.

Suggested key events (Admin → Events → Mark as key event), once a week of data
shows the volumes: `calculator_use` and `whatsapp_channel_click`.

### Parts that send nothing from our code, and how to count them (25 Nov 2026)

The audit (Annex B §C, §10) found three products with no usage figure. For two
of them the right answer is no new code, because adding a script would break
a promise.

**`/embed/*` widgets (holiday calendar, net salary, working days).** They
carry no scripts and no tracking on purpose: they run inside other people's
pages, and we add nothing to third-party pages. The only privacy-safe count
is the server's own access log (Caddy, `ops/vps/Caddyfile`, JSON, 14 days, 40
rolls: `/var/log/caddy/catalunyainfo.access.log*`; Cloudflare's analytics
show the same requests by path and `Referer` host). Each time a visitor's
browser loads a frame it asks for `/embed/<locale>/...` with the embedding
page as `Referer`. Count **embedding sites**, not requests, and drop our own
pages (the builder's preview, the "embed this" boxes). Run as a user who can
read the log, aggregated, printing hosts only (the log holds IP addresses:
never print or store them):

```
# distinct embedding sites and frame loads per host, last 14 days
sudo sh -c 'zcat -f /var/log/caddy/catalunyainfo.access.log*' \
 | jq -r 'select((.request.uri | startswith("/embed/")) and .status == 200)
          | (.request.headers.Referer[0] // "(no referrer)")
          | sub("^https?://"; "") | split("/")[0]' \
 | grep -v -e '^www\.catalunyainfo\.com$' -e '^catalunyainfo\.com$' \
 | sort | uniq -c | sort -rn | head -50
```

How to read it: each line is `frame loads  embedding host`. The number of
lines is the number of embedding sites; `(no referrer)` is a browser or an
embedder that strips it, not a site. Loads include crawlers and previews, so
treat counts as an upper bound and the host list as the evidence. A host that
appears on several days is a live embed; a host with one hit is a visit or a
bot. Add `.request.uri` instead of the host (`| capture("^/embed/(?<w>[^/]+/[^/]+)")`)
to split by widget. The same count by day for the trend: pipe
`.ts | todate | .[0:10]` instead of the host. Rolled logs only reach back 14
days, so keep the weekly result in `docs/OUTREACH_PLAN.md`'s tracker; the log
cannot be read later.

**`.ics` calendar files.** The subscribe click is measured
(`ics_subscribe_click`, by method), but a real subscription is a calendar app
fetching the file on a schedule, with no browser and no consent, so it can
only be seen in the log. Path `/ics/<locale>/<town>.ics` (and
`/ics/<locale>/2027/<community>/<file>`). Distinct subscribers are
approximated by distinct user agents per file per day, never by IP:

```
sudo sh -c 'zcat -f /var/log/caddy/catalunyainfo.access.log*' \
 | jq -r 'select((.request.uri | startswith("/ics/")) and .status == 200)
          | [(.ts | todate | .[0:10]), .request.uri, (.request.headers["User-Agent"][0] // "")] | @tsv' \
 | sort -u | cut -f1,2 | uniq -c | sort -rn | head -40
```

Calendar apps refetch the same URL daily, so a file seen on many consecutive
days under one user agent is a subscription; a single day is a download.
`webcal://` clicks arrive as normal `https` requests with these paths.

### GA4 admin: custom dimensions to register, and how to read retention (25 Nov 2026)

Registration is Admin → Data display → Custom definitions → Create custom
dimension, **scope Event**, parameter name exactly as below. It is not
retroactive: data sent before registering is never reportable by that
dimension, so register before the first week of data you want.

| Parameter | Events that send it | Suggested display name | Status |
| --- | --- | --- | --- |
| `block_position` | `next_step_click` | Posició del bloc | **register** |
| `target_type` | `next_step_click` | Destí del bloc | **register** |
| `step_family` | `next_step_click` | Família del bloc | **register** |
| `tool` | `town_select` | Eina de selecció | **register** |
| `calculator_id` | `calculator_use` | Calculadora | **register** (also in the table above) |
| `link_context` | link events | (already registered) | done |
| `results_count` | `internal_search` | (already registered) | done |
| `locale` | all | (already registered) | done |

`link_url`, `method`, `link_domain` are built-in (Link URL, Method, Link
domain). `displayName` rejects an apostrophe. Mark `town_select`,
`next_step_click` and `search_no_results` as key events only once a week of
volume shows they are not noise.

**How to read retention (hypothesis 2 of the audit: do readers of one family
come back).** GA4 → Explore → blank → Technique **Cohort exploration**.

1. Cohort inclusion: **First touch** (`first_session_date`'s event is
   `first_visit`); return criteria: **Any event** (or `session_start`);
   cohort granularity: **Weekly**; calculation: **Standard**; show
   **Day 7 and Day 28** by choosing granularity Daily and reading the 7 and 28
   columns (or Weekly, columns +1 and +4).
2. Breakdown: **Landing page + query string** is a dimension on sessions, not
   on users, so use the segment route: create one **segment** per family
   (Segments → User segment → Add condition **Landing page** *matches regex*
   the family regex below, event scope `first_visit`), and apply up to four at
   a time in Segment comparisons. Name the segment with the family.
3. Export the table as CSV after the cohort has had 28 days. The audit's
   baseline question needs the cohorts of the weeks from 27 Oct; the audit
   asked for the export on 23 Dec 2026.
4. Reading: GA4 shows only users who accepted measurement (about half of
   Google's clicks, ratio 0.51), so compare families with each other, never
   with Search Console. Retention under about 30 users in a cohort cell is
   noise.

Family regexes (the audit's `families.py`, first match wins, applied to the
lower-cased path without query or hash; in GA4 use *Landing page* "matches
regex" with the family's pattern. GA4 matches the whole value, so wrap each as
`.*(...).*`; to emulate "first match wins" exclude the earlier families in the
same segment or compare only families that do not overlap, such as
`vagues`, `eleccions` and `calculadores`):

| Order | Family | Regex |
| --- | --- | --- |
| 1 | vagues | `(huelga\|vaga\|vague\|strike\|serveis-minims\|servicios-minimos)` |
| 2 | eleccions | `(/eleccions\|/elecciones\|/elections\|elecci\|eleccio\|election\|vot-correu\|vot-per-correu\|voto-correo\|voto-por-correo\|postal-vote\|how-to-vote\|com-votar\|como-votar\|mesa-electoral\|polling\|sondeig\|encuesta\|polls\|candidat\|foreign-vote\|vot-estrangers\|voto-extranjeros\|resultats\|resultados\|results)` |
| 3 | nadal-loteria | `(fires-de-nadal\|mercados-navidad\|christmas\|nadal\|navidad\|llums\|luces\|lights\|reis\|reyes\|three-kings\|cavalcada\|cabalgata\|loteria\|lottery\|grossa\|gordo\|nino\|marato\|gran-recapte)` |
| 4 | calendari-escolar | `(calendari-escolar\|calendario-escolar\|school-calendar\|school-holidays\|vacances-escolars\|vacaciones-escolares\|lliure-disposicio\|libre-disposicion\|school-free)` |
| 5 | festius-2027 | `(/2027/\|-2027\|2027-)` |
| 6 | festius | `(/festius\|/festivos\|/holidays\|festiu\|festivo\|holiday\|pont-\|puente\|long-weekend\|bridge\|calendari-laboral\|calendario-laboral\|work-calendar\|setmana-santa\|semana-santa\|easter\|carnaval\|carnival\|carnestoltes)` |
| 7 | calculadores | `(/calculadores/\|/calculadoras/\|/calculators/)` |
| 8 | carburants-energia | `(benzineres\|gasolineras\|fuel-prices\|butano\|butane\|preu-llum\|precio-luz\|electricity-price\|bono-social\|pvpc)` |
| 9 | mobilitat | `(rodalies\|zbe\|low-emission\|zona-blava\|zona-azul\|blue-zone\|metro\|renfe\|transport\|parking\|aparcament\|aparcamiento\|cruise\|creuers\|cruceros\|aeroport\|aeropuerto\|airport\|tren\|train)` |
| 10 | escapades-oci | `(escapades\|escapadas\|nieve\|-neu\|snow\|day-trips\|cap-de-setmana\|fin-de-semana\|weekend\|destinacions\|destinos\|destinations\|natura\|naturaleza\|nature\|embassaments\|embalses\|reservoirs\|agenda\|events\|esqui\|ski\|montserrat\|portaventura\|tibidabo\|boqueria\|museu\|museo\|museum\|temps\|tiempo\|weather\|tradicions\|tradiciones\|traditions\|platja\|playa\|beach\|bolets\|setas\|mushroom\|tardor\|otono\|autumn)` |
| 11 | tramits-diners | `(irpf\|renta\|beckham\|nie-\|-nie\|tie-\|-tie\|padro\|padron\|empadron\|tsi\|tarjeta-sanitaria\|sanitaria\|fallece\|defuncio\|death\|cobra\|pay-dates\|smi\|salari\|salario\|salary\|pensi\|paro\|atur\|unemployment\|iprem\|hisenda\|hacienda\|tax\|impost\|impuesto\|treball\|trabajo\|botigues\|tiendas\|shops\|comer)` |
| 12 | institucional | `(/legal/\|quienes-somos\|qui-som\|about\|contacto\|contacte\|contact\|autores\|autors\|authors\|avisos\|metodologia\|methodology)` |

Also: **portada** = path is exactly `/ca/`, `/es/`, `/en/` or `/`; **hubs** =
`/<locale>/(guies|guias|guides)/` or at most two path segments; anything else
is **sense-classificar**. The `\|` above is the table's escape: type a plain
`|` in GA4.

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
   (`internal_search` with `results_count` 0). Since 18 Nov: a link in the
   "Siguiente paso útil" box of `/es/guias/huelga-hoy-cataluna/` (one
   `related_content_click`, `link_context` `next_step`, `link_url`
   `/es/rodalies/`); any other internal link sends nothing.
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

## Which links carry a utm, and why "0 sessions from WhatsApp" (25 Nov 2026)

The site's WhatsApp buttons (end-of-article box, footer, the "keep it" block)
link **to** `whatsapp.com/channel/...`: they send readers away and cannot carry
a utm that anything reads. A visit **from** WhatsApp comes from one of three
places, each tagged differently:

| Where the link is | utm | Shows in GA4 as |
| --- | --- | --- |
| The channel's daily post (`lib/share/channel-message.ts`, `channelUrl()`, pasted by the owner from `/canal/<token>/` or `/admin/canal/`) | `utm_source=whatsapp&utm_medium=channel&utm_campaign=daily` (+ `utm_content` for the weekend line) | source `whatsapp`, medium `channel` |
| The share bar's WhatsApp button (`lib/share/links.ts`, `sharedUrl()`) | `utm_source=share&utm_medium=whatsapp` | source `share`, medium `whatsapp` (not source `whatsapp`) |
| A link typed or pasted by hand, or a post not built by the generator | none | Direct |

Checked in the code on 25 Nov: every link of a generated post and every share
URL carries its utm (`tests/channel-message.test.ts`, `tests/return-step.test.ts`);
the apex-to-www and slash redirects keep the query (curl, 25 Nov); nothing
strips it client-side. So no site-generated link lacks a utm. The zero
`utm_source=whatsapp` sessions in 28 d is therefore not a tagging bug on our
side; the candidates are (a) too few channel followers or posts that were not
published with the generated links (followers are not readable from the
server: owner to read them in WhatsApp), (b) readers who denied measurement
(GA4 sees a minimum, ratio 0.51 of Google clicks), (c) shares counted as
`share / whatsapp`. To read the channel's real pull: GA4 Traffic acquisition,
session source/medium, filter source in (`whatsapp`, `share`) and medium in
(`channel`, `whatsapp`). Owner rule: paste the post exactly as the private
page generates it, never retype a link.
