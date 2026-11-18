import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { CALCULATOR_NEXT } from "../src/lib/engagement/next-step-calculators.ts";
import { CHECKER_COPY, COMMUNITY_IDS, COMMUNITY_LABEL, GRAN_LABEL, ZT_LOCALES, matchTowns, townAnswer, ztEditions } from "../src/lib/programmatic/zona-tensionada/copy.ts";
import { DATA, checkerContext, checkerTown, checkerTowns, counts, expiries, listByCommunity } from "../src/lib/programmatic/zona-tensionada/data.ts";
import { ztFaq, ztMeta, ztSitemapEntries } from "../src/lib/programmatic/zona-tensionada/page.ts";
import { QUOTE, RECHECK_BY, RULES_AS_OF, RULES_UNTIL, SOURCES, UPDATE_RULE } from "../src/lib/programmatic/zona-tensionada/rules.ts";

/**
 * "¿Está mi municipio en zona tensionada?" (lib/programmatic/zona-tensionada/):
 * the declarations file against the counts the acts themselves state, the
 * Ministry's dates, the INE register, the checker's answers, the page, and the
 * two date guards (RECHECK_BY, and 14 days before each zone's last day).
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const ctx = checkerContext();

/* ------------------------------------------------------------ date guards */

test(`date guard: re-check the BOE lists and the DOGC by ${RECHECK_BY}`, () => {
  assert.ok(RULES_AS_OF <= today());
  assert.ok(
    today() < RECHECK_BY,
    "Zonas tensionadas: run `node --experimental-strip-types scripts/zonas-tensionadas-snapshot.ts check`. The Ministry's list for the 4th quarter of 2026 will list the 53 towns of TER/3740/2026 (then the limits apply from the next day) and date the extension of the 118 towns of TER/3739/2026; other regions may have declared zones. Rebuild, re-read Ley 12/2023 and LAU (consolidated), update rules.ts and the page's words, then move RULES_AS_OF and RECHECK_BY.",
  );
  assert.ok(today() < RULES_UNTIL, "RDL 29/2026 DF 6ª (yearly updates) ends on 31 Dec 2027: re-read the rules.");
});

for (const e of expiries()) {
  test(`date guard: zone ${e.decl} (${e.towns} rows) ends on ${e.until}; re-check 14 days before`, () => {
    assert.ok(
      today() < addDays(e.until, -14),
      `${e.decl} ends on ${e.until}. Search the BOE for the Ministry's list that extends it (Ley 12/2023 art. 18.2.d allows yearly extensions) and the region's bulletin; rebuild declarations.json; the towns not extended leave the list.`,
    );
  });
}

/* --------------------------------------------------------------- the data */

test("data: the BOE ids in the header are the lists read; each zone runs from the day after its list for three years", () => {
  assert.deepEqual(DATA.boeIds, DATA.resolutions.map((r) => r.boe));
  assert.equal(DATA.boeIds.length, 10);
  for (const r of DATA.resolutions) {
    assert.match(r.boe, /^BOE-A-\d{4}-\d+$/);
    assert.equal(r.from, addDays(r.published, 1), r.boe);
    assert.equal(r.until, `${Number(r.from.slice(0, 4)) + 3}${r.from.slice(4)}`, r.boe);
    assert.ok(r.url.startsWith("https://www.boe.es/"), r.boe);
  }
  // The Ministry's page: "Desde el 16 de marzo de 2024 hasta el 16 de marzo de 2027" (first list), "Desde el 4 de noviembre de 2026 hasta el 4 de noviembre de 2029" (latest).
  assert.deepEqual([DATA.resolutions[0]!.from, DATA.resolutions[0]!.until], ["2024-03-16", "2027-03-16"]);
  assert.deepEqual([DATA.resolutions.at(-1)!.from, DATA.resolutions.at(-1)!.until], ["2026-11-04", "2029-11-04"]);
  for (const d of DATA.declarations) if (d.boe) assert.ok(DATA.boeIds.includes(d.boe), d.id);
});

