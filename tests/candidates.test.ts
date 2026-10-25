import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { blockSchema } from "../src/lib/content/blocks.ts";
import {
  ELECTION_29N,
  SEATS,
  boeLinks,
  catalanLists,
  classify,
  decodeEntities,
  itemMeta,
  juntasIn,
  listed,
  loadCandidates,
  parseJuntas,
  plainText,
  provinceOf,
  scanDays,
  sumarioItems,
  unlisted,
  type ElectionConfig,
} from "../src/lib/content/candidates/boe.ts";
import { DAY_DEPENDENT_BLOCKS } from "../src/lib/content/day-dependent.ts";

/**
 * The 29N candidate lists, read from the BOE.
 *
 * Fixtures are the real 2023 items, trimmed (tests/fixtures/): the proclaimed
 * candidacies (BOE-A-2023-15066) cut down to the four Catalan Juntas with the
 * start of their neighbours (Baleares, Bizkaia, Teruel), the two corrections,
 * and the four day summaries (21 Jun, 27 Jun, 4 Jul, 7 Jul 2023) cut down to
 * the electoral boards plus one unrelated item each. The counts below were
 * taken from the fixture independently of the parser.
 */

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
const PROCLAIMED_2023 = fixture("boe-2023-proclaimed-trimmed.xml");
const CORRECTION_A = fixture("boe-2023-correction-15548.xml");
const CORRECTION_B = fixture("boe-2023-correction-15828.xml");
const SUMARIOS_2023: Record<string, string> = {
  "20230621": fixture("boe-sumario-20230621.json"),
  "20230627": fixture("boe-sumario-20230627.json"),
  "20230704": fixture("boe-sumario-20230704.json"),
  "20230707": fixture("boe-sumario-20230707.json"),
};

/** The 2023 precedent, as a config: same LOREG day numbering as 2026. */
const ELECTION_23J: ElectionConfig = {
  decree: "400/2023",
  presentedDay: "2023-06-21",
  proclamationDay: "2023-06-26",
  proclaimedDay: "2023-06-27",
  appealsFrom: "2023-06-28",
  appealsTo: "2023-06-29",
  appealsResolvedBy: "2023-07-06",
  campaignFrom: "2023-07-07",
  campaignTo: "2023-07-21",
  reflectionDay: "2023-07-22",
  electionDay: "2023-07-23",
  scanFrom: "2023-06-21",
  scanTo: "2023-07-08",
};

/* -------------------------------------------------------------------------- */
/* Parsing the proclaimed item                                                */
/* -------------------------------------------------------------------------- */

const lists = catalanLists(PROCLAIMED_2023);
const byProvince = Object.fromEntries(lists.map((item) => [item.province, item]));

test("the four Catalan Juntas are found, in fixed order, and nothing else", () => {
  assert.deepEqual(
    lists.map((item) => [item.province, item.junta]),
    [
      ["barcelona", "JUNTA ELECTORAL DE BARCELONA"],
      ["girona", "JUNTA ELECTORAL DE GIRONA"],
      ["lleida", "JUNTA ELECTORAL DE LLEIDA"],
      ["tarragona", "JUNTA ELECTORAL DE TARRAGONA"],
    ],
  );
  assert.deepEqual(
    parseJuntas(PROCLAIMED_2023).map((junta) => [junta.junta.replace("JUNTA ELECTORAL DE ", ""), junta.province]),
    [
      ["BALEARES", null],
      ["BARCELONA", "barcelona"],
      ["BIZKAIA", null],
      ["GIRONA", "girona"],
      ["LLEIDA", "lleida"],
      ["TARRAGONA", "tarragona"],
      ["TERUEL", null],
    ],
  );
});

test("candidacies per province and chamber match the BOE, proclaimed and not", () => {
  const counts = Object.fromEntries(
    lists.map((item) => [
      item.province,
      [item.congress.length, listed(item.congress).length, item.senate.length, listed(item.senate).length],
    ]),
  );
  assert.deepEqual(counts, {
    barcelona: [17, 12, 13, 10],
    girona: [13, 12, 11, 10],
    lleida: [13, 13, 11, 11],
    tarragona: [16, 14, 13, 11],
  });
});

