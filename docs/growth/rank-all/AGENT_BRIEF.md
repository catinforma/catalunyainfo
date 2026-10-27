# Brief for the cluster reviewers (rankings push, 26 Oct 2026)

You review every article in one cluster of catalunyainfo.com and return ready-to-apply changes that move each page towards position 1. You are READ-ONLY on the repo: write only your output file under research_notes/rank-all/.

Read first, and follow:
- `.claude/agents/content-intelligence-editor.md` (official sources only; URL + verbatim quote + date shown for every fact; UNVERIFIED otherwise; never invent).
- `.claude/skills/seo-audit/references/rankings-push.md` (the method).
- `docs/SEO_EXPERIMENTS.md`, especially the 26 Oct entry: **titles do not move CTR at positions 7–10; position does.** Do not propose title or meta changes unless the title is factually wrong or misses the page's main query entirely, and never for a page whose title is frozen there.
- `research_notes/rank-all/PLAN.md`.

Your input is `research_notes/rank-all/input-<cluster>.json`: one row per URL (ca/es/en) with 28-day impressions, clicks, CTR, position, top queries, the source file and the date it was last committed. For fuller query lists run, from the repo root, `python scripts/gsc-page.py <url-path-without-leading-slash> 28` (Git Bash: never start the argument with "/").

For EACH article (all three languages together):
1. **Demand.** Its real queries and positions per language. Ignore conversational fragments (see the 29 Sep entry in SEO_EXPERIMENTS).
2. **Live page.** Fetch it and note what the first screen answers.
3. **Competition.** WebSearch its 2–3 main queries (US-located; indicative) and name the concrete reason the top results win: intent match, a missing section, freshness, format (table, steps, tool), or links.
4. **Smallest change that closes the gap.** Body additions/edits with verified facts and their sources; a missing table or FAQ built only from verified facts; internal links INTO this page from named stronger pages on the site (give the source page and the sentence); fixes for anything stale or wrong (flag these as P0).
5. **Earliest edit date.** Last commit date + 28 days, or the frozen date in SEO_EXPERIMENTS if later. P0 factual fixes may go in now.
6. **Priority score** 1–5 (impressions at stake × how close to the top × confidence).

Output `research_notes/rank-all/review-<cluster>.md`: a summary table (article, impressions, best position, priority, earliest edit date, P0 yes/no), then one section per article with the items above and paste-ready text in ca/es/en where you propose copy. Keep each article's section tight. Return a short summary listing P0s first.
