import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { SLUG_PATTERN } from "../src/lib/programmatic/holidays/slug.ts";
import { SEASON, SEASON_YEAR, inSeason, isChristmasAgendaMarket, isChristmasName, shortFairName } from "../src/lib/programmatic/christmas-fairs/classify.ts";
import {
  DATED_TITLE_TOWNS,
  DESCRIPTION_LIMIT,
  LEAD_HOLDS,
  SNIPPET_HOLDS,
  TITLE_LIMIT,
  confirmationNote,
  fairShortName,
  headline,
  hubMeta,
  statusLabels,
  stripOrdinal,
  stripVenue,
  townDescription,
  townDatesLine,
  townH1,
  townLead,
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
  outingDays,
  pendingFor,
  pendingMarkets,
  qualifies,
  sameWeekendFairs,
  shippedTowns,
  townBySlug,
  towns,
  weekendZoneFor,
} from "../src/lib/programmatic/christmas-fairs/data.ts";
import { onDate, rangeText, shortRange, untilDate } from "../src/lib/programmatic/christmas-fairs/format.ts";
import { holidaySentences, regionalHolidaysIn, trainLines, weekendSentence } from "../src/lib/programmatic/christmas-fairs/guide.ts";
import { BODY_HOLDS, HTTP_ONLY_HOSTS, ORGANISER_FAIRS, PENDING_MARKETS, UNCONFIRMED_FAIRS } from "../src/lib/programmatic/christmas-fairs/organisers.ts";
import { EN_TOWNS, FAIRS_LOCALES, FAIRS_ROUTE, agendaActivityUrl, fairsHubPath, hubTranslations, townPath, townTranslations } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import { PRERENDER, hubAllowed, resolveTown, townStaticParams } from "../src/lib/programmatic/christmas-fairs/routing.ts";
import { WEB_REPLACEMENTS, agendaFairs, fairFromRow, organiserWeb } from "../src/lib/programmatic/christmas-fairs/rows.ts";
import { christmasFairsPaths, christmasFairsSitemapEntries } from "../src/lib/programmatic/christmas-fairs/sitemap.ts";
import { christmasFairEvents } from "../src/lib/programmatic/christmas-fairs/structured.ts";
import { fill, isOpenOn, seasonStatus, todayInMadrid, type DatedFair } from "../src/lib/programmatic/christmas-fairs/today.ts";
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
    if (HTTP_ONLY_HOSTS.includes(new URL(o.url).hostname)) assert.match(o.url, /^http:\/\//);
    else assert.match(o.url, /^https:\/\//);
    if (o.hours) for (const locale of FAIRS_LOCALES) assert.ok(o.hours[locale].length > 3, `${o.id} ${locale}`);
    for (const day of o.closed ?? []) assert.ok(day >= o.start && day <= o.end, `${o.id}: closed ${day} inside its dates`);
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
  // Every snapshot row and every organiser-only entry is on the merged list, once;
  // the rows an organiser entry names in `alsoReplaces` (the same fair, listed again) are not.
  const folded = new Set(ORGANISER_FAIRS.flatMap((o) => o.alsoReplaces ?? []));
  for (const id of folded) assert.ok(SNAPSHOT.fairs.some((f) => f.id === id), `${id} is a snapshot row`);
  assert.equal(FAIRS.length, SNAPSHOT.fairs.length - folded.size + ORGANISER_FAIRS.filter((o) => !o.replaces).length);
  assert.equal(new Set(FAIRS.map((f) => f.id)).size, FAIRS.length);
  for (const id of folded) assert.ok(!FAIRS.some((f) => f.id === id), `${id} folded`);
});

/**
 * 3 Nov 2026: the cultural agenda listed Canyelles and Vic again (with the
 * councils' dates). `alsoReplaces` folds each into its council entry: one
 * fair per town, and only rows with the same town and overlapping dates.
 */
test("merge: a fair listed by both the agenda and its council is shown once", () => {
  for (const o of ORGANISER_FAIRS) {
    for (const id of o.alsoReplaces ?? []) {
      const row = SNAPSHOT.fairs.find((f) => f.id === id)!;
      assert.equal(row.ine, o.ine, `${id}: same town as ${o.id}`);
      assert.ok(row.start <= o.end && row.end >= o.start, `${id}: overlaps ${o.id}`);
    }
  }
  for (const slug of ["canyelles", "vic"]) {
    const town = townBySlug(slug)!;
    // Canyelles also has the Petita Llúcia (28-29 Nov, org:canyelles-petita-llucia): its own fair, not a duplicate of the 21-22 Nov one.
    const own = town.fairs.filter((f) => f.id !== "org:canyelles-petita-llucia");
    assert.equal(own.length, 1, `${slug}: ${town.fairs.map((f) => f.id).join(", ")}`);
  }
  // Without the fold the duplicates would be back.
  const unfolded = mergeFairs(SNAPSHOT, ORGANISER_FAIRS.map(({ alsoReplaces: _drop, ...o }) => o));
  assert.ok(unfolded.filter((f) => f.ine === "08298").length > 1);
});