test("data: the counts each act states (140, 131, 118 + 22, 53) and the other regions' lists", () => {
  const rows = (decl: string) => DATA.entries.filter((e) => e.declaration === decl);
  const first = DATA.declarations.find((d) => d.act.includes("TER/800/2024"))!;
  const second = DATA.declarations.find((d) => d.act.includes("TER/2408/2024"))!;
  assert.equal(rows(first.id).length, 140);
  assert.equal(rows(second.id).length, 131);
  assert.equal(rows(first.id).filter((e) => e.extension === "extended").length, 118);
  assert.equal(rows(first.id).filter((e) => e.extension === "not-extended").length, 22);
  assert.equal(rows("TER/3740/2026").length, 53);
  const c = counts();
  assert.deepEqual(c.catalonia, { listed: 271, pending: 53, towns: 271 });
  assert.equal(c["basque-country"].listed, 21);
  assert.equal(c.navarre.listed, 21);
  assert.equal(c.galicia.listed, 2);
  assert.deepEqual(c.asturias, { listed: 6, pending: 0, towns: 5 });
  assert.equal(DATA.extension.of, first.id);
  assert.equal(DATA.extension.number, "TER/3739/2026");
  assert.equal(DATA.pending.declaration, "TER/3740/2026");
});

test("data: every row has an INE code of the 2026 register in its region; no town twice in one declaration; 947 Catalan towns", () => {
  const ine = new Map(
    read("scripts/data/ine-municipios-2026.tsv")
      .split("\n")
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => l.split("\t") as [string, string]),
  );
  const provinces: Record<string, string[]> = { catalonia: ["08", "17", "25", "43"], "basque-country": ["01", "20", "48"], navarre: ["31"], galicia: ["15", "27", "32", "36"], asturias: ["33"] };
  for (const e of DATA.entries) {
    assert.ok(ine.has(e.ine), `${e.name} ${e.ine}`);
    assert.ok(provinces[e.community]!.includes(e.ine.slice(0, 2)), `${e.name} ${e.ine}`);
  }
  const keys = DATA.entries.map((e) => `${e.declaration}|${e.ine}`);
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(DATA.register.catalonia.length, 947);
  // Names that the BOE prints oddly: "Manresa el Masnou" (no comma) is two towns; "Castell d'Aro, Platja d'Aro i S'Agaró" is one.
  assert.ok(DATA.entries.some((e) => e.ine === "08113") && DATA.entries.some((e) => e.ine === "08118"));
  assert.ok(DATA.entries.some((e) => e.ine === "17048" && e.name === "Castell d'Aro, Platja d'Aro i S'Agaró"));
});

test("data: large-landlord rule per declaration, as the BOE lists word it", () => {
  const rule = (ine: string) => ctx.decls[DATA.entries.find((e) => e.ine === ine)!.declaration]!.rule;
  assert.equal(rule("08019"), "five-or-more"); // Barcelona (TER/800/2024)
  assert.equal(rule("31201"), "five-or-more"); // Pamplona/Iruña
  assert.equal(rule("48020"), "general"); // Bilbao
  assert.equal(rule("20027"), "general"); // Zestoa
  assert.equal(rule("20064"), "more-than-five"); // Pasaia
  assert.equal(rule("15030"), "general"); // A Coruña
  assert.equal(rule("15078"), "five-or-more"); // Santiago de Compostela
  assert.equal(rule("33024"), "general"); // Gijón
  assert.equal(rule("08114"), "five-or-more"); // Martorell (TER/3740/2026)
  for (const d of DATA.declarations) assert.ok(d.neverRented.applies, `${d.id}: LAU 17.7 second paragraph`);
});

/* ------------------------------------------------------------- the rules */

