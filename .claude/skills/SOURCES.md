# Installed skills (markdown/json only — reviewed, no scripts, no hooks, no MCP, no allowed-tools)

| Skill | Source | Commit | Copied / checked |
|---|---|---|---|
| seo-audit, schema, content-strategy, site-architecture | https://github.com/coreyhaines31/marketingskills | 1f83744 (2026-11-11) | copied 2026-10-17 at 365b412; updated 2026-11-17 |
| ai-seo, programmatic-seo, analytics, link-building | https://github.com/coreyhaines31/marketingskills | 1f83744 (2026-11-11) | copied 2026-11-17 |
| vercel-react-best-practices | https://github.com/vercel-labs/agent-skills (skills/react-best-practices) | 063bee9 | copied 2026-10-17; checked 2026-11-17 vs 1a2c79d: no change (upstream AGENTS.md is the compiled duplicate of rules/, still not copied) |
| core-web-vitals, performance, accessibility | https://github.com/addyosmani/web-quality-skills | afa8da9 | copied 2026-10-17; checked 2026-11-17: still upstream HEAD |
| seo-aeo-best-practices | https://github.com/sanity-io/agent-toolkit | feb9d38 | copied 2026-10-17; checked 2026-11-17 vs 3ed3a14: no change |

Project-written (not copied from anywhere): growth-snapshot, publish-safe, verify-official-source.

Copied skills do not auto-update: re-clone into an empty directory and diff against the commit above.
See research_notes/audits/skills.md for the review (17 Oct and 17 Nov 2026 sections).

## 2026-11-17 update from 365b412 to 1f83744 (diff reviewed)

Shorter `description` lines in all four (less trigger noise), cross-references to the new `link-building` skill, an arithmetic fix in content-strategy's scoring table, eval wording in schema. No new files, no new instructions to run tools.

## House rules win over these skills

The marketingskills skills are written for SaaS marketers. Where they disagree with the project rules, the project rules apply (official sources only via verify-official-source, no invented data, no mass AI content, AdSense safety, ca/es/en for every page, no auto-posting, no paid tools). Specific spots:

- **All marketingskills skills** first look for `.agents/product-marketing.md` or `.claude/product-marketing.md`. Neither exists yet, so they will ask generic SaaS questions (product, pricing, ICP). Answer from the site's context; do not invent a "product".
- **ai-seo**
  - `references/agent-readiness.md` suggests `npx is-agentic <domain>`, `npx afdocs` and web checkers (Frase, Suganthan's OKF generator). Do not run them: unpinned npm code and third-party services. Use the checklist by hand.
  - `references/content-patterns.md` example statistics and the expert quote are illustrations, not verified facts. Never reuse them. Every number on the site comes from an official source.
  - "Update monthly", "current year references" and "Last updated" mean real re-verification only. Never bump a date or year without re-checking the fact.
  - The robots.txt example disallows GPTBot, ClaudeBot and Google-Extended as "publisher choice". Changing the site's crawler policy is the owner's call; do not copy the block.
  - FAQ schema: `platform-ranking-factors.md` still describes the 2023 restriction; the schema skill (May 2026 retirement of FAQ rich results) is the current guidance. Check Google's docs before promising anything.
  - The monitoring tools it lists (Peec, Otterly, Profound, Semrush, Ahrefs…) are paid. Use the DIY monitoring method and Search Console.
  - `/pricing.md`, G2/Capterra and "agent defaults" sections are SaaS-only; ignore them.
- **programmatic-seo**: its data list includes "scraped" sources. This site only uses official primary sources. Its "noindex thin variations" and "launch the 20–50 strongest pages first" rules apply to town, strike-day and calculator page sets. `implementation-platforms.md` names a repo partner (Ploy ◆); not relevant (Next.js).
- **analytics**: the Consent Mode snippet in `references/gtm-implementation.md` is v1 (no `ad_user_data` / `ad_personalization`). For AdSense with EEA traffic, use a Google-certified CMP and Consent Mode v2, checked against Google's current docs. Ignore the Facebook Pixel and user-ID examples (no logins, no PII).
- **link-building**: never buy followed links (the skill agrees). Its "done-for-you placements" vendor (LinkDR) and the Ahrefs/Semrush/Hunter/Exa/Firecrawl tool rows are paid services; use the free fallback (Search Console Links report, search operators). Outreach stays a draft until the owner approves the list and the copy.
- Cross-references to skills that are not installed (competitors, public-relations, directory-submissions, referrals, community-marketing, cold-email, marketing-loops, free-tools, copywriting…) are expected; skip them.
