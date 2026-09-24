# SEO experiments

A log of deliberate changes made to influence search performance, so that what
worked can be told apart from what merely coincided with something else.

## How to use this

One entry per change. Record the hypothesis **before** the outcome is known,
because a hypothesis written afterwards is a description, not a prediction.

Rules that keep the log honest:

- **Do not change a title again inside 28 days.** Position and CTR move on
  their own, and two changes inside one measurement window make both
  unmeasurable.
- **Change one thing.** A title and a description rewritten together cannot be
  attributed.
- **Record the baseline as a range, not a number.** Daily CTR on tens of
  impressions is noise.
- **A negative result is a result.** Reverting is fine; deleting the entry is
  not.

Baselines come from Search Console via MCP, over the 14 days before the change.

---

## 2026-09-24 — English Sitges guide: title answered the wrong question

**URL:** `/en/events/sitges-film-festival-guide/`

**Observation.** Search Console, 10–24 September, page × query:

| Query | Impressions | Position | Clicks |
| --- | --- | --- | --- |
| sitges film festival 2026 | 8 | 9.0 | 0 |
| sitges film festival 2026 schedule | 7 | 7.0 | 0 |
| sitges film festival 2026 program | 6 | 8.2 | 0 |
| sitges film festival 2026 tickets | 4 | 9.5 | 0 |
| sitges festival 2026 | 4 | 7.5 | 0 |
| sitges film festival 2026 lineup | 3 | 10.7 | 0 |
| when is sitges film festival 2026 | 2 | 9.0 | 0 |
| sitges film festival dates | 2 | 9.0 | 0 |
| sitges film festival 2026 dates | 12 | 8.2 | 1 |

About 45 impressions in page-one positions, one click. Every query asks for
**dates, schedule, programme, tickets or line-up**.

**Diagnosis.** Not a ranking problem and not a content problem: the guide
already gives the verified dates (8–18 October 2026, 59th edition), explains
how passes differ from single tickets, and states that the full schedule is not
published yet. The title said none of that.

Before:

```
Sitges Film Festival 2026: a first-timer's guide
The 59th Sitges Film Festival runs 8–18 October 2026. Venues, passes,
getting there by train, and what has actually been announced.
```

After:

```
Sitges Film Festival 2026: dates, venues and tickets
Sitges Film Festival 2026 runs 8-18 October, the 59th edition. Dates, venues,
how passes work, getting there by train, and what is confirmed so far.
```

**Hypothesis.** Leading with the dates matches the dominant intent, so CTR
rises from ~2% toward the 4–8% the Catalan and Spanish pages already get at
similar positions. Position should not move much; if it drops, the change was
not the cause.

**Caveat on timing.** The festival runs 8–18 October, so interest rises sharply
on its own over the next fortnight. Compare CTR at a given position, not raw
clicks, or the festival will take the credit.

**Measure on:** 2026-10-08 (14 days) and 2026-10-22 (28 days).

**Outcome:** _pending_

---

## 2026-09-24 — public holiday calendar published

**URLs:** `/ca/guies/calendari-laboral-catalunya/` and the es/en equivalents.

Not an experiment on an existing page, recorded here because it has a
measurement schedule attached and a clear prediction.

**Prediction.** The page targets a seasonal, recurring query that peaks from
now to January. Nothing on the site currently ranks for it, so any impression
is new coverage rather than a reallocation.

**Measure at:** 1 October (7 days, indexing and first queries), 22 October
(28 days, first performance), 23 December (90 days, near the seasonal peak).

**Do not change the title before 22 October** unless a factual error appears.
Position on a brand-new page is unstable for the first fortnight, and a change
inside that window makes the whole thing unreadable.

**Outcome:** _pending_

---

## Candidates not yet run

Recorded so they are not lost, and so they are not all started at once.

- **`/en/day-trips/barcelona-day-trips-by-train/`** — "what are the best day
  trips from barcelona" sits at position 3 with 1 impression; "barcelona day
  trips by train" at position 10. Too little data to act on. Revisit once
  impressions pass ~50.
- **Home page.** `catalunya informacio` gave 51 impressions at position 11.5
  with zero clicks over 14 days, and the same query ranks `/`, `/ca/` and
  `/en/` simultaneously. Two separate problems — intent mismatch and three URLs
  competing — and the second should be understood before the first is touched.
- **`/ca/agenda/que-fer-aquest-cap-de-setmana-catalunya/`** — ranks 16–47 for
  several "cap de setmana" variants. That is a ranking problem, not a CTR one;
  a title change would not fix it.
