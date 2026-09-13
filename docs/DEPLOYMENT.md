# Deployment

## Environments

| | Where | Indexable | Database |
| --- | --- | --- | --- |
| Development | `localhost:3000` | No | Optional — the app runs without one |
| Preview | `*.vercel.app`, per branch/PR | **Never** | A separate database, or none |
| Production | `https://www.catalunyainfo.com` | Only when explicitly enabled | Production Postgres |

Preview deployments send `X-Robots-Tag: noindex, nofollow, noarchive` on every
response and serve a blanket-disallow `robots.txt`, because `VERCEL_ENV` is
`preview`. This is not configurable by an environment variable — it is a
property of not being production.

**Production deployments are gated on the request host as well.** Vercel serves
every production build on a `*.vercel.app` alias *and* on the custom domain,
with `VERCEL_ENV=production` in both cases. Gating only on the environment would
therefore publish a full duplicate of the site on a host we do not control, the
moment indexing is switched on. So the proxy and `robots.txt` both additionally
require `Host: www.catalunyainfo.com`; anything else is noindex and
blanket-disallowed, permanently and regardless of any environment variable.

## Environment variables

Set per environment in Vercel. See `.env.example` for the annotated list.

| Variable | Dev | Preview | Production |
| --- | --- | --- | --- |
| `DATABASE_URL` | optional | staging DB | **pooled** production URL |
| `POSTGRES_URL_NON_POOLING` | — | — | for `drizzle-kit migrate` |
| `NEXT_PUBLIC_ALLOW_INDEXING` | — | **never set** | `true` only when content is ready |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | — | — | the GA4 id |
| `CRON_SECRET` | — | — | a 32-byte random token |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | — | — | only if not verifying by DNS |

Generate `CRON_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Use the **pooled** connection string at runtime (serverless functions open a
connection per invocation; `DATABASE_POOL_MAX` defaults to 1 for the same
reason) and the **non-pooled** one for migrations, since poolers often refuse
DDL.

## Database

Neon or Vercel Postgres both work. Choose the region closest to `cdg1` (Paris) —
`vercel.json` pins functions there because the audience is in Catalonia.

First time:

```bash
npm run db:push               # development: push the schema directly
npm run db:seed:taxonomy      # categories and tags — structure, not content
CI_PASSWORD='…' npm run admin:create-user -- \
  --email you@example.com --name "Your Name" --role admin
```

For production, use versioned migrations rather than `db:push`:

```bash
npm run db:generate           # writes SQL into drizzle/
npm run db:migrate            # applies it
```

Commit the generated SQL. `db:push` is convenient in development and dangerous
against a database with real content.

## Domain

**`https://www.catalunyainfo.com` is canonical.** The apex redirects to it,
permanently.

That is not a stylistic preference: `www` is the host already indexed for
version 1, and the apex already redirected to it. Switching now would force a
re-crawl of everything for no gain.

In Vercel → Project → Domains:

1. Add `www.catalunyainfo.com` as the **primary** domain.
2. Add `catalunyainfo.com` and set it to **redirect to** `www.catalunyainfo.com`.
3. Vercel issues and renews the certificates; there is nothing to do for HTTPS.

DNS lives at **Spaceship** (nameservers `launch1/launch2.spaceship.net`).
Current records:

| Record | Name | Value | Note |
| --- | --- | --- | --- |
| A | `@` | `216.198.79.1` | Vercel anycast. Vercel reports `ipStatus: no-change`. |
| CNAME | `www` | `9db29c1d3804e584.vercel-dns-017.com` | **Inherited from the old project — see below** |
| TXT | `_vercel` | `vc-domain-verify=…` ×2 | Ownership proof. Safe to keep. |
| TXT | `@` | `google-site-verification=…` | Search Console. **Do not delete.** |

**The `www` CNAME should be repointed.** It still targets the hostname Vercel
issued to the *old* project. Routing works today because Vercel routes by `Host`
header and that name resolves to Vercel's edge, so the API reports
`misconfigured: false` — but the name belongs to a project in an account we do
not control. If that project is ever deleted, the target could stop resolving.

Change it in Spaceship to this project's own target:

```
www  CNAME  d624581fbef5aff0.vercel-dns-017.com
```

