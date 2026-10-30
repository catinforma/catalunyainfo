import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { SLUG_PATTERN } from "../src/lib/programmatic/holidays/slug.ts";
import { SEASON, SEASON_YEAR, inSeason, isChristmasAgendaMarket, isChristmasName, shortFairName } from "../src/lib/programmatic/christmas-fairs/classify.ts";
import {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  fairShortName,
  headline,
  hubMeta,
  statusLabels,
  stripOrdinal,
  townDescription,
  townH1,
  townTitle,
} from "../src/lib/programmatic/christmas-fairs/copy.ts";
import {
  FAIRS,
  SNAPSHOT,
  englishTowns,
  familyLastChecked,
  holidayDatesIn,
  holidayTown,
  lastChecked,
  linesFor,
  mergeFairs,
  nearbyTowns,
  pendingMarkets,
  qualifies,
  shippedTowns,
  townBySlug,
  towns,
  weekendZoneFor,
} from "../src/lib/programmatic/christmas-fairs/data.ts";
import { onDate, rangeText, shortRange, untilDate } from "../src/lib/programmatic/christmas-fairs/format.ts";
import { holidaySentences, regionalHolidaysIn, trainLines, weekendSentence } from "../src/lib/programmatic/christmas-fairs/guide.ts";
import { ORGANISER_FAIRS, PENDING_MARKETS } from "../src/lib/programmatic/christmas-fairs/organisers.ts";
import { EN_TOWNS, FAIRS_LOCALES, FAIRS_ROUTE, fairsHubPath, hubTranslations, townPath, townTranslations } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import { PRERENDER, hubAllowed, resolveTown, townStaticParams } from "../src/lib/programmatic/christmas-fairs/routing.ts";
import { WEB_REPLACEMENTS, agendaFairs, fairFromRow, organiserWeb } from "../src/lib/programmatic/christmas-fairs/rows.ts";
import { christmasFairsPaths, christmasFairsSitemapEntries } from "../src/lib/programmatic/christmas-fairs/sitemap.ts";
import { christmasFairEvents } from "../src/lib/programmatic/christmas-fairs/structured.ts";
import { fill, seasonStatus, todayInMadrid, type DatedFair } from "../src/lib/programmatic/christmas-fairs/today.ts";
import type { ChristmasSnapshot } from "../src/lib/programmatic/christmas-fairs/types.ts";
import { buildLookup, municipalityNames } from "../src/lib/programmatic/weekend/compact.ts";
import { SNAPSHOT as WEEKEND, municipality } from "../src/lib/programmatic/weekend/data.ts";
import { buildMetadata } from "../src/lib/seo/metadata.ts";
import { absoluteUrl } from "../src/lib/site.ts";

const ROOT = join(import.meta.dirname, "..");
const FIXTURE = JSON.parse(readFileSync(join(ROOT, "tests/fixtures/christmas-fairs-rows.json"), "utf8")) as {
  readOn: string;
  fairs: Record<string, string>[];
  agenda: Record<string, string>[];
};
const KNOWN = new Set(WEEKEND.municipalities.map((m) => m.ine));
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/* -------------------------------------------------------------------------- */
/* Snapshot                                                                   */
/* -------------------------------------------------------------------------- */

test("snapshot: dated, with the two official datasets and what was measured", () => {
  assert.match(SNAPSHOT.readOn, ISO);
  assert.ok(SNAPSHOT.readOn >= "2026-10-30");
  assert.deepEqual(SNAPSHOT.season, { from: SEASON.from, to: SEASON.to });
  for (const [id, source] of [["vm32-przc", SNAPSHOT.sources.fairs], ["rhpv-yr4f", SNAPSHOT.sources.agenda]] as const) {
    assert.equal(source.url, `https://analisi.transparenciacatalunya.cat/d/${id}`);
    assert.equal(source.api, `https://analisi.transparenciacatalunya.cat/resource/${id}.json`);
    assert.match(source.updated ?? "", ISO);
    assert.match(source.publisher, /Generalitat de Catalunya/);
  }
  const m = SNAPSHOT.measured;
  assert.ok(m.fairRows >= 100 && m.agendaRows >= 200, JSON.stringify(m));
  assert.ok(m.fairChristmas >= SNAPSHOT.fairs.filter((f) => f.source === "fairs").length);
});

