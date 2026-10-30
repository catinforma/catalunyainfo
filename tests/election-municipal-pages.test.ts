import assert from "node:assert/strict";
import { test } from "node:test";

import { ELECTION_NIGHT } from "../src/lib/content/batch02/election-night.ts";
import { MUNICIPAL_RESULTS } from "../src/lib/content/batch02/municipal-results.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import {
  ELECTION_NIGHT_RESULTS_URL,
  INTERIOR_CHECKED,
  NEXT_MUNICIPAL,
  buildElectionPage,
  caDelPct,
  caEl,
  caElPct,
  caTheOrdinal,
} from "../src/lib/programmatic/elections/model.ts";
import { displayName, slugify } from "../src/lib/programmatic/elections/names.ts";
import { TOURISM_REGISTER, hubCopy } from "../src/lib/programmatic/elections/hub.ts";
import {
  DESCRIPTION_LIMIT,
  EN_LARGEST,
  EN_RESORTS,
  PAGES_PER_LOCALE,
  PRERENDERED_PER_LOCALE,
  TITLE_LIMIT,
  byComarca,
  comarcaAnchor,
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

test("the snapshot holds the 300 most populous municipalities, largest first, with unique slugs", () => {
  assert.equal(ALL.length, 300);
  for (let i = 1; i < ALL.length; i++) assert.ok(ALL[i - 1]!.population >= ALL[i]!.population, `order at ${ALL[i]!.slug}`);
  assert.equal(new Set(ALL.map((m) => m.slug)).size, 300);
  assert.equal(new Set(ALL.map((m) => m.code)).size, 300);
  for (const m of ALL) {
    assert.match(m.code, /^\d{5}$/);
    assert.equal(m.idescat.slice(0, 5), m.code);
    assert.equal(m.slug, slugify(m.name));
    assert.match(m.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(m.comarca && m.province, `${m.slug}: comarca and province`);
    assert.ok(["Barcelona", "Girona", "Lleida", "Tarragona"].includes(m.province), `${m.slug}: ${m.province}`);
  }
  assert.equal(ALL[0]!.slug, "barcelona");
  // Population ranking: Idescat, 1 January 2025, read 27 Oct 2026 (tranche 1)
  // and 29 Oct 2026 (tranche 2, same release). 100th: Abrera, 13,227; 101st:
  // Castellbisbal, 13,061; 300th: Castellet i la Gornal, 2,776 (301st:
  // Linyola, 2,762, not included).
  assert.equal(SNAPSHOT.sources.population.period, "2025-01-01");
  assert.deepEqual([ALL[99]!.name, ALL[99]!.population], ["Abrera", 13227]);
  assert.deepEqual([ALL[100]!.name, ALL[100]!.population], ["Castellbisbal", 13061]);
  assert.deepEqual([ALL[299]!.name, ALL[299]!.population], ["Castellet i la Gornal", 2776]);
  assert.ok(!ALL.some((m) => m.slug === "linyola"));
  // Tranche 1's hundred are still the first hundred, in the same order.
  assert.deepEqual(
    ALL.slice(0, 5).map((m) => m.slug),
    ["barcelona", "l-hospitalet-de-llobregat", "terrassa", "badalona", "sabadell"],
  );
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

/**
 * Tranche 2: read on 29 Oct 2026 straight from analisi.transparenciacatalunya.cat
 * (irrv-2mfc and ntc4-rnwr, `id_nivell_territorial='MU'`, one SoQL query per
 * town and election, outside the snapshot script). The first new town (101st),
 * the last (300th), a Costa Brava resort, the Aran's capital and Salou.
 * [short, name, votes, councillors], as the source writes them.
 */
const KNOWN_T2 = {
  castellbisbal: {
    rank: 101,
    municipal: { electorate: 9628, voters: 5523, nullVotes: 74, blankVotes: 68, validVotes: 5449, seats: 17, censusPopulation: 12735 },
    lists: [
      ["ALTpCB-C", "Alternativa per Castellbisbal - Confluència", 1577, 5],
      ["CP", "Som-hi Castellbisbal - Candidatura de Progrés", 1350, 5],
      ["SOM VEU", "Som Veu - Som Veïnes i Veïns d'Urbanitzacions de Castellbisbal", 835, 3],
      ["CM", "Junts per Catalunya Castellbisbal - Compromís Municipal", 539, 2],
      ["ERC-AM", "Esquerra Republicana de Catalunya - Acord Municipal", 414, 1],
      ["VOX", "VOX", 325, 1],
      ["CUP-AMUNT", "Candidatura d'Unitat Popular - Alternativa Municipalista", 180, 0],
      ["Cs", "Ciutadans - Partido de la Ciudadanía", 161, 0],
    ],
    congress: { electorate: 9584, voters: 6748, validVotes: 6682, PSC: 2313 },
    parliament: { electorate: 9750, voters: 5853, validVotes: 5784, PSC: 1697 },
  },
  "castellet-i-la-gornal": {
    rank: 300,
    municipal: { electorate: 1979, voters: 1015, nullVotes: 20, blankVotes: 24, validVotes: 995, seats: 11, censusPopulation: 2474 },
    lists: [
      ["PSC-CP", "Partit dels Socialistes de Catalunya - Candidatura de Progrés", 424, 5],
      ["CM", "Junts per Castellet I la Gornal - Compromís Municipal", 224, 3],
      ["ERC-AM", "Esquerra Republicana de Catalunya - Acord Municipal", 181, 2],
      ["VALENTS", "Valents", 142, 1],
    ],
    congress: { electorate: 1974, voters: 1232, validVotes: 1217, PSC: 443 },
    parliament: { electorate: 2005, voters: 1076, validVotes: 1063, PSC: 318 },
  },
  "tossa-de-mar": {
    rank: 185,
    municipal: { electorate: 4044, voters: 2498, nullVotes: 49, blankVotes: 47, validVotes: 2449, seats: 13, censusPopulation: 5956 },
    lists: [
      ["CM", "+ Tossa - Compromís Municipal", 759, 5],
      ["TU-IdSELVA", "Tossa Unida - Independents de la Selva", 554, 3],
      ["ENDAVANT TOSSA-FIC", "Endavant Tossa - FIC", 520, 3],
      ["TOSSA SEMPRE!", "Tossa Sempre!", 282, 2],
      ["PP", "Partido Popular", 133, 0],
      ["ERC-AM", "Esquerra Republicana de Catalunya - Acord Municipal", 105, 0],
      ["PSC-CP", "Socialistes de Tossa - Partit dels Socialistes de Catalunya - Candidatura de Progrés", 49, 0],
    ],
    congress: { electorate: 3945, voters: 2486, validVotes: 2445, PSC: 715 },
    parliament: { electorate: 3981, voters: 2130, validVotes: 2105, PSC: 494 },
  },
  "vielha-e-mijaran": {
    rank: 198,
    municipal: { electorate: 3863, voters: 2285, nullVotes: 41, blankVotes: 48, validVotes: 2244, seats: 13, censusPopulation: 5581 },
    lists: [
      ["UA-PSC-CP", "Unitat d'Aran - Partit dels Socialistes de Catalunya - Candidatura de Progrés", 1188, 8],
      ["CDA-PNA", "Convergéncia Democratica Aranesa - Partit Nacionalista Aranés", 577, 3],
      ["AA-AM", "Aran Amassa - Acord Municipal", 308, 2],
      ["VOX", "VOX", 62, 0],
      ["PP", "Partido Popular", 61, 0],
    ],
    congress: { electorate: 3758, voters: 2307, validVotes: 2275, PSC: 813 },
    parliament: { electorate: 3754, voters: 1751, validVotes: 1730, PSC: 638 },
  },
  salou: {
    rank: 46,
    municipal: { electorate: 16966, voters: 8093, nullVotes: 139, blankVotes: 104, validVotes: 7954, seats: 21, censusPopulation: 29028 },
    lists: [
      ["Sumen per Salou-PSC-CP", "Sumem per Salou - Partit dels Socialistes de Catalunya - Candidatura de Progrés", 2350, 8],
      ["ERC-AM", "Esquerra Republicana de Catalunya - Acord Municipal", 1289, 4],
      ["VOX", "VOX", 931, 3],
      ["PP", "Partido Popular", 787, 3],
      ["ARA PL", "Sempre Salou - Ara Pacte Local", 726, 2],
      ["USAP", "Unidos Salou Acció Plural", 416, 1],
      ["Cs", "Ciutadans - Partido de la Ciudadanía", 363, 0],
      ["CM", "Junts per Salou - Compromís Municipal", 335, 0],
      ["SECP-C", "Salou En Comú Podem - Confluència", 254, 0],
      ["CNV", "Convergents", 249, 0],
      ["VALENTS", "Valents", 76, 0],
      ["A per TGN", "Asamblea Por Tarragona", 74, 0],
    ],
    congress: { electorate: 16437, voters: 9740, validVotes: 9658, PSC: 3175 },
    parliament: { electorate: 16721, voters: 7983, validVotes: 7924, PSC: 2267 },
  },
} as const;

test("known answers, tranche 2: five more municipalities match the official source exactly", () => {
  for (const [slug, known] of Object.entries(KNOWN_T2)) {
    const m = bySlug(slug);
    assert.equal(ALL.indexOf(m) + 1, known.rank, `${slug} rank`);
    for (const [field, value] of Object.entries(known.municipal)) {
      assert.equal(m.municipal[field as keyof typeof known.municipal], value, `${slug} municipal ${field}`);
    }
    assert.equal(m.municipal.lists.length, known.lists.length, `${slug}: every list`);
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
});

test("known answers, tranche 2: the last seat in a council of 11, worked by hand", () => {
  // Castellet i la Gornal, 995 valid votes: threshold 50 (5 % = 49.75), all
  // four lists in. Quotients in order: 424, 224, 212, 181, 142, 141.3, 112,
  // 106, 90.5, 84.8, 74.7 (CM, 224 ÷ 3) = 11th seat; next 71 (VALENTS, 142 ÷ 2).
  const m = bySlug("castellet-i-la-gornal");
  const view = municipalView(m.municipal);
  assert.equal(view.threshold, 50);
  assert.equal(view.belowThreshold, 0);
  assert.deepEqual([view.dhondt.last?.code, view.dhondt.last?.divisor], [m.municipal.lists[1]!.code, 3]);
  assert.deepEqual([view.dhondt.nextOut?.votes, view.dhondt.nextOut?.divisor], [142, 2]);
  const ca = buildElectionPage(m, "ca").seats.md.join(" ");
  assert.match(ca, /L'11è i últim regidor el va obtenir CM, amb un quocient de 74,7 \(224 vots ÷ 3\)/);
  assert.match(ca, /71 \(VALENTS, 142 ÷ 2\)/);
  assert.match(buildElectionPage(m, "es").seats.md.join(" "), /El 11\.º y último concejal lo obtuvo CM/);
  assert.match(buildElectionPage(m, "ca").seats.md.join(" "), /amb 2\.474 habitants al padró de referència/);
  // Catalan elides the article before 1 and 11 in percentages too.
  assert.equal(caElPct("11,2 %"), "l'11,2 %");
  assert.equal(caDelPct("1,5 %"), "de l'1,5 %");
  assert.equal(caDelPct("50,3 %"), "del 50,3 %");
  assert.equal(caElPct("10,9 %"), "el 10,9 %");
  assert.equal(caElPct("1.234"), "el 1.234", "a thousands separator is not a decimal comma");
  assert.equal(caTheOrdinal(13), "El 13è");
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
  // English: the 11 largest (Girona is 11th) and the resorts; Sant Cugat (12th) is not one.
  assert.equal(municipalitiesFor("en").length, 30);
  assert.equal(resolveElectionPage("en", "en", "girona")?.name, "Girona");
  assert.equal(resolveElectionPage("en", "en", "salou")?.name, "Salou");
  assert.equal(resolveElectionPage("en", "en", "tossa-de-mar")?.name, "Tossa de Mar");
  assert.equal(resolveElectionPage("en", "en", "sant-cugat-del-valles"), null, "12th, not a resort");
  assert.equal(resolveElectionPage("en", "en", "castellbisbal"), null);
  assert.equal(resolveElectionPage("ca", "ca", "sant-cugat-del-valles")?.name, "Sant Cugat del Vallès");
  // Tranche 2 in Catalan and Spanish: the 101st to the 300th now resolve.
  assert.equal(resolveElectionPage("ca", "ca", "castellbisbal")?.name, "Castellbisbal", "101st");
  assert.equal(resolveElectionPage("es", "es", "castellbisbal")?.name, "Castellbisbal");
  assert.equal(resolveElectionPage("ca", "ca", "castellet-i-la-gornal")?.name, "Castellet i la Gornal", "300th");
  assert.equal(resolveElectionPage("es", "es", "vielha-e-mijaran")?.name, "Vielha e Mijaran");
  assert.equal(resolveElectionPage("es", "ca", "castellbisbal"), null, "/ca/elecciones/castellbisbal/");
  assert.equal(resolveElectionPage("ca", "es", "tossa-de-mar"), null, "/es/eleccions/tossa-de-mar/");
  // Outside the 300, unknown and malformed slugs.
  assert.equal(resolveElectionPage("ca", "ca", "linyola"), null, "301st");
  assert.equal(resolveElectionPage("es", "es", "linyola"), null, "301st");
  assert.equal(resolveElectionPage("ca", "ca", "prats-de-llucanes"), null, "302nd");
  assert.equal(resolveElectionPage("ca", "ca", "pals"), null, "a resort outside the 300 (318th)");
  assert.equal(resolveElectionPage("ca", "ca", "cadaques")?.name, "Cadaqués", "inside: 2,918 residents");
  assert.equal(resolveElectionPage("ca", "ca", "castellbisbal/"), null);
  assert.equal(resolveElectionPage("ca", "ca", ""), null);
  assert.equal(resolveElectionPage("ca", "ca", "Sabadell"), null);
  assert.equal(resolveElectionPage("ca", "ca", "../sabadell"), null);
  assert.equal(resolveElectionPage("ca", "xx", "sabadell"), null);
  // Hubs.
  assert.equal(resolveElectionsHub("ca", "ca"), true);
  assert.equal(resolveElectionsHub("ca", "es"), false);
  assert.equal(resolveElectionsHub("en", "ca"), false);
});

test("only the 20 largest are prerendered, and only in their own locale", () => {
  // 300 + 300 + 30 pages, 60 at build time: the rest render once on first request.
  assert.equal(PRERENDERED_PER_LOCALE, 20);
  assert.equal(electionsStaticParams("ca").length, 20);
  assert.equal(electionsStaticParams("es").length, 20);
  assert.equal(electionsStaticParams("en").length, 20);
  assert.deepEqual(
    electionsStaticParams("ca").map((p) => p.municipi),
    ALL.slice(0, 20).map((m) => m.slug),
  );
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
  assert.deepEqual(Object.keys(electionTranslations(bySlug("girona"))), ["ca", "es", "en"]);
  assert.deepEqual(Object.keys(electionTranslations(bySlug("sant-cugat-del-valles"))), ["ca", "es"]);
  assert.deepEqual(Object.keys(electionTranslations(bySlug("castellet-i-la-gornal"))), ["ca", "es"]);
  assert.deepEqual(Object.keys(electionTranslations(bySlug("l-escala"))), ["ca", "es", "en"]);
  assert.equal(inCa("l'Ametlla de Mar"), "a l'Ametlla de Mar");
  assert.equal(inCa("els Hostalets de Pierola"), "als Hostalets de Pierola");
  assert.equal(ofCa("Ulldecona"), "d'Ulldecona");
  assert.equal(ofCa("Hostalric"), "d'Hostalric");
  assert.equal(slugify("Castell d'Aro, Platja d'Aro i s'Agaró"), "castell-d-aro-platja-d-aro-i-s-agaro");
  assert.equal(displayName("Castell d'Aro, Platja d'Aro i s'Agaró"), "Castell d'Aro, Platja d'Aro i s'Agaró", "a comma that is not an article");
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
  // The two longest names (37 and 36 characters) fall back to the short forms.
  const platja = bySlug("castell-d-aro-platja-d-aro-i-s-agaro");
  assert.equal(electionTitle("ca", platja), "Eleccions Castell d'Aro, Platja d'Aro i s'Agaró: 2023 i 29N");
  assert.equal(electionTitle("es", platja), "Elecciones Castell d'Aro, Platja d'Aro i s'Agaró: 2023 y 29N");
  assert.equal(electionTitle("en", platja), "Castell d'Aro, Platja d'Aro i s'Agaró: 2023 election results");
  assert.equal(electionTitle("ca", bySlug("vandellos-i-l-hospitalet-de-l-infant")), "Eleccions Vandellòs i l'Hospitalet de l'Infant: 2023 i 29N");
  // 630 town pages, every one with its own title and description.
  assert.equal(LOCALES.reduce((n, locale) => n + municipalitiesFor(locale).length, 0), 630);
  for (const m of municipalitiesFor("ca")) {
    assert.doesNotMatch(electionDescription("ca", m), /\b(del|el) 1{1,2},/, `${m.slug}: Catalan elision`);
  }
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

test("sitemap: 633 URLs with the snapshot date and their language alternates", () => {
  const entries = electionsSitemapPaths();
  assert.equal(entries.length, 3 + 300 + 300 + 30);
  assert.equal(entries.filter((e) => e.path.startsWith("/ca/eleccions/")).length, 301);
  assert.equal(entries.filter((e) => e.path.startsWith("/es/elecciones/")).length, 301);
  assert.equal(entries.filter((e) => e.path.startsWith("/en/elections/")).length, 31);
  // Every sitemap URL resolves, and nothing that 404s is listed.
  for (const entry of entries) {
    const [, locale, , slug] = entry.path.split("/");
    if (!slug) continue;
    assert.ok(resolveElectionPage(locale as Locale, locale!, slug), `${entry.path} resolves`);
  }
  assert.ok(!entries.some((e) => e.path.includes("/linyola/")));
  assert.ok(!entries.some((e) => e.path === "/en/elections/sant-cugat-del-valles/"));
  assert.equal(new Set(entries.map((e) => e.path)).size, entries.length);
  for (const entry of entries) {
    assert.match(entry.path, /^\/(ca\/eleccions|es\/elecciones|en\/elections)\/([a-z0-9-]+\/)?$/);
    assert.equal(entry.lastModified, SNAPSHOT.readAt);
    assert.ok(Object.values(entry.translations).includes(entry.path), `${entry.path} lists itself`);
  }
  const santCugat = entries.find((e) => e.path === "/es/elecciones/sant-cugat-del-valles/");
  assert.deepEqual(santCugat?.translations, { ca: "/ca/eleccions/sant-cugat-del-valles/", es: "/es/elecciones/sant-cugat-del-valles/" });
  const tossa = entries.find((e) => e.path === "/en/elections/tossa-de-mar/");
  assert.deepEqual(tossa?.translations, { ca: "/ca/eleccions/tossa-de-mar/", es: "/es/elecciones/tossa-de-mar/", en: "/en/elections/tossa-de-mar/" });
  const bcn = entries.find((e) => e.path === "/en/elections/barcelona/");
  assert.deepEqual(bcn?.translations, { ca: "/ca/eleccions/barcelona/", es: "/es/elecciones/barcelona/", en: "/en/elections/barcelona/" });
  assert.deepEqual(electionsSitemap(), [], "nothing on a deployment that may not be indexed");
});

/* -------------------------------------------------------------------------- */
/* Content rules                                                              */
/* -------------------------------------------------------------------------- */

const pageText = (m: Municipality, locale: Locale) => JSON.stringify(buildElectionPage(m, locale));

/** The page minus every name copied from the source (a mayor called Maria Victoria is not a claim of victory). */
const ownText = (m: Municipality, locale: Locale) => {
  const labels = [SNAPSHOT.elections.congress.lists, SNAPSHOT.elections.parliament.lists, SNAPSHOT.general2026?.lists].flatMap((l) => Object.values(l ?? {}));
  const names = [m.mayor?.name ?? "", ...m.municipal.lists.flatMap((l) => [l.name, l.short]), ...labels.flatMap((l) => [l.name, l.short])]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  return names.reduce((text, name) => text.split(JSON.stringify(name).slice(1, -1)).join(""), pageText(m, locale));
};

test("neutral: no polls, forecasts or winners; no guessed results site; no template leaks", () => {
  for (const locale of LOCALES) {
    for (const m of municipalitiesFor(locale)) {
      const text = pageText(m, locale);
      assert.doesNotMatch(ownText(m, locale), /enquest|sondeig|encuesta|sondeo|\bpolls?\b|previsi|pronòstic|pronóstico|forecast|projecci|proyecci|projection|guanyador|ganador|winner|victòria|victoria|victory/i, `${locale}/${m.slug}`);
      assert.doesNotMatch(text, /aerobusbcn|resultados\.[a-z]|https?:\/\/resultados|generales\d+j?\.es/i, `${locale}/${m.slug}`);
      assert.doesNotMatch(text, /\$\{|undefined|NaN|\[object/, `${locale}/${m.slug}`);
      // Catalan elides before "u" and "onze": "l'11è", "de l'1,5 %", never "el 11,2 %".
      if (locale === "ca") assert.doesNotMatch(ownText(m, locale), /\b(el|del|El) 1{1,2}(,\d| %|è|r)/, `ca/${m.slug}: elision`);
    }
  }
  assert.equal(ELECTION_NIGHT_RESULTS_URL, null, "no results-night link until Interior announces it");
  // Re-checked 29 Oct 2026: Interior's 21 Oct note is a media-only repository, not a public site.
  assert.equal(INTERIOR_CHECKED, "2026-10-29");
  assert.match(buildElectionPage(bySlug("salou"), "ca").slot.md[1]!, /comprovat el 29 d'octubre de 2026/);
  assert.match(buildElectionPage(bySlug("salou"), "en").slot.md[1]!, /checked on 29 October 2026/);
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

test("siblings reach every page: each Catalan and Spanish page is linked from another town's page", () => {
  for (const locale of ["ca", "es"] as const) {
    const inbound = new Map<string, number>();
    for (const m of municipalitiesFor(locale)) {
      const { sameComarca, sameProvince } = siblings(m, locale);
      assert.ok(sameComarca.length + sameProvince.length <= 8, `${m.slug}: at most 8 links`);
      assert.equal(new Set([...sameComarca, ...sameProvince].map((x) => x.slug)).size, sameComarca.length + sameProvince.length);
      for (let i = 1; i < sameComarca.length; i++) assert.ok(sameComarca[i - 1]!.population >= sameComarca[i]!.population, `${m.slug}: largest first`);
      for (const x of [...sameComarca, ...sameProvince]) inbound.set(x.slug, (inbound.get(x.slug) ?? 0) + 1);
    }
    const orphans = municipalitiesFor(locale).filter((m) => !inbound.get(m.slug)).map((m) => m.slug);
    assert.deepEqual(orphans, [], `${locale}: pages only the hub links to`);
  }
  // In a comarca with more towns than links: its largest town, then the
  // nearest in size, and two links to other comarques.
  const small = siblings(bySlug("vallromanes"), "ca");
  assert.equal(small.sameComarca.length, 6);
  assert.equal(small.sameProvince.length, 2);
  assert.equal(small.sameComarca[0]!.slug, "granollers", "the Vallès Oriental's largest town");
  assert.ok(small.sameComarca.slice(1).every((x) => x.population < 20_000), "the rest are near Vallromanes in size");
  // Moià, the only page in the Moianès, is linked from towns of its size.
  assert.ok(municipalitiesFor("ca").some((m) => siblings(m, "ca").sameProvince.some((x) => x.slug === "moia")));
  // A comarca with a single page falls back to the province.
  const vielha = siblings(bySlug("vielha-e-mijaran"), "ca");
  assert.equal(vielha.sameComarca.length, 0);
  assert.equal(vielha.sameProvince.length, 4);
  assert.ok(vielha.sameProvince.every((x) => x.province === "Lleida"));
});

test("the English set: the 11 largest and the 19 resorts, all with Catalan and Spanish pages", () => {
  const en = municipalitiesFor("en");
  assert.equal(en.length, PAGES_PER_LOCALE.en);
  assert.equal(EN_LARGEST + EN_RESORTS.length, 30);
  assert.equal(new Set(EN_RESORTS).size, EN_RESORTS.length);
  const largest = ALL.slice(0, EN_LARGEST);
  assert.deepEqual(en.slice(0, 7).map((m) => m.slug), largest.slice(0, 7).map((m) => m.slug));
  for (const m of largest) assert.ok(en.includes(m), `${m.slug}: one of the 11 largest`);
  // The hub says the four provincial capitals are among the 11.
  for (const capital of ["barcelona", "girona", "lleida", "tarragona"]) assert.ok(largest.some((m) => m.slug === capital), capital);
  for (const slug of EN_RESORTS) {
    const m = bySlug(slug);
    assert.ok(ALL.indexOf(m) >= EN_LARGEST, `${slug} is a resort, not one of the 11`);
    assert.ok(en.includes(m), slug);
  }
  for (let i = 1; i < en.length; i++) assert.ok(en[i - 1]!.population >= en[i]!.population, "largest first");
  for (const m of en) assert.ok(municipalitiesFor("ca").includes(m) && municipalitiesFor("es").includes(m), `${m.slug} in ca and es`);
  const hub = hubCopy("en");
  assert.ok(hub.sources.some((s) => s.url === TOURISM_REGISTER.url), "the register the resorts come from is cited");
  assert.match(hub.intro.join(" "), /the 11 largest .* and the 19 with the most places/);
  assert.match(hub.intro.join(" "), /cover the 300 most populous/);
});

test("the hubs: 300 pages by comarca with a jump list, 30 in English", () => {
  for (const locale of LOCALES) {
    const groups = byComarca(locale);
    const anchors = groups.map((g) => comarcaAnchor(g.comarca));
    assert.equal(new Set(anchors).size, anchors.length, `${locale}: anchors unique`);
    for (const anchor of anchors) assert.match(anchor, /^c-[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.equal(groups.reduce((n, g) => n + g.municipalities.length, 0), PAGES_PER_LOCALE[locale]);
    assert.ok(hubCopy(locale).jumpLabel);
  }
  assert.equal(byComarca("ca").length, 40, "40 of Catalonia's comarques have at least one page");
  assert.equal(comarcaAnchor("Vallès Oriental"), "c-valles-oriental");
  assert.equal(comarcaAnchor("Pla de l'Estany"), "c-pla-de-l-estany");
  assert.match(hubMeta("ca").title, /els 300 més poblats/);
  assert.match(hubMeta("es").title, /los 300 más poblados/);
  assert.match(hubCopy("ca").lead, /als 300 municipis més poblats/);
  for (const locale of LOCALES) {
    const model = buildElectionPage(bySlug("salou"), locale);
    assert.equal(model.siblings.hub.href, hubPath(locale));
  }
  assert.equal(buildElectionPage(bySlug("salou"), "ca").siblings.hub.label, "Els 300 municipis més poblats, per comarques");
});

test("the guides quote the page counts, not tranche 1's", () => {
  for (const [name, article] of [["voting", VOTING], ["election night", ELECTION_NIGHT], ["municipal results", MUNICIPAL_RESULTS]] as const) {
    for (const locale of LOCALES) {
      const text = JSON.stringify(article.editions[locale].blocks);
      assert.doesNotMatch(text, /100 municipis|100 municipios|ten largest/, `${name}/${locale}`);
    }
    assert.match(JSON.stringify(article.editions.ca.blocks), /300 municipis més poblats/, `${name}/ca`);
    assert.match(JSON.stringify(article.editions.es.blocks), /300 municipios más poblados/, `${name}/es`);
    assert.match(JSON.stringify(article.editions.en.blocks), /30 towns/, `${name}/en`);
  }
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
