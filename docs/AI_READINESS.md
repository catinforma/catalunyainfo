# AI search readiness

What makes a page citable by ChatGPT Search, Google's AI Overviews and AI Mode,
Gemini, Perplexity and Copilot — checked against what this site actually does,
on 24 September 2026.

## The honest premise

There is no file you can add that makes an assistant cite you. `llms.txt` is
not a standard any major assistant reads, and anyone selling it as one is
guessing. What these systems share is narrower and duller:

1. They must be able to **fetch** the page.
2. They must be able to **read** it without running your JavaScript.
3. They must find a **specific, attributable claim** worth quoting.
4. They prefer claims with a **source** and a **date**.

Everything below follows from those four.

## 1. Can they fetch it?

| Crawler | Status |
| --- | --- |
| Googlebot | Allowed |
| Google-Extended (Gemini training/grounding) | Allowed explicitly |
| Bingbot (feeds Copilot) | Allowed via `User-Agent: *` |
| OAI-SearchBot, GPTBot (ChatGPT) | Allowed via `User-Agent: *` |
| PerplexityBot | Allowed via `User-Agent: *` |
| Mediapartners-Google | Allowed explicitly |

No AI crawler is blocked. That is a deliberate position, not an oversight: the
measurable upside right now is referral traffic, and GA4 already shows an
`AI Assistant` channel bringing real sessions.

**Verified 2026-09-24:** every content image is reachable again. Until that
date `robots.txt` carried a blanket `Disallow: /*?*` which also hid
`/_next/image`, so every crawler — Googlebot included — was being refused every
illustration on the site.

## 2. Can they read it without JavaScript?

Yes. Pages are statically rendered with ISR; the full article text is in the
initial HTML. Measured on `/en/culture/lesser-known-gaudi-sites/`: **~2,400
words of text in the raw response**, no hydration required.

This is the single most important property on this list, and it is the one
version 1 failed — it served `Carregant…` to crawlers.

## 3. Is there something specific to quote?

Assistants quote sentences, not pages. The block model supports the shapes that
produce quotable sentences, and articles use them where they are true rather
than everywhere:

| Block | What it gives an assistant |
| --- | --- |
| `callout` with a direct answer | One sentence that answers the question outright |
| `keyFacts` | Label/value pairs: dates, seasons, prices, durations |
| `table` | Comparisons with a stated unit and a note on provenance |
| `heading` + short section | A retrievable passage with its own subject |
| Sources list | The attribution an assistant needs to cite confidently |
| Verification date | Recency, stated rather than inferred |

What makes these work is that they are **narrow**. "The 59th Sitges Film
Festival runs 8–18 October 2026" is citable. "Sitges is a wonderful place to
experience cinema" is not.

## 4. Do the claims carry a source and a date?

Every article ends with the official sources it was written from, linked, and
carries a visible verification date. `entry_translations` holds
`published_at`, `updated_at`, `last_verified_at` and `review_due_at`, so
freshness is data rather than a claim in the prose.

Where a fact could not be verified, the articles say what the official source
actually states and link it, instead of publishing a number. That is also what
makes the site safe to cite: an assistant that quotes us is quoting something
we checked.

## What is measurably working

GA4, 10 days to 24 September 2026:

| Channel | Users | Sessions |
| --- | --- | --- |
| Organic Search | 56 | 62 |
| Direct | 10 | 12 |
| **AI Assistant** | **8** | **13** |
| Cross-network | 4 | 4 |

AI assistants are already the third channel. Small in absolute terms, and worth
watching rather than celebrating.

Search Console also shows a distinctive signature on the English mushroom and
autumn pages: queries like `si`, `avui`, `ahora esta semana`, `next weekend`,
`two weeks from now`, `month?`, `komende week?`. These are conversational
fragments, not search queries — consistent with assistant-mediated retrieval.
They convert at roughly zero, which is expected: the assistant answers, the
user does not click.

## What would actually improve citation

In rough order of expected effect:

1. **Keep the recurring pages recurring.** A page updated weekly with a dated,
   sourced figure is the most citable object this site produces. The mushroom
   report is already the most-cited-shaped thing here.
2. **Answer the question in the first sentence**, in the reader's language, and
   then support it. Assistants retrieve passages, not documents.
3. **Keep the verification date visible and true.** A stale date is worse than
   none.
4. **Do not pad.** Every extra paragraph of throat-clearing dilutes the
   retrievable passage.

## What we will not do

- No `llms.txt` theatre.
- No structured data that describes something the page does not contain.
- No FAQ blocks invented to farm question queries.
- No cloaking of any kind: assistants and Googlebot get the same HTML a reader
  gets.