test("rules: quotes are whole extracts; sources are official https pages", () => {
  for (const [k, q] of Object.entries(QUOTE)) {
    assert.ok(q.length > 40, k);
    assert.doesNotMatch(q, /\[…\]|\.\.\./, k);
  }
  for (const s of Object.values(SOURCES)) assert.match(s.url, /^https:\/\/(www\.boe\.es|www\.mivau\.gob\.es|serpavi\.mivau\.gob\.es|habitatge\.gencat\.cat)\//, s.name);
  assert.equal(SOURCES.rdl29.ref, "BOE-A-2026-20823");
  assert.equal(SOURCES.rdl29Valid.ref, "BOE-A-2026-23755");
  assert.equal(SOURCES.index.ref, "BOE-A-2024-5213");
  assert.ok(QUOTE.granTenedor.includes("más de diez") && QUOTE.granTenedor.includes("cinco o más"));
  assert.ok(QUOTE.updateTwoPercent.includes("dos por ciento"));
  assert.deepEqual(UPDATE_RULE, { from: "2026-10-08", until: "2027-12-31" });
});

/* ----------------------------------------------------------- the checker */

test("checker: Barcelona yes and extended; Lleida yes, not extended, ends 16 Mar 2027; Martorell pending; Abella de la Conca no", () => {
  const bcn = townAnswer(checkerTown("08019"), ctx, "es");
  assert.equal(bcn.verdict, "yes");
  assert.ok(bcn.lines.some((l) => l.includes("16 de marzo de 2024") && l.includes("16 de marzo de 2027") && l.includes("BOE-A-2024-5214")));
  assert.ok(bcn.lines.some((l) => l.includes("TER/3739/2026") && l.includes("prorrogó")));
  assert.equal(bcn.changes.length, 5);

  const lleida = townAnswer(checkerTown("25120"), ctx, "es");
  assert.equal(lleida.verdict, "yes");
  assert.ok(lleida.lines.some((l) => l.includes("no la ha prorrogado") && l.includes("16 de marzo de 2027")));

  const martorell = townAnswer(checkerTown("08114"), ctx, "es");
  assert.equal(martorell.verdict, "pending");
  assert.ok(martorell.lines[0]!.includes("TER/3740/2026") && martorell.lines[0]!.includes("19 de octubre de 2026"));
  assert.match(martorell.changesTitle!, /BOE/);

  const no = townAnswer(checkerTown("25001"), ctx, "es");
  assert.equal(no.verdict, "no");
  assert.equal(no.changes.length, 0);
  assert.equal(no.changesTitle, null);

  // Partial areas: Galdakao district 2; Llanes in two declarations.
  assert.equal(townAnswer(checkerTown("48036"), ctx, "es").verdict, "partial");
  const llanes = townAnswer(checkerTown("33036"), ctx, "es");
  assert.equal(llanes.verdict, "partial");
  assert.equal(llanes.lines.length, 2);
  for (const l of ZT_LOCALES) for (const ine of ["08019", "25120", "08114", "25001", "33036", "20064"]) assert.ok(townAnswer(checkerTown(ine), ctx, l).headline.trim(), `${ine} ${l}`);
});

test("checker: the search finds towns by any official name, with or without accents and articles", () => {
  const towns = checkerTowns();
  assert.equal(towns.filter((t) => t.community === "catalonia").length, 947);
  assert.equal(matchTowns(towns, "barcelona")[0]!.ine, "08019");
  assert.equal(matchTowns(towns, "Hospitalet")[0]!.ine, "08101");
  assert.equal(matchTowns(towns, "san sebastian")[0]!.ine, "20069");
  assert.equal(matchTowns(towns, "coruna")[0]!.ine, "15030");
  assert.equal(matchTowns(towns, "lleida")[0]!.ine, "25120");
  assert.deepEqual(matchTowns(towns, "Madrid"), []);
  assert.deepEqual(matchTowns(towns, "b"), []);
});

/* -------------------------------------------------------------- the page */

test("page: titles and descriptions fit the snippet and carry the counts; FAQ of eight; labels in ca, es and en", () => {
  for (const l of ZT_LOCALES) {
    const m = ztMeta(l);
    assert.ok(m.title.length <= 62, `${l} title: ${m.title.length}`);
    assert.ok(m.description.length <= 160, `${l} description: ${m.description.length} ${m.description}`);
    assert.ok(m.h1.length <= 80, `${l} h1: ${m.h1.length}`);
    assert.ok(m.description.includes("271") && m.description.includes("53"), l);
    const faq = ztFaq(l);
    assert.equal(faq.length, 8, l);
    for (const f of faq) assert.ok(f.q.trim() && f.a.length > 80, `${l}: ${f.q}`);
    assert.ok(faq.some((f) => f.a.includes("271") && f.a.includes("118") && f.a.includes("22") && f.a.includes("53")), l);
    for (const c of COMMUNITY_IDS) assert.ok(COMMUNITY_LABEL[c][l].trim(), `${c} ${l}`);
    for (const r of Object.keys(GRAN_LABEL) as (keyof typeof GRAN_LABEL)[]) assert.ok(GRAN_LABEL[r][l].trim(), `${r} ${l}`);
    assert.deepEqual(Object.keys(CHECKER_COPY[l]).sort(), Object.keys(CHECKER_COPY.es).sort(), l);
  }
  assert.deepEqual(ztEditions(), { ca: "/ca/calculadores/zona-tensionada/", es: "/es/calculadoras/zona-tensionada/", en: "/en/calculators/spain-rent-control-areas/" });
  const entries = ztSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.ztSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: ztEditions\(\)/);
  assert.deepEqual(HUB_GROUPS.find((g) => g.id === "housing")?.cards.map((c) => c.key).slice(0, 2), ["rent-update", "zona-tensionada"]);
  assert.deepEqual(CALCULATOR_NEXT["zona-tensionada"], ["rent-update", "ipc"]);
});