test("every proclaimed Congress list has as many candidates as seats, numbered in the Junta's order", () => {
  for (const item of lists) {
    for (const candidacy of listed(item.congress)) {
      const label = `${item.province} ${candidacy.number}`;
      assert.equal(candidacy.candidates.length, SEATS[item.province].deputies, label);
      assert.deepEqual(
        candidacy.candidates.map((candidate) => candidate.number),
        candidacy.candidates.map((_, index) => index + 1),
        label,
      );
      assert.ok(candidacy.substitutes.length <= 10, label);
      assert.deepEqual(
        candidacy.substitutes.map((candidate) => candidate.number),
        candidacy.substitutes.map((_, index) => index + 1),
        label,
      );
    }
  }
});

test("a Congress list keeps its names and its substitutes apart", () => {
  const first = byProvince.barcelona!.congress[0]!;
  assert.equal(first.number, 1);
  assert.equal(first.name, "PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE) (PSC)");
  assert.equal(first.candidates[0]!.name, "Meritxell Batet Lamaña");
  assert.equal(first.candidates.at(-1)!.name, "Matias Carnero Sojo");
  assert.equal(first.substitutes.length, 10);
  assert.equal(first.substitutes[0]!.name, "Álvaro Sánchez Pérez");
  // A list with no substitutes is not given anyone else's.
  assert.deepEqual(byProvince.barcelona!.congress[1]!.substitutes, []);
});

test("Senate candidates carry their two substitutes, in order", () => {
  const first = byProvince.barcelona!.senate[0]!;
  assert.deepEqual(first.candidates[0], {
    number: 1,
    name: "Manuel Cruz Rodríguez",
    substitutes: ["Elia Tortolero Orejuela", "Antoni Poyato Rodríguez"],
  });
  for (const item of lists) {
    for (const candidacy of listed(item.senate)) {
      assert.ok(candidacy.candidates.length >= 1 && candidacy.candidates.length <= 3, `${item.province} ${candidacy.number}`);
      for (const candidate of candidacy.candidates) {
        assert.equal(candidate.substitutes.length, 2, `${item.province} ${candidacy.number} ${candidate.name}`);
      }
      assert.deepEqual(candidacy.substitutes, []);
    }
  }
});

test("a substitute row the BOE indented like a candidate still belongs to the candidate above it", () => {
  // Barcelona, Senate, 8. JUNTS: the BOE marks "Suplente 2: Núria Colomé i
  // Rodríguez" with the candidate indentation (data-sangria="1").
  const junts = byProvince.barcelona!.senate.find((candidacy) => candidacy.number === 8)!;
  assert.equal(junts.candidates.length, 3);
  assert.deepEqual(junts.candidates[2]!.substitutes, ["Pep Llop i Rigol", "Núria Colomé i Rodríguez"]);
});

test("'No proclamada' candidacies are kept, marked and in their numbered place", () => {
  const congress = byProvince.barcelona!.congress;
  assert.deepEqual(
    congress.map((candidacy) => candidacy.number),
    Array.from({ length: 17 }, (_, index) => index + 1),
  );
  assert.deepEqual(
    unlisted(congress).map((candidacy) => [candidacy.number, candidacy.status, candidacy.note, candidacy.candidates.length]),
    [
      [5, "notProclaimed", "No proclamada.", 0],
      [8, "notProclaimed", "No proclamada.", 0],
      [11, "notProclaimed", "No proclamada.", 0],
      [15, "notProclaimed", "No proclamada.", 0],
      [17, "notProclaimed", "No proclamada.", 0],
    ],
  );
  assert.equal(unlisted(byProvince.lleida!.congress).length, 0);
});

test("neighbouring Juntas never leak into a Catalan list", () => {
  const names = JSON.stringify(lists);
  for (const outsider of ["Julia Galindo López", "María Salom Coll", "EUSKAL HERRIA BILDU", "Javier Vitales Escolano"]) {
    assert.ok(!names.includes(outsider), outsider);
  }
  // Barcelona's last Senate candidacy ends where Bizkaia begins.
  assert.equal(byProvince.barcelona!.senate.at(-1)!.name, "PARTIT DEMÒCRATA EUROPEU CATALÀ-ESPAI CIU (PDeCAT-E-CiU)");
});

