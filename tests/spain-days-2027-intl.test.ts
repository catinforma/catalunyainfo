import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

/*
 * The Catalan and English editions of the Spain-wide 2027 day pages
 * (/ca/festius/2027/dia/…, /en/holidays/2027/day/…). The Spanish edition and
 * the facts behind all three are held by tests/spain-days-2027.test.ts; this
 * file holds the routes, hreflang, the language of every line and the
 * same-language links.
 */

const { COMMON_DATES } = await import("../src/lib/programmatic/spain-2027/calendar.ts");
const { TITLE_LIMIT, DESCRIPTION_LIMIT } = await import("../src/lib/programmatic/spain-2027/copy.ts");
const { DAY_PAGES, spainDay } = await import("../src/lib/programmatic/spain-2027/days.ts");
const {
  HOLIDAY_NAMES,
  dayDescriptionIntl,
  dayFaqIntl,
  dayH1Intl,
  dayLeadIntl,
  dayNotesIntl,
  dayQuestionIntl,
  daySectionsIntl,
  dayTitleIntl,
  dayVerdictIntl,
  restOfSpainLabelIntl,
} = await import("../src/lib/programmatic/spain-2027/day-copy-intl.ts");
const { resolveSpainDay, spainDayPath, spainDayPaths, spainDaySlug, spainDayStaticParams, spainDayTranslations } = await import(
  "../src/lib/programmatic/spain-2027/paths.ts"
);
const { DATE_PAGES, datePath, hubPath } = await import("../src/lib/programmatic/holidays/paths.ts");
const { municipalities } = await import("../src/lib/programmatic/holidays/data.ts");
const { B2_PATHS } = await import("../src/lib/content/batch02/shared.ts");

type L = "ca" | "en";
const INTL: readonly L[] = ["ca", "en"];
type Day = NonNullable<ReturnType<typeof spainDay>>;

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const COMPONENT = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/days.tsx"), "utf8");
const ROUTE_DIR: Record<L, string> = { ca: join(APP, "festius", "2027", "dia", "[fecha]"), en: join(APP, "holidays", "2027", "day", "[fecha]") };

const day = (iso: string): Day => {
  const d = spainDay(iso);
  assert.ok(d, iso);
  return d;
};

function sakamoto(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const year = m < 3 ? y - 1 : y;
  return (year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) + t[m - 1]! + d) % 7;
}

/** Every line a page prints or puts in its metadata and FAQPage. */
function allText(iso: string, locale: L): string {
  const d = day(iso);
  return [
    dayTitleIntl(iso, d, locale),
    dayDescriptionIntl(d, locale),
    dayH1Intl(iso, locale),
    dayVerdictIntl(d, locale),
    dayLeadIntl(d, locale),
    ...dayNotesIntl(d, locale),
    ...daySectionsIntl(d, locale).flatMap((s) => [s.question, s.answer, s.printed]),
    ...dayFaqIntl(d, locale).flatMap((f) => [f.question, f.answer]),
  ].join(" ");
}

/* -------------------------------------------------------------------------- */
/* URLs and routes                                                            */
/* -------------------------------------------------------------------------- */

