import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import {
  agendaPageUrl,
  groupByComarca,
  loadNativities,
  nativityKind,
  nativityQuery,
  normaliseNativity,
  parseLocation,
  selectNativities,
  updatedDay,
  withoutTracking,
  type AgendaRow,
  type PlaceNames,
} from "../src/lib/content/pessebres/agenda.ts";
import { DAY_DEPENDENT_BLOCKS } from "../src/lib/content/day-dependent.ts";

/**
 * The living-nativity calendar is read from the Generalitat's agenda every
 * day. What can go wrong, and what these tests pin down: an exhibition or a
 * concert presented as a living nativity, a nativity that has already ended
 * presented as upcoming, and a failed or empty source shown as anything
 * other than what it is.
 *
 * The rows are shaped like the real 2025-26 ones (names as the organisers
 * wrote them), read from `rhpv-yr4f` on 25 Oct 2026.
 */

const TODAY = "2026-12-10";

const NAMES: PlaceNames = {
  municipalities: new Map([
    ["corbera-de-llobregat", "Corbera de Llobregat"],
    ["la-vall-d-en-bas", "la Vall d'en Bas"],
    ["olot", "Olot"],
  ]),
  comarques: new Map([
    ["baix-llobregat", "Baix Llobregat"],
    ["garrotxa", "Garrotxa"],
    ["alt-emporda", "Alt Empordà"],
  ]),
  comarcaOf: new Map([["peralada", "Alt Empordà"]]),
};