test("snapshot: every row is a Christmas fair of the season, placed, unique, in date order", () => {
  assert.ok(SNAPSHOT.fairs.length >= 20, `${SNAPSHOT.fairs.length} fairs`);
  const ids = new Set<string>();
  let previous = "";
  for (const f of SNAPSHOT.fairs) {
    assert.ok(!ids.has(f.id), `duplicate ${f.id}`);
    ids.add(f.id);
    assert.match(f.id, /^(vm32|agenda):\S+$/);
    assert.ok(isChristmasName(f.name, f.nameEs), f.name);
    assert.match(f.start, ISO);
    assert.match(f.end, ISO);
    assert.ok(f.start <= f.end, f.id);
    assert.ok(inSeason(f.start, f.end), `${f.name} ${f.start}`);
    assert.ok(KNOWN.has(f.ine), `${f.name}: ${f.ine}`);
    if (f.web) assert.match(f.web, /^https:\/\/[^\s]+\.[a-z]{2,}/);
    assert.ok(`${f.start}|${f.end}` >= previous, "date order");
    previous = `${f.start}|${f.end}`;
  }
});

test("snapshot: known answers from the calendar read on 30 Oct 2026", () => {
  const byId = new Map(SNAPSHOT.fairs.map((f) => [f.id, f]));
  const avet = byId.get("vm32:24032308");
  assert.equal(avet?.name, "Fira de l'Avet");
  assert.equal(avet?.ine, "17063");
  assert.equal(`${avet?.start}..${avet?.end}`, "2026-11-28..2026-12-08");
  assert.equal(avet?.since, 1980);
  const olot = byId.get("vm32:24032768");
  assert.equal(olot?.name, "Fira del Pessebre");
  assert.equal(`${olot?.start}..${olot?.end}`, "2026-12-05..2026-12-07");
  assert.equal(olot?.place, "Nucli antic");
  const manresa = byId.get("vm32:24032442");
  assert.equal(`${manresa?.start}..${manresa?.end}`, "2026-12-12..2026-12-13");
  // Left out: the Fira del Gall (its organiser never calls it a Christmas fair) and last January's Reis fairs.
  assert.ok(!SNAPSHOT.fairs.some((f) => /Gall|Torrons/.test(f.name)));
  assert.ok(!SNAPSHOT.fairs.some((f) => f.start < SEASON.from));
});

/* -------------------------------------------------------------------------- */
/* Rows: the script's code on real rows                                       */
/* -------------------------------------------------------------------------- */

test("fixture: real calendar rows become season fairs, or are left out", () => {
  const out = new Map<string, ReturnType<typeof fairFromRow>>();
  for (const r of FIXTURE.fairs) out.set(r.nom!, fairFromRow(r, KNOWN));
  assert.deepEqual(out.get("Fira de l'Avet"), {
    id: "vm32:24032308",
    source: "fairs",
    name: "Fira de l'Avet",
    nameEs: "Feria del Abeto",
    ine: "17063",
    start: "2026-11-28",
    end: "2026-12-08",
    place: "Carrers i places del nucli urbà",
    web: "https://www.espinelves.cat/",
    webReplaced: false,
    organiser: "Ajuntament d'Espinelves",
    since: 1980,
    toConfirm: false,
  });
  const valls = out.get("Mercat de Nadal. Fira de Capons, Aviram i Motius Nadalencs");
  assert.equal(valls?.ine, "43161");
  assert.equal(shortFairName(valls!.name), "Mercat de Nadal");
  // Ascó's calendar website now serves an unrelated site: the council's own is linked instead.
  const asco = out.get("Fira de Nadal");
  assert.equal(asco?.web, "https://www.asco.cat/");
  assert.equal(asco?.webReplaced, true);
  // Igualada's Reis fair of 6 Jan 2026 is last season's; the Gall and Torrons fairs are not Christmas by name.
  assert.equal(out.get("Fira de Reis"), null);
  assert.equal(out.get("Fira del Gall"), null);
  assert.equal(out.get("Fira dels Torrons"), null);
  assert.throws(() => fairFromRow({ ...FIXTURE.fairs[1]!, codi_municipi_idescat: "999999" }, KNOWN), /not in the register/);
});

test("fixture: agenda rows count only when they are Christmas fairs or markets", () => {
  const register = { municipalities: WEEKEND.municipalities, comarques: WEEKEND.comarques, agendaAliases: WEEKEND.agendaAliases };
  const lookup = buildLookup(register);
  const names = municipalityNames(register);
  // Real rows read on 30 Oct 2026: Vic's medieval market (a market, not Christmas) and a Christmas concert (Christmas, not a market).
  assert.deepEqual(agendaFairs(FIXTURE.agenda, lookup, names, []), []);
  // The same shape with a Christmas market title, as organisers add them in November.
  const medieval = FIXTURE.agenda.find((r) => /Medieval/.test(r.denominaci ?? ""))!;
  const market = { ...medieval, codi: "test-1", denominaci: "Mercat de Nadal de Vic", data_inici: "2026-12-12T00:00:00.000", data_fi: "2026-12-13T00:00:00.000" };
  const found = agendaFairs([market], lookup, names, []);
  assert.equal(found.length, 1);
  assert.equal(found[0]?.ine, "08298");
  assert.equal(found[0]?.id, "agenda:test-1");
  // Already in the calendar for that town and those days: not added twice.
  assert.deepEqual(agendaFairs([market], lookup, names, found), []);
  assert.ok(isChristmasAgendaMarket({ denominaci: "Pessebre vivent", tags_categor_es: "agenda:categories/fires-i-mercats" }));
  assert.ok(!isChristmasAgendaMarket({ denominaci: "Concert de Nadal", tags_categor_es: "agenda:categories/concerts" }));
});

