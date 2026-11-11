# Legal and institutional pages

## What exists

Ten pages, in `ca`/`es`/`en`, published as ordinary `page` entries so an editor
can reword them in the CMS without a deploy:

| Page | `ca` | `es` | `en` |
| --- | --- | --- | --- |
| Hub | `/ca/legal/` | `/es/legal/` | `/en/legal/` |
| Legal notice | `/legal/avis-legal/` | `/legal/aviso-legal/` | `/legal/legal-notice/` |
| Privacy | `/legal/privacitat/` | `/legal/privacidad/` | `/legal/privacy/` |
| Cookies | `/legal/cookies/` | `/legal/cookies/` | `/legal/cookies/` |
| Editorial policy | `/legal/politica-editorial/` | `/legal/politica-editorial/` | `/legal/editorial-policy/` |
| Corrections | `/legal/correccions/` | `/legal/correcciones/` | `/legal/corrections/` |
| Sources | `/legal/fonts/` | `/legal/fuentes/` | `/legal/sources/` |
| Accessibility | `/legal/accessibilitat/` | `/legal/accesibilidad/` | `/legal/accessibility/` |
| About | `/ca/qui-som/` | `/es/quienes-somos/` | `/en/about/` |
| Contact | `/ca/contacte/` | `/es/contacto/` | `/en/contact/` |

Source: `src/lib/content/pages/`, published by `publishInstitutionalPages()`
from `/api/admin/publish`.

**Before this existed, all thirty of those URLs returned 404** — while the
footer linked to them and the sitemap listed every one. On a site whose stated
problem was looking like it had nothing behind it, that was the worst defect on
it, and `tests/institutional-pages.test.ts` asserts the set of published paths
still matches the set the route map advertises, so it cannot come back quietly.

## Still to fill in

`src/lib/content/pages/operator.ts` holds the publisher identity. Three fields
are **empty**, and every line that renders them is skipped while they are:

```ts
legalName: "",   // legal name of the natural or legal person
taxId: "",       // NIF / CIF
address: "",     // postal address for notifications
```

Spain's LSSI-CE (Ley 34/2002, art. 10) requires these of an information-society
service provider. They are facts about a real person that the repository does
not hold, and **an invented tax number is a false statement, whereas a missing
line is only a gap** — so they are absent rather than filled with a placeholder.
A test forbids placeholders reaching the page.

**Fill them in before the site is presented as a commercial service** —
advertising, affiliate links, sponsorship — since that is the point at which
art. 10 clearly bites. Editing that one file and re-running the publish endpoint
adds the rows to the legal notice in all three languages.

## What the pages promise, and what has to stay true

These are not boilerplate; they describe what the code does. Changing the code
without changing them makes them false:

- **The cookie table is generated** from `COOKIES` in `operator.ts`, which is
  the same list the consent gate honours. A test asserts every cookie the site
  sets appears in the policy. Add a cookie, add it there.
- **The processor table** names Vercel, Neon and Google Ireland. Add a third
  party that sees data and it belongs in that table.
- **"Nothing third-party loads before consent"** is a claim the privacy and
  cookie pages both make. It is true today — verify it stays true by declining
  consent and checking the network panel shows no request to
  `googletagmanager.com` at all.
- **Retention: 24 months for contact messages.** Nothing prunes them yet; that
  belongs in the scheduled job.
- **Accessibility: WCAG 2.2 AA, self-assessed.** The page says explicitly that
  there has been no external audit. Do not upgrade that claim without one.
- **Advertising: planned, not live.** The legal notice, privacy policy,
  cookie policy, editorial policy, about page, accessibility statement, legal
  hub and contact page all say the same thing (11 Nov 2026): the site will be
  funded by Google AdSense ads, none is shown yet, no advertising cookie is set,
  and in the EEA/UK/Switzerland ads will run only through a Google-certified
  IAB TCF consent platform. The privacy policy carries the disclosures AdSense
  "Required content" asks for (quoted with the check date above `AD_LINKS`,
  `src/lib/content/pages/privacy.ts`); a test holds the links and forbids any
  page saying the site "never" carries ads. No affiliate links and no sponsored
  content remain true. **The day ads go live**, the privacy and cookie pages,
  `PROCESSORS` (Google as an advertising party) and the legal notice's identity
  block (LSSI art. 10) change with them.
- **Publish groups**: `ads-disclosure` republishes the eight pages that wording
  touches; `privacy-cookies`, `legal-notice`, `editorial-policy`, `legal-hub`,
  `accessibility-page`, `about-page` and `contact-page` publish one or two
  pages each. `pages` republishes all ten and overwrites CMS edits on every one.
  `verifiedAt` on a `PageSpec` sets the page's verification date.

## Corrections and right of reply

`/legal/correccions/` commits to a 72-hour response target and to noting
substantial corrections on the page itself rather than fixing them silently.
That is a promise about process, not about code; it needs somebody to honour it.