/**
 * 3 Nov 2026: Santa Llúcia 2026 is in the Generalitat's cultural agenda
 * (27 Nov - 23 Dec), so Barcelona has a page (and an English one), from the
 * agenda row; it is no longer a pending market.
 *
 * 13 Nov 2026: the Ajuntament's guide (guia.barcelona.cat) lists the Sagrada
 * Família fair (21 Nov - 23 Dec, 10-21 h) and Nadal al Port (27 Nov - 6 Jan,
 * 11-23 h), so Barcelona's page lists three fairs and nothing is pending
 * there. Its title and description stay on Santa Llúcia until the 3 Nov
 * experiment's last reading (1 Dec): SNIPPET_HOLDS.
 */
test("Barcelona: Santa Llúcia from the cultural agenda, the Sagrada Família and Nadal al Port from the council's guide", () => {
  const bcn = townBySlug("barcelona");
  assert.ok(bcn, "Barcelona has a page");
  const fair = bcn.fairs.find((f) => /Santa Llúcia/.test(f.name))!;
  assert.equal(fair.source, "agenda");
  assert.equal(`${fair.start}..${fair.end}`, "2026-11-27..2026-12-23");
  assert.equal(agendaActivityUrl(fair.id), "https://agenda.cultura.gencat.cat/ca/activitat.html/2026110300020");
  assert.equal(fair.checked?.url, "https://agenda.cultura.gencat.cat/ca/activitat.html/2026110300020");
  assert.equal(fair.datasetDates, null, "the agenda's own dates, confirmed");
  assert.equal(fair.hours?.ca, "de 10 a 21 h");
  assert.ok(!PENDING_MARKETS.some((p) => p.ine === "08019"), "nothing pending in Barcelona");
  assert.deepEqual(pendingFor("08019"), []);
  const sagrada = bcn.fairs.find((f) => f.id === "org:barcelona-sagrada-familia")!;
  assert.equal(`${sagrada.start}..${sagrada.end}`, "2026-11-21..2026-12-23");
  assert.match(sagrada.checked!.url, /^https:\/\/guia\.barcelona\.cat\//);
  const port = bcn.fairs.find((f) => f.id === "org:barcelona-nadal-al-port")!;
  assert.equal(`${port.start}..${port.end}`, "2026-11-27..2027-01-06");
  assert.deepEqual(bcn.fairs.map((f) => f.id), ["org:barcelona-sagrada-familia", "agenda:2026110300020", "org:barcelona-nadal-al-port"]);
  assert.equal(fairShortName(fair, "ca"), "Fira de Santa Llúcia");
  assert.equal(fairShortName(fair, "es"), "Feria de Santa Llúcia");
  // The snippet stays on Santa Llúcia (3 Nov measurement window); the H1 names all three.
  assert.equal(townTitle(bcn, "ca"), "Fira de Santa Llúcia de Barcelona 2026: dates i lloc");
  assert.equal(townTitle(bcn, "es"), "Feria de Santa Llúcia de Barcelona 2026: fechas y lugar");
  assert.equal(townTitle(bcn, "en"), "Barcelona Christmas market 2026: dates and place");
  assert.ok(townDescription(bcn, "ca").startsWith("Fira de Santa Llúcia de Barcelona: del 27 de novembre al 23 de desembre de 2026"), townDescription(bcn, "ca"));
  assert.equal(townH1(bcn, "ca"), "Fires de Nadal a Barcelona 2026");
  // Only a street-type word after " a " is cut.
  assert.equal(stripVenue("Fira d'Artesans i de Nadal d'Aiguafreda"), "Fira d'Artesans i de Nadal d'Aiguafreda");
  assert.equal(stripVenue("Mercat de Nadal a la Plaça Major de Vic"), "Mercat de Nadal");
  assert.equal(agendaActivityUrl("vm32:24032442"), null);
});

/**
 * 13 Nov 2026 pass over the 30 towns with the most search impressions: each
 * organiser page opened and grepped. Confirmed: the calendar's dates on the
 * organiser's page (same dates, quoted). Corrected: Ripoll (5-8 Dec, calendar
 * 5-6) and Caldes de Montbui (opening evening on 4 Dec). Not confirmed: the
 * organiser's page still shows 2025 or no year, and the page says so.
 */
test("13 Nov 2026: confirmations, corrections and unconfirmed fairs", () => {
  const byId = new Map(FAIRS.map((f) => [f.id, f]));
  const confirmed: Record<string, string> = {
    "vm32:24032308": "2026-11-28..2026-12-08", // Espinelves
    "vm32:24033117": "2026-12-11..2026-12-13", // Cardedeu
    "vm32:24032768": "2026-12-05..2026-12-07", // Olot
    "vm32:24032545": "2026-12-05..2026-12-06", // Arbúcies
    "vm32:24033492": "2026-12-12..2026-12-13", // Banyoles
    "vm32:24033337": "2026-12-05..2026-12-05", // Balaguer
    "vm32:34895242": "2026-12-05..2026-12-06", // Tivissa
    "vm32:24033189": "2026-12-11..2026-12-13", // Tàrrega
    "vm32:24032523": "2026-12-06..2026-12-06", // Berga
    "vm32:24033607": "2026-11-28..2026-11-29", // Ascó
  };
  for (const [id, dates] of Object.entries(confirmed)) {
    const f = byId.get(id)!;
    assert.equal(`${f.start}..${f.end}`, dates, id);
    assert.ok(f.checked, `${id}: checked`);
    assert.equal(f.datasetDates, null, `${id}: same dates as the calendar`);
    assert.equal(f.unconfirmed, null, id);
  }
  const ripoll = byId.get("vm32:24032983")!;
  assert.equal(`${ripoll.start}..${ripoll.end}`, "2026-12-05..2026-12-08");
  assert.deepEqual(ripoll.datasetDates, { start: "2026-12-05", end: "2026-12-06" });
  const caldes = byId.get("vm32:24032937")!;
  assert.equal(`${caldes.start}..${caldes.end}`, "2026-12-04..2026-12-08");
  assert.match(caldes.hours!.ca, /18 a 20 h/);
  // Unconfirmed: real calendar rows, never also confirmed, and the page says it in every language.
  const replaced = new Set(ORGANISER_FAIRS.map((o) => o.replaces).filter(Boolean));
  for (const u of UNCONFIRMED_FAIRS) {
    assert.ok(SNAPSHOT.fairs.some((f) => f.id === u.fairId && f.source === "fairs"), u.fairId);
    assert.ok(!replaced.has(u.fairId), `${u.fairId} is both confirmed and unconfirmed`);
    assert.match(u.url, /^https:\/\//);
    assert.match(u.readOn, ISO);
    for (const locale of FAIRS_LOCALES) assert.ok(u.shows[locale].length > 20, `${u.fairId} ${locale}`);
    assert.ok(byId.get(u.fairId)?.unconfirmed, u.fairId);
  }
  // Sant Celoni stands for the unconfirmed ones since Manresa published (24 Nov 2026, test below).
  const santCeloni = townBySlug("sant-celoni")!;
  assert.match(confirmationNote(santCeloni.fairs, "ca")!, /encara no ha confirmat l'edició del 2026/);
  assert.match(confirmationNote(santCeloni.fairs, "es")!, /aún no ha confirmado la edición de 2026/);
  assert.match(confirmationNote(townBySlug("espinelves")!.fairs, "en")!, /2026 dates confirmed/);
  // Girona: the council's agenda, with its closing days.
  const girona = townBySlug("girona")!;
  assert.deepEqual(girona.fairs.map((f) => `${f.start}..${f.end}`), ["2026-11-27..2027-01-05"]);
  assert.deepEqual(girona.fairs[0]!.closed, ["2026-12-25", "2026-12-26", "2027-01-01"]);
});

/**
 * Date guard. Organisers publish through November: the unconfirmed list must be
 * re-read at least every 10 days until each fair opens (move a fair to
 * ORGANISER_FAIRS when its page publishes 2026, bump `readOn` otherwise).
 */
/**
 * 24 Nov 2026 re-read: Manresa, Martorell, Solsona and Vallirana published
 * their 2026 edition (Vallirana with a Friday evening the calendar does not
 * have), Granollers its fairs page, Vic the days it opens and Olot its hours.
 */
test("24 Nov 2026: newly confirmed fairs, Vic's open days, Granollers' own page", () => {
  const byId = new Map(FAIRS.map((f) => [f.id, f]));
  for (const id of ["vm32:24032442", "vm32:24033249", "vm32:24032429", "vm32:24032398"]) {
    const f = byId.get(id)!;
    assert.equal(f.unconfirmed, null, id);
    assert.ok((f.checked?.readOn ?? "") >= "2026-11-24", id);
    assert.ok(f.hours, id);
    assert.ok(!UNCONFIRMED_FAIRS.some((u) => u.fairId === id), id);
  }
  assert.match(confirmationNote(townBySlug("manresa")!.fairs, "ca")!, /confirmades/);
  const manresa = byId.get("vm32:24032442")!;
  assert.equal(`${manresa.start}..${manresa.end}`, "2026-12-12..2026-12-13");
  assert.deepEqual(manresa.details?.times, { opens: "10:00", closes: "20:00" });
  // Vallirana: the council opens on Friday 27; the calendar said 28-29.
  const vallirana = byId.get("vm32:24032398")!;
  assert.equal(`${vallirana.start}..${vallirana.end}`, "2026-11-27..2026-11-29");
  assert.deepEqual(vallirana.datasetDates, { start: "2026-11-28", end: "2026-11-29" });
  // Vic: fifteen open days between 5 Dec and 4 Jan, as the organiser lists them.
  const vic = FAIRS.find((f) => f.id === "org:vic-artesania-de-nadal")!;
  const dated: DatedFair = { id: vic.id, s: vic.start, e: vic.end, n: vic.name, t: "Vic", x: vic.closed ? [...vic.closed] : undefined };
  const open: string[] = [];
  for (let t = Date.parse(`${vic.start}T12:00:00Z`); t <= Date.parse(`${vic.end}T12:00:00Z`); t += 86_400_000) {
    const day = new Date(t).toISOString().slice(0, 10);
    if (isOpenOn(dated, day)) open.push(day.slice(5));
  }
  assert.deepEqual(open, ["12-05", "12-06", "12-07", "12-08", "12-12", "12-13", "12-19", "12-20", "12-21", "12-22", "12-23", "12-24", "01-02", "01-03", "01-04"]);
  assert.match(vic.hours!.ca, /només els dies 5, 6, 7, 8, 12, 13, 19, 20, 21, 22, 23 i 24 de desembre i 2, 3 i 4 de gener/);
  // Olot: hours per day and the place the fair's page gives.
  const olot = byId.get("vm32:24032768")!;
  assert.match(olot.hours!.es, /sábado 5 y domingo 6, de 10 a 20 h; lunes 7, de 10 a 19 h/);
  assert.equal(olot.place, "Del carrer de Sant Esteve a la plaça del Carme");
  // Granollers: no longer pending; three dated fairs give it a page.
  assert.ok(!PENDING_MARKETS.some((p) => p.ine === "08096"));
  const granollers = townBySlug("granollers")!;
  assert.equal(granollers.fairs.length, 3);
  assert.deepEqual(granollers.fairs.find((f) => f.id === "org:granollers-fira-d-artesania")?.closed, ["2026-12-25", "2026-12-26", "2027-01-01"]);
});

/**
 * 25 Nov 2026 re-read of every fair of 28 Nov - 8 Dec on its organiser's page, and of the
 * councils of the 15 largest towns: Sabadell, Mataró, Badalona and Tarragona publish
 * fairs in that window and get a page (Tarragona also an English one).
 */
test("25 Nov 2026: fairs found in the largest towns, with the organiser's own dates and hours", () => {
  const byId = new Map(FAIRS.map((f) => [f.id, f]));
  const expectFair = (id: string, range: string, readOn = "2026-11-25") => {
    const f = byId.get(id)!;
    assert.ok(f, id);
    assert.equal(`${f.start}..${f.end}`, range, id);
    assert.equal(f.checked?.readOn, readOn, id);
    assert.equal(f.source, "organiser", id);
    return f;
  };
  const sabadell = expectFair("org:sabadell-fira-de-santa-llucia", "2026-11-27..2026-12-22");
  assert.equal(sabadell.place, null, "two pages of the council give two squares: no place printed");
  assert.match(sabadell.hours!.ca, /de dilluns a divendres, de 10 a 14 h i de 17 a 20 h; caps de setmana i festius, de 10 a 14 h i de 17 a 21 h/);
  for (const locale of ["ca", "es", "en"] as const) assert.match(sabadell.details!.programme.map((l) => l[locale]).join(" "), /Sant Roc.*Doctor Robert/s, locale);
  const mataro = expectFair("org:mataro-fira-de-nadal", "2026-11-27..2026-12-23");
  assert.match(mataro.place!, /Santa Anna/);
  // The calendar gives no 2026 hours and says it may change: the page says both.
  assert.match(mataro.hours!.ca, /sense horari publicat; pot canviar/);
  assert.match(mataro.hours!.es, /sin horario publicado; puede cambiar/);
  assert.match(mataro.hours!.en, /no opening hours published; it may change/);
  const badalona = expectFair("org:badalona-fira-de-nadal-tradicional", "2026-11-20..2026-12-23");
  assert.equal(badalona.place, "Plaça de la Plana");
  assert.equal(badalona.hours!.ca, "de 9 a 21 h");
  for (const locale of ["ca", "es", "en"] as const) assert.ok(!/cada dia|todos los días|daily/.test(`${badalona.hours![locale]}`), locale);
  const tgnFair = expectFair("org:tarragona-fira-de-nadal", "2026-12-04..2026-12-23");
  assert.equal(tgnFair.hours!.ca, "de 10 a 21 h; entrada gratuïta");
  for (const locale of ["ca", "es", "en"] as const) assert.ok(!/cada dia|todos los días|daily/.test(`${tgnFair.hours![locale]}`), locale);
  // The craft fair's page gives 6 Jan and 23 Dec: the earlier is printed, and the quote carries both.
  const tgnCraft = expectFair("org:tarragona-fira-d-artesania", "2026-12-04..2026-12-23");
  assert.match(tgnCraft.checked!.quote, /6 de gener/);
  assert.match(tgnCraft.checked!.quote, /23 de desembre/);
  for (const slug of ["sabadell", "mataro", "badalona", "tarragona"]) assert.ok(townBySlug(slug), slug);
  assert.deepEqual(englishTowns().map((t) => t.slug), ["barcelona", "figueres", "girona", "tarragona", "vic"]);
  // Tarragona left the pending list.
  assert.ok(!PENDING_MARKETS.some((p) => p.ine === "43148"));
  // Nadal al Port: the organiser's own site gives the hours; the opening evening is in the programme.
  const port = byId.get("org:barcelona-nadal-al-port")!;
  assert.deepEqual(port.details?.times, { opens: "11:00", closes: "23:00" });
  assert.match(port.details!.programme.map((l) => l.es).join(" "), /18\.30, 20\.30 y 22\.30/);
  // Balsareny: the council's November agenda lists no fair on 29 Nov.
  assert.match(UNCONFIRMED_FAIRS.find((u) => u.fairId === "vm32:24033253")!.shows.ca, /agenda de novembre/);
  // Canyelles: no shuttle or parking is published for the Petita Llúcia (28-29 Nov).
  const canyelles = byId.get("vm32:24033377")!;
  assert.match(canyelles.details!.access![0]!.ca, /Petita Llúcia \(28 i 29 de novembre\)/);
  assert.match(canyelles.details!.after!.ca, /Espai Harry Potter/);
  // Caldes de Montbui: car parks and the Granollers and Sabadell bus lines from the council's "Com arribar" page.
  const caldes = byId.get("vm32:24032937")!;
  assert.match(caldes.details!.access!.map((l) => l.ca).join(" "), /Les Cremades.*El Sindicat.*de pagament/s);
  assert.match(caldes.details!.access!.map((l) => l.ca).join(" "), /420 i 260.*230, 231 i 234/s);
  // Every fair of the window was read on the 24th or 25th, the unconfirmed ones included.
  for (const f of FAIRS) {
    if (f.end < "2026-11-28" || f.start > "2026-12-08") continue;
    const readOn = f.checked?.readOn ?? f.unconfirmed?.readOn;
    if (!readOn) continue; // calendar-only rows (Aiguafreda, Maçanet de la Selva): no organiser page to read
    assert.ok(readOn >= "2026-11-24", `${f.id} last read ${readOn}`);
  }
});

/** 25 Nov 2026, second re-read: Maçanet de la Selva's council gives the hours the calendar lacks. */
test("25 Nov 2026: Maçanet de la Selva's council news gives the hours; the calendar keeps the place", () => {
  const f = FAIRS.find((x) => x.id === "vm32:24033619")!;
  assert.ok(f);
  assert.equal(`${f.start}..${f.end}`, "2026-11-28..2026-11-29");
  assert.equal(f.checked?.readOn, "2026-11-25");
  assert.equal(f.place, "Avinguda Catalunya i Plaça Església", "the page names no place: the calendar's stays");
  assert.equal(f.source, "fairs");
  assert.equal(FAIRS.filter((x) => x.name === "Mercat de Nadal" && x.ine === "17103").length, 1, "listed once");
  assert.match(f.checked!.quote, /Dissabte 28 de novembre 10 a 20 h/);
  assert.match(f.checked!.quote, /Diumenge 29 de novembre 10 a 18 h/);
  assert.equal(f.hours!.ca, "dissabte 28, de 10 a 20 h; diumenge 29, de 10 a 18 h");
  assert.match(f.hours!.es, /sábado 28/);
  assert.match(f.hours!.en, /Saturday 28/);
});

test("date guard: unconfirmed fairs re-read within 10 days while still to come", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  const tenDaysAgo = new Date(Date.parse(`${today}T12:00:00Z`) - 10 * 86_400_000).toISOString().slice(0, 10);
  for (const u of UNCONFIRMED_FAIRS) {
    const f = FAIRS.find((x) => x.id === u.fairId)!;
    if (f.start <= today) continue;
    assert.ok(u.readOn >= tenDaysAgo, `${u.fairId} (${u.publisher}) last read ${u.readOn}: re-read it`);
  }
});

/** The lead's first sentence gives the days (16 Nov 2026), except on the towns whose title test holds the body. */
test("town lead: the first sentence gives the fair's days", () => {
  const cardedeu = townBySlug("cardedeu")!;
  for (const locale of ["ca", "es", "en"] as const) {
    const lead = townLead({ ...cardedeu, comarcaName: "Vallès Oriental" }, locale, "2026-11-13");
    assert.ok(lead.startsWith(townDatesLine(cardedeu, locale)), `${locale}: ${lead}`);
    assert.ok(townDatesLine(cardedeu, locale).includes(String(Number(cardedeu.fairs[0]!.start.slice(8)))), `${locale}: day in the first sentence`);
    assert.match(townDatesLine(cardedeu, locale), /2026/);
  }
  const multi = towns().find((t) => t.fairs.length > 1)!;
  assert.equal(townDatesLine(multi, "es").split("; ").length, multi.fairs.length);
  for (const ine of Object.keys(LEAD_HOLDS)) {
    const town = towns().find((t) => t.ine === ine)!;
    assert.ok(!townLead({ ...town, comarcaName: "x" }, "ca", "2026-11-13").startsWith(townDatesLine(town, "ca")), `${ine} keeps the held lead`);
  }
});

/**
 * 20 Nov 2026: the organisers' programmes. Each `details` is dated, in the
 * three languages, sourced on official https pages, and only says what those
 * pages print (no price, no "free entry" unless the page says it).
 */
test("details: every organiser programme is dated, trilingual and sourced", () => {
  const withDetails = ORGANISER_FAIRS.filter((o) => o.details);
  assert.ok(withDetails.length >= 1);
  for (const o of withDetails) {
    const d = o.details!;
    assert.match(d.readOn, ISO);
    assert.ok(d.readOn >= o.readOn || d.readOn === o.readOn, `${o.id}: details read on or after the dates`);
    const lines = [...d.programme, ...(d.news ?? []), ...(d.access ?? []), ...[d.tickets, d.after, d.why, d.snippet, d.accessTitle].filter((x) => x !== undefined)];
    assert.ok(d.programme.length > 0, o.id);
    if (d.accessTitle) assert.ok((d.access ?? []).length > 0, `${o.id}: a "how to get there" heading needs its lines`);
    for (const line of lines) for (const locale of FAIRS_LOCALES) assert.ok(line![locale].length > 3 && !/undefined|\$\{/.test(line![locale]), `${o.id} ${locale}: ${line!.ca}`);
    for (const line of lines) assert.ok(!/entrada (lliure|gratuïta)|entrada (libre|gratuita)|free entry|free admission/i.test(Object.values(line!).join(" ")), `${o.id}: no free-entry claim the pages do not make`);
    assert.ok(d.links.length > 0);
    for (const l of d.links) assert.match(l.url, HTTP_ONLY_HOSTS.includes(new URL(l.url).hostname) ? /^http:\/\// : /^https:\/\//, l.url);
    if (d.times) {
      assert.match(d.times.opens, /^\d{2}:\d{2}$/);
      assert.match(d.times.closes, /^\d{2}:\d{2}$/);
      // winterDateTime's +01:00 holds from the last Sunday of October 2026 to the last Sunday of March 2027.
      assert.ok(o.start >= "2026-10-25" && o.end < "2027-03-28", o.id);
    }
    if (d.snippet) for (const locale of FAIRS_LOCALES) assert.ok(d.snippet[locale].length <= 85, `${o.id} ${locale}: snippet fits the description`);
  }
});

test("Canyelles (20 Nov 2026): hours, programme, shuttle buses and parking from the council's pages", () => {
  const town = townBySlug("canyelles")!;
  const fair = town.fairs.find((f) => f.id === "vm32:24033377")!;
  assert.equal(fair.hours?.ca, "dissabte i diumenge, de 9 a 21 h");
  assert.ok((fair.details?.readOn ?? "") >= "2026-11-24");
  assert.match(fair.details!.after!.ca, /28 i diumenge 29 de novembre.*1 euro/);
  assert.ok(fair.details!.links.every((l) => /^https:\/\/www\.(canyelles\.cat|santalluciacanyelles\.cat)\//.test(l.url)));
  const text = (locale: "ca" | "es" | "en") => [...fair.details!.programme, ...(fair.details!.access ?? [])].map((l) => l[locale]).join(" ");
  assert.match(text("ca"), /350 parades/);
  assert.match(text("ca"), /Vilanova.*9, 11, 13, 15, 17 i 19 h/);
  assert.match(text("es"), /Sitges \(Parc de Can Robert/);
  assert.match(text("en"), /free parking/i);
  // The lead hold ended with the 20 Nov review: the first sentence gives the days.
  assert.ok(!("08043" in LEAD_HOLDS));
  for (const locale of ["ca", "es"] as const) {
    // 25 Nov: the Petita Llúcia is a second entry; the lead keeps speaking of the 21-22 Nov fair (SNIPPET_HOLDS, headline).
    const held = { ...town, fairs: [fair] };
    assert.ok(townLead({ ...town, comarcaName: "Garraf" }, locale, "2026-11-20").startsWith(townDatesLine(held, locale)), locale);
    const description = townDescription(town, locale);
    assert.ok(description.length <= DESCRIPTION_LIMIT && /9 a 21 h/.test(description) && /Vilafranca/.test(description), description);
  }
  // The title test (13 Nov) keeps its dated title.
  assert.equal(townTitle(town, "ca"), "Fira de Santa Llúcia de Canyelles 2026: 21 i 22 de novembre");
  // Event: the day's times (winter time), the organiser, a description.
  const event = christmasFairEvents(town.fairs, townPath("es", town.slug), "es")[0] as Record<string, unknown>;
  assert.equal(event.startDate, "2026-11-21T09:00:00+01:00");
  assert.equal(event.endDate, "2026-11-22T21:00:00+01:00");
  assert.equal((event.organizer as { name: string }).name, "Ajuntament de Canyelles");
  assert.match(String(event.description), /9 a 21 h/);
  assert.equal(event.eventStatus, "https://schema.org/EventScheduled");
});

test("same weekend (20 Nov 2026): other towns' fairs open on one of this town's Saturdays, Sundays or holidays", () => {
  assert.deepEqual(outingDays("2026-12-11", "2026-12-13"), ["2026-12-12", "2026-12-13"]);
  assert.deepEqual(outingDays("2026-12-04", "2026-12-08"), ["2026-12-05", "2026-12-06", "2026-12-08"]);
  // A weekday-only fair counts all its days.
  assert.deepEqual(outingDays("2026-12-09", "2026-12-10"), ["2026-12-09", "2026-12-10"]);
  for (const town of towns()) {
    const list = sameWeekendFairs(town);
    assert.ok(list.length <= 8);
    assert.equal(new Set(list.map((s) => s.town.ine)).size, list.length, `${town.slug}: one entry per town`);
    const mine = new Set(town.fairs.filter(qualifies).flatMap((f) => outingDays(f.start, f.end)));
    for (const s of list) {
      assert.notEqual(s.town.ine, town.ine);
      assert.ok(mine.has(s.first) && s.first >= s.fair.start && s.first <= s.fair.end, `${town.slug} -> ${s.town.slug} on ${s.first}`);
    }
  }
  // Canyelles (21-22 Nov): the Sagrada Família fair opens on the 21st.
  const canyelles = sameWeekendFairs(townBySlug("canyelles")!);
  assert.ok(canyelles.some((s) => s.fair.id === "org:barcelona-sagrada-familia"), canyelles.map((s) => s.fair.id).join(", "));
  // Short fairs come before the month-long markets on the same first day.
  const cardedeu = sameWeekendFairs(townBySlug("cardedeu")!);
  const firstLong = cardedeu.findIndex((s) => s.first === "2026-12-12" && s.fair.end > "2026-12-20");
  const lastShort = cardedeu.map((s) => s.first === "2026-12-12" && s.fair.end <= "2026-12-20").lastIndexOf(true);
  if (firstLong >= 0 && lastShort >= 0) assert.ok(lastShort < firstLong, "short fairs first");
});

/** Date guard: a body hold (organisers.ts BODY_HOLDS) ends with its title test's read; the held town shows no details. */
test("date guard: body holds end on their date, and a held town shows no organiser details", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  for (const [ine, until] of Object.entries(BODY_HOLDS)) {
    assert.ok(today <= until, `${ine}: the body hold ended ${until}; read the title test, remove the hold (its details and same-weekend links then show), deploy and log it`);
    const town = towns().find((t) => t.ine === ine)!;
    assert.ok(town.fairs.every((f) => f.details === null), `${ine}: held, so no details yet`);
  }
});

/** Date guard: the lead holds end with the Canyelles/Espinelves title review (20 Nov 2026). */
test("date guard: lead holds end on their date", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  for (const [ine, until] of Object.entries(LEAD_HOLDS)) {
    assert.ok(today <= until, `${ine}: the lead hold ended ${until}; read the title test (docs/SEO_EXPERIMENTS.md, 13 Nov), remove the hold so the lead gives the dates, and log it`);
  }
});

/** Date guard: Barcelona's snippet hold ends with the 3 Nov experiment's last reading (1 Dec 2026). */
test("date guard: snippet holds end on their date", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  for (const [ine, hold] of Object.entries(SNIPPET_HOLDS)) {
    assert.ok(today <= hold.until, `${ine}: the hold on ${hold.fairId} ended ${hold.until}; remove it (titles then name every fair) and log it in docs/SEO_EXPERIMENTS.md`);
    assert.ok(FAIRS.some((f) => f.id === hold.fairId && f.ine === ine), `${ine}: ${hold.fairId} is one of its fairs`);
  }
});

test("client: closed days inside a fair's dates (Girona: 25-26 Dec, 1 Jan)", () => {
  const girona: DatedFair[] = [{ id: "g", s: "2026-11-27", e: "2027-01-05", n: "Mercat de Nadal", t: "Girona", x: ["2026-12-25", "2026-12-26", "2027-01-01"] }];
  assert.equal(seasonStatus("2026-12-24", girona)?.state, "open");
  const christmas = seasonStatus("2026-12-25", girona)!;
  assert.ok(christmas.state === "upcoming" && christmas.nextOn === "2026-12-27" && christmas.nextIn === 2, JSON.stringify(christmas));
  const newYear = seasonStatus("2027-01-01", girona)!;
  assert.ok(newYear.state === "upcoming" && newYear.nextOn === "2027-01-02" && newYear.nextIn === 1);
  assert.equal(seasonStatus("2027-01-05", girona)?.state, "open");
  assert.equal(seasonStatus("2027-01-06", girona)?.state, "over");
  // A fair open today with another closed today: the closed one is the "next" to reopen.
  const both = seasonStatus("2026-12-25", [...girona, { id: "v", s: "2026-12-05", e: "2027-01-04", n: "Fira d'Artesania", t: "Vic" }])!;
  assert.ok(both.state === "open" && both.open.length === 1 && both.next?.id === "g" && both.nextOn === "2026-12-27");
  // The page embeds the closed days for the browser.
  const parts = readFileSync(join(ROOT, "src/components/programmatic/christmas-fairs/parts.tsx"), "utf8");
  assert.match(parts, /x: \[\.\.\.f\.closed\]/);
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
  // Lleida and Tarragona have no dated fair yet: no page. (Barcelona got its page on
  // 3 Nov 2026, when Santa Llúcia was published in the cultural agenda; Girona on
  // 13 Nov, from the council's agenda.)
  // (Tarragona published on 25 Nov 2026 and has a page: see the 25 Nov test.)
  for (const slug of ["lleida", "sitges", "igualada", "vilafranca-del-penedes"]) assert.equal(townBySlug(slug), null, slug);
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
  assert.deepEqual(englishTowns().map((t) => t.slug).sort(), ["barcelona", "figueres", "girona", "tarragona", "vic"]);
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
  assert.equal(resolveTown("ca", "ca", "lleida"), null, "no dated fair, no page");
  assert.equal(resolveTown("en", "en", "girona")?.ine, "17079");
  assert.equal(resolveTown("en", "en", "barcelona")?.ine, "08019");
  assert.equal(resolveTown("ca", "ca", "Olot"), null);
  assert.equal(resolveTown("ca", "ca", "no-such-town"), null);
  for (const locale of FAIRS_LOCALES) {
    const params = townStaticParams(locale);
    assert.ok(params.length <= PRERENDER && params.length > 0);
    assert.ok(params.every((p) => p.locale === locale && resolveTown(locale, locale, p.municipi)));
  }
  assert.equal(townStaticParams("ca")[0]?.municipi, "barcelona", "largest first (Barcelona since 3 Nov 2026)");
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
      // SNIPPET_HOLDS with `headline` (Canyelles): the H1 speaks of the held fair.
      const held = SNIPPET_HOLDS[t.ine]?.headline ? { ...t, fairs: t.fairs.filter((f) => f.id === SNIPPET_HOLDS[t.ine]!.fairId) } : t;
      assert.equal(townH1(t, locale), `${headline(held, locale)} ${SEASON_YEAR}`);
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
  // 13 Nov 2026 title experiment: the confirmed days in the title (Canyelles, Espinelves).
  for (const ine of DATED_TITLE_TOWNS) assert.ok(FAIRS.filter((f) => f.ine === ine).every((f) => f.checked), `${ine}: dates confirmed by the organiser`);
  assert.equal(townTitle(townBySlug("canyelles")!, "ca"), "Fira de Santa Llúcia de Canyelles 2026: 21 i 22 de novembre");
  assert.equal(townTitle(townBySlug("canyelles")!, "es"), "Feria de Santa Llúcia de Canyelles 2026: 21–22 nov.");
  assert.equal(townTitle(townBySlug("espinelves")!, "ca"), "Fira de l'Avet d'Espinelves 2026: 28 nov. – 8 des.");
  assert.equal(townTitle(townBySlug("espinelves")!, "es"), "Feria del Abeto de Espinelves 2026: 28 nov. – 8 dic.");
  // 13 Nov 2026: the council's agenda gives 5-8 Dec (the calendar, 5-6).
  assert.ok(ripoll.startsWith("Fira de Nadal de Ripoll: del 5 al 8 de desembre de 2026"), ripoll);
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
  // The page's own fairs, the day after the season's last one (Nadal al Port closes on 6 Jan 2027).
  const all = FAIRS.map((f) => ({ id: f.id, s: f.start, e: f.end, n: f.name, t: f.ine }));
  const last = FAIRS.reduce((m, f) => (f.end > m ? f.end : m), "");
  assert.equal(last, "2027-01-06");
  assert.equal(seasonStatus("2027-01-07", all)?.state, "over");
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
  // With the organiser's hours read (24 Nov 2026): 10 to 21 h on its open days.
  assert.equal(events[0]!.startDate, "2026-12-05T10:00:00+01:00");
  assert.equal(events[0]!.endDate, "2027-01-04T21:00:00+01:00");
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

test("links (3 Nov 2026): hub and town pages link the Three Kings parade; the hub and Barcelona's page, Barcelona in December", () => {
  const hub = readFileSync(join(ROOT, "src/components/programmatic/christmas-fairs/HubPage.tsx"), "utf8");
  assert.match(hub, /const guides = \(\[[^\]]*"barcelonaDecember"[^\]]*"reis"[^\]]*\] as const\)/);
  const town = readFileSync(join(ROOT, "src/components/programmatic/christmas-fairs/TownPage.tsx"), "utf8");
  assert.match(town, /const GUIDES = \[[^\]]*"reis"[^\]]*\] as const;/);
  assert.match(town, /town\.ine === BARCELONA_INE \? \(\["barcelonaDecember", \.\.\.GUIDES\]/);
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
    let source = readFileSync(join(ROOT, file), "utf8");
    if (file.endsWith("TownPage.tsx")) {
      // The one exception (27 Nov 2026, batch 9B): the seasonal "coming up" link reads the Madrid day, and the nightly
      // cron rebuilds the town pages on the nights it changes (lib/engagement/seasonal-refresh.ts, tests/seasonal-refresh.test.ts).
      const seasonal = /const onward = townFamilyOnward\(\{\s*self: townPath\(locale, town\.slug\),\s*locale,\s*today: todayInCatalonia\(\),/;
      assert.match(source, seasonal, "the seasonal link's clock");
      source = source.replace(seasonal, "");
    }
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
  walk(UNCONFIRMED_FAIRS);
  assert.ok(links.length > 0);
  for (const link of links) {
    const http = /^http:\/\//.test(link) && HTTP_ONLY_HOSTS.includes(new URL(link).hostname);
    assert.match(link, http ? /^http:\/\/[^\s"<>]+$/ : /^https:\/\/[^\s"<>]+$/, link);
  }
});
