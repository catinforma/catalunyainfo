import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { CITIES, commonLocalDays, holidayCount, localDays, local2027 } = await import("../src/lib/programmatic/spain-2027/cities.ts");
const { GLANCE_FEED_ANCHOR, cityGlance, cityGlanceCopy } = await import("../src/lib/programmatic/spain-2027/city-glance.ts");
const { cityAnswer } = await import("../src/lib/programmatic/spain-2027/city-copy.ts");

/**
 * The one-glance line of every Spain 2027 city page (city-glance.ts): same
 * count as the answer paragraph and the table, pending wording and no date
 * when the local days are pending, two lines on a phone, ca/es/en.
 */

const LOCALES = ["es", "ca", "en"] as const;
const line = (c: (typeof CITIES)[number], l: (typeof LOCALES)[number]) => {
  const g = cityGlanceCopy(c, l);
  return `${g.strong}${g.rest} · ${g.cta}`;
};
const MONTH = /\b\d{1,2}(?:,? y \d{1,2}| i \d{1,2}| and \d{1,2})? (ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|gen|abr|mai|juny|jul|set|des|Jan|Feb|Apr|Jun|Aug|Sep|Dec)\b/i;
/** About 84 characters fit two lines of 0.95rem text on a 390 px phone (checked on a screenshot: 97 wrapped to three). */
const MAX = 84;

test("glance: every city, every language: no placeholder, within two phone lines", () => {
  assert.ok(CITIES.length > 500, String(CITIES.length));
  for (const c of CITIES) {
    for (const l of LOCALES) {
      const text = line(c, l);
      assert.doesNotMatch(text, /undefined|null|NaN|\$\{|\[object/, `${l} ${c.slug}: ${text}`);
      assert.ok(text.length <= MAX, `${l} ${c.slug}: ${text.length} ${text}`);
      assert.match(text, /2027/, `${l} ${c.slug}`);
      assert.ok(text.includes(String(holidayCount(c))), `${l} ${c.slug}: ${text}`);
    }
  }
});

test("glance: total is the number of the table and the answer; parts add up", () => {
  for (const c of CITIES) {
    const g = cityGlance(c);
    assert.equal(g.total, holidayCount(c), c.slug);
    assert.equal(g.base + g.local, g.total, c.slug);
    assert.ok(g.local >= 0 && g.pending >= 0 && g.pending <= 2, c.slug);
    if (g.status === "published" || g.status === "council") assert.equal(g.local, localDays(c).length, c.slug);
    if (local2027(c) && !cityAnswer(c).strong.includes("por zonas")) {
      assert.ok(cityAnswer(c).rest.includes(`son ${g.total} festivos`), `${c.slug}: ${cityAnswer(c).rest}`);
    }
  }
});

test("glance: pending cities say pending in the language, name no invented date and cite their bulletin", () => {
  let pending = 0;
  for (const c of CITIES) {
    const g = cityGlance(c);
    if (g.status !== "pending") continue;
    pending++;
    assert.equal(g.pending, 2 - commonLocalDays(c).length, c.slug);
    const es = cityGlanceCopy(c, "es");
    const ca = cityGlanceCopy(c, "ca");
    const en = cityGlanceCopy(c, "en");
    assert.match(es.rest, /pendiente/, c.slug);
    assert.match(ca.rest, /pendent/, c.slug);
    assert.match(en.rest, /pending/, c.slug);
    for (const t of [es.rest, ca.rest, en.rest]) assert.doesNotMatch(t, MONTH, `${c.slug}: ${t}`);
    assert.match(es.rest, /\bde(l| su) [A-Za-z]/, c.slug);
    assert.match(en.rest, /in (the )?[A-Za-z]|its official gazette/, c.slug);
  }
  assert.ok(pending > 10, `pending cities: ${pending}`);
});

test("glance: a published city lists exactly its own local days; council cities say so", () => {
  let published = 0;
  let council = 0;
  for (const c of CITIES) {
    const g = cityGlance(c);
    if (g.status === "published") {
      published++;
      const es = cityGlanceCopy(c, "es").rest;
      assert.match(es, /locales: /, c.slug);
      assert.match(es, MONTH, `${c.slug}: ${es}`);
      assert.doesNotMatch(es, /pendiente/, c.slug);
    }
    if (g.status === "council") {
      council++;
      assert.match(cityGlanceCopy(c, "es").rest, /locales aprobadas, falta (el|su) /, c.slug);
      assert.match(cityGlanceCopy(c, "ca").rest, /locals aprovades, falta el /, c.slug);
      assert.match(cityGlanceCopy(c, "en").rest, /local, approved; \S.* pending\)/, c.slug);
    }
  }
  assert.ok(published > 500, String(published));
  console.log("glance statuses:", { published, council });
});

test("glance: a city whose list leaves it out has no pending wording and no local date", () => {
  const missing = CITIES.filter((c) => c.status2027 === "missing");
  for (const c of missing) {
    for (const l of LOCALES) {
      const rest = cityGlanceCopy(c, l).rest;
      assert.doesNotMatch(rest, MONTH, `${l} ${c.slug}`);
      assert.doesNotMatch(rest, /pendiente|pendent|pending/, `${l} ${c.slug}`);
    }
  }
});

test("glance: both city page components render it, and the feed anchor exists on the page", () => {
  const es = readFileSync("src/components/programmatic/spain-2027/city-page.tsx", "utf8");
  const intl = readFileSync("src/components/programmatic/spain-2027/city-page-intl.tsx", "utf8");
  assert.match(es, /<CityGlance c=\{c\} locale="es" \/>/);
  assert.match(intl, /<CityGlance c=\{c\} locale=\{locale\} \/>/);
  // After the answer paragraph, before the layers list and the table.
  for (const src of [es, intl]) {
    assert.ok(src.indexOf("data-answer") < src.indexOf("<CityGlance"), "glance after the answer");
    assert.ok(src.indexOf("<CityGlance") < src.indexOf("data-layers"), "glance before the layers");
    assert.ok(src.indexOf("<CityGlance") < src.indexOf('id="calendario"'), "glance before the table");
    assert.match(src, /<CalendarSubscribe/);
  }
  assert.equal(GLANCE_FEED_ANCHOR, "#afegeix-calendari");
  assert.match(readFileSync("src/components/programmatic/ics/CalendarSubscribe.tsx", "utf8"), /const id = "afegeix-calendari"/);
});