test("the item's own metadata gives its id, date, issue and corrections", () => {
  assert.deepEqual(itemMeta(PROCLAIMED_2023), {
    id: "BOE-A-2023-15066",
    title:
      "Candidaturas proclamadas para la elecciones al Congreso de los Diputados y al Senado, convocadas por Real Decreto 400/2023, de 29 de mayo.",
    date: "2023-06-27",
    issue: "152",
    corrections: ["BOE-A-2023-15828", "BOE-A-2023-15548"],
  });
  assert.equal(itemMeta("<error><descripcion>No se encontr&#xF3; el documento original.</descripcion></error>"), null);
});

test("a correction names the Juntas it touches", () => {
  assert.deepEqual(juntasIn(CORRECTION_A), [
    "JUNTA ELECTORAL DE BALEARES",
    "JUNTA ELECTORAL DE BIZKAIA",
    "JUNTA ELECTORAL DE CUENCA",
  ]);
  assert.deepEqual(juntasIn(CORRECTION_B), ["JUNTA ELECTORAL DE TERUEL"]);
});

/* -------------------------------------------------------------------------- */
/* Odd shapes and hostile text                                                */
/* -------------------------------------------------------------------------- */

const doc = (texto: string) =>
  `<?xml version="1.0" encoding="UTF-8"?><documento><metadatos><identificador>BOE-A-2026-1</identificador>` +
  `<fecha_publicacion>20261103</fecha_publicacion></metadatos><analisis><referencias><posteriores>` +
  `<posterior referencia="BOE-A-2026-2"><palabra codigo="201">CORRECCIÓN de errores</palabra><texto>en BOE núm. 1</texto></posterior>` +
  `</posteriores></referencias></analisis><texto>${texto}</texto></documento>`;

test("spacing variants, withdrawn lists and notes are read the way the BOE means them", () => {
  const xml = doc(`
    <p class="centro_negrita">JUNTA ELECTORAL PROVINCIAL DE LÉRIDA</p>
    <p class="parrafo_2">Lleida, 2 de noviembre de 2026.–El Presidente.</p>
    <p class="centro_cursiva">CONGRESO DE LOS DIPUTADOS</p>
    <p class="centro_redonda">1. LISTA A (A)</p>
    <p class="parrafo_2">1.María Pérez Pérez.</p>
    <p class="parrafo">2. Joan Puig i Puig (Independent).</p>
    <p class="centro_redonda">2. LISTA B (B)</p>
    <p class="parrafo_2">La candidatura ha sido retirada.</p>
    <p class="centro_redonda">«Candidatura núm.: 3. LISTA C (C)</p>
    <p class="parrafo_2">Sin candidatos.</p>
    <p class="centro_cursiva">SENADO</p>
    <p class="centro_redonda">1. LISTA A (A)</p>
    <p class="parrafo_2"><span class="sangria-numero">1.</span><span class="sangria-texto">Anna Soler Vidal.</span></p>
    <p class="parrafo"><span class="sangria-numero"/><span class="sangria-texto">Suplente 1: Pere Roca Mas.</span></p>
    <p class="parrafo">Suplente 2.Teresa Font Gil.</p>
  `);
  const [lleida] = catalanLists(xml);
  assert.equal(lleida?.province, "lleida");
  assert.deepEqual(
    lleida!.congress.map((candidacy) => [candidacy.number, candidacy.name, candidacy.status, candidacy.candidates.map((c) => c.name)]),
    [
      [1, "LISTA A (A)", "listed", ["María Pérez Pérez", "Joan Puig i Puig (Independent)"]],
      [2, "LISTA B (B)", "withdrawn", []],
      [3, "LISTA C (C)", "note", []],
    ],
  );
  assert.equal(lleida!.congress[2]!.note, "Sin candidatos.");
  assert.deepEqual(lleida!.senate[0]!.candidates[0]!.substitutes, ["Pere Roca Mas", "Teresa Font Gil"]);
  // The analysis block's own <texto> is not mistaken for the lists.
  assert.deepEqual(itemMeta(xml)?.corrections, ["BOE-A-2026-2"]);
});

