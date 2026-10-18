---
name: publish-safe
description: Release checklist for catalunyainfo.com — tests, build, ISR-cost check, owner approval, production deploy, publish group, live verification and IndexNow. Run manually with /publish-safe <publish-group>.
disable-model-invocation: true
---

# publish-safe

Input: one or more publish groups as accepted by `/api/admin/publish/?only=<group>` (see `src/app/api/admin/publish/route.ts`).

1. **Gate** — all must pass, otherwise stop and report:
   - `npx tsc --noEmit`, `npm test`, `npx eslint src tests`, `npm run build` (if build fails with a turbopack font error: `rm -rf .next` and rebuild).
   - `git diff main --stat` reviewed; no secrets; no `revalidate` lowered below 86400 on content routes; no frozen experiment titles changed (docs/SEO_EXPERIMENTS.md).
   - Every new or changed fact has an official source in the article's `sources` and a matching `VERIFIED` date.
2. **Owner approval** — summarise the change in Catalan (what, why, risk, ISR writes ≈ editions × 1) and ask before deploying to production. Never deploy without an explicit yes in this conversation.
3. **Deploy** — merge to main, push, `npx vercel@59.17.0 --prod --yes` (retry on "Not authorized").
4. **Publish** — `curl -X POST -H "authorization: Bearer $(cat .cron-secret)" "https://www.catalunyainfo.com/api/admin/publish/?only=<group>"` (trailing slash required). Never print the secret.
5. **Verify** — `curl -sI https://www.catalunyainfo.com/ca/` must carry **no** `X-Robots-Tag`, and the deployment's `*.vercel.app` URL **must** carry `X-Robots-Tag: noindex` (headers are static in next.config.ts since 19 Oct; a wrong env at build time would noindex the whole site). Then each edition URL returns 200, the new text is in the HTML, `indexNow.status` is 200/202. Resubmit the sitemap in Search Console when URLs are new.
6. **Log** — add a line to docs/growth/DECISION_LOG.md (date, commit, what changed, how it will be measured).
