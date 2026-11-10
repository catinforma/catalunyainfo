import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { BOE_2027_ROWS, REGIONS } = await import("../src/lib/programmatic/holidays/boe-2027.ts");
const { BOE_2026 } = await import("../src/lib/programmatic/holidays/boe-2026.ts");
const { DATE_PAGES, datePath } = await import("../src/lib/programmatic/holidays/paths.ts");
const { COMMON_DATES, SUBSTITUTIONS } = await import("../src/lib/programmatic/spain-2027/calendar.ts");
const { COMMUNITIES, communityBySlug } = await import("../src/lib/programmatic/spain-2027/communities.ts");
const { TITLE_LIMIT, DESCRIPTION_LIMIT } = await import("../src/lib/programmatic/spain-2027/copy.ts");
const { SOURCES } = await import("../src/lib/programmatic/spain-2027/sources.ts");
const { DAY_PAGES, SPAIN_DAYS, change2026, dayRuns, hasDayPage, neighbours, spainDay, territoryDaysOff } = await import(
  "../src/lib/programmatic/spain-2027/days.ts"
);
const {
  NATIONAL_TITLE_NAME,
  dayDescription,
  dayFaq,
  dayH1,
  dayLead,
  dayNotes,
  dayQuestion,
  daySections,
  dayTitle,
  dayVerdict,
  hubDayWords,
  restOfSpainLabel,
} = await import("../src/lib/programmatic/spain-2027/day-copy.ts");
const { SPAIN_BRIDGES_SLUG, SPAIN_DAY_SLUG, resolveCommunity, resolveSpainDay, spainDayPath, spainDayPaths, spainDaySitemapEntries, spainDaySlug, spainDayStaticParams, spainDayTranslations, spainPaths } =
  await import("../src/lib/programmatic/spain-2027/paths.ts");
const { B2_PATHS } = await import("../src/lib/content/batch02/shared.ts");

type Region = (typeof REGIONS)[number];
type Day = (typeof SPAIN_DAYS)[number];

const ROOT = join(import.meta.dirname, "..");
const APP_2027 = join(ROOT, "src", "app", "(public)", "[locale]", "festivos", "2027");
const COMPONENT = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/days.tsx"), "utf8");

/** Weekday by Sakamoto's method, independent of `Date`: 0 = Sunday. */
function sakamoto(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const year = m < 3 ? y - 1 : y;
  return (year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) + t[m - 1]! + d) % 7;
}

const day = (iso: string): Day => {
  const d = spainDay(iso);
  assert.ok(d, iso);
  return d;
};

/* -------------------------------------------------------------------------- */
/* Which dates                                                                */
/* -------------------------------------------------------------------------- */

/** Every date with its territory count, as the brief's report gives it: [date, count, page]. */
const EXPECTED: [string, number, boolean][] = [
  ["2027-01-01", 19, true],
  ["2027-01-06", 19, true],
  ["2027-03-01", 2, true],
  ["2027-03-10", 2, false],
  ["2027-03-19", 5, true],
  ["2027-03-25", 17, true],
  ["2027-03-26", 19, true],
  ["2027-03-29", 6, true],
  ["2027-04-23", 2, true],
  ["2027-05-01", 19, true],
  ["2027-05-17", 3, true],
  ["2027-05-27", 1, true],
  ["2027-05-31", 1, true],
  ["2027-06-09", 2, true],
  ["2027-06-24", 1, true],
  ["2027-07-28", 1, true],
  ["2027-08-05", 1, false],
  ["2027-08-15", 0, true],
  ["2027-08-16", 6, true],
  ["2027-09-02", 1, false],
  ["2027-09-08", 3, true],
  ["2027-09-11", 1, false],
  ["2027-09-15", 1, true],
  ["2027-09-17", 1, false],
  ["2027-10-07", 1, true],
  ["2027-10-09", 1, false],
  ["2027-10-11", 1, true],
  ["2027-10-12", 19, true],
  ["2027-11-01", 19, true],
  ["2027-12-03", 1, true],
  ["2027-12-06", 19, true],
  ["2027-12-08", 19, true],
  ["2027-12-25", 19, true],
];

