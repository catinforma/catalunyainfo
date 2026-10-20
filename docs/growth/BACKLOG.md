# Backlog — 2026-10-18

Priority = (impact × probability × confidence × learning speed) / (hours + relative cost) × safety × seasonality.
Data errors, indexing and compliance always rank above CTR experiments.
Labels: **V** verified · **H** hypothesis · **E** experiment. Effort S ≤ 2 h, M ≤ 1 day, L > 1 day.
Evidence files: `research_notes/audits/*.md` (gitignored) and `docs/growth/baseline/BASELINE_2026-10-18.json`.

## P0 — wrong facts, reliability, compliance, cost

| # | Task | Evidence | Effort | Status |
|---|---|---|---|---|
| 1 | Tourist tax: Barcelona surcharge 5/6/7/8 € by date; seven municipal surcharges since 1 Oct; review date | p0_data_accuracy P0-1..3 (ATC, Ordenança 2.2, Llei 2/2026) · V | M | **done on branch** |
| 2 | Cerdanya: no trains Barcelona–La Garriga; R3 warning; dead source | P0-4 (Rodalies notice 06.07, still in force 18.10) · V | S | **done on branch** |
| 3 | DB error during ISR regeneration must not cache a 404 / empty hub for 24 h | hosting_monetisation C8 · H (untested in staging) | S | **done on branch** (criticalRead) |
| 4 | Vercel Hobby forbids ads: upgrade to Pro before any AdSense code or verification tag | Vercel fair-use page (2026-09-14) · V | owner | open — owner |
| 5 | Neon free compute quota (100 CU-h): monitor; suspension = site errors | hosting_monetisation §2 · V | owner | open — owner |
| 6 | `/es/guias/calendario-laboral-cataluna/` impressions 61 → 3 → 0 (15–17 Oct); last crawl 25 Sep | **Re-checked 20 Oct · V:** 0 impressions 16–18 Oct (was 60–220/day). URL inspection: indexed, canonical ours, robots allowed, in sitemap with lastmod; **last crawl still 25 Sep**. Not cannibalised: no other page took `calendario laboral` / `2027`. The whole ES holiday cluster fell from 15 Oct (`es-festivo-hoy` pos 17 → 61, last crawl 9 Oct). Owner action: *Request indexing* in GSC for the ES and CA calendar pages and `es-festivo-hoy`. | S | owner: request indexing |
| 7 | `/es/guias/es-festivo-hoy-cataluna/` position ~9 → 41–48 after 13 Oct | search_opportunities · H | S | investigate (title frozen to 3 Nov) |

## P1 — demand at positions 3–15, mobile LCP, linking

| # | Task | Evidence | Impact | Effort | Conf. |
|---|---|---|---|---|---|
| 8 | Mesa ES: answer "cuándo/cuánto se cobra" higher in the body (title frozen to 14 Nov) | 106 impr. pos 8.9, 0 clicks · V. **Done on branch 20 Oct:** the "when is it paid" answer moved from the FAQ into the pay section, all three editions | M | S | M |
| 9 | Work calendar CA/ES: plan the post-22 Oct title from measured data; strengthen Catalan internal links to the CA page | ~3,250 impr./28 d, CTR < 1 % · V | H | S | M |
| 10 | Tourist tax: after 23 Oct, title/description with the 2027 change (from the freeze result) | frozen to 23 Oct | M | S | M |
| 11 | Mobile LCP 2.7–3.0 s (was 3.5–3.9): render delay 1.4 s → cut client JS (per-component i18n strings, ~17 KB) | Lighthouse 18 Oct, 2×4 runs · V | M | M | M |
| 12 | `proxy.ts` runs on every request incl. prefetch (15 calls per cold view): move headers to static config, narrow matcher | hosting_monetisation C1 · V | cost | M | H |
| 13 | Local holidays page 615 KB HTML / 4,926 nodes: compact server table + lighter filter, keep all data crawlable | performance audit · V | M | M | M |
| 14 | "Next step" cards with thumbnails after the first answer (render-time, no republish) | ux_accessibility P1-4 · E | M | M | M |
| 15 | Holiday-today: next-step actions in the answer box, show 5 upcoming, rest collapsible | ux P1-6 · E (title frozen; body allowed) | M | S | M |
| 16 | Consent banner still 205–225 px on phones (goal ≤ 150): single-line body + link | audit.js 17 Oct · V | M | S | H |
| 17 | Thin pages: Setcases, Girona, Ripollès (450–540 words) — expand with verified practical facts or merge. **Done on branch 20 Oct** (to ~720–1,050 words; R3 and dead-link fixes) | content_adsense · V | M | M | M |
| 18 | Weekly freshness: mushrooms (`mushrooms:refresh`) and autumn status block until end of Nov | memory · V | H | S | H |
| 19 | Clock change after 25 Oct: titles to 28 Mar 2027 (test forces it) | clock-change test · V | M | S | H |

