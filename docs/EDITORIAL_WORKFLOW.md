# Editorial workflow

## Roles

| Role | Can |
| --- | --- |
| `viewer` | Read the CMS |
| `author` | Create and edit drafts, move to `review`, save media and sources |
| `editor` | Everything above, plus **publish**, schedule, manage authors and redirects |
| `admin` | Everything |

Role checks live in the server actions, not in the UI. Hiding a button is a
convenience; `requireUser("editor")` inside `saveTranslation` is the boundary.

Accounts exist only because an administrator ran
`npm run admin:create-user`. There is no self-service sign-up anywhere.

## States

```
draft ──▶ review ──▶ ready ──▶ scheduled ──▶ published
  ▲          │                                   │
  └──────────┘                                   ▼
                                          needs-update
                                                 │
                                                 ▼
                                            archived
```

| State | Meaning | Public? |
| --- | --- | --- |
| `draft` | Being written | No |
| `review` | With an editor | No |
| `ready` | Approved, waiting for a slot | No |
| `scheduled` | Will publish automatically at `scheduled_for` | No, until then |
| `published` | Live | **Yes** |
| `needs_update` | Live but overdue for re-verification | No — it leaves the public site |
| `archived` | Withdrawn | No |

`needs_update` deliberately removes a page from public view. A guide whose facts
have gone stale is worse than no guide, and the whole premise of the product is
that its pages are checked.

## Publishing a page

1. **Create.** `/admin/content` → type, language, title, optional path. Always
   created as a draft.
2. **Write.** Blocks in the main column, metadata in the rail. Live word count
   and reading time; SEO field lengths shown against what Google actually
   displays.
3. **Attribute.** Pick an author. Anonymous content is one of the strongest
   low-value signals there is.
4. **Cite.** Add sources — official and primary first. They render as a numbered
   register and feed `citation` in the structured data.
5. **Set the verification date.** `last_verified_at` is the date a human checked
   the facts, not the date the file was touched. Set `review_due_at` to when it
   must be checked again.
6. **Check the URL.** The path is validated on save; after publication, changing
   it automatically leaves a permanent redirect behind.
7. **Review.** Author moves to `review`; an editor reads it.
8. **Publish.** Only an editor can. `published_at` is set once and preserved
   through every later edit.

On publish the site revalidates the page, its section hub, the locale home and
the sitemap. Fresh static HTML is served from the CDN on the next request.

## Scheduling

Set the status to `scheduled` and give `scheduled_for` a time. A Vercel Cron
calls `/api/cron/publish-scheduled` and:

1. publishes anything whose time has passed,
2. flips published pages whose `review_due_at` has passed to `needs_update`,
3. deletes expired sessions.

The job is idempotent and authorised with `CRON_SECRET`, compared in constant
time.

**On the current Hobby plan it runs once a day, at 05:00 UTC.** So a page
scheduled for 14:00 goes live at the next morning's run. Until that changes,
treat scheduling as "publish on this day" rather than "publish at this minute",
or just press Publish. `docs/DEPLOYMENT.md` lists the three ways to get finer
granularity.

## Translating

From the editing screen, the **Idiomes** panel offers "Crea esborrany" for any
language that does not yet have an edition. That copies the source and creates a
**draft** — never a published page.

Rules:

- **A copied edition is never published without a human reading it in the target
  language.** The action hard-codes `status: "draft"`; there is no path around it.
- Give each language its own natural slug. The draft gets a placeholder
  (`…-en`); change it before publishing.
- `translated_from_locale` records the source, so a reviewer knows what to check
  against.
- Publish order in practice: Catalan → Spanish → English.
- A language you have not published simply does not appear in `hreflang`. Half a
  translation is worse than none.

## Writing well here

The platform can only carry the content. What makes a page worth its URL:

**Answer the question in the first screen.** Use a `keyFacts` block. Someone
searching "com arribar a Montserrat" wants the train line, the price and the
journey time before the prose.

**Cite the primary source.** Gencat, the town council, Renfe, FGC, the museum
itself. A link to another blog is not a source.

**Say when you checked.** Prices and timetables change. The verification stamp
is the product's differentiator; an empty one wastes it.

**Structure for the question, not for length.** A table of train times beats
three paragraphs describing them. Length is not a ranking factor — but a page
that answers less than a search snippet already did is what gets flagged as low
value.

**Be the local.** The defensible content is what a well-informed resident knows
and a generic travel aggregator cannot copy: which car park fills first, which
entrance is step-free, what closes in February.

**Never publish AI-generated content.** Not a policy statement for the file —
it is the specific failure that got version 1 rejected. The CMS has no
"generate" button by design.

## Corrections

A reader can flag a page through the "was this useful?" control, which stores
the path, the language and a yes/no — no identifier, no session, no IP. The
corrections policy page should tell readers how to report an error and what
happens next; when you fix one, update `last_verified_at` so the change is
visible.

## The CMS dashboard

`/admin` shows, in order of usefulness:

- counts per workflow state,
- the **AdSense readiness checklist** with a live verdict,
- pages overdue for re-verification,
- translation gaps — published in one language, missing in another.