test("URLs: /ca/festius/2027/dia/<d>-<mes>/ and /en/holidays/2027/day/<d>-<month>/, one per Spanish page", () => {
  assert.equal(spainDayPath("2027-12-06", "ca"), "/ca/festius/2027/dia/6-desembre/");
  assert.equal(spainDayPath("2027-12-06", "es"), "/es/festivos/2027/dia/6-diciembre/");
  assert.equal(spainDayPath("2027-12-06", "en"), "/en/holidays/2027/day/6-december/");
  assert.equal(spainDayPath("2027-03-19", "ca"), "/ca/festius/2027/dia/19-marc/", "ASCII month, as the Catalan date pages");
  assert.equal(spainDayPath("2027-01-01", "en"), "/en/holidays/2027/day/1-january/");
  assert.equal(spainDayPaths().length, 81);
  assert.equal(DAY_PAGES.length, 27);
  for (const locale of INTL) {
    const slugs = DAY_PAGES.map((iso) => spainDaySlug(iso, locale));
    assert.equal(new Set(slugs).size, DAY_PAGES.length, locale);
    for (const s of slugs) assert.match(s, /^\d{1,2}-[a-z]+$/, s);
    for (const iso of DAY_PAGES) {
      assert.equal(resolveSpainDay(locale, locale, spainDaySlug(iso, locale)), iso);
      // Each route answers its own language only, and only its own spelling.
      assert.equal(resolveSpainDay(locale, "es", spainDaySlug(iso, locale)), null);
      assert.equal(resolveSpainDay(locale, locale, spainDaySlug(iso, "es")) === iso, spainDaySlug(iso, locale) === spainDaySlug(iso, "es"));
    }
    assert.deepEqual(
      spainDayStaticParams(locale).map((p) => p.fecha),
      slugs,
    );
    assert.ok(spainDayStaticParams(locale).every((p) => p.locale === locale));
  }
  assert.equal(resolveSpainDay("ca", "ca", "10-marc"), null, "folded dates have no page");
  assert.equal(resolveSpainDay("en", "en", "6-december-2027"), null);
  // The static `2027` folder sits beside `[municipi]` in both: no town may be called that.
  assert.ok(!municipalities().some((m) => m.slug === "2027" || m.slug === "dia" || m.slug === "day"));
  // Since 10 Nov 2026 the calendar's own ca/en editions sit beside the day pages.
  // Since 11 Nov 2026 the embeddable calendar's page too (embed-2027/places.ts WIDGET_SLUG).
  assert.deepEqual(readdirSync(join(APP, "festius", "2027")).sort(), ["[comunitat]", "al-teu-web", "dia", "page.tsx", "ponts"]);
  assert.deepEqual(readdirSync(join(APP, "festius", "2027", "dia")), ["[fecha]"]);
  assert.deepEqual(readdirSync(join(APP, "holidays", "2027")).sort(), ["[community]", "day", "for-your-website", "long-weekends", "page.tsx"]);
  assert.deepEqual(readdirSync(join(APP, "holidays", "2027", "day")), ["[fecha]"]);
});

test("routes: one locale each, dynamicParams = true (the publish group revalidates them), notFound() for the rest", () => {
  for (const locale of INTL) {
    const path = join(ROUTE_DIR[locale], "page.tsx");
    assert.ok(existsSync(path), path);
    const source = readFileSync(path, "utf8");
    assert.match(source, /^export const dynamicParams = true;$/m);
    assert.match(source, /^export const revalidate = false;$/m);
    assert.match(source, new RegExp(`spainDayStaticParams\\("${locale}"\\)`));
    assert.match(source, new RegExp(`resolveSpainDay\\("${locale}", locale, fecha\\)`));
    assert.match(source, new RegExp(`spainDayMetadata\\(iso, "${locale}"\\)`));
    assert.match(source, new RegExp(`<SpainDayRoute iso=\\{iso\\} locale="${locale}" />`));
    assert.match(source, /notFound\(\)/);
  }
});

test("hreflang: every edition lists the three, in metadata and in the language switcher", () => {
  for (const iso of DAY_PAGES) {
    const t = spainDayTranslations(iso);
    assert.deepEqual(t, { ca: spainDayPath(iso, "ca"), es: spainDayPath(iso, "es"), en: spainDayPath(iso, "en") });
  }
  assert.match(COMPONENT, /buildMetadata\(\{ locale, path: spainDayPath\(iso, locale\), [^}]*translations: spainDayTranslations\(iso\) \}\)/);
  assert.match(COMPONENT, /<SiteHeader locale=\{locale\} translations=\{spainDayTranslations\(iso\)\} \/>/);
  assert.match(COMPONENT, /<SiteFooter locale=\{locale\} \/>/);
});

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

test("every holiday name a page prints has a Catalan and an English name; every national day a title name", () => {
  const printed = new Set<string>();
  for (const iso of DAY_PAGES) {
    const d = day(iso);
    for (const h of d.holders) printed.add(h.name);
    for (const i of d.islands) printed.add(i.name);
    for (const t of d.moved?.to ?? []) printed.add(t.name);
  }
  for (const name of printed) {
    const n = HOLIDAY_NAMES[name];
    assert.ok(n, `no translation for «${name}»`);
    assert.ok(n.ca && n.en, name);
  }
  for (const iso of COMMON_DATES) {
    const name = day(iso).holders[0]!.name;
    assert.ok(HOLIDAY_NAMES[name]?.title, name);
  }
});

