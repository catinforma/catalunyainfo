---
name: verify-official-source
description: Use before writing or changing any variable fact on catalunyainfo.com (prices, timetables, deadlines, dates, rules, rail service, rates) — finds the official primary source, quotes it, and records the verification date.
---

# verify-official-source

1. Identify the authority that owns the fact (BOE/DOGC for law; Generalitat departments, ATC, Meteocat, ACA, Rodalies/Renfe/FGC/TMB for services; INE/Interior/JEC for elections; the council for local matters). Press and aggregators are never the source.
2. Fetch the official page or PDF. Record: URL, exact quote (original language), the date or validity shown on the page, and today's date as the check date.
3. If sources disagree, print the stricter or safer version and note the conflict; if nothing official exists, mark UNVERIFIED and leave the fact out — do not approximate.
4. Write the fact pack to `research_notes/<topic>.md` (gitignored) with a "safe claims" summary at the top and a "do not print" section.
5. In code: add the source to the article's `sources`, set its `VERIFIED` date to the check date, and avoid clock times or prices that will expire unless the validity date is printed next to them.
