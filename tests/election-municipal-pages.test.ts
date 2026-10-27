import assert from "node:assert/strict";
import { test } from "node:test";

import { ELECTION_NIGHT } from "../src/lib/content/batch02/election-night.ts";
import { MUNICIPAL_RESULTS } from "../src/lib/content/batch02/municipal-results.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { ELECTION_NIGHT_RESULTS_URL, NEXT_MUNICIPAL, buildElectionPage, caEl } from "../src/lib/programmatic/elections/model.ts";
import { displayName, slugify } from "../src/lib/programmatic/elections/names.ts";
import { hubCopy } from "../src/lib/programmatic/elections/hub.ts";
import {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  byComarca,
  electionDescription,
  electionPath,
  electionTitle,
  electionTranslations,
  electionsSitemap,
  electionsSitemapPaths,
  electionsStaticParams,
  hubMeta,
  hubPath,
  inCa,
  municipalitiesFor,
  ofCa,
  resolveElectionPage,
  resolveElectionsHub,
  siblings,
} from "../src/lib/programmatic/elections/pages.ts";
import { councilSize, dhondt, municipalView, regionalView, residents, share, thresholdVotes, turnout } from "../src/lib/programmatic/elections/results.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";
import { dayLine, daysBetween, electionDayStatus, madridDate } from "../src/lib/programmatic/elections/today.ts";
import type { Counts, Municipality } from "../src/lib/programmatic/elections/types.ts";
import { composeTitle } from "../src/lib/seo/metadata.ts";

const ALL = SNAPSHOT.municipalities;
const bySlug = (slug: string): Municipality => {
  const found = ALL.find((m) => m.slug === slug);
  assert.ok(found, `no ${slug} in the snapshot`);
  return found;
};

/* -------------------------------------------------------------------------- */
/* Snapshot shape and invariants                                              */
/* -------------------------------------------------------------------------- */