test("dates: every BOE date, the local days a whole territory shares and 15 August; 27 pages, 6 folded into the hub", () => {
  assert.deepEqual(
    SPAIN_DAYS.map((d) => [d.date, d.regions.length, d.page]),
    EXPECTED,
  );
  // Every BOE row's date is there, with every column it marks.
  for (const row of BOE_2027_ROWS) {
    const d = day(row.date);
    for (const r of Object.keys(row.marks) as Region[]) assert.ok(d.holders.some((h) => h.region === r && h.basis === "boe" && h.name === row.name), `${row.date} ${r}`);
  }
  // A local holder is a local day of that territory's own text, and never doubles a BOE column.
  for (const d of SPAIN_DAYS) {
    assert.equal(new Set(d.regions).size, d.regions.length, d.date);
    for (const h of d.holders.filter((x) => x.basis === "local")) {
      assert.ok(SOURCES[h.region].local.days?.some((x) => x.date === d.date && x.name === h.name), `${d.date} ${h.region}`);
      assert.ok(h.source && h.source.url.startsWith("https://"), `${d.date} ${h.region}: no source`);
      assert.ok(!BOE_2027_ROWS.some((row) => row.date === d.date && row.marks[h.region]), `${d.date} ${h.region}`);
    }
  }
  assert.deepEqual(day("2027-12-03").holders.map((h) => [h.region, h.basis]), [["NC", "local"]]);
  assert.deepEqual(day("2027-09-08").regions, ["AS", "EX", "ML"]);
  assert.equal(DAY_PAGES.length, 27);
  assert.deepEqual(
    SPAIN_DAYS.filter((d) => !d.page).map((d) => d.date),
    ["2027-03-10", "2027-08-05", "2027-09-02", "2027-09-11", "2027-09-17", "2027-10-09"],
  );
});

test("no thin pages: a folded date is only Ceuta and/or Melilla, or one community on a Saturday; a page has more to say", () => {
  for (const d of SPAIN_DAYS) {
    const communities = d.regions.filter((r) => r !== "CE" && r !== "ML");
    const weekend = sakamoto(d.date) === 0 || sakamoto(d.date) === 6;
    if (!d.page) {
      assert.ok(communities.length === 0 || (d.regions.length === 1 && weekend), d.date);
      // Folded, not lost: the hub lists it, with where.
      assert.ok(hubDayWords(d).length > 5, d.date);
      continue;
    }
    assert.ok(d.national || d.moved || communities.length > 0, d.date);
    const sections = daySections(d);
    assert.ok(sections.length >= 3, `${d.date}: ${sections.length} sections`);
    for (const s of sections) assert.ok(s.answer.length > 20, `${d.date} ${s.id}`);
  }
});

test("national days: every one has a page saying 'toda España'; a Sunday one is flagged with where it moved; Saturdays say so", () => {
  for (const iso of COMMON_DATES) {
    const d = day(iso);
    assert.ok(d.page && d.national, iso);
    assert.match(dayLead(d), /^Sí, el .* es festivo en toda España/, iso);
    assert.notEqual(sakamoto(iso), 0, `${iso}: a national day on a Sunday must be a moved page`);
    if (sakamoto(iso) === 6) {
      assert.match(dayLead(d), /cae en sábado/, iso);
      assert.ok(daySections(d).some((s) => s.id === "sabado"), iso);
    }
  }
  assert.deepEqual(COMMON_DATES.filter((iso) => sakamoto(iso) === 6), ["2027-05-01", "2027-12-25"]);
  // 15 August: a Sunday, no BOE row, two substitution rows.
  const aug15 = day("2027-08-15");
  assert.equal(sakamoto("2027-08-15"), 0);
  assert.ok(!BOE_2027_ROWS.some((r) => r.date === "2027-08-15"));
  assert.deepEqual(
    aug15.moved?.to.map((t) => [t.date, t.regions]),
    [
      ["2027-08-16", ["AN", "AR", "AS", "CN", "CL", "MD"]],
      ["2027-10-11", ["EX"]],
    ],
  );
  for (const t of aug15.moved!.to) assert.equal(SUBSTITUTIONS[t.name]?.replaces, "2027-08-15");
  assert.match(dayLead(aug15), /^No: el 15 de agosto de 2027, la Asunción de la Virgen, cae en domingo/);
  assert.match(dayLead(aug15), /6 comunidades lo pasan al lunes 16 de agosto .*Extremadura, al lunes 11 de octubre/);
  assert.equal(dayVerdict(aug15), "Cae en domingo");
  // The days that stand in for it say so.
  for (const iso of ["2027-08-16", "2027-10-11"]) assert.ok(dayNotes(day(iso)).some((n) => n.includes("domingo 15 de agosto")), iso);
});

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