function row(overrides: AgendaRow = {}): AgendaRow {
  return {
    codi: "20261124017",
    denominaci: "Pessebre Vivent de Corbera de Llobregat",
    subt_tol: "",
    espai: "",
    comarca_i_municipi: "agenda:ubicacions/barcelona/baix-llobregat/corbera-de-llobregat",
    data_inici: "2026-11-28T00:00:00.000",
    data_fi: "2027-01-10T00:00:00.000",
    tags_categor_es: "agenda:categories/infantil,agenda:categories/nadal",
    permanent: "No",
    modalitat: "Presencial",
    url: "",
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* What counts as a living nativity                                           */
/* -------------------------------------------------------------------------- */

test("only the organiser's own wording makes a row a living nativity", () => {
  assert.equal(nativityKind(row()), "living");
  assert.equal(nativityKind(row({ denominaci: "XIV Pessebre Vivent de Breda" })), "living");
  assert.equal(nativityKind(row({ denominaci: "Tona, 54è Pessebre Vivent d'Osona" })), "living");
  // The subtitle counts too.
  assert.equal(
    nativityKind(row({ denominaci: "Corbera", subt_tol: "El primer Pessebre Vivent de Catalunya" })),
    "living",
  );
  // Tagged as theatre, still a living nativity (Brunyola, Fornells in 2025).
  assert.equal(nativityKind(row({ tags_categor_es: "agenda:categories/teatre" })), "living");
});

test("exhibitions and static scenes are 'other', never living", () => {
  for (const name of [
    "XXXIII Mostra de Pessebres d'Olot",
    "Exposició de pessebres i diorames",
    "Pessebre Monumental de Tarrés",
    "El Pessebre de Bàscara",
    "Pessebre de sorra",
  ]) {
    assert.equal(
      nativityKind(row({ denominaci: name, tags_categor_es: "agenda:categories/exposicions,agenda:categories/nadal" })),
      "other",
      name,
    );
  }
});

test("concerts, plays and talks named after the nativity are left out", () => {
  assert.equal(
    nativityKind(
      row({
        denominaci: "Concert de l’Oratori El Pessebre al Palau de la Música",
        tags_categor_es: "agenda:categories/commemoracions,agenda:categories/concerts",
      }),
    ),
    null,
  );
  assert.equal(nativityKind(row({ denominaci: "Els Pastorets Rosa de Betlem", tags_categor_es: "agenda:categories/teatre" })), null);
  assert.equal(nativityKind(row({ denominaci: "Taller de pessebres", tags_categor_es: "agenda:categories/cursos" })), null);
  assert.equal(nativityKind(row({ denominaci: "Fira de la Puríssima" })), null);
});

/* -------------------------------------------------------------------------- */
/* Normalising                                                                */
/* -------------------------------------------------------------------------- */

test("a well-formed row keeps its name and gets official place names and the agenda link", () => {
  const event = normaliseNativity(row(), TODAY, NAMES);
  assert.ok(event);
  assert.equal(event.title, "Pessebre Vivent de Corbera de Llobregat");
  assert.equal(event.kind, "living");
  assert.equal(event.municipality, "Corbera de Llobregat");
  assert.equal(event.comarca, "Baix Llobregat");
  assert.equal(event.start, "2026-11-28");
  assert.equal(event.end, "2027-01-10");
  assert.equal(event.agendaUrl, "https://agenda.cultura.gencat.cat/ca/activitat.html/20261124017");
  assert.equal(event.organiserUrl, null);
});

test("a nativity that ended yesterday is never shown; one that ends today still is", () => {
  assert.equal(normaliseNativity(row({ data_fi: "2026-12-09T00:00:00.000" }), TODAY, NAMES), null);
  assert.ok(normaliseNativity(row({ data_fi: `${TODAY}T00:00:00.000` }), TODAY, NAMES));
  // Already running is still upcoming for a reader: it has not finished.
  assert.ok(normaliseNativity(row({ data_inici: "2026-12-01T00:00:00.000" }), TODAY, NAMES));
});

test("a one-day nativity with no end date ends on its start date", () => {
  const event = normaliseNativity(row({ data_inici: "2026-12-20T00:00:00.000", data_fi: undefined }), TODAY, NAMES);
  assert.equal(event?.end, "2026-12-20");
  assert.equal(normaliseNativity(row({ data_inici: "2026-12-01T00:00:00.000", data_fi: undefined }), TODAY, NAMES), null);
});

test("malformed, permanent and online-only rows are skipped", () => {
  assert.equal(normaliseNativity(row({ denominaci: "  " }), TODAY, NAMES), null);
  assert.equal(normaliseNativity(row({ data_inici: "" }), TODAY, NAMES), null);
  assert.equal(normaliseNativity(row({ data_inici: "2027-02-01T00:00:00.000" }), TODAY, NAMES), null);
  assert.equal(normaliseNativity(row({ permanent: "Sí" }), TODAY, NAMES), null);
  assert.equal(normaliseNativity(row({ modalitat: "Virtual" }), TODAY, NAMES), null);
});

test("comarca comes from the full location path, then from the municipality list", () => {
  assert.deepEqual(parseLocation("agenda:ubicacions/girona/garrotxa/la-vall-d-en-bas"), {
    comarca: "garrotxa",
    municipality: "la-vall-d-en-bas",
  });
  const joanetes = normaliseNativity(
    row({ comarca_i_municipi: "agenda:ubicacions/girona/garrotxa/la-vall-d-en-bas" }),
    TODAY,
    NAMES,
  );
  assert.equal(joanetes?.municipality, "la Vall d'en Bas");
  assert.equal(joanetes?.comarca, "Garrotxa");
  // An unknown comarca slug falls back to the municipality's comarca.
  const peralada = normaliseNativity(row({ comarca_i_municipi: "agenda:ubicacions/girona/x/peralada" }), TODAY, NAMES);
  assert.equal(peralada?.comarca, "Alt Empordà");
  // Without the name list, the slugs are still readable.
  const bare = normaliseNativity(row(), TODAY);
  assert.equal(bare?.municipality, "Corbera de Llobregat");
  assert.equal(bare?.comarca, "Baix Llobregat");
});

test("links: only a numeric agenda id, only web addresses, no tracking parameters", () => {
  assert.equal(agendaPageUrl("2026083100010"), "https://agenda.cultura.gencat.cat/ca/activitat.html/2026083100010");
  assert.equal(agendaPageUrl("../x"), null);
  assert.equal(agendaPageUrl(undefined), null);
  assert.equal(
    withoutTracking("https://www.example.cat/entrades?lang=ca&_gl=1*abc&utm_source=x&_ga=y"),
    "https://www.example.cat/entrades?lang=ca",
  );
  const event = normaliseNativity(row({ url: "http://www.pessebre.example/?utm_campaign=nadal" }), TODAY, NAMES);
  assert.equal(event?.organiserUrl, "https://www.pessebre.example/");
  assert.equal(normaliseNativity(row({ url: "info@pessebre.example" }), TODAY, NAMES)?.organiserUrl, null);
  assert.equal(normaliseNativity(row({ url: "javascript:alert(1)" }), TODAY, NAMES)?.organiserUrl, null);
});

/* -------------------------------------------------------------------------- */
/* The list                                                                   */
/* -------------------------------------------------------------------------- */

test("the list is deduplicated, in date order, and holds no past rows", () => {
  const events = selectNativities(
    [
      row({ codi: "3", denominaci: "Pessebre Vivent de Pals", data_inici: "2026-12-26T00:00:00.000" }),
      row({ codi: "1" }),
      row({ codi: "1" }),
      row({ codi: "2", denominaci: "Pessebre Vivent de Navata", data_inici: "2026-12-05T00:00:00.000", data_fi: "2026-12-06T00:00:00.000" }),
      row({ codi: "4", denominaci: "Concert El Pessebre", tags_categor_es: "agenda:categories/concerts" }),
    ],
    TODAY,
    NAMES,
  );
  assert.deepEqual(
    events.map((event) => event.id),
    ["1", "3"],
  );
});

test("living nativities are grouped by comarca in Catalan alphabetical order", () => {
  const events = selectNativities(
    [
      row({ codi: "1", comarca_i_municipi: "agenda:ubicacions/girona/garrotxa/olot" }),
      row({ codi: "2", comarca_i_municipi: "agenda:ubicacions/girona/alt-emporda/peralada" }),
      row({ codi: "3" }),
      row({ codi: "4", comarca_i_municipi: "agenda:ubicacions/girona/garrotxa/la-vall-d-en-bas", data_inici: "2026-11-01T00:00:00.000" }),
    ],
    TODAY,
    NAMES,
  );
  const groups = groupByComarca(events);
  assert.deepEqual(
    groups.map((group) => group.comarca),
    ["Alt Empordà", "Baix Llobregat", "Garrotxa"],
  );
  assert.deepEqual(
    groups[2]?.items.map((event) => event.id),
    ["4", "1"],
  );
});

test("the query asks only for rows that have not ended", () => {
  const query = decodeURIComponent(nativityQuery("2026-10-25"));
  assert.match(query, /data_fi >= '2026-10-25T00:00:00'/);
  assert.match(query, /PESSEBRE/);
});

test("the Generalitat's Last-Modified header becomes a day in Catalan time", () => {
  assert.equal(updatedDay("Fri, 23 Oct 2026 16:54:03 GMT"), "2026-10-23");
  // 23:30 UTC on 31 Dec is already 1 January in Catalonia.
  assert.equal(updatedDay("Thu, 31 Dec 2026 23:30:00 GMT"), "2027-01-01");
  assert.equal(updatedDay("not a date"), null);
  assert.equal(updatedDay(null), null);
});

/* -------------------------------------------------------------------------- */
/* Loading: failure and emptiness are reported, never papered over            */
/* -------------------------------------------------------------------------- */

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function fakeFetch(agenda: () => Response) {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.includes("wpyq-we8x")) return new Response("[]", { status: 200 });
    return agenda();
  }) as typeof fetch;
}