## P2 — seasonal and new tools (Content Opportunity Gate required)

| # | Task | Live by | Sources | Effort |
|---|---|---|---|---|
| 20 | Election night 29N. **Explainer built on branch** (7f576b0, no figures). Left: add the official Interior results link when its press note names it (~26–27 Nov by precedent); ingest numbers only if Interior publishes a documented download with reuse terms; 29N final data into `congressResults` after the BOE | 26 Nov | Interior, JEC | S |
| 21 | Christmas markets (Santa Llúcia etc.). **Fact pack 20 Oct** (research_notes/christmas_markets_2026.md): no major market has official 2026 dates yet; 2025 announcements came 28 Oct (Terrassa) to 24 Nov (Figueres, Tortosa), Sagrada Família opened 22 Nov. Plan: publish by 10–15 Nov with an evergreen entry per market (what, where, organiser, page to watch, "2026 dates pending"), calendar block with verified dates only; re-check twice a week from 27 Oct, daily 10–28 Nov. Lead photo: Commons `122 Fira de Santa Llúcia … Nadal 2024` (Enric, CC BY-SA 4.0). The four held-back illustrations were never committed. | 10–15 Nov | councils, organisers | M |
| 22 | Shops open on Sundays/holidays. **Built on branch** (5e0c480). Left: add the 2027 municipal days (Barcelona and big towns) when the DOGC resolution appears (~27 Nov by precedent); recheck ZGAT validity before summer 2027 | 28 Nov | DOGC, Ajuntament | S |
| 23 | Christmas & New Year in Barcelona | 1 Dec | Ajuntament | M |
| 24 | Cavalcada de Reis 2027 (routes as councils publish) | 8 Dec | councils | M |
| 25 | Snow & avalanche state (ICGC bulletin, Meteocat) upgrade of ski/snow pages | 28 Nov | ICGC, Meteocat, resorts | M |
| 26 | EU citizens: register for the May 2027 local elections (INE, 30 Dec) — EN first | 1 Dec | INE | S |
| 27 | Bing Webmaster Tools + sitemap | now | — | owner |

## P3 — later, only with ROI

| # | Task | Note |
|---|---|---|
| 28 | Site search: PostgreSQL full-text + trigram over titles/places, CA/ES/EN synonyms; evaluate on 50 real queries before any vectors | megaprompt §12 |
| 29 | Real-user Web Vitals to GA4 (consented users only) | performance P2 |
| — | **Tried and reverted 20 Oct:** `next/dynamic` for the client widgets inside `BlockRenderer` (contact form, calculators, calendar, transport selector, holiday filter, election tables). With Turbopack (Next 16) the `[...slug]` client reference manifest still put all of them in the same three chunks (2v9kos5ta1lh0, 0me0bm1d4avje, 06zqvhzqepamg, 112 KB raw), so it split nothing. A real fix needs a different boundary, e.g. a separate route segment or client-side `import()` behind interaction. | evidence: page_client-reference-manifest.js |
| 30 | x-default → `/` for the home cluster only, after 23 Oct, as a logged experiment | technical_seo P2 |

## Do not do

- Per-municipality pages, AI-generated pages at scale, vector DB before full-text is measured.
- Shorter revalidation on content routes (ISR budget).
- AdSense code, ads.txt ID or CSP opening before: Pro plan, certified CMP (TCF v2.3), real publisher identity, updated privacy texts.
- Touching frozen titles before their measurement dates (`docs/SEO_EXPERIMENTS.md`).