test("the first line answers in the page's language: the weekday, the date and where", () => {
  assert.equal(
    dayLeadIntl(day("2027-03-19"), "ca"),
    "Sí, el divendres 19 de març de 2027 és festiu a 5 comunitats: Galícia, la Comunitat de Madrid, la Regió de Múrcia, Navarra i la Comunitat Valenciana. A la resta d'Espanya és laborable.",
  );
  assert.equal(dayLeadIntl(day("2027-12-06"), "en"), "Yes, Monday 6 December 2027 is a public holiday across Spain: in all 17 autonomous communities and in Ceuta and Melilla.");
  assert.equal(dayLeadIntl(day("2027-10-07"), "ca"), "No, excepte al País Basc: el dijous 7 d'octubre de 2027 només és festiu allà. A la resta d'Espanya és laborable.");
  assert.match(dayLeadIntl(day("2027-08-15"), "en"), /^No: 15 August 2027, the Assumption, falls on a Sunday/);
  for (const iso of COMMON_DATES.filter((d) => sakamoto(d) === 6)) {
    assert.match(dayLeadIntl(day(iso), "ca"), /cau en dissabte/, iso);
    assert.match(dayLeadIntl(day(iso), "en"), /falls on a Saturday/, iso);
    for (const locale of INTL) assert.ok(daySectionsIntl(day(iso), locale).some((s) => s.id === "sabado"), iso);
  }
  for (const iso of DAY_PAGES) {
    assert.match(dayLeadIntl(day(iso), "ca"), /^(Sí|No)[,:] /, iso);
    assert.match(dayLeadIntl(day(iso), "en"), /^(Yes|No)[,:] /, iso);
  }
});

test("titles <= 60 with the question first, descriptions <= 165; nothing unfilled", () => {
  assert.equal(dayTitleIntl("2027-12-06", day("2027-12-06"), "ca"), "És festiu el 6 de desembre de 2027 a Espanya? Constitució");
  assert.equal(dayTitleIntl("2027-12-06", day("2027-12-06"), "en"), "Is 6 December 2027 a holiday in Spain? Constitution Day");
  assert.equal(dayTitleIntl("2027-03-19", day("2027-03-19"), "ca"), "És festiu el 19 de març 2027 a Espanya? Sí, a 5 comunitats");
  assert.equal(dayH1Intl("2027-03-25", "en"), "Is Maundy Thursday 2027 (25 March) a public holiday in Spain?");
  assert.equal(dayH1Intl("2027-03-25", "ca"), "És festiu el Dijous Sant de 2027 (25 de març) a Espanya?");
  for (const iso of DAY_PAGES) {
    const d = day(iso);
    for (const locale of INTL) {
      const title = dayTitleIntl(iso, d, locale);
      assert.ok(title.length <= TITLE_LIMIT, `${title} (${title.length})`);
      assert.match(title, locale === "ca" ? /^És festiu .*2027 a Espanya\?/ : /^Is .*2027 a (public )?holiday in Spain\?/, title);
      const description = dayDescriptionIntl(d, locale);
      assert.ok(description.length <= DESCRIPTION_LIMIT, `${iso} ${locale}: ${description.length}`);
      assert.doesNotMatch(allText(iso, locale), /undefined|null|NaN|\[object|\s{2}|\s[,.]/, `${iso} ${locale}`);
      const faq = dayFaqIntl(d, locale);
      assert.equal(faq[0]!.question, dayQuestionIntl(iso, locale));
      assert.deepEqual(
        faq.slice(1).map((f) => f.question),
        daySectionsIntl(d, locale).map((s) => s.question),
      );
    }
  }
});

test("each edition is written in its own language: no month or weekday of another, Spanish only inside the BOE's «» names", () => {
  const foreign: Record<L, RegExp> = {
    ca: /\b(enero|febrero|marzo|mayo|junio|julio|agosto|septiembre|noviembre|diciembre|lunes|martes|miércoles|jueves|viernes|sábado|domingo|festivo|comunidad|España|January|March|May|December|Monday|Friday|Saturday|Sunday|holiday)\b/,
    en: /\b(enero|marzo|agosto|diciembre|lunes|viernes|sábado|domingo|festivo|comunidad|España|gener|març|maig|agost|desembre|dilluns|divendres|dissabte|diumenge|festiu|comunitat|Espanya)\b/,
  };
  for (const iso of DAY_PAGES) {
    for (const locale of INTL) {
      const text = allText(iso, locale).replace(/«[^»]*»/g, "«»");
      assert.doesNotMatch(text, foreign[locale], `${iso} ${locale}`);
    }
  }
});

test("every weekday printed next to a day of the month is that date's (2027), in both languages", () => {
  const weekdays: Record<L, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    en: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  };
  const months: Record<L, string[]> = {
    ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
    en: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
  };
  let checked = 0;
  for (const locale of INTL) {
    const monthWord = new RegExp(`(?<![\\p{L}])(${months[locale].join("|")})(?![\\p{L}])`, "gu");
    for (const iso of DAY_PAGES) {
      const d = day(iso);
      const text = [dayLeadIntl(d, locale), ...dayNotesIntl(d, locale), dayDescriptionIntl(d, locale), ...daySectionsIntl(d, locale).filter((s) => s.id !== "en-2026").map((s) => s.answer)]
        .join(" ")
        .toLowerCase();
      for (const m of text.matchAll(new RegExp(`(${weekdays[locale].join("|")}) (\\d{1,2})(?!\\d)`, "gu"))) {
        const after = (text.slice(m.index + m[0].length).split(/[.;:?)]/)[0] ?? "").match(monthWord)?.[0];
        const before = [...text.slice(Math.max(0, m.index - 120), m.index).matchAll(monthWord)].at(-1)?.[0];
        const month = months[locale].indexOf(after ?? before ?? "");
        assert.ok(month >= 0, `${iso} ${locale}: no month for "${m[0]}"`);
        const date = `2027-${String(month + 1).padStart(2, "0")}-${m[2]!.padStart(2, "0")}`;
        assert.equal(weekdays[locale][sakamoto(date)], m[1], `${iso} ${locale}: "${m[0]}" read as ${date}`);
        checked += 1;
      }
    }
  }
  assert.ok(checked > 200, `only ${checked} checked`);
});