test("an unreachable source is an error with no list at all", async () => {
  fakeFetch(() => new Response("oops", { status: 503 }));
  const result = await loadNativities("2026-10-25");
  assert.equal(result.events.length, 0);
  assert.match(result.error ?? "", /503/);
});

test("a source that throws is an error, not an empty season", async () => {
  globalThis.fetch = (async () => {
    throw new Error("timeout");
  }) as typeof fetch;
  const result = await loadNativities("2026-10-25");
  assert.equal(result.events.length, 0);
  assert.equal(result.error, "timeout");
});

test("an answer that is not a list is an error", async () => {
  fakeFetch(() => new Response(JSON.stringify({ error: true }), { status: 200 }));
  const result = await loadNativities("2026-10-25");
  assert.ok(result.error);
});

test("an empty season is an honest empty list, with the dataset's update day", async () => {
  fakeFetch(
    () =>
      new Response("[]", {
        status: 200,
        headers: { "last-modified": "Fri, 23 Oct 2026 16:54:03 GMT" },
      }),
  );
  const result = await loadNativities("2026-10-25");
  assert.equal(result.error, null);
  assert.deepEqual(result.events, []);
  assert.equal(result.updatedAt, "2026-10-23");
  assert.equal(result.today, "2026-10-25");
});

test("rows the source returns despite having ended are still dropped", async () => {
  fakeFetch(
    () =>
      new Response(
        JSON.stringify([
          row({ codi: "1", data_inici: "2025-12-20T00:00:00.000", data_fi: "2026-01-06T00:00:00.000" }),
          row({ codi: "2" }),
        ]),
        { status: 200 },
      ),
  );
  const result = await loadNativities("2026-10-25");
  assert.deepEqual(
    result.events.map((event) => event.id),
    ["2"],
  );
});

test("the block is rebuilt every night", () => {
  assert.ok(DAY_DEPENDENT_BLOCKS.includes("livingNativities"));
});
