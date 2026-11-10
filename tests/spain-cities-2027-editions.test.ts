import assert from "node:assert/strict";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

type Edition = import("../src/lib/programmatic/spain-2027/editions.ts").Edition;
const { CITIES, localDays, local2027, isZoned } = await import("../src/lib/programmatic/spain-2027/cities.ts");
const { cityDescriptionIntl, cityFaqIntl, cityH1Intl, cityLeadIntl, cityListLineIntl, cityTitleIntl, localNoteIntl } = await import(
  "../src/lib/programmatic/spain-2027/city-copy-intl.ts"
);
const { EDITION_DESCRIPTION_LIMIT, EDITION_TITLE_LIMIT } = await import("../src/lib/programmatic/spain-2027/copy-intl.ts");
const { dayPair } = await import("../src/lib/programmatic/holidays/format.ts");

/**
 * The Catalan and English editions of the 129 city pages: every text in the
 * page's language, fitting Google's limits, each city's own lead.
 */

const LOCALES: Edition[] = ["ca", "en"];
/** Spanish words that would mean a sentence slipped through untranslated (local festival names and official titles excepted, so only the lead and the H1). */
const SPANISH = /\b(festivos|según|también|aún|fiestas locales|habitantes|provincia de)\b/;

test("city editions: titles ≤ 60 with the year, descriptions ≤ 155, H1, lead and FAQ in every city", () => {
  for (const locale of LOCALES) {
    for (const c of CITIES) {
      const title = cityTitleIntl(c, locale);
      assert.ok(title.length <= EDITION_TITLE_LIMIT, `${locale} ${c.slug}: ${title} (${title.length})`);
      assert.ok(title.includes("2027"), `${locale} ${c.slug}: ${title}`);
      const description = cityDescriptionIntl(c, locale);
      assert.ok(description.length <= EDITION_DESCRIPTION_LIMIT, `${locale} ${c.slug}: ${description.length} ${description}`);
      assert.ok(description.length > 40, `${locale} ${c.slug}: ${description}`);
      assert.ok(cityH1Intl(c, locale).includes("2027"), c.slug);
      const lead = cityLeadIntl(c, locale);
      assert.ok(lead.length > 80, `${locale} ${c.slug}: ${lead}`);
      for (const text of [title, description, lead, cityH1Intl(c, locale), cityListLineIntl(c, locale)]) {
        assert.doesNotMatch(text, /undefined|null|NaN|\$\{/, `${locale} ${c.slug}: ${text}`);
      }
      assert.doesNotMatch(lead.replace(/\([^)]*\)/g, ""), SPANISH, `${locale} ${c.slug}: ${lead}`);
      assert.doesNotMatch(cityH1Intl(c, locale), SPANISH, `${locale} ${c.slug}`);
      const faq = cityFaqIntl(c, locale);
      assert.ok(faq.length >= 2, `${locale} ${c.slug}`);
      for (const item of faq) {
        assert.ok(item.question.length > 10 && item.answer.length > 10, `${locale} ${c.slug}`);
        assert.doesNotMatch(item.question + item.answer, /undefined|null|NaN|\$\{/, `${locale} ${c.slug}: ${item.answer}`);
      }
    }
  }
});

test("city editions: no two leads alike, per locale", () => {
  for (const locale of LOCALES) {
    const leads = CITIES.map((c) => cityLeadIntl(c, locale));
    assert.equal(new Set(leads).size, leads.length, locale);
  }
});

test("city editions: a published city names its two days in the title; local notes are translated", () => {
  const sevilla = CITIES.find((c) => c.slug === "sevilla")!;
  const [a, b] = localDays(sevilla).map((d) => d.date);
  assert.ok(a && b);
  assert.ok(cityTitleIntl(sevilla, "ca").includes(dayPair(a, b, "ca")), cityTitleIntl(sevilla, "ca"));
  assert.ok(cityTitleIntl(sevilla, "en").startsWith("Seville local holidays 2027:"), cityTitleIntl(sevilla, "en"));
  assert.ok(cityTitleIntl(sevilla, "en").includes(dayPair(a, b, "en")), cityTitleIntl(sevilla, "en"));
  for (const c of CITIES) {
    const list = local2027(c);
    if (!list) continue;
    const days = [...list.days, ...(list.zones ?? []).flatMap((z) => z.days)];
    for (const d of days) {
      if (!d.note) continue;
      for (const locale of LOCALES) assert.notEqual(localNoteIntl(d.note, locale), d.note, `${c.slug}: ${d.note}`);
    }
  }
  // Zoned cities say so in both languages.
  for (const c of CITIES.filter(isZoned)) {
    assert.match(cityListLineIntl(c, "ca"), /per zones/);
    assert.match(cityListLineIntl(c, "en"), /by area/);
  }
});