test("the first line answers: Sí/No, the weekday and date, and where", () => {
  assert.equal(
    dayLead(day("2027-03-19")),
    "Sí, el viernes 19 de marzo de 2027 es festivo en 5 comunidades: Galicia, la Comunidad de Madrid, la Región de Murcia, la Comunidad Foral de Navarra y la Comunitat Valenciana. En el resto de España es laborable.",
  );
  assert.equal(dayLead(day("2027-03-25")), "Sí, el jueves 25 de marzo de 2027 es festivo en toda España salvo en Cataluña y la Comunitat Valenciana: en 15 comunidades y en Ceuta y Melilla.");
  assert.equal(dayLead(day("2027-10-11")), "No, salvo en Extremadura: el lunes 11 de octubre de 2027 solo es festivo allí. En el resto de España es laborable.");
  assert.match(dayLead(day("2027-12-03")), /^No, salvo en la Comunidad Foral de Navarra: el viernes 3 de diciembre de 2027 es fiesta local en todos sus municipios\./);
  assert.match(dayLead(day("2027-09-08")), /en 2 comunidades \(el Principado de Asturias y Extremadura\) y en Melilla\./);
  for (const iso of DAY_PAGES) {
    const lead = dayLead(day(iso));
    assert.match(lead, /^(Sí|No)[,:] /, iso);
    if (iso !== "2027-08-15") assert.ok(lead.includes(`${["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][sakamoto(iso)]} ${Number(iso.slice(8))} de `), iso);
  }
});

test("titles: the question, then the count for split days or the day's name; <= 60; descriptions <= 165", () => {
  const titles = Object.fromEntries(DAY_PAGES.map((iso) => [iso, dayTitle(iso, day(iso))]));
  assert.equal(titles["2027-03-19"], "¿Es festivo el 19 de marzo de 2027? Sí, en 5 comunidades");
  assert.equal(titles["2027-03-25"], "¿Es festivo el Jueves Santo 2027? Sí, salvo en 2 comunidades");
  assert.equal(titles["2027-03-29"], "¿Es festivo el Lunes de Pascua de 2027? Sí, en 6 comunidades");
  assert.equal(titles["2027-08-16"], "¿Es festivo el 16 de agosto de 2027? Sí, en 6 comunidades");
  assert.equal(titles["2027-08-15"], "¿Es festivo el 15 de agosto de 2027? Dónde pasa al lunes");
  assert.equal(titles["2027-10-11"], "¿Es festivo el 11 de octubre de 2027? Solo en una comunidad");
  assert.equal(titles["2027-03-26"], "¿Es festivo el 26 de marzo de 2027? Viernes Santo");
  assert.equal(titles["2027-01-06"], "¿Es festivo el 6 de enero de 2027? Reyes");
  for (const [iso, title] of Object.entries(titles)) {
    assert.ok(title.length <= TITLE_LIMIT, `${title} (${title.length})`);
    assert.match(title, /^¿Es festivo el .*2027\? \S/, iso);
    const description = dayDescription(day(iso));
    assert.ok(description.length <= DESCRIPTION_LIMIT, `${iso}: ${description.length}`);
    assert.match(description, /^(Sí|No)[,:] /, iso);
  }
  // Every national row has its everyday title name, and nothing else is in the list.
  const nationalNames = [...new Set(BOE_2027_ROWS.filter((r) => COMMON_DATES.includes(r.date)).map((r) => r.name))].sort();
  assert.deepEqual(Object.keys(NATIONAL_TITLE_NAME).sort(), nationalNames);
  for (const iso of COMMON_DATES) assert.ok(titles[iso]!.endsWith(` ${NATIONAL_TITLE_NAME[day(iso).holders[0]!.name]}`), iso);
  // H1s: the question, with the date for the Easter feasts.
  assert.equal(dayH1("2027-03-25"), "¿Es festivo el Jueves Santo de 2027 (25 de marzo)?");
  assert.equal(dayH1("2027-03-19"), "¿Es festivo el 19 de marzo de 2027?");
});

