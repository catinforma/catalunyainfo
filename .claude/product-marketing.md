# CatalunyaInfo — product and marketing context

Read by the marketing skills in `.claude/skills/` (seo-audit, ai-seo, programmatic-seo, analytics, link-building, schema, content-strategy, site-architecture) before they ask anything. Updated 17 Nov 2026.

## What the site is
- catalunyainfo.com: practical, verified answers for people in Catalonia and, since Nov 2026, Spain-wide utilities. Editions in ca, es and en (every page in all three).
- Families: strikes (today/this week, minimum services), holidays and calendars (town pages, 2027, bridges, school calendars, shops open on holidays), elections (29N), Christmas fairs and traditions, Barcelona practical guides, nature/day trips, live data (reservoirs, Rodalies, fuel, electricity PVPC, butane), and calculators under `/es/calculadoras/` (net salary, dismissal, finiquito, paro, subsidio, sick leave, paid leave, autónomos, pensions 2027, SMI, IPC, rent update, Euríbor, mortgage, home-purchase taxes, Letras del Tesoro, working days, ITV, 2027 leave planner).
- Audience: mostly Spain-wide Spanish-speaking searchers (strikes, holidays, calculators), then Catalan speakers, then English-speaking visitors and residents. ~63 % mobile.
- Stack: Next.js 16 on our own VPS behind Cloudflare; GA4 (property 554310792) and Search Console (sc-domain:catalunyainfo.com) via `scripts/snapshot.py` (skill growth-snapshot).

## Goal
Sustained organic traffic and revenue: AdSense (review pending), later affiliates and transparent sponsorship. Owned audience: the WhatsApp channel (manual daily post from the private page; no auto-posting).

## House rules (override any skill advice)
- Official/primary sources only for every variable fact (BOE, DOGC, AEAT, SEPE, INE, Seguridad Social, operators, councils); quote and date them (skill verify-official-source). Never invent figures, dates, quotes, statistics, anecdotes or testimonials, not even as examples.
- No mass AI content, no thin or near-duplicate programmatic pages; noindex low-demand variants (`src/lib/seo/low-demand.ts`).
- AdSense safety: don't change AdSense code, verification or the consent banner (owner decision). Ads need Consent Mode v2 and the certified CMP already planned in `src/lib/analytics/consent.ts`.
- Titles/descriptions: respect the measurement windows in `docs/SEO_EXPERIMENTS.md`; log every change with baseline and review date.
- No paid tools, no bought or exchanged links, no outreach, press, council or partner contact without the owner's explicit approval; no automated posting or messaging.
- YMYL pages (money, employment, health, legal): disclaimer, official simulator link, dated rules and a test guard for the yearly update.
- Never link aerobusbcn.com. Never print secrets from `/srv/catalunyainfo/shared/`.
- Deploy: push to origin main first (check it succeeded), then `sudo -u deploy catalunyainfo-deploy main`, then the publish groups. Agents never run `npm run build`.