test("classification: Christmas words only, and the season's bounds", () => {
  for (const name of ["Fira de Nadal", "Mercat nadalenc", "Fira de Santa Llúcia", "Fira de Reis", "Fira del Tió", "Fira de l'Avet", "Fira del Pessebre", "Feria del Belén", "Mercado navideño"]) {
    assert.ok(isChristmasName(name), name);
  }
  for (const name of ["Fira del Gall", "Fira dels Torrons", "Fira d'Hivern de Porqueres", "Fira de la Puríssima", "Mercat Medieval Vic", "Fira de Sant Nicolau"]) {
    assert.ok(!isChristmasName(name), name);
  }
  assert.ok(inSeason("2026-10-31", "2026-11-01"));
  assert.ok(!inSeason("2026-10-30", "2026-10-31"));
  assert.ok(inSeason("2027-01-07", "2027-01-07"));
  assert.ok(!inSeason("2027-01-08", "2027-01-10"));
  assert.equal(SEASON_YEAR, 2026);
  assert.equal(stripOrdinal("24a Fira de Santa Llúcia"), "Fira de Santa Llúcia");
  assert.equal(stripOrdinal("6è Mercat de Nadal de Garriguella"), "Mercat de Nadal de Garriguella");
  assert.equal(shortFairName("Fira de Santa Llúcia. Fira de la Punta al Coixí"), "Fira de Santa Llúcia");
  assert.equal(shortFairName("Mercat d'Artesans. Fira de Nadal"), "Fira de Nadal");
});