test("every weekday printed next to a day of the month is that date's (2027)", () => {
  const weekdays = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  let checked = 0;
  for (const iso of DAY_PAGES) {
    const d = day(iso);
    // The 2026 comparison names 2026 dates: checked below on its own.
    const text = [dayLead(d), ...dayNotes(d), dayDescription(d), ...daySections(d).filter((s) => s.id !== "en-2026").map((s) => s.answer)].join(" ").toLowerCase();
    const monthWord = new RegExp(`\\b(${months.join("|")})\\b`, "g");
    for (const m of text.matchAll(new RegExp(`(${weekdays.join("|")}) (\\d{1,2})(?!\\d)`, "gu"))) {
      // The month is the next one in the clause ("del viernes 19 al domingo 21 de marzo"),
      // else the last one before it ("del 1 al 6 de enero: … pidiendo el lunes 4 y el martes 5").
      const after = (text.slice(m.index + m[0].length).split(/[.;:?)]/)[0] ?? "").match(monthWord)?.[0];
      const before = [...text.slice(Math.max(0, m.index - 120), m.index).matchAll(monthWord)].at(-1)?.[0];
      const month = months.indexOf(after ?? before ?? "");
      assert.ok(month >= 0, `${iso}: no month for "${m[0]}"`);
      const date = `2027-${String(month + 1).padStart(2, "0")}-${m[2]!.padStart(2, "0")}`;
      assert.equal(weekdays[sakamoto(date)], m[1], `${iso}: "${m[0]}" read as ${date}`);
      checked += 1;
    }
  }
  assert.ok(checked > 120, `only ${checked} checked`);
});

/* -------------------------------------------------------------------------- */
/* Long weekends and last year                                                */
/* -------------------------------------------------------------------------- */

test("bridges: computed per territory with its own days off; the leave is always a working day there", () => {
  const runs = (iso: string) => dayRuns(day(iso)).map((g) => [g.run.from, g.run.to, g.run.take, g.regions]);
  assert.deepEqual(runs("2027-03-19"), [["2027-03-19", "2027-03-21", [], ["GA", "MD", "MC", "NC", "VC"]]]);
  assert.deepEqual(runs("2027-10-12"), [
    ["2027-10-09", "2027-10-12", ["2027-10-11"], REGIONS.filter((r) => r !== "EX")],
    ["2027-10-09", "2027-10-12", [], ["EX"]],
  ]);
  // Navarra's 3 December (local, all its towns) makes a four-day weekend there, and six days with Tuesday 7.
  assert.deepEqual(runs("2027-12-03"), [
    ["2027-12-03", "2027-12-06", [], ["NC"]],
    ["2027-12-03", "2027-12-08", ["2027-12-07"], ["NC"]],
  ]);
  assert.deepEqual(runs("2027-05-01"), []);
  assert.deepEqual(runs("2027-08-15"), [
    ["2027-08-14", "2027-08-16", [], ["AN", "AR", "AS", "CN", "CL", "MD"]],
    ["2027-10-09", "2027-10-12", [], ["EX"]],
  ]);
  for (const iso of DAY_PAGES) {
    const d = day(iso);
    const anchors = d.moved ? d.moved.to.map((t) => t.date) : [iso];
    for (const g of dayRuns(d)) {
      assert.ok(anchors.some((a) => g.run.from <= a && a <= g.run.to), `${iso}: ${g.run.from}-${g.run.to}`);
      for (const r of g.regions) {
        const off = territoryDaysOff(r);
        for (const t of g.run.take) assert.ok(sakamoto(t) !== 0 && sakamoto(t) !== 6 && !off.includes(t), `${iso} ${r}: leave on ${t}`);
      }
    }
  }
});