test("the snapshot holds the 100 most populous municipalities, largest first, with unique slugs", () => {
  assert.equal(ALL.length, 100);
  for (let i = 1; i < ALL.length; i++) assert.ok(ALL[i - 1]!.population >= ALL[i]!.population, `order at ${ALL[i]!.slug}`);
  assert.equal(new Set(ALL.map((m) => m.slug)).size, 100);
  assert.equal(new Set(ALL.map((m) => m.code)).size, 100);
  for (const m of ALL) {
    assert.match(m.code, /^\d{5}$/);
    assert.equal(m.idescat.slice(0, 5), m.code);
    assert.equal(m.slug, slugify(m.name));
    assert.match(m.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(m.comarca && m.province, `${m.slug}: comarca and province`);
    assert.ok(["Barcelona", "Girona", "Lleida", "Tarragona"].includes(m.province), `${m.slug}: ${m.province}`);
  }
  assert.equal(ALL[0]!.slug, "barcelona");
  // Population ranking: Idescat, 1 January 2025 (read 27 Oct 2026). 100th: Abrera, 13,227.
  assert.equal(SNAPSHOT.sources.population.period, "2025-01-01");
  assert.equal(ALL[99]!.name, "Abrera");
  assert.equal(ALL[99]!.population, 13227);
});

test("the snapshot carries its sources, official and https, with ISO dates", () => {
  assert.match(SNAPSHOT.readAt, /^\d{4}-\d{2}-\d{2}$/);
  for (const source of Object.values(SNAPSHOT.sources)) {
    assert.match(source.url, /^https:\/\/(analisi\.transparenciacatalunya\.cat|www\.idescat\.cat)\//, source.url);
    assert.match(source.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(source.updated <= SNAPSHOT.readAt, `${source.name} updated after it was read`);
    assert.ok(source.name && source.publisher);
  }
  assert.deepEqual(
    [SNAPSHOT.elections.municipal, SNAPSHOT.elections.congress, SNAPSHOT.elections.parliament].map((e) => [e.id, e.date]),
    [["M20231", "2023-05-28"], ["G20231", "2023-07-23"], ["A20241", "2024-05-12"]],
  );
});

function assertCounts(c: Counts, label: string) {
  assert.equal(c.listVotes + c.blankVotes, c.validVotes, `${label}: lists + blank = valid`);
  assert.equal(c.validVotes + c.nullVotes, c.voters, `${label}: valid + null = voters`);
  assert.ok(c.voters <= c.electorate && c.voters > 0, `${label}: voters`);
}

test("every count adds up, in every municipality and election", () => {
  for (const m of ALL) {
    assertCounts(m.municipal, `${m.slug} municipal`);
    assertCounts(m.congress, `${m.slug} congress`);
    assertCounts(m.parliament, `${m.slug} parliament`);
    assert.equal(m.municipal.lists.reduce((a, l) => a + l.votes, 0), m.municipal.listVotes, `${m.slug}: municipal lists`);
    assert.equal(m.municipal.lists.reduce((a, l) => a + l.seats, 0), m.municipal.seats, `${m.slug}: councillors`);
    assert.equal(Object.values(m.congress.votes).reduce((a, b) => a + b, 0), m.congress.listVotes, `${m.slug}: congress lists`);
    assert.equal(Object.values(m.parliament.votes).reduce((a, b) => a + b, 0), m.parliament.listVotes, `${m.slug}: parliament lists`);
    for (const code of [...Object.keys(m.congress.votes)]) assert.ok(SNAPSHOT.elections.congress.lists?.[code], `${m.slug}: unknown congress list ${code}`);
    for (const code of [...Object.keys(m.parliament.votes)]) assert.ok(SNAPSHOT.elections.parliament.lists?.[code], `${m.slug}: unknown parliament list ${code}`);
  }
  for (const key of ["congress", "parliament"] as const) {
    assertCounts(SNAPSHOT.catalonia[key].total, `Catalonia ${key}`);
    assertCounts(SNAPSHOT.catalonia[key].abroad, `abroad ${key}`);
    assertCounts(residents(SNAPSHOT.catalonia[key]), `residents ${key}`);
  }
  assertCounts(SNAPSHOT.catalonia.municipal, "Catalonia municipal");
  assert.equal(Object.values(SNAPSHOT.catalonia.congress.seats).reduce((a, b) => a + b, 0), 48);
  assert.equal(Object.values(SNAPSHOT.catalonia.parliament.seats).reduce((a, b) => a + b, 0), 135);
});

test("council sizes follow LOREG art. 179 and D'Hondt with the 5 % threshold reproduces every official seat", () => {
  for (const m of ALL) {
    assert.equal(councilSize(m.municipal.censusPopulation), m.municipal.seats, `${m.slug}: council size`);
    const { seats } = dhondt(m.municipal.lists, m.municipal.seats, m.municipal.validVotes);
    for (const list of m.municipal.lists) assert.equal(seats[list.code], list.seats, `${m.slug}: ${list.short}`);
  }
  // The scale itself, at its edges.
  assert.deepEqual([100, 101, 250, 251, 1000, 1001, 2000, 2001, 5000, 5001, 10000, 10001, 20000, 20001, 50000, 50001, 100000].map(councilSize), [3, 5, 5, 7, 7, 9, 9, 11, 11, 13, 13, 17, 17, 21, 21, 25, 25]);
  assert.equal(councilSize(100_001), 27, "26 is even, so one more");
  assert.equal(councilSize(215_760), 27);
  assert.equal(councilSize(1_636_193), 41);
  assert.equal(thresholdVotes(77_704), 3886, "5 % of 77,704 is 3,885.2");
  assert.equal(thresholdVotes(100), 5);
});

/* -------------------------------------------------------------------------- */
/* Known answers, read from the official source on 27 Oct 2026                */
/* -------------------------------------------------------------------------- */

/**
 * Read directly from analisi.transparenciacatalunya.cat on 27 Oct 2026
 * (irrv-2mfc and ntc4-rnwr, `id_nivell_territorial='MU'`), independently of
 * the snapshot script. [short, name, votes, councillors].
 */
const KNOWN = {
  sabadell: {
    municipal: { electorate: 156546, voters: 78796, nullVotes: 1092, blankVotes: 1184, validVotes: 77704, seats: 27 },
    lists: [
      ["PSC-CP", "Partit dels Socialistes de Catalunya - Candidatura de Progrés", 35799, 14],
      ["ERC-EUiA-AM", "Esquerra Republicana de Catalunya - EUiA - Acord Municipal", 8592, 3],
      ["CpS-AMUNT", "Crida per Sabadell - Alternativa Municipalista", 8018, 3],
      ["CM", "Junts per Sabadell - Compromís Municipal", 6319, 2],
      ["SECP -C", "Sabadell En Comú Podem - Confluència", 5636, 2],
      ["VOX", "VOX", 5087, 2],
      ["PP", "Partido Popular", 4557, 1],
      ["SSBD", "Sentim Sabadell", 939, 0],
      ["Cs", "Ciutadans - Partido de la Ciudadanía", 884, 0],
      ["PDeCAT-ARA PL", "Partit Demòcrata Europeu Català - Ara Pacte Local", 400, 0],
      ["VALENTS", "Valents", 289, 0],
    ],
    congress: { electorate: 155301, voters: 103041, validVotes: 102167, PSC: 39729 },
    parliament: { electorate: 156552, voters: 87835, validVotes: 87191, PSC: 28292 },
  },
  girona: {
    municipal: { electorate: 68515, voters: 34822, nullVotes: 553, blankVotes: 554, validVotes: 34269, seats: 27 },
    lists: [
      ["PSC-CP", "Partit dels Socialistes de Catalunya - Candidatura de Progrés", 8644, 8],
      ["GGi-AMUNT", "Guanyem Girona - Alternativa Municipalista", 7989, 8],
      ["CM", "Junts Girona - Compromís Municipal", 6950, 6],
      ["ERC-AM", "Esquerra Republicana de Catalunya - Acord Municipal", 3151, 3],
      ["PP", "Partido Popular", 1791, 1],
      ["VOX", "VOX", 1740, 1],
      ["ARA GIRONA- ARA PL", "Ara Girona - Ara Pacte Local", 1579, 0],
    ],
    congress: { electorate: 67444, voters: 42184, validVotes: 41778, PSC: 12252 },
    parliament: { electorate: 68486, voters: 40337, validVotes: 39998, PSC: 8518 },
  },
  lleida: {
    municipal: { electorate: 93444, voters: 48133, nullVotes: 842, blankVotes: 1040, validVotes: 47291, seats: 27 },
    lists: [
      ["PSC-UNITS-CP", "Partit dels Socialistes de Catalunya - Units - Candidatura de Progrés", 12979, 9],
      ["PP", "Partido Popular", 7348, 5],
      ["ERC-AM", "Esquerra Republicana de Catalunya - Acord Municipal", 7199, 5],
      ["CM", "Junts per Catalunya Lleida - Compromís Municipal", 6862, 5],
      ["VOX", "VOX", 3575, 2],
      ["Comúdelleida-C", "Comú de Lleida - Confluència", 2373, 1],
      ["ARA PL", "Activem Lleida - Ara Pacte Local", 2258, 0],
      ["CUP-AMUNT", "Candidatura d’Unitat Popular Lleida - Alternativa Municipalista", 2170, 0],
    ],
    congress: { electorate: 92894, voters: 56421, validVotes: 55823, PSC: 19367 },
    parliament: { electorate: 93468, voters: 50170, validVotes: 49714, PSC: 12648 },
  },
  barcelona: {
    municipal: { electorate: 1109116, voters: 672053, nullVotes: 6307, blankVotes: 6788, validVotes: 665746, seats: 41 },
    lists: [
      ["TriasxBCN-CM", "Trias per Barcelona - Compromís Municipal", 149479, 11],
      ["PSC-CP", "Partit dels Socialistes de Catalunya - Bo per Barcelona - Units - Candidatura de Progrés", 131923, 10],
      ["Barcelona en Comú-C", "Barcelona En Comú - Confluència", 131581, 9],
      ["ERC-AM", "Esquerra Republicana de Catalunya - Acord Municipal", 74804, 5],
      ["PP", "Partido Popular", 61362, 4],
      ["VOX", "VOX", 37990, 2],
    ],
    congress: { electorate: 1084347, voters: 730726, validVotes: 726293, PSC: 241003 },
    parliament: { electorate: 1088879, voters: 668022, validVotes: 664338, PSC: 185260 },
  },
} as const;

test("known answers: four municipalities match the official source exactly", () => {
  for (const [slug, known] of Object.entries(KNOWN)) {
    const m = bySlug(slug);
    for (const [field, value] of Object.entries(known.municipal)) {
      assert.equal(m.municipal[field as keyof typeof known.municipal], value, `${slug} municipal ${field}`);
    }
    known.lists.forEach(([short, name, votes, seats], i) => {
      const list = m.municipal.lists[i];
      assert.deepEqual([list?.short, list?.name, list?.votes, list?.seats], [short, name, votes, seats], `${slug} list ${i + 1}`);
    });
    for (const key of ["congress", "parliament"] as const) {
      const k = known[key];
      assert.equal(m[key].electorate, k.electorate, `${slug} ${key} electorate`);
      assert.equal(m[key].voters, k.voters, `${slug} ${key} voters`);
      assert.equal(m[key].validVotes, k.validVotes, `${slug} ${key} valid`);
      assert.equal(m[key].votes["6"], k.PSC, `${slug} ${key} PSC (list code 6)`);
    }
  }
  // Barcelona 2023, as the municipal-results guide states it: 60.59 % turnout.
  assert.equal(turnout(bySlug("barcelona").municipal).toFixed(2), "60.59");
});

test("known answers: Catalonia's vote from abroad is the four 'Residents Absents' rows", () => {
  const abroad = SNAPSHOT.catalonia.congress.abroad;
  assert.equal(abroad.electorate, 217682 + 24016 + 18277 + 21576);
  assert.equal(abroad.voters, 21434 + 2335 + 1758 + 1992);
  // Official Catalonia turnout for Congress 2023, including the vote from abroad: 62.7 %.
  assert.equal(turnout(SNAPSHOT.catalonia.congress.total).toFixed(1), "62.7");
  assert.equal(SNAPSHOT.catalonia.congress.total.electorate, 5703784);
});

/* -------------------------------------------------------------------------- */
/* Percentages                                                                */
/* -------------------------------------------------------------------------- */

test("percentages are computed from counts and sum to 100 with blank votes", () => {
  for (const m of ALL) {
    const mv = municipalView(m.municipal);
    const total = mv.rows.reduce((a, r) => a + r.share, 0) + mv.blankShare;
    assert.ok(Math.abs(total - 100) < 1e-9, `${m.slug}: municipal shares sum to ${total}`);
    for (const row of mv.rows) assert.equal(row.share, share(row.votes, m.municipal.validVotes));
    // Printed to one decimal, the rounding error stays within half a tenth per row.
    const printed = mv.rows.reduce((a, r) => a + Number(r.share.toFixed(1)), 0) + Number(mv.blankShare.toFixed(1));
    assert.ok(Math.abs(printed - 100) <= 0.05 * (mv.rows.length + 1) + 1e-9, `${m.slug}: printed shares ${printed}`);

    for (const key of ["congress", "parliament"] as const) {
      const view = regionalView(m[key], SNAPSHOT.catalonia[key], SNAPSHOT.elections[key].lists ?? {});
      const local = view.rows.reduce((a, r) => a + r.share, 0) + view.others.share + view.blank.share;
      const region = view.rows.reduce((a, r) => a + r.cataloniaShare, 0) + view.others.cataloniaShare + view.blank.cataloniaShare;
      assert.ok(Math.abs(local - 100) < 1e-9, `${m.slug} ${key}: local shares ${local}`);
      assert.ok(Math.abs(region - 100) < 1e-9, `${m.slug} ${key}: Catalonia shares ${region}`);
      assert.ok(view.turnout > 0 && view.turnout < 100);
    }
  }
});

test("turnout is voters over electorate, never the source's percentage fields", () => {
  const sabadell = bySlug("sabadell");
  assert.equal(turnout(sabadell.municipal), (78796 / 156546) * 100);
  const view = regionalView(sabadell.congress, SNAPSHOT.catalonia.congress, SNAPSHOT.elections.congress.lists ?? {});
  assert.equal(view.turnout, (103041 / 155301) * 100);
  const region = residents(SNAPSHOT.catalonia.congress);
  assert.equal(view.cataloniaTurnout, (region.voters / region.electorate) * 100);
});

/* -------------------------------------------------------------------------- */
/* Party names exactly as in the source                                       */
/* -------------------------------------------------------------------------- */

test("list names reach the page exactly as the source writes them", () => {
  for (const locale of LOCALES) {
    const model = buildElectionPage(bySlug("sabadell"), locale);
    const cells = model.municipal.table.rows.map((row) => row[0]);
    KNOWN.sabadell.lists.forEach(([short, name], i) => assert.equal(cells[i], `${short}\n${name}`, `${locale} row ${i + 1}`));
    const labels = SNAPSHOT.elections.congress.lists ?? {};
    for (const row of model.congress.table.rows) {
      const [short, name] = row[0]!.split("\n");
      assert.ok(Object.values(labels).some((l) => l.short === short && l.name === name), `${locale}: congress ${short}`);
    }
  }
  // The Catalonia-level labels of the 2024 Parliament lists, verbatim.
  const parliament = SNAPSHOT.elections.parliament.lists ?? {};
  assert.deepEqual(parliament["1143"], { short: "CAT-JUNTS+", name: "Junts + Carles Puigdemont per Catalunya-Junts+" });
  assert.deepEqual(parliament["6"], { short: "PSC", name: "Partit dels Socialistes de Catalunya (PSC-PSOE)" });
});

test("no source name contains inline-formatting characters, so summaries print it verbatim", () => {
  const names = [
    ...ALL.flatMap((m) => m.municipal.lists.flatMap((l) => [l.short, l.name])),
    ...Object.values(SNAPSHOT.elections.congress.lists ?? {}).flatMap((l) => [l.short, l.name]),
    ...Object.values(SNAPSHOT.elections.parliament.lists ?? {}).flatMap((l) => [l.short, l.name]),
    ...ALL.flatMap((m) => [m.name, m.comarca, m.mayor?.name ?? ""]),
  ];
  for (const name of names) assert.doesNotMatch(name, /[*_`[\]]/, name);
});

/* -------------------------------------------------------------------------- */
/* Routing                                                                    */
/* -------------------------------------------------------------------------- */

test("each route serves only its own locale; anything else is a 404", () => {
  assert.equal(resolveElectionPage("ca", "ca", "sabadell")?.slug, "sabadell");
  assert.equal(resolveElectionPage("es", "es", "sabadell")?.slug, "sabadell");
  assert.equal(resolveElectionPage("en", "en", "sabadell")?.slug, "sabadell");
  // Wrong locale on a route folder.
  assert.equal(resolveElectionPage("ca", "es", "sabadell"), null, "/es/eleccions/sabadell/");
  assert.equal(resolveElectionPage("ca", "en", "sabadell"), null, "/en/eleccions/sabadell/");
  assert.equal(resolveElectionPage("es", "ca", "sabadell"), null, "/ca/elecciones/sabadell/");
  assert.equal(resolveElectionPage("en", "ca", "barcelona"), null, "/ca/elections/barcelona/");
  // English only for the ten largest: Girona is 11th.
  assert.equal(municipalitiesFor("en").length, 10);
  assert.equal(resolveElectionPage("en", "en", "girona"), null);
  assert.equal(resolveElectionPage("ca", "ca", "girona")?.name, "Girona");
  // Outside the 100, unknown and malformed slugs.
  assert.equal(resolveElectionPage("ca", "ca", "castellbisbal"), null, "101st");
  assert.equal(resolveElectionPage("ca", "ca", "Sabadell"), null);
  assert.equal(resolveElectionPage("ca", "ca", "../sabadell"), null);
  assert.equal(resolveElectionPage("ca", "xx", "sabadell"), null);
  // Hubs.
  assert.equal(resolveElectionsHub("ca", "ca"), true);
  assert.equal(resolveElectionsHub("ca", "es"), false);
  assert.equal(resolveElectionsHub("en", "ca"), false);
});

test("only the 20 largest are prerendered, and only in their own locale", () => {
  assert.equal(electionsStaticParams("ca").length, 20);
  assert.equal(electionsStaticParams("es").length, 20);
  assert.equal(electionsStaticParams("en").length, 10);
  for (const locale of LOCALES) {
    // Every entry names both segments: an entry without `municipi` made Next prerender nothing.
    assert.ok(electionsStaticParams(locale).every((p) => p.locale === locale && p.municipi), locale);
    for (const p of electionsStaticParams(locale)) assert.ok(resolveElectionPage(locale, p.locale, p.municipi), `${locale}/${p.municipi}`);
  }
  assert.deepEqual(electionsStaticParams("ca")[0], { locale: "ca", municipi: "barcelona" });
});

test("paths, hreflang alternates and Catalan prepositions", () => {
  assert.equal(electionPath("ca", "sabadell"), "/ca/eleccions/sabadell/");
  assert.equal(electionPath("es", "sabadell"), "/es/elecciones/sabadell/");
  assert.equal(electionPath("en", "sabadell"), "/en/elections/sabadell/");
  assert.deepEqual(Object.keys(electionTranslations(bySlug("sabadell"))), ["ca", "es", "en"]);
  assert.deepEqual(Object.keys(electionTranslations(bySlug("girona"))), ["ca", "es"]);
  assert.equal(displayName("Hospitalet de Llobregat, l'"), "l'Hospitalet de Llobregat");
  assert.equal(displayName("Prat de Llobregat, el"), "el Prat de Llobregat");
  assert.equal(slugify("l'Hospitalet de Llobregat"), "l-hospitalet-de-llobregat");
  assert.equal(slugify("Palau-solità i Plegamans"), "palau-solita-i-plegamans");
  assert.equal(inCa("el Prat de Llobregat"), "al Prat de Llobregat");
  assert.equal(inCa("l'Hospitalet de Llobregat"), "a l'Hospitalet de Llobregat");
  assert.equal(ofCa("Igualada"), "d'Igualada");
  assert.equal(ofCa("el Vendrell"), "del Vendrell");
  assert.equal(ofCa("la Garriga"), "de la Garriga");
  assert.equal(ofCa("Sabadell"), "de Sabadell");
  assert.equal(caEl("2025-10-01"), "l'1 d'octubre de 2025");
  assert.equal(caEl("2023-06-17"), "el 17 de juny de 2023");
});

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

test("titles fit 60 characters with the place and the year; descriptions fit 155", () => {
  for (const locale of LOCALES) {
    const titles = new Set<string>();
    for (const m of municipalitiesFor(locale)) {
      const title = electionTitle(locale, m);
      const rendered = composeTitle(title, electionPath(locale, m.slug), "2026-10-27");
      const shown = typeof rendered === "string" ? `${rendered} · CatalunyaInfo` : rendered.absolute;
      assert.ok(title.length <= TITLE_LIMIT, `${locale}/${m.slug}: ${title.length} "${title}"`);
      assert.ok(shown.length <= 60, `${locale}/${m.slug}: rendered ${shown.length}`);
      assert.match(title, /2023/);
      assert.ok(title.toLowerCase().includes(m.name.toLowerCase()), `${locale}/${m.slug}: place in the title`);
      titles.add(title);
      const description = electionDescription(locale, m);
      assert.ok(description.length <= DESCRIPTION_LIMIT && description.length >= 70, `${locale}/${m.slug}: description ${description.length}`);
    }
    assert.equal(titles.size, municipalitiesFor(locale).length, `${locale}: titles are unique`);
    const hub = hubMeta(locale);
    assert.ok(hub.title.length <= TITLE_LIMIT, `${locale} hub title ${hub.title.length}`);
    assert.ok(hub.description.length <= DESCRIPTION_LIMIT, `${locale} hub description ${hub.description.length}`);
  }
  // The brief's own wording, where it fits.
  assert.equal(electionTitle("ca", bySlug("vic")), "Resultats eleccions Vic: municipals 2023, generals i 29N");
  assert.equal(electionTitle("es", bySlug("sabadell")), "Resultados elecciones Sabadell: municipales 2023 y 29N");
});

/* -------------------------------------------------------------------------- */
/* Client "today" logic                                                       */
/* -------------------------------------------------------------------------- */

test("the date is Madrid's, across midnight and both offsets", () => {
  // Winter time (UTC+1): 22:59:59 UTC on 28 Nov is still the 28th in Madrid; 23:00 is the 29th.
  assert.equal(madridDate(new Date("2026-11-28T22:59:59Z")), "2026-11-28");
  assert.equal(madridDate(new Date("2026-11-28T23:00:00Z")), "2026-11-29");
  assert.equal(madridDate(new Date("2026-11-29T22:59:59Z")), "2026-11-29");
  assert.equal(madridDate(new Date("2026-11-29T23:00:00Z")), "2026-11-30");
  // Summer time (UTC+2).
  assert.equal(madridDate(new Date("2026-07-01T21:59:59Z")), "2026-07-01");
  assert.equal(madridDate(new Date("2026-07-01T22:00:00Z")), "2026-07-02");
  assert.equal(daysBetween("2026-10-25", "2026-10-26"), 1, "across the clock change");
});

test("the 29N line: countdown, the day before, the day, the day after, and the server fallback", () => {
  const lines = buildElectionPage(bySlug("sabadell"), "ca").slot.lines;
  assert.equal(dayLine(null, lines), "Votació: diumenge 29 de novembre de 2026.");
  assert.equal(dayLine("2026-10-27", lines), "Falten 33 dies per a la votació, el diumenge 29 de novembre de 2026.");
  assert.equal(dayLine("2026-11-28", lines), lines.beforeOne);
  assert.equal(dayLine("2026-11-29", lines), lines.today);
  assert.equal(dayLine("2026-11-30", lines), lines.after, "the day after the last date");
  assert.equal(dayLine("2027-05-23", lines), lines.after);
  assert.deepEqual(electionDayStatus("2026-11-30"), { kind: "after", days: 1 });
  assert.deepEqual(electionDayStatus("2026-11-29"), { kind: "today" });
  for (const locale of LOCALES) {
    const l = buildElectionPage(bySlug("barcelona"), locale).slot.lines;
    assert.match(l.before, /\{days\}/);
    for (const text of [l.fallback, l.beforeOne, l.today, l.after]) assert.doesNotMatch(text, /\{days\}/);
  }
});

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

test("sitemap: 213 URLs with the snapshot date and their language alternates", () => {
  const entries = electionsSitemapPaths();
  assert.equal(entries.length, 3 + 100 + 100 + 10);
  assert.equal(new Set(entries.map((e) => e.path)).size, entries.length);
  for (const entry of entries) {
    assert.match(entry.path, /^\/(ca\/eleccions|es\/elecciones|en\/elections)\/([a-z0-9-]+\/)?$/);
    assert.equal(entry.lastModified, SNAPSHOT.readAt);
    assert.ok(Object.values(entry.translations).includes(entry.path), `${entry.path} lists itself`);
  }
  const girona = entries.find((e) => e.path === "/es/elecciones/girona/");
  assert.deepEqual(girona?.translations, { ca: "/ca/eleccions/girona/", es: "/es/elecciones/girona/" });
  const bcn = entries.find((e) => e.path === "/en/elections/barcelona/");
  assert.deepEqual(bcn?.translations, { ca: "/ca/eleccions/barcelona/", es: "/es/elecciones/barcelona/", en: "/en/elections/barcelona/" });
  assert.deepEqual(electionsSitemap(), [], "nothing on a deployment that may not be indexed");
});

/* -------------------------------------------------------------------------- */
/* Content rules                                                              */
/* -------------------------------------------------------------------------- */

const pageText = (m: Municipality, locale: Locale) => JSON.stringify(buildElectionPage(m, locale));

test("neutral: no polls, forecasts or winners; no guessed results site; no template leaks", () => {
  for (const locale of LOCALES) {
    for (const m of municipalitiesFor(locale)) {
      const text = pageText(m, locale);
      assert.doesNotMatch(text, /enquest|sondeig|encuesta|sondeo|\bpolls?\b|previsi|pronòstic|pronóstico|forecast|projecci|proyecci|projection|guanyador|ganador|winner|victòria|victoria|victory/i, `${locale}/${m.slug}`);
      assert.doesNotMatch(text, /aerobusbcn|resultados\.[a-z]|https?:\/\/resultados|generales\d+j?\.es/i, `${locale}/${m.slug}`);
      assert.doesNotMatch(text, /\$\{|undefined|NaN|\[object/, `${locale}/${m.slug}`);
    }
  }
  assert.equal(ELECTION_NIGHT_RESULTS_URL, null, "no results-night link until Interior announces it");
});

test("each page carries its own data and the original guidance blocks", () => {
  const m = bySlug("sabadell");
  const ca = buildElectionPage(m, "ca");
  assert.equal(ca.h1, "Resultats de les eleccions a Sabadell");
  assert.match(ca.municipal.summary, /78\.796 persones d'un cens de 156\.546/);
  assert.match(ca.municipal.summary, /50,3 %/);
  assert.match(ca.seats.md.join(" "), /3\.886 vots/);
  assert.match(ca.seats.md.join(" "), /27è i últim regidor/);
  assert.match(ca.slot.md[0]!, /infoelectoral\.interior\.gob\.es\/ca\/elecciones-celebradas\/area-de-descargas/);
  assert.match(ca.next.md[0]!, /23 de maig de 2027/);
  assert.ok(ca.facts.some((f) => f.label === "Alcaldia" && f.value.startsWith("Marta Farrés Falgueras (PSC-CP)")));
  const es = buildElectionPage(bySlug("el-prat-de-llobregat"), "es");
  assert.equal(es.h1, "Resultados de las elecciones en El Prat de Llobregat");
  assert.equal(buildElectionPage(bySlug("el-prat-de-llobregat"), "ca").h1, "Resultats de les eleccions al Prat de Llobregat");
  // Where the two registers disagree on the mayor's name, the mayor is left out.
  const lleida = buildElectionPage(bySlug("lleida"), "ca");
  assert.equal(bySlug("lleida").mayor, null);
  assert.equal(lleida.municipal.mayor, null);
  assert.ok(!lleida.facts.some((f) => f.label === "Alcaldia"));
  // Deterministic: building twice gives the same page.
  assert.deepEqual(buildElectionPage(m, "en"), buildElectionPage(m, "en"));
});

test("siblings and the hub: every page is linked, by comarca", () => {
  for (const locale of LOCALES) {
    const linked = new Set(byComarca(locale).flatMap((g) => g.municipalities.map((m) => m.slug)));
    assert.equal(linked.size, municipalitiesFor(locale).length, `${locale}: hub lists every page`);
    for (const m of municipalitiesFor(locale)) {
      const { sameComarca, sameProvince } = siblings(m, locale);
      assert.ok(sameComarca.every((s) => s.comarca === m.comarca && s.slug !== m.slug));
      assert.ok(sameProvince.every((s) => s.province === m.province && s.comarca !== m.comarca));
      assert.ok(sameComarca.length + sameProvince.length > 0 || locale === "en", `${locale}/${m.slug} has siblings`);
    }
    assert.ok(hubCopy(locale).intro.join(" ").includes("](/"), `${locale}: hub links to the lookup page`);
  }
  assert.deepEqual(
    siblings(bySlug("sabadell"), "ca").sameComarca.map((m) => m.slug).slice(0, 2),
    ["terrassa", "sant-cugat-del-valles"],
  );
});

test("the next municipal elections: fourth Sunday of May 2027, decree 55 days before", () => {
  const day = new Date(`${NEXT_MUNICIPAL.day}T12:00:00Z`);
  assert.equal(day.getUTCDay(), 0, "a Sunday");
  assert.ok(day.getUTCDate() > 21 && day.getUTCDate() <= 28, "the fourth Sunday");
  assert.equal(daysBetween(NEXT_MUNICIPAL.decree, NEXT_MUNICIPAL.day), 55);
  assert.equal(daysBetween(NEXT_MUNICIPAL.decree, NEXT_MUNICIPAL.published), 1);
  // Same rule, checked against 2023: polling day 28 May, decree of 3 April.
  assert.equal(daysBetween("2023-04-03", "2023-05-28"), 55);
});

test("the lookup guide and the election-night guide each link to the hub once per language", () => {
  for (const locale of LOCALES) {
    const target = `(${hubPath(locale)})`;
    assert.equal(JSON.stringify(MUNICIPAL_RESULTS.editions[locale].blocks).split(target).length - 1, 1, `municipal results/${locale}`);
    assert.equal(JSON.stringify(ELECTION_NIGHT.editions[locale].blocks).split(target).length - 1, 1, `election night/${locale}`);
  }
});
