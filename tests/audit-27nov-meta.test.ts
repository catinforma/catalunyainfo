import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

/**
 * 27 Nov 2026 live audit, batch 8F: the author indexes had no meta description
 * (so no og:description either), and llms.txt carried no date.
 */

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { getMessages } = await import("../src/lib/i18n/index.ts");
const { LOCALES } = await import("../src/lib/i18n/config.ts");
const { buildMetadata } = await import("../src/lib/seo/metadata.ts");
const { sectionPath } = await import("../src/lib/i18n/routes.ts");
const { buildLlmsTxt, llmsUpdatedLine } = await import("../src/lib/seo/llms.ts");
const { latestBodyDate } = await import("../src/lib/seo/body-dates.ts");

const ROOT = join(import.meta.dirname, "..");
const BODY_DATES = JSON.parse(readFileSync(join(ROOT, "src/lib/seo/body-dates.json"), "utf8")) as { families: Record<string, { date: string }> };

test("author index: a title and description in each language, like the other hubs, and Open Graph carries them", () => {
  const seen = new Set<string>();
  for (const locale of LOCALES) {
    const meta = getMessages(locale).hubMeta.authors;
    assert.ok(meta.title.length <= 65, `${locale}: ${meta.title.length}`);
    assert.ok(meta.description.length >= 70 && meta.description.length <= 160, `${locale}: ${meta.description.length}`);
    seen.add(meta.description);
    const md = buildMetadata({ locale, path: sectionPath("authors", locale), title: meta.title, description: meta.description, noindex: true });
    assert.equal(md.description, meta.description);
    const og = md.openGraph as { description?: string; title?: string; url?: string };
    assert.equal(og.description, meta.description);
    assert.equal(og.title, meta.title);
    assert.ok(String(og.url).endsWith(sectionPath("authors", locale)));
  }
  assert.equal(seen.size, 3, "one text per language");
  const page = readFileSync(join(ROOT, "src/app/(public)/[locale]/[...slug]/page.tsx"), "utf8");
  assert.match(page, /title: t\.hubMeta\.authors\.title,\s*description: t\.hubMeta\.authors\.description,/);
  // Still out of the index while only the founder is listed (unchanged).
  assert.match(page, /noindex: \(await listAuthors\(locale\)\)\.length === 0,/);
});

test("llms.txt: an Updated line from the newest body date or guide publish, never a typed date", () => {
  const newestBody = Object.values(BODY_DATES.families)
    .map((f) => f.date)
    .sort()
    .at(-1)!;
  assert.equal(latestBodyDate()?.toISOString(), new Date(newestBody).toISOString());
  const madrid = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(d);
  // The body date alone; a newer guide publish wins; Madrid's day, not UTC's.
  assert.equal(llmsUpdatedLine({}), `Updated: ${madrid(new Date(newestBody))}`);
  assert.equal(llmsUpdatedLine({ ca: [{ title: "x", href: "/ca/guies/x/", excerpt: null, updatedAt: "2099-01-01T23:30:00Z" }] }), "Updated: 2099-01-02");
  assert.equal(llmsUpdatedLine({}, new Date("2026-11-26T23:30:00Z")), "Updated: 2026-11-27");
  assert.equal(llmsUpdatedLine({}, null), null);

  const txt = buildLlmsTxt("https://www.catalunyainfo.com", "CatalunyaInfo", {});
  const lines = txt.split("\n");
  assert.equal(lines[0], "# CatalunyaInfo");
  assert.match(lines[4]!, /^Updated: \d{4}-\d{2}-\d{2}$/);
  assert.equal(lines[6], "## Live tools and data");
  const route = readFileSync(join(ROOT, "src/app/llms.txt/route.ts"), "utf8");
  assert.match(route, /updatedAt: entry\.updatedAt/);
  assert.doesNotMatch(readFileSync(join(ROOT, "src/lib/seo/llms.ts"), "utf8"), /Updated: 20\d\d/);
});