test("2026: only where the same day's table differs, from BOE-A-2025-21667", () => {
  const changed = SPAIN_DAYS.filter((d) => d.page && change2026(d)).map((d) => [d.date, change2026(d)!.gained, change2026(d)!.lost]);
  assert.deepEqual(changed, [
    ["2027-03-19", ["MD"], ["PV"]],
    ["2027-03-29", [], ["CM"]],
    ["2027-06-24", [], ["GA", "VC"]],
  ]);
  const line = daySections(day("2027-06-24")).find((s) => s.id === "en-2026")!.answer;
  assert.match(line, /^En 2026, el 24 de junio fue festivo en Cataluña, Galicia y la Comunitat Valenciana/);
  assert.ok(line.includes(BOE_2026.ref.split(",")[0]!));
  assert.match(daySections(day("2027-03-29")).find((s) => s.id === "en-2026")!.answer, /el Lunes de Pascua \(lunes 6 de abril\)/);
  assert.equal(sakamoto("2026-04-06"), 1);
});

/* -------------------------------------------------------------------------- */
/* Structured data and links                                                  */
/* -------------------------------------------------------------------------- */

test("FAQPage: the H1's question and each section's, as printed; nothing unfilled", () => {
  for (const iso of DAY_PAGES) {
    const d = day(iso);
    const faq = dayFaq(d);
    assert.equal(faq[0]!.question, dayQuestion(iso));
    assert.ok(faq[0]!.answer.startsWith(dayLead(d)));
    assert.deepEqual(
      faq.slice(1).map((f) => f.question),
      daySections(d).map((s) => s.question),
    );
    const all = [dayTitle(iso, d), dayDescription(d), dayH1(iso), dayVerdict(d), ...faq.flatMap((f) => [f.question, f.answer])].join(" ");
    assert.doesNotMatch(all, /undefined|null|NaN|\[object|\s{2}|\s[,.]/, iso);
  }
  assert.match(COMPONENT, /faqSchema\(\[\{ type: "faq", items: w\.faq\(day\) \}\]\)/);
  assert.match(COMPONENT, /const ES_WORDS: DayWords = \{[^}]*faq: dayFaq,/);
  assert.match(COMPONENT, /breadcrumbSchema\(dayCrumbs\(iso, locale\)\)/);
});

test("prev and next: every page links its neighbours; 6 January sends December 2026 to the Spain bridge guide", () => {
  for (const [i, iso] of DAY_PAGES.entries()) {
    const { prev, next } = neighbours(iso);
    assert.equal(prev, DAY_PAGES[i - 1] ?? null, iso);
    assert.equal(next, DAY_PAGES[i + 1] ?? null, iso);
  }
  assert.equal(neighbours("2027-01-01").prev, null);
  assert.equal(neighbours("2027-12-25").next, null);
  assert.equal(B2_PATHS.decemberBridgeSpain.es, "guias/puente-diciembre-espana");
  assert.match(COMPONENT, /const december = b2href\("decemberBridgeSpain", locale\)/);
  assert.match(COMPONENT, /iso === "2027-01-06" \? \(/);
  // Before 1 January the chain goes to the December guide; after 25 December, to the hub.
  assert.match(COMPONENT, /prev \? <Link href=\{spainDayPath\(prev, locale\)\}>.*: <Link href=\{december\}>/);
  // No page for December 2026: the guide has it.
  assert.ok(DAY_PAGES.every((iso) => iso.startsWith("2027-")));
});

test("every territory is linked from the 'where' lists, Spanish pages only", () => {
  assert.match(COMPONENT, /communityPath\(names\(r\)\)/);
  assert.doesNotMatch(COMPONENT, /href=\{?["'`]\/(ca|en)\//);
  assert.doesNotMatch(COMPONENT, /datePath\("(ca|en)"/);
  for (const iso of DAY_PAGES) {
    const d = day(iso);
    if (d.moved || d.national) continue;
    const holders = d.holders.map((h) => h.region);
    const working = REGIONS.filter((r) => !holders.includes(r));
    assert.equal(holders.length + working.length, 19, iso);
  }
});

/* -------------------------------------------------------------------------- */
/* URLs, routes, sitemap, publish                                             */
/* -------------------------------------------------------------------------- */

test("URLs: /es/festivos/2027/dia/<d>-<mes>/, no collision with [comunidad], puentes or the city pages", () => {
  assert.equal(spainDayPath("2027-03-19"), "/es/festivos/2027/dia/19-marzo/");
  assert.equal(spainDayPath("2027-01-01"), "/es/festivos/2027/dia/1-enero/");
  assert.equal(spainDayPath("2027-09-08"), "/es/festivos/2027/dia/8-septiembre/");
  const slugs = DAY_PAGES.map((iso) => spainDaySlug(iso));
  assert.equal(new Set(slugs).size, DAY_PAGES.length);
  for (const s of slugs) assert.match(s, /^\d{1,2}-(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)$/, s);
  for (const iso of DAY_PAGES) assert.equal(resolveSpainDay("es", "es", spainDaySlug(iso)), iso);
  assert.equal(resolveSpainDay("es", "ca", "19-marzo"), null);
  assert.equal(resolveSpainDay("es", "en", "19-marzo"), null);
  assert.equal(resolveSpainDay("es", "es", "10-marzo"), null, "folded dates have no page");
  assert.equal(resolveSpainDay("es", "es", "19-marzo-2027"), null);
  assert.deepEqual(spainDayStaticParams("es").map((p) => p.fecha), slugs);
  assert.ok(spainDayStaticParams("es").every((p) => p.locale === "es"));
  // `dia` is a static folder beside `[comunidad]` and `puentes`: no community may take that slug.
  assert.equal(SPAIN_DAY_SLUG, "dia");
  assert.notEqual(SPAIN_DAY_SLUG, SPAIN_BRIDGES_SLUG);
  assert.ok(!COMMUNITIES.some((c) => c.slug === SPAIN_DAY_SLUG || c.slug === SPAIN_BRIDGES_SLUG));
  assert.equal(communityBySlug("dia"), null);
  assert.equal(resolveCommunity("es", "dia"), null);
  const folders = readdirSync(APP_2027).sort();
  assert.ok(folders.includes("dia") && folders.includes("puentes") && folders.includes("[comunidad]"), folders.join());
  // Only one dynamic segment at this level: a static `dia` always wins over it.
  assert.deepEqual(
    folders.filter((f) => f.startsWith("[")),
    ["[comunidad]"],
  );
  assert.deepEqual(readdirSync(join(APP_2027, "dia")), ["[fecha]"]);
});

test("route: revalidated by the publish group, so dynamicParams = true; notFound() for the rest", () => {
  const path = join(APP_2027, "dia", "[fecha]", "page.tsx");
  assert.ok(existsSync(path));
  const source = readFileSync(path, "utf8");
  assert.match(source, /^export const dynamicParams = true;$/m);
  assert.doesNotMatch(source, /^export const dynamicParams = false/m);
  assert.match(source, /^export const revalidate = false;$/m);
  assert.match(source, /notFound\(\)/);
  assert.match(source, /generateStaticParams/);
  assert.match(source, /resolveSpainDay\("es", locale, fecha\)/);
});

test("sitemap and publish: three editions per date, hreflang across them, and calendario-2027-espana revalidates them", () => {
  const paths = spainDayPaths();
  assert.equal(paths.length, 3 * DAY_PAGES.length);
  assert.equal(new Set(paths).size, paths.length);
  // The Spanish-only family list stays as it was: the day pages have their own entries.
  for (const p of paths) assert.ok(!spainPaths().includes(p), p);
  const entries = spainDaySitemapEntries();
  assert.equal(entries.length, paths.length);
  for (const iso of DAY_PAGES) {
    const t = spainDayTranslations(iso);
    for (const locale of ["ca", "es", "en"] as const) {
      const entry = entries.find((e) => e.url === `https://www.catalunyainfo.com${t[locale]}`);
      assert.ok(entry, `${iso} ${locale}`);
      assert.deepEqual(entry.alternates?.languages, {
        ca: `https://www.catalunyainfo.com${t.ca}`,
        es: `https://www.catalunyainfo.com${t.es}`,
        en: `https://www.catalunyainfo.com${t.en}`,
        "x-default": `https://www.catalunyainfo.com${t.en}`,
      });
    }
  }
  const sitemap = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8");
  assert.match(sitemap, /\.\.\.spainDaySitemapEntries\(\)/);
  const publish = readFileSync(join(ROOT, "src/app/api/admin/publish/route.ts"), "utf8");
  assert.match(publish, /wants\("calendario-2027-espana"\) \? \[\.\.\.spainPaths\(\), \.\.\.spainDayPaths\(\)\] : \[\]/);
});

test("links in: the hub lists every date, the community tables link theirs, and the Catalan date pages ask '¿Y en el resto de España?' in each language", () => {
  const pages = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/pages.tsx"), "utf8");
  assert.match(pages, /<SpainDayIndex \/>/);
  assert.match(pages, /<DayDateLink iso=\{d\.date\}>/);
  assert.match(COMPONENT, /SPAIN_DAYS\.map\(\(d\) =>/);
  const catalan = readFileSync(join(ROOT, "src/components/programmatic/holidays/DatePage.tsx"), "utf8");
  assert.match(catalan, /\{hasDayPage\(iso\) \? \(/);
  assert.match(catalan, /<Link href=\{spainDayPath\(iso, locale\)\}>\{locale === "es" \? restOfSpainLabel\(iso\) : restOfSpainLabelIntl\(iso, locale\)\}<\/Link>/);
  assert.match(catalan, /es: "¿Y en el resto de España\?"/);
  // The Catalan date pages that get the line: the ones with a Spain day page. 11 September is folded: no line.
  const linked = DATE_PAGES.filter((iso) => hasDayPage(iso));
  assert.deepEqual(linked, [
    "2027-01-01",
    "2027-01-06",
    "2027-03-19",
    "2027-03-25",
    "2027-03-26",
    "2027-03-29",
    "2027-04-23",
    "2027-05-01",
    "2027-05-17",
    "2027-06-24",
    "2027-08-15",
    "2027-10-12",
    "2027-11-01",
    "2027-12-06",
    "2027-12-08",
    "2027-12-25",
  ]);
  assert.ok(DATE_PAGES.includes("2027-09-11") && !hasDayPage("2027-09-11"));
  assert.equal(restOfSpainLabel("2027-03-19"), "Dónde es festivo el 19 de marzo de 2027, comunidad por comunidad");
  // And back: the Spain page links the Catalan page (Spanish edition) where it exists.
  assert.match(COMPONENT, /isDatePage\(iso\) \? \(/);
  assert.match(COMPONENT, /<Link href=\{datePath\(locale, iso\)\}>/);
  assert.equal(datePath("es", "2027-03-19"), "/es/festivos/dia/19-marzo-2027/");
});