test("page: one static route per language, a 404 in the others, one page (no page per town), server-rendered list and YMYL pieces", () => {
  const routes = { es: "calculadoras/zona-tensionada", ca: "calculadores/zona-tensionada", en: "calculators/spain-rent-control-areas" } as const;
  for (const l of ZT_LOCALES) {
    const dir = join(ROOT, "src", "app", "(public)", "[locale]", routes[l]);
    assert.deepEqual(readdirSync(dir), ["page.tsx"], `${routes[l]}: no sub-routes`);
    const src = readFileSync(join(dir, "page.tsx"), "utf8");
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, new RegExp(`<ZonaTensionadaRoute locale="${l}" />`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /^export const revalidate = false;$/m);
  }
  const page = read("src/components/programmatic/zona-tensionada/ZonaTensionadaPage.tsx");
  assert.match(page, /<MoreCalculators current="zona-tensionada" locale=\{locale\} \/>/);
  assert.match(page, /<CalculatorNextStep current="zona-tensionada" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\)/);
  assert.match(page, /<ZonaTensionadaChecker locale=\{locale\} towns=\{towns\} ctx=\{ctx\} initial=\{INITIAL_TOWN\} \/>/);
  // The answer is in the HTML: the full list by region and the large-landlord table render on the server.
  assert.match(page, /listByCommunity\(\)\.map/);
  assert.match(page, /granTable\(\)\.map/);
  // YMYL: the disclaimer with the Ministry's index lookup, the dates, the FAQ schema, the rent calculator link.
  assert.match(page, /SOURCES\.serpaviApp\.url/);
  assert.match(page, /RULES_AS_OF/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /calcPath\("rent-update", locale\)/);
  const checker = read("src/components/programmatic/zona-tensionada/ZonaTensionadaChecker.tsx");
  assert.match(checker, /^"use client";/);
  assert.match(checker, /<noscript>/);
  assert.match(checker, /useCalculatorUse\("zona-tensionada"/);
  assert.doesNotMatch(checker, /declarations\.json|zona-tensionada\/data/);
  // Every region with declarations has a block, in the order of COMMUNITY_IDS.
  assert.deepEqual(listByCommunity().map((x) => x.community), [...COMMUNITY_IDS]);
  // The rent-update page links the checker.
  assert.match(read("src/components/programmatic/rent-update/RentPage.tsx"), /calcPath\("zona-tensionada", locale\)/);
  assert.ok(existsSync(join(ROOT, "scripts/zonas-tensionadas-snapshot.ts")));
});