test("entities are decoded once; markup spelled with entities stays literal text", () => {
  assert.equal(decodeEntities("Ca&#241;ellas &amp; Ib&#xE1;&#xF1;ez &#8220;Pep&#8221; d&apos;Urgell"), "Cañellas & Ibáñez “Pep” d'Urgell");
  assert.equal(decodeEntities("&amp;lt;b&amp;gt;"), "&lt;b&gt;");
  assert.equal(plainText('ALIANÇA <span class="no_partir">(PSE-EE</span> X'), "ALIANÇA (PSE-EE X");
  const xml = doc(`
    <p class="centro_negrita">JUNTA ELECTORAL DE GERONA</p>
    <p class="centro_cursiva">CONGRESO DE LOS DIPUTADOS</p>
    <p class="centro_redonda">1. &lt;script&gt;alert(1)&lt;/script&gt; (X)</p>
    <p class="parrafo_2">1. [Pep](javascript:alert(1)) **Puig** &lt;img src=x onerror=alert(1)&gt;.</p>
  `);
  const [girona] = catalanLists(xml);
  assert.equal(girona?.province, "girona");
  assert.equal(girona!.congress[0]!.name, "<script>alert(1)</script> (X)");
  const name = girona!.congress[0]!.candidates[0]!.name;
  assert.equal(name, "[Pep](javascript:alert(1)) **Puig** <img src=x onerror=alert(1)>");
  // Printed as a React text node, which is how the component prints it.
  const html = renderToStaticMarkup(createElement("li", null, name));
  assert.ok(!html.includes("<img"), html);
  assert.ok(!html.includes("<a"), html);
  assert.ok(html.includes("&lt;img src=x onerror=alert(1)&gt;"), html);
});