test("websites: replacements are https council sites, and no page links a replaced host", () => {
  for (const [host, url] of Object.entries(WEB_REPLACEMENTS)) {
    assert.match(url, /^https:\/\//);
    assert.notEqual(new URL(url).hostname, host);
  }
  for (const f of FAIRS) if (f.web) assert.ok(!(new URL(f.web).hostname in WEB_REPLACEMENTS), f.web);
  assert.ok(!JSON.stringify(SNAPSHOT).includes("ascoturisme"));
  assert.deepEqual(organiserWeb("www.ascoturisme.com"), { web: "https://www.asco.cat/", webReplaced: true });
  assert.deepEqual(organiserWeb("www.firagirona.com"), { web: "https://www.firagirona.com/", webReplaced: false });
  assert.deepEqual(organiserWeb(""), { web: null, webReplaced: false });
});

/* -------------------------------------------------------------------------- */
/* Organisers' own pages, and the merge                                       */
/* -------------------------------------------------------------------------- */

test("organisers: each announcement is sourced, dated and quoted", () => {
  const ids = new Set<string>();
  for (const o of ORGANISER_FAIRS) {
    assert.ok(!ids.has(o.id));
    ids.add(o.id);
    assert.match(o.id, /^org:[a-z0-9-]+$/);
    assert.ok(KNOWN.has(o.ine), o.id);
    assert.match(o.url, /^https:\/\//);
    assert.match(o.readOn, ISO);
    assert.ok(o.publisher.length > 5);
    assert.ok(inSeason(o.start, o.end) && o.start <= o.end, o.id);
    assert.ok(o.quote.length > 20, o.id);
    // The quote carries the first day's number.
    assert.ok(o.quote.includes(String(Number(o.start.slice(8, 10)))), `${o.id}: ${o.quote}`);
    assert.ok(!/aerobusbcn/.test(o.url));
  }
  for (const p of PENDING_MARKETS) {
    assert.match(p.url, /^https:\/\//);
    assert.ok(KNOWN.has(p.ine));
    for (const locale of FAIRS_LOCALES) assert.ok(p.shows[locale].length > 20);
  }
});

test("merge: Canyelles takes the council's dates over the calendar's, and says so", () => {
  const canyelles = FAIRS.find((f) => f.id === "vm32:24033377")!;
  assert.equal(`${canyelles.start}..${canyelles.end}`, "2026-11-21..2026-11-22");
  assert.deepEqual(canyelles.datasetDates, { start: "2026-11-28", end: "2026-11-29" });
  assert.equal(canyelles.checked?.publisher, "Ajuntament de Canyelles");
  assert.equal(canyelles.place, "Nucli i casc antic");
  assert.ok(!FAIRS.some((f) => f.id === "org:canyelles-santa-llucia"), "a correction is not a second fair");
  const figueres = FAIRS.find((f) => f.id === "org:figueres-mercat-de-nadal")!;
  assert.equal(figueres.source, "organiser");
  assert.equal(`${figueres.start}..${figueres.end}`, "2026-11-27..2026-12-24");
  // Every snapshot row and every organiser-only entry is on the merged list, once.
  assert.equal(FAIRS.length, SNAPSHOT.fairs.length + ORGANISER_FAIRS.filter((o) => !o.replaces).length);
  assert.equal(new Set(FAIRS.map((f) => f.id)).size, FAIRS.length);
});

/* -------------------------------------------------------------------------- */
/* Guardrail                                                                  */
/* -------------------------------------------------------------------------- */

test("guardrail: a town has a page only with at least one dated fair of the season", () => {
  const list = towns();
  assert.equal(list.length, new Set(FAIRS.filter(qualifies).map((f) => f.ine)).size);
  for (const t of list) {
    assert.ok(t.fairs.some(qualifies), t.slug);
    assert.match(t.slug, SLUG_PATTERN);
    assert.equal(townBySlug(t.slug)?.ine, t.ine);
  }
  // Barcelona, Girona and Tarragona have no dated fair yet (Santa Llúcia unpublished): no page.
  for (const slug of ["barcelona", "girona", "tarragona", "sitges", "igualada", "vilafranca-del-penedes"]) assert.equal(townBySlug(slug), null, slug);
  // A fair whose dates are still to be confirmed does not give its town a page on its own.
  const pending: ChristmasSnapshot = {
    ...SNAPSHOT,
    fairs: [{ ...SNAPSHOT.fairs[0]!, id: "vm32:test", ine: "08019", toConfirm: true }],
  };
  assert.deepEqual(shippedTowns(mergeFairs(pending, [])).map((t) => t.slug), []);
  assert.deepEqual(
    shippedTowns(mergeFairs({ ...pending, fairs: [{ ...pending.fairs[0]!, toConfirm: false }] }, [])).map((t) => t.slug),
    ["barcelona"],
  );
  // The pending big markets have no page until they publish.
  for (const p of pendingMarkets()) assert.ok(!towns().some((t) => t.ine === p.ine && !t.fairs.some(qualifies)));
});

test("guardrail: English pages only for the visitor towns, and only with a dated fair", () => {
  for (const t of englishTowns()) {
    assert.ok(EN_TOWNS.includes(t.ine));
    assert.ok(t.fairs.some(qualifies));
  }
  assert.deepEqual(englishTowns().map((t) => t.slug).sort(), ["figueres", "vic"]);
});

/* -------------------------------------------------------------------------- */
/* Paths and routing                                                          */
/* -------------------------------------------------------------------------- */

test("paths: one route folder per locale", () => {
  assert.deepEqual(FAIRS_ROUTE, { ca: "fires-de-nadal", es: "mercados-navidad", en: "christmas-markets" });
  assert.equal(fairsHubPath("ca"), "/ca/fires-de-nadal/");
  assert.equal(townPath("es", "sant-feliu-de-guixols"), "/es/mercados-navidad/sant-feliu-de-guixols/");
  assert.deepEqual(hubTranslations(), { ca: "/ca/fires-de-nadal/", es: "/es/mercados-navidad/", en: "/en/christmas-markets/" });
  assert.deepEqual(townTranslations({ slug: "olot", ine: "17114" }), { ca: "/ca/fires-de-nadal/olot/", es: "/es/mercados-navidad/olot/" });
  assert.deepEqual(townTranslations({ slug: "vic", ine: "08298" }), { ca: "/ca/fires-de-nadal/vic/", es: "/es/mercados-navidad/vic/", en: "/en/christmas-markets/vic/" });
});

test("routing: each route answers its own locale only; anything else is a 404", () => {
  assert.ok(hubAllowed("ca", "ca"));
  assert.ok(!hubAllowed("ca", "es"));
  assert.ok(!hubAllowed("en", "ca"));
  assert.equal(resolveTown("ca", "ca", "olot")?.ine, "17114");
  assert.equal(resolveTown("es", "es", "olot")?.ine, "17114");
  assert.equal(resolveTown("ca", "es", "olot"), null);
  assert.equal(resolveTown("es", "en", "olot"), null);
  assert.equal(resolveTown("en", "en", "olot"), null, "Olot has no English edition");
  assert.equal(resolveTown("en", "en", "vic")?.ine, "08298");
  assert.equal(resolveTown("en", "ca", "vic"), null);
  assert.equal(resolveTown("ca", "ca", "barcelona"), null);
  assert.equal(resolveTown("ca", "ca", "Olot"), null);
  assert.equal(resolveTown("ca", "ca", "no-such-town"), null);
  for (const locale of FAIRS_LOCALES) {
    const params = townStaticParams(locale);
    assert.ok(params.length <= PRERENDER && params.length > 0);
    assert.ok(params.every((p) => p.locale === locale && resolveTown(locale, locale, p.municipi)));
  }
  assert.equal(townStaticParams("ca")[0]?.municipi, "manresa", "largest first");
});

test("route files: one per locale folder, static, 404 for other locales", () => {
  for (const [dir, locale] of [["fires-de-nadal", "ca"], ["mercados-navidad", "es"], ["christmas-markets", "en"]] as const) {
    const hub = readFileSync(join(ROOT, `src/app/(public)/[locale]/${dir}/page.tsx`), "utf8");
    const town = readFileSync(join(ROOT, `src/app/(public)/[locale]/${dir}/[municipi]/page.tsx`), "utf8");
    for (const source of [hub, town]) {
      assert.match(source, /export const revalidate = false;/);
      assert.match(source, /notFound\(\)/);
      assert.ok(source.includes(`"${locale}"`));
      assert.ok(!source.includes(locale === "ca" ? `"es"` : `"ca"`));
    }
    assert.match(town, /export const dynamicParams = true;/);
    assert.match(town, new RegExp(`townStaticParams\\("${locale}"\\)`));
  }
});

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

test("metadata: titles <= 60 with the year and the town, descriptions <= 155", () => {
  for (const t of towns()) {
    for (const locale of FAIRS_LOCALES) {
      if (locale === "en" && !EN_TOWNS.includes(t.ine)) continue;
      const title = townTitle(t, locale);
      const description = townDescription(t, locale);
      assert.ok(title.length <= TITLE_LIMIT, `${title} (${title.length})`);
      assert.ok(description.length <= DESCRIPTION_LIMIT, `${description} (${description.length})`);
      assert.ok(title.includes(String(SEASON_YEAR)), title);
      const bare = t.name.replace(/^(el|la|les|els) |^l'/, "");
      assert.ok(title.toLowerCase().includes(bare.toLowerCase()), `${title} / ${bare}`);
      assert.ok(!/\$\{|undefined|null/.test(title + description), title);
      assert.equal(townH1(t, locale), `${headline(t, locale)} ${SEASON_YEAR}`);
    }
  }
  for (const locale of FAIRS_LOCALES) {
    const m = hubMeta(locale, { fairs: FAIRS.length, towns: towns().length }, familyLastChecked());
    assert.ok(m.title.length <= TITLE_LIMIT && m.title.includes(String(SEASON_YEAR)), m.title);
    assert.ok(m.description.length <= DESCRIPTION_LIMIT, m.description);
    // Room for the list to grow.
    const big = hubMeta(locale, { fairs: 250, towns: 180 }, "2026-12-31");
    assert.ok(big.description.length <= DESCRIPTION_LIMIT, big.description);
  }
});

test("metadata: the query's words", () => {
  const solsona = townBySlug("solsona")!;
  assert.equal(townTitle(solsona, "ca"), "Fira del Tió de Solsona 2026: dates i lloc");
  assert.equal(townTitle(solsona, "es"), "Feria del Tió de Solsona 2026: fechas y lugar");
  assert.equal(townTitle(townBySlug("vallirana")!, "ca"), "Fira de Nadal de Vallirana 2026: dates i lloc");
  assert.equal(townTitle(townBySlug("figueres")!, "es"), "Mercado de Navidad de Figueres 2026: fechas y lugar");
  assert.equal(townTitle(townBySlug("vic")!, "en"), "Vic Christmas market 2026: dates and place");
  assert.equal(fairShortName({ name: "Fira de Santa Llúcia", nameEs: "Feria de Santa Llúcia" }, "es"), "Feria de Santa Llúcia");
  const ripoll = townDescription(townBySlug("ripoll")!, "ca");
  assert.ok(ripoll.startsWith("Fira de Nadal de Ripoll: 5 i 6 de desembre de 2026"), ripoll);
  assert.equal(hubMeta("ca", { fairs: 41, towns: 41 }, "2026-10-30").title, "Fires de Nadal 2026 a Catalunya: dates per municipi");
  assert.equal(hubMeta("en", { fairs: 41, towns: 41 }, "2026-10-30").title, "Christmas markets in Catalonia 2026: dates by town");
});

test("metadata: canonical and hreflang between the editions that exist", () => {
  const olot = townBySlug("olot")!;
  const meta = buildMetadata({ locale: "es", path: townPath("es", olot.slug), title: "t", translations: townTranslations(olot) });
  const alt = meta.alternates as { canonical: string; languages: Record<string, string> };
  assert.equal(alt.canonical, absoluteUrl("/es/mercados-navidad/olot/"));
  assert.equal(alt.languages.ca, absoluteUrl("/ca/fires-de-nadal/olot/"));
  assert.equal(alt.languages["x-default"], absoluteUrl("/ca/fires-de-nadal/olot/"));
  assert.equal(Object.keys(alt.languages).length, 3, "ca, es and x-default");
  const vic = townBySlug("vic")!;
  const en = buildMetadata({ locale: "en", path: townPath("en", vic.slug), title: "t", translations: townTranslations(vic) });
  const enAlt = en.alternates as { languages: Record<string, string> };
  assert.equal(enAlt.languages["x-default"], absoluteUrl("/en/christmas-markets/vic/"));
  assert.equal(Object.keys(enAlt.languages).length, 4);
});

/* -------------------------------------------------------------------------- */
/* Client "today" logic                                                       */
/* -------------------------------------------------------------------------- */

const LIST: DatedFair[] = [
  { id: "a", s: "2026-12-05", e: "2026-12-06", n: "Fira de Nadal", t: "Ripoll" },
  { id: "b", s: "2026-12-05", e: "2026-12-07", n: "Fira del Pessebre", t: "Olot" },
  { id: "c", s: "2026-12-13", e: "2026-12-13", n: "Fira de Santa Llúcia", t: "Tremp" },
];

test("client: today is Madrid's date, whatever the device's zone", () => {
  // 23:30 UTC on 4 Dec is 00:30 on 5 Dec in Madrid (UTC+1 in winter).
  assert.equal(todayInMadrid(new Date("2026-12-04T23:30:00Z")), "2026-12-05");
  assert.equal(todayInMadrid(new Date("2026-12-04T22:59:00Z")), "2026-12-04");
  assert.equal(todayInMadrid(new Date("2027-01-04T23:00:00Z")), "2027-01-05");
});

test("client: open today, next, and the day after the last date", () => {
  const before = seasonStatus("2026-12-04", LIST)!;
  assert.equal(before.state, "upcoming");
  assert.ok(before.state === "upcoming" && before.nextIn === 1 && before.next.id === "a");
  const day1 = seasonStatus(todayInMadrid(new Date("2026-12-04T23:30:00Z")), LIST)!;
  assert.equal(day1.state, "open");
  assert.ok(day1.state === "open" && day1.open.length === 2 && day1.next?.id === "c" && day1.nextIn === 8);
  const lastDayOfOlot = seasonStatus("2026-12-07", LIST)!;
  assert.ok(lastDayOfOlot.state === "open" && lastDayOfOlot.open.map((f) => f.id).join() === "b");
  const gap = seasonStatus("2026-12-08", LIST)!;
  assert.ok(gap.state === "upcoming" && gap.next.id === "c" && gap.nextIn === 5);
  const lastDay = seasonStatus("2026-12-13", LIST)!;
  assert.ok(lastDay.state === "open" && lastDay.next === null);
  const after = seasonStatus("2026-12-14", LIST)!;
  assert.deepEqual(after, { state: "over", lastDay: "2026-12-13" });
  assert.equal(seasonStatus("2026-12-14", []), null);
  // The page's own fairs, the day after the season's last one (Vic closes on 4 Jan 2027).
  const all = FAIRS.map((f) => ({ id: f.id, s: f.start, e: f.end, n: f.name, t: f.ine }));
  const last = FAIRS.reduce((m, f) => (f.end > m ? f.end : m), "");
  assert.equal(last, "2027-01-04");
  assert.equal(seasonStatus("2027-01-05", all)?.state, "over");
  assert.equal(seasonStatus(SNAPSHOT.readOn, all)?.state, "upcoming");
});

test("client: the box's words fill every placeholder", () => {
  for (const locale of FAIRS_LOCALES) {
    for (const scope of ["town", "hub"] as const) {
      const l = statusLabels(locale, scope, "la Pobla de Segur");
      const text = [
        fill(l.openOne, { n: "Fira", t: "Olot", until: untilDate("2026-12-07", locale) }),
        fill(l.openMany, { count: 3 }),
        fill(l.upcoming, { n: "Fira", t: "Olot", when: "dissabte 5", in: fill(l.inDays, { n: 3 }) }),
        fill(l.over, { last: onDate("2026-12-13", locale) }),
        l.fallback,
      ].join(" ");
      assert.ok(!/[{}]/.test(text), `${locale} ${scope}: ${text}`);
    }
  }
  assert.equal(untilDate("2027-01-01", "ca"), "a l'1 de gener");
  assert.equal(untilDate("2026-12-07", "ca"), "al 7 de desembre");
  assert.equal(onDate("2026-12-11", "ca"), "l'11 de desembre");
});

test("format: fair dates in words", () => {
  assert.equal(rangeText("2026-12-05", "2026-12-05", "ca"), "dissabte 5 de desembre de 2026");
  assert.equal(rangeText("2026-12-05", "2026-12-06", "ca"), "dissabte 5 i diumenge 6 de desembre de 2026");
  assert.equal(rangeText("2026-12-05", "2026-12-07", "es"), "del sábado 5 al lunes 7 de diciembre de 2026");
  assert.equal(rangeText("2026-11-28", "2026-12-08", "ca"), "del dissabte 28 de novembre al dimarts 8 de desembre de 2026");
  assert.equal(rangeText("2026-12-05", "2027-01-04", "en"), "Saturday 5 December 2026 to Monday 4 January 2027");
  assert.equal(rangeText("2026-12-11", "2026-12-13", "ca", { weekdays: false }), "de l'11 al 13 de desembre de 2026");
  assert.equal(rangeText("2026-12-05", "2026-12-06", "en", { weekdays: false }), "5 and 6 December 2026");
  assert.equal(shortRange("2026-12-05", "2026-12-07", "ca"), "5–7 des.");
  assert.equal(shortRange("2026-11-28", "2026-12-08", "en"), "28 Nov – 8 Dec");
});

/* -------------------------------------------------------------------------- */
/* Guidance data                                                              */
/* -------------------------------------------------------------------------- */

test("guidance: trains, holidays, shops and the weekend zone come from the other families' data", () => {
  const vic = townBySlug("vic")!;
  assert.deepEqual(linesFor(vic).map((l) => l.id), ["R3"]);
  const trains = trainLines(vic.name, linesFor(vic), "ca");
  assert.ok(trains.items[0]?.includes("/ca/rodalies/"), trains.items[0]);
  const espinelves = townBySlug("espinelves")!;
  assert.deepEqual(linesFor(espinelves), []);
  assert.match(trainLines(espinelves.name, [], "es").intro, /mou-te\.gencat\.cat/);
  // Vic's fair runs over 8, 25 and 26 Dec and 1 Jan, Catalonia-wide holidays.
  assert.deepEqual(regionalHolidaysIn(vic.fairs, "ca").map((h) => h.date), ["2026-12-08", "2026-12-25", "2026-12-26", "2027-01-01"]);
  assert.deepEqual(holidayDatesIn("2026-12-05", "2027-01-04"), ["2026-12-07", "2026-12-08", "2026-12-24", "2026-12-25", "2026-12-26", "2026-12-31", "2027-01-01"]);
  const shops = holidayTown(vic.ine)!;
  assert.equal(shops.slug, "vic");
  assert.ok(shops.shops.every((d) => d >= SEASON.from && d <= SEASON.to));
  const text = holidaySentences(vic.name, { regional: regionalHolidaysIn(vic.fairs, "ca"), local: [], shops: shops.shops, holidaySlug: shops.slug, datePages: ["2026-12-08"] }, "ca").join(" ");
  assert.ok(text.includes("/ca/festius/vic/") && text.includes("/ca/festius/dia/8-desembre-2026/"), text);
  assert.equal(weekendZoneFor(townBySlug("sant-feliu-de-guixols")!)?.id, "baix-emporda");
  assert.equal(weekendZoneFor(townBySlug("manresa")!)?.id, "provincia-barcelona");
  assert.ok(weekendSentence(weekendZoneFor(vic), "es").includes("/es/fin-de-semana/"));
  // Neighbours: same comarca first (Osona), never the town itself.
  const near = nearbyTowns(vic);
  assert.ok(near.length > 0 && !near.some((t) => t.ine === vic.ine));
  assert.equal(municipality(near[0]!.ine)?.comarca, vic.comarca);
});

test("structured data: one Event per dated fair, on its town page only", () => {
  const vic = townBySlug("vic")!;
  const events = christmasFairEvents(vic.fairs, townPath("en", vic.slug), "en") as Record<string, unknown>[];
  assert.equal(events.length, 1);
  assert.equal(events[0]!["@type"], "Event");
  assert.equal(events[0]!.startDate, "2026-12-05");
  assert.equal(events[0]!.endDate, "2027-01-04");
  assert.equal((events[0]!.location as { address: { addressLocality: string } }).address.addressLocality, "Vic");
  assert.ok(String(events[0]!["@id"]).startsWith(`${absoluteUrl("/en/christmas-markets/vic/")}#event-org-vic-`), String(events[0]!["@id"]));
  // A council homepage standing in for a dead organiser website is not the event's URL.
  const asco = townBySlug("asco")!;
  assert.equal((christmasFairEvents(asco.fairs, townPath("ca", "asco"), "ca")[0] as Record<string, unknown>).url, undefined);
  // Dates to confirm: no Event.
  const unsure = { ...vic.fairs[0]!, toConfirm: true };
  assert.deepEqual(christmasFairEvents([unsure], "/ca/fires-de-nadal/vic/", "ca"), []);
  // The hub carries no Event markup (each fair is described by its town page).
  const routes = readFileSync(join(ROOT, "src/components/programmatic/christmas-fairs/routes.tsx"), "utf8");
  const hubRoute = routes.slice(routes.indexOf("export function HubRoute"), routes.indexOf("export function townMetadata"));
  assert.ok(hubRoute.length > 0 && !hubRoute.includes("christmasFairEvents"));
  assert.ok(routes.includes("christmasFairEvents(town.fairs"));
});

/* -------------------------------------------------------------------------- */
/* Sitemap and links                                                          */
/* -------------------------------------------------------------------------- */

test("sitemap: three hubs, every town in ca and es, the English towns; nothing when indexing is off", () => {
  const paths = christmasFairsPaths();
  assert.equal(paths.length, 3 + 2 * towns().length + englishTowns().length);
  assert.equal(new Set(paths.map((p) => p.path)).size, paths.length);
  assert.equal(paths[0]?.path, "/ca/fires-de-nadal/");
  for (const p of paths) {
    assert.match(p.lastModified, ISO);
    assert.ok(Object.values(p.translations).includes(p.path));
  }
  assert.equal(paths.find((p) => p.path === "/ca/fires-de-nadal/olot/")?.lastModified, lastChecked(townBySlug("olot")!));
  assert.ok(paths.some((p) => p.path === "/en/christmas-markets/vic/"));
  assert.ok(!paths.some((p) => p.path === "/en/christmas-markets/olot/"));
  assert.deepEqual(christmasFairsSitemapEntries(), []);
  const sitemap = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8");
  assert.match(sitemap, /\.\.\.christmasFairsSitemapEntries\(\)/);
});

test("links: both Christmas guides and the weekend pages point at the hub", () => {
  for (const file of ["src/lib/content/batch02/christmas.ts", "src/lib/content/batch02/christmas-barcelona.ts"]) {
    const source = readFileSync(join(ROOT, file), "utf8");
    for (const locale of FAIRS_LOCALES) assert.ok(source.includes(`fairsHubPath("${locale}")`), `${file} ${locale}`);
  }
  for (const file of ["src/components/programmatic/weekend/ZonePage.tsx", "src/components/programmatic/weekend/HubPage.tsx"]) {
    assert.match(readFileSync(join(ROOT, file), "utf8"), /fairsHubPath\(locale\)/, file);
  }
});

test("links (30 Oct 2026): the hub's guides include the December bridge and La Marató, each town page's the bridge", () => {
  const hub = readFileSync(join(ROOT, "src/components/programmatic/christmas-fairs/HubPage.tsx"), "utf8");
  assert.match(hub, /const guides = \(\[[^\]]*"christmasBarcelona"[^\]]*"decemberBridge"[^\]]*"marato"[^\]]*\] as const\)/);
  const town = readFileSync(join(ROOT, "src/components/programmatic/christmas-fairs/TownPage.tsx"), "utf8");
  assert.match(town, /const GUIDES = \[[^\]]*"christmasBarcelona"[^\]]*"decemberBridge"[^\]]*\] as const;/);
});

