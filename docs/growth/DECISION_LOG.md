# Decision log

Newest first. Format: date · decision · why (evidence) · how it is measured · commit.

- 2026-10-18 · Owner approval required for production deploys from now on (megaprompt 2026-10-18 §20.I). Work happens on sprint branches; `publish-safe` skill gates releases. · Safety and cost control on Vercel Hobby. · — · branch `sprint/2026-10-18-growth-foundations`
- 2026-10-18 · `site:audit` now checks reciprocal hreflang, html lang vs URL locale and Article required fields. First run: 207 URLs, 0 hreflang/lang/Article problems. · Megaprompt §06 asks for these checks; they were not automated. · Re-run before every release. · this branch
- 2026-10-18 · Added read-only project agents and two project skills; no other new skills (existing ones cover SEO, schema, CWV, a11y, content strategy). · Avoid overlap (§03.3). · — · this branch
- 2026-10-17 · Content routes revalidate 86400 s, home 3600 s, nightly cron refreshes day-dependent pages. · ISR writes reached 90 % of the Hobby allowance at revalidate=300. · Vercel usage dashboard (owner). · b6a5b42
- 2026-10-17 · `updatedAt` follows the verification date, not the republish time. · Republishing to add a layout box stamped ~110 pages "updated today". · dateModified in JSON-LD vs VERIFIED constants. · see git log 17 Oct
- 2026-10-17 · IndexNow on every publish (Bing; Google does not use IndexNow). · Bing ~14 % and ChatGPT ~7 % of GA4 sessions. · Bing sessions in GA4; Bing Webmaster Tools once the owner sets it up. · 3a5147b
