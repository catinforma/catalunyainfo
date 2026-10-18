# docs/growth — index

| File | What it is |
|---|---|
| `../GROWTH_PLAN_X100.md` | Long-range plan and history (Catalan). Still the master plan. |
| `../SEO_EXPERIMENTS.md` | Title/snippet experiments, frozen windows and measurement dates. |
| `DECISION_LOG.md` | One line per decision or release: date, commit, why, how it is measured. |
| `BACKLOG.md` | Prioritised backlog (P0–P3) with evidence, impact, effort, confidence. |
| `baseline/BASELINE_YYYY-MM-DD.json` | Aggregated, PII-free GSC + GA4 snapshot used to judge sprints. |

Agents (`.claude/agents/`): seo-technical-auditor, search-data-analyst,
content-intelligence-editor, security-qa-reviewer — all read-only; the main
session is the only one that edits.

Skills (`.claude/skills/`): installed third-party skills are listed in
`SOURCES.md`; project skills are `publish-safe` (manual release checklist)
and `verify-official-source`.

Rules that never change: official sources for every variable fact, honest
dates (`lastVerifiedAt` drives "updated"), no thin or programmatic pages,
evergreen URLs, neutral election content, content routes revalidate ≥ 86400 s
(Vercel ISR budget), production deploys only with the owner's approval.