test("deterministic: no clock in the server code of the family", () => {
  for (const file of [
    "src/lib/programmatic/christmas-fairs/data.ts",
    "src/lib/programmatic/christmas-fairs/copy.ts",
    "src/lib/programmatic/christmas-fairs/guide.ts",
    "src/lib/programmatic/christmas-fairs/format.ts",
    "src/components/programmatic/christmas-fairs/TownPage.tsx",
    "src/components/programmatic/christmas-fairs/HubPage.tsx",
    "src/components/programmatic/christmas-fairs/parts.tsx",
    "src/components/programmatic/christmas-fairs/routes.tsx",
  ]) {
    const source = readFileSync(join(ROOT, file), "utf8");
    assert.ok(!/new Date\(\)|Date\.now\(\)|todayInCatalonia\(\)/.test(source), file);
  }
  // The browser component reads the clock only after mount.
  const client = readFileSync(join(ROOT, "src/components/programmatic/christmas-fairs/FairStatus.tsx"), "utf8");
  assert.match(client, /^"use client";/);
  assert.match(client, /useEffect\(\(\) => \{\s+const today = todayInMadrid\(new Date\(\)\);/);
});

test("every outbound link in the fair data is https (no javascript: or other schemes)", () => {
  const links: string[] = [];
  const walk = (value: unknown, key?: string): void => {
    if (Array.isArray(value)) value.forEach((v) => walk(v, key));
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, k);
    else if (typeof value === "string" && key && /url|href|link|web/i.test(key)) links.push(value);
  };
  walk(SNAPSHOT);
  walk(ORGANISER_FAIRS);
  walk(PENDING_MARKETS);
  walk(FAIRS);
  assert.ok(links.length > 0);
  for (const link of links) assert.match(link, /^https:\/\/[^\s"<>]+$/, link);
});