/* -------------------------------------------------------------------------- */
/* Links                                                                      */
/* -------------------------------------------------------------------------- */

test("same-language links: territories link only in Spanish, every other href is built for the page's locale", () => {
  // The community pages are Spanish only: Catalan and English name the territory without a link.
  assert.match(COMPONENT, /return locale === "es" \? <Link href=\{communityPath\(names\(r\)\)\}>\{label\}<\/Link> : <>\{label\}<\/>;/);
  assert.equal((COMPONENT.match(/communityPath\(/g) ?? []).length, 1, "communityPath is used in Place only");
  // No hard-coded locale prefix, and no day link without the locale.
  assert.doesNotMatch(COMPONENT, /href=\{?["'`]\/(ca|es|en)\//);
  assert.doesNotMatch(COMPONENT, /datePath\("(ca|es|en)"/);
  assert.doesNotMatch(COMPONENT, /spainDayPath\((prev|next|d|t\.date)\)/);
  assert.match(COMPONENT, /<Link href=\{datePath\(locale, iso\)\}>\{dateQuestion\(iso, locale\)\}<\/Link>/);
  assert.match(COMPONENT, /const december = b2href\("decemberBridgeSpain", locale\)/);
  assert.match(COMPONENT, /const lastLink = locale === "es" \? spainHubPath\(\) : hubPath\(locale\)/);
  // Spanish-only targets (the bridges page) are behind the Spanish check.
  assert.match(COMPONENT, /\{locale === "es" \? \(\s*<>\s*\{" · "\}\s*<Link href=\{spainBridgesPath\(\)\}>/);
  // The targets exist in each language.
  for (const locale of INTL) {
    assert.ok(B2_PATHS.decemberBridgeSpain[locale], locale);
    assert.equal(hubPath(locale), locale === "ca" ? "/ca/festius/" : "/en/holidays/");
    for (const iso of DAY_PAGES.filter((d) => DATE_PAGES.includes(d))) assert.ok(datePath(locale, iso).startsWith(`/${locale}/`));
  }
});

test("links in: the Catalan date pages ask 'and in the rest of Spain?' in each language and link the same-language edition", () => {
  const catalan = readFileSync(join(ROOT, "src/components/programmatic/holidays/DatePage.tsx"), "utf8");
  assert.match(catalan, /ca: "I a la resta d'Espanya\?"/);
  assert.match(catalan, /en: "And in the rest of Spain\?"/);
  assert.match(catalan, /<Link href=\{spainDayPath\(iso, locale\)\}>/);
  assert.equal(restOfSpainLabelIntl("2027-03-19", "ca"), "On és festiu el 19 de març de 2027 a Espanya, comunitat per comunitat");
  assert.equal(restOfSpainLabelIntl("2027-12-06", "en"), "Where 6 December 2027 is a public holiday in Spain, region by region");
});