(Or `cname.vercel-dns.com`, Vercel's generic rank-2 recommendation.)

### How the domain was reclaimed

The domain had been registered to a Vercel account that is no longer
accessible, so `vercel domains add` returned `domain_not_owned` (403). The way
through was **DNS ownership proof**: attaching the domain to the new project
yields a `_vercel` TXT challenge, and adding that record at the registrar moves
the domain regardless of which Vercel account previously held it. Verification
is instant once the TXT propagates, and it takes effect immediately — there is
no window in which both sites serve.

`next.config.ts` also redirects apex → www at the application level. That is
belt and braces: it covers custom aliases and any window where the platform
redirect is not configured.

**Version 1's apex redirect was a 307.** This one is permanent. Changing it is
part of the cutover.

### Cutover

DNS changes are the one genuinely risky step here, so do them in this order:

1. Deploy v2 to Vercel and test it on its `.vercel.app` URL.
2. Set every production environment variable **except**
   `NEXT_PUBLIC_ALLOW_INDEXING`.
3. Run the database migrations and create the accounts.
4. Publish the trust pages and the first cluster through the CMS.
5. Move the domain to the new project.
6. Verify (below) on the real domain, with indexing still off.
7. Only then set `NEXT_PUBLIC_ALLOW_INDEXING=true` and redeploy.
8. Follow `SEARCH_CONSOLE.md` from step 4.

Keep the old project available but undeployed for a few days. Rolling back is a
domain reassignment, not a rebuild.

## Cron

`vercel.json` registers one job:

```json
{ "path": "/api/cron/publish-scheduled", "schedule": "0 5 * * *" }
```

It publishes scheduled pages, flips overdue pages to `needs_update` and prunes
expired sessions. Vercel sends `CRON_SECRET` as a bearer token; without it the
endpoint answers 401. The job is idempotent — a double run changes nothing.

**The daily schedule is a Hobby-plan constraint, not a design choice.** Vercel
Hobby allows one cron run per day; the deploy is rejected outright with anything
more frequent. The practical effect: a page scheduled for 14:00 publishes at the
next 05:00 UTC run, not at 14:00.

Three ways out, in order of preference:

1. **Upgrade to Pro** and change the schedule back to `*/15 * * * *`. That is the
   only change needed — the endpoint is already idempotent and authorised.
2. **Publish manually.** For a site publishing a few pages a week, an editor
   pressing Publish is not a hardship, and scheduling can simply go unused.
3. **Call the endpoint from outside Vercel** on whatever interval you like
   (GitHub Actions, cron-job.org, an existing server):
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET"      https://www.catalunyainfo.com/api/cron/publish-scheduled
   ```
   Same authorisation, same idempotency. This is the free route to
   15-minute granularity.

## Cost control

The brief asked not to pay for what can be static. What the build does:

- **Every content page is static + ISR.** A cache hit costs no function
  invocation and no database query.
- Functions exist only where they must: the CMS, internal search, the feedback
  endpoint and the cron job. All four are noindexed and low traffic.
- The proxy runs on every request and is deliberately kept free of database
  access — a query there would tax every page view.
- `revalidate` is 5–10 minutes plus **on-demand revalidation on publish**, so
  editors see changes immediately without a short global interval.
- Images are cached for 30 days after optimisation. Every upload gets a new key,
  so a long TTL is safe.
- `social-card.png` and `logo.png` are generated once at build, not per request.

## Verification after any production deploy

```bash
# Canonical host and permanent redirect
curl -sI https://catalunyainfo.com/ | head -1

# The v1 regression: real HTML, no loading placeholder
curl -s https://www.catalunyainfo.com/ca/ | grep -oE '<h1[^>]*>[^<]*'
curl -s https://www.catalunyainfo.com/ca/ | grep -ciE 'carregant|loading'   # 0

# Indexing posture
curl -sI https://www.catalunyainfo.com/ca/ | grep -i x-robots-tag
curl -s  https://www.catalunyainfo.com/robots.txt

# Migration
curl -so /dev/null -w '%{http_code}\n' https://www.catalunyainfo.com/article/<any>.html   # 410
curl -so /dev/null -w '%{http_code}\n' https://www.catalunyainfo.com/ultimahora/          # 308

# Admin is gated and noindexed
curl -so /dev/null -w '%{http_code}\n' https://www.catalunyainfo.com/admin/               # 307 → login

# Security headers
curl -sI https://www.catalunyainfo.com/ca/ | grep -iE 'content-security|strict-transport|x-frame'
```

## Rollback

Vercel keeps every deployment. Promote a previous one from the dashboard; it is
instant and needs no rebuild.

Two caveats:

- **Database migrations do not roll back with the deployment.** Write migrations
  additively — add a column, do not rename one — so an older build keeps working
  against a newer schema.
- Content changes are in the database and are unaffected by a code rollback.
  Individual pages roll back through `entry_revisions` in the CMS.