test("the component prints BOE text as text: no markdown renderer, no raw HTML", () => {
  const source = readFileSync(new URL("../src/components/blocks/CandidateLists.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(source, /renderInline|content\/inline/);
  // Every link it renders is built by boeLinks or is a fixed address.
  assert.doesNotMatch(source, /href=\{(?!links\.|BOE_SOURCE\.|`#candidates-)/);
});

test("province names: Catalan and Spanish spellings, other Juntas are not Catalan", () => {
  assert.equal(provinceOf("JUNTA ELECTORAL DE BARCELONA"), "barcelona");
  assert.equal(provinceOf("Junta Electoral Provincial de Girona"), "girona");
  assert.equal(provinceOf("JUNTA ELECTORAL DE LÉRIDA"), "lleida");
  assert.equal(provinceOf("JUNTA ELECTORAL DE TARRAGONA."), "tarragona");
  assert.equal(provinceOf("JUNTA ELECTORAL DE BALEARES"), null);
  assert.equal(provinceOf("Circunscripción electoral: Mallorca"), null);
});

/* -------------------------------------------------------------------------- */
/* Finding the items                                                          */
/* -------------------------------------------------------------------------- */

const notices = (config: ElectionConfig) =>
  Object.entries(SUMARIOS_2023).flatMap(([day, text]) =>
    sumarioItems(JSON.parse(text), `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6)}`)
      .map((item) => classify(item, config))
      .filter((notice) => notice !== null)
      .map((notice) => [notice.date, notice.id, notice.kind, notice.corrects, notice.issue]),
  );

test("2023 precedent: presented 21 Jun, proclaimed 27 Jun, corrections 4 and 7 Jul, nothing else", () => {
  assert.deepEqual(notices(ELECTION_23J), [
    ["2023-06-21", "BOE-A-2023-14733", "presented", null, "147"],
    ["2023-06-27", "BOE-A-2023-15066", "proclaimed", null, "152"],
    ["2023-07-04", "BOE-A-2023-15548", "correction", "proclaimed", "158"],
    ["2023-07-07", "BOE-A-2023-15828", "correction", "proclaimed", "161"],
  ]);
  // The Junta Electoral Central's items on the same days are not candidacies.
  const all = Object.entries(SUMARIOS_2023).flatMap(([day, text]) => sumarioItems(JSON.parse(text), day));
  assert.ok(all.some((item) => item.id === "BOE-A-2023-15823" && /JUNTA ELECTORAL CENTRAL/.test(item.department)));
  assert.ok(all.some((item) => item.section === "1"));
});

test("the 29N configuration never accepts another election's items", () => {
  assert.deepEqual(notices(ELECTION_29N), []);
  const item = {
    id: "BOE-A-2026-30000",
    title: "Candidaturas proclamadas para las elecciones al Congreso de los Diputados y al Senado, convocadas por Real Decreto 806/2026, de 5 de octubre.",
    date: "2026-11-03",
    issue: "273",
    department: "JUNTAS ELECTORALES PROVINCIALES",
    section: "3",
  };
  assert.equal(classify(item, ELECTION_29N)?.kind, "proclaimed");
  assert.equal(classify({ ...item, title: item.title.replace("806/2026", "999/2026") }, ELECTION_29N), null);
  assert.equal(classify({ ...item, department: "JUNTA ELECTORAL CENTRAL" }, ELECTION_29N), null);
  assert.equal(classify({ ...item, title: "Candidaturas proclamadas para las elecciones al Senado." }, ELECTION_29N)?.kind, "proclaimed");
  assert.equal(classify({ ...item, title: "Candidaturas proclamadas para las elecciones al Senado.", date: "2026-10-27" }, ELECTION_29N), null);
  assert.equal(classify({ ...item, title: "Resolución sobre locales para actos de campaña." }, ELECTION_29N), null);
});

test("the scan covers 28 Oct to today, never a Sunday, never past the day before polling", () => {
  assert.deepEqual(scanDays(ELECTION_29N, "2026-10-27"), []);
  assert.deepEqual(scanDays(ELECTION_29N, "2026-10-28"), ["2026-10-28"]);
  const tenth = scanDays(ELECTION_29N, "2026-11-10");
  assert.equal(tenth.length, 12);
  assert.ok(!tenth.includes("2026-11-01") && !tenth.includes("2026-11-08"));
  assert.ok(tenth.includes("2026-11-03"));
  const late = scanDays(ELECTION_29N, "2026-12-15");
  assert.equal(late.at(-1), "2026-11-28");
  assert.ok(late.every((day) => new Date(`${day}T12:00:00Z`).getUTCDay() !== 0));
});

test("links are built from a checked id and only ever point at boe.es", () => {
  assert.deepEqual(boeLinks("BOE-A-2023-15066", "2023-06-27"), {
    html: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-15066",
    xml: "https://www.boe.es/diario_boe/xml.php?id=BOE-A-2023-15066",
    pdf: "https://www.boe.es/boe/dias/2023/06/27/pdfs/BOE-A-2023-15066.pdf",
  });
  assert.equal(boeLinks("BOE-A-2023-15066", "").pdf, null);
  assert.throws(() => boeLinks("javascript:alert(1)", "2023-06-27"));
  assert.throws(() => boeLinks("BOE-A-2023-1&x=https://evil", "2023-06-27"));
});

/* -------------------------------------------------------------------------- */
/* Loading: every state is honest                                             */
/* -------------------------------------------------------------------------- */

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

interface Call {
  url: string;
  accept: string | null;
  revalidate: number | undefined;
}

/** Serves the given summaries and items; everything else is a 404. */
function serve(sumarios: Record<string, string>, items: Record<string, string>, calls: Call[] = []) {
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit & { next?: { revalidate?: number } }) => {
    const url = String(input instanceof Request ? input.url : input);
    calls.push({ url, accept: new Headers(init?.headers).get("accept"), revalidate: init?.next?.revalidate });
    const day = /\/sumario\/(\d{8})$/.exec(url)?.[1];
    if (day) {
      return sumarios[day]
        ? new Response(sumarios[day], { status: 200, headers: { "content-type": "application/json" } })
        : new Response('<?xml version="1.0"?><response><status><code>404</code></status></response>', { status: 404 });
    }
    const id = /xml\.php\?id=(BOE-A-[\d-]+)$/.exec(url)?.[1];
    if (id && items[id]) return new Response(items[id], { status: 200 });
    // What boe.es really answers for an id it does not have.
    return new Response("<?xml version=\"1.0\"?>\n<error><descripcion>No se encontr&#xF3; el documento original.</descripcion></error>", { status: 200 });
  }) as typeof fetch;
  return calls;
}

test("before 28 October nothing is fetched and nothing is shown as current", async () => {
  globalThis.fetch = (async () => {
    throw new Error("must not fetch before the first publication day");
  }) as typeof fetch;
  const result = await loadCandidates("2026-10-26");
  assert.equal(result.phase, "before");
  assert.deepEqual(result.provinces, []);
  assert.equal(result.checkedThrough, null);
});

test("28 October before the BOE has it: waiting, having asked for that day only", async () => {
  const calls = serve({}, {});
  const result = await loadCandidates("2026-10-28");
  assert.equal(result.phase, "waiting");
  assert.equal(result.checkedThrough, "2026-10-28");
  assert.deepEqual(result.failedDays, []);
  assert.deepEqual(
    calls.map((call) => [call.url, call.accept]),
    [["https://www.boe.es/datosabiertos/api/boe/sumario/20261028", "application/json"]],
  );
});

test("a BOE that cannot be reached is reported as such, never as 'no lists'", async () => {
  globalThis.fetch = (async () => {
    throw new Error("timeout");
  }) as typeof fetch;
  const result = await loadCandidates("2026-11-04");
  assert.equal(result.phase, "unreachable");
  assert.deepEqual(result.provinces, []);
  assert.equal(result.failedDays.length, scanDays(ELECTION_29N, "2026-11-04").length);
});

test("days that fail are listed; days with no BOE are not failures", async () => {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.endsWith("20261029")) return new Response("busy", { status: 503 });
    return new Response("", { status: 404 });
  }) as typeof fetch;
  const result = await loadCandidates("2026-10-30");
  assert.equal(result.phase, "waiting");
  assert.deepEqual(result.failedDays, ["2026-10-29"]);
});

/** The 2023 summaries served on their own dates. */
const SERVED_2023 = SUMARIOS_2023;

test("2023 end to end: proclaimed lists for the four provinces, both corrections, presented item not even read", async () => {
  const calls = serve(SERVED_2023, {
    "BOE-A-2023-15066": PROCLAIMED_2023,
    "BOE-A-2023-15548": CORRECTION_A,
    "BOE-A-2023-15828": CORRECTION_B,
  });
  const result = await loadCandidates("2023-07-08", ELECTION_23J);
  assert.equal(result.phase, "lists");
  assert.deepEqual(
    result.provinces.map((province) => [province.province, province.stage, province.source.id, province.source.date]),
    [
      ["barcelona", "proclaimed", "BOE-A-2023-15066", "2023-06-27"],
      ["girona", "proclaimed", "BOE-A-2023-15066", "2023-06-27"],
      ["lleida", "proclaimed", "BOE-A-2023-15066", "2023-06-27"],
      ["tarragona", "proclaimed", "BOE-A-2023-15066", "2023-06-27"],
    ],
  );
  assert.deepEqual(result.missing, []);
  assert.deepEqual(
    result.corrections.map((notice) => [notice.date, notice.id, notice.catalan, notice.juntas?.length]),
    [
      ["2023-07-04", "BOE-A-2023-15548", [], 3],
      ["2023-07-07", "BOE-A-2023-15828", [], 1],
    ],
  );
  assert.ok(!calls.some((call) => call.url.includes("BOE-A-2023-14733")), "presented item read although proclaimed covers all");
  // Sundays (25 Jun, 2 Jul) are never asked for.
  assert.ok(!calls.some((call) => /2023062[5]$|20230702$/.test(call.url)));
  // No request may shorten the page's one-day ISR period.
  assert.ok(calls.every((call) => (call.revalidate ?? 0) >= 86_400), JSON.stringify(calls.map((call) => call.revalidate)));
});

test("between the two publications the presented lists are shown, labelled as presented", async () => {
  serve(SERVED_2023, { "BOE-A-2023-14733": PROCLAIMED_2023 });
  const result = await loadCandidates("2023-06-23", ELECTION_23J);
  assert.equal(result.phase, "lists");
  assert.deepEqual([...new Set(result.provinces.map((province) => `${province.stage} ${province.source.id}`))], [
    "presented BOE-A-2023-14733",
  ]);
  assert.deepEqual(result.proclaimed, []);
});

test("a proclaimed item that cannot be read falls back to the presented one and says so", async () => {
  serve(SERVED_2023, { "BOE-A-2023-14733": PROCLAIMED_2023 });
  const result = await loadCandidates("2023-06-30", ELECTION_23J);
  assert.equal(result.phase, "lists");
  assert.ok(result.provinces.every((province) => province.stage === "presented"));
  assert.deepEqual(result.unreadable.map((notice) => notice.id), ["BOE-A-2023-15066"]);
});

test("items that cannot be read at all: 'unreadable', with no lists", async () => {
  serve(SERVED_2023, {});
  const result = await loadCandidates("2023-06-30", ELECTION_23J);
  assert.equal(result.phase, "unreadable");
  assert.deepEqual(result.provinces, []);
  assert.deepEqual(result.unreadable.map((notice) => notice.id), ["BOE-A-2023-15066", "BOE-A-2023-14733"]);
});

test("2023 summaries served as if they were 2026 days are still refused under 29N", async () => {
  const shifted = {
    "20261028": SUMARIOS_2023["20230621"]!,
    "20261103": SUMARIOS_2023["20230627"]!,
    "20261110": SUMARIOS_2023["20230704"]!,
  };
  serve(shifted, { "BOE-A-2023-15066": PROCLAIMED_2023, "BOE-A-2023-14733": PROCLAIMED_2023 });
  const result = await loadCandidates("2026-11-12");
  assert.equal(result.phase, "waiting");
  assert.deepEqual(result.provinces, []);
});

test("29N shape end to end: a 3 November item under RD 806/2026 becomes the proclaimed lists", async () => {
  // The 2023 documents with this election's decree, date and ids.
  const to2026 = (text: string) =>
    text
      .replaceAll("400/2023, de 29 de mayo", "806/2026, de 5 de octubre")
      .replaceAll("20230627", "20261103")
      .replaceAll("2023/06/27", "2026/11/03")
      .replaceAll("BOE-A-2023-15066", "BOE-A-2026-23001")
      .replaceAll("BOE-A-2023-15548", "BOE-A-2026-23500")
      .replaceAll("BOE-A-2023-15828", "BOE-A-2026-23600");
  const calls = serve({ "20261103": to2026(SUMARIOS_2023["20230627"]!) }, { "BOE-A-2026-23001": to2026(PROCLAIMED_2023) });
  const result = await loadCandidates("2026-11-04");
  assert.equal(result.phase, "lists");
  assert.equal(result.provinces.length, 4);
  assert.ok(result.provinces.every((province) => province.stage === "proclaimed" && province.source.id === "BOE-A-2026-23001"));
  assert.equal(result.provinces[0]!.source.issue, "152");
  // The corrections the item itself lists are shown even though the scan did
  // not find them (here they cannot be read, so they say so).
  assert.deepEqual(
    result.corrections.map((notice) => [notice.id, notice.juntas]),
    [
      ["BOE-A-2026-23500", null],
      ["BOE-A-2026-23600", null],
    ],
  );
  assert.ok(calls.every((call) => (call.revalidate ?? 0) >= 86_400));
});

/* -------------------------------------------------------------------------- */
/* Wiring                                                                     */
/* -------------------------------------------------------------------------- */

test("the block validates and is rebuilt every night", () => {
  assert.ok(blockSchema.safeParse({ type: "candidateLists" }).success);
  assert.ok(DAY_DEPENDENT_BLOCKS.includes("candidateLists"));
});
