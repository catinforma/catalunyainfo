import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { BARCELONA_LOCAL, CATALONIA_HOLIDAYS } from "../src/lib/content/holidays/payload.ts";
import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  comarcaCopy,
  councilLabel,
  hubCopy,
  municipalityCopy,
  municipalityDescription,
  municipalityFaq,
  municipalityTitle,
} from "../src/lib/programmatic/holidays/copy.ts";
import { COUNCIL_2027, councilDisagreements, councilSlugs } from "../src/lib/programmatic/holidays/council-2027.ts";
import {
  NEXT,
  NEXT_YEAR,
  YEAR,
  comarcaOf,
  councilApproved2027,
  councilApprovedTowns,
  municipalityBySlug,
  nextYearPublished,
  statusDays,
  yearRows,
} from "../src/lib/programmatic/holidays/data.ts";
import { hasEnglishPage } from "../src/lib/programmatic/holidays/english.ts";
import { englishHubCopy, englishTownCopy, englishTownDescription, englishTownFaq, englishTownTitle } from "../src/lib/programmatic/holidays/english-copy.ts";
import { dayMonth, dayPair, weekdayName } from "../src/lib/programmatic/holidays/format.ts";
import { municipalityDataset } from "../src/lib/programmatic/holidays/structured.ts";

/**
 * Next year's local days as the councils approved them (council-2027.ts),
 * shown before the DOGC order with the label "approved by the council,
 * pending the DOGC order". The order, once parsed, always wins.
 */

const ROOT = join(import.meta.dirname, "..");
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const valid = (iso: string) => ISO.test(iso) && new Date(`${iso}T12:00:00Z`).toISOString().slice(0, 10) === iso;
const town = (slug: string) => {
  const m = municipalityBySlug(slug);
  assert.ok(m, slug);
  return m;
};

/**
 * Each town's own domain, or the provincial bulletins. A source must sit on
 * one of these (or a subdomain); the AOC's shared e-seu (`seu-e.cat`) counts
 * only under the town's own path. Press and aggregators never qualify.
 */
const COUNCIL_DOMAIN: Record<string, string> = {
  barcelona: "bcn.cat",
  "l-hospitalet-de-llobregat": "l-h.cat",
  badalona: "badalona.cat",
  lleida: "paeria.cat",
  mataro: "mataro.cat",
  reus: "reus.cat",
  girona: "girona.cat",
  "cornella-de-llobregat": "cornella.cat",
  "sant-boi-de-llobregat": "santboi.cat",
  rubi: "rubi.cat",
  manresa: "manresa.cat",
  granollers: "granollers.cat",
  figueres: "figueres.cat",
  "esplugues-de-llobregat": "esplugues.cat",
  blanes: "blanes.cat",
  "vilafranca-del-penedes": "vilafranca.cat",
  ripollet: "ripollet.cat",
  olot: "olot.cat",
  "sant-adria-de-besos": "sant-adria.cat",
  "montcada-i-reixac": "montcada.cat",
  tortosa: "seu-e.cat/web/tortosa/",
  "sant-joan-despi": "sjdespi.cat",
  "premia-de-mar": "premiademar.cat",
  "sant-vicenc-dels-horts": "svh.cat",
  "molins-de-rei": "molinsderei.cat",
  "sant-andreu-de-la-barca": "sabarca.cat",
  palafrugell: "palafrugell.cat",
  "vila-seca": "vila-seca.cat",
  amposta: "amposta.cat",
  "sant-just-desvern": "santjust.cat",
  banyoles: "banyoles.cat",
  roses: "roses.cat",
  "caldes-de-montbui": "caldesdemontbui.cat",
  "la-llagosta": "llagosta.cat",
  "premia-de-dalt": "premiadedalt.cat",
  alella: "alella.cat",
  cervera: "cervera.cat",
  "sant-fost-de-campsentelles": "santfost.cat",
  vidreres: "vidreres.cat",
  artes: "artes.cat",
  capellades: "capellades.cat",
  "castellbell-i-el-vilar": "castellbellielvilar.cat",
  "castellvi-de-rosanes": "castellviderosanes.cat",
  "la-llacuna": "lallacuna.cat",
  riudarenes: "ajuntamentderiudarenes.cat",
  pau: "pau.cat",
};
const BULLETINS = ["bop.diba.cat", "ddgi.cat", "dipta.cat", "diputaciolleida.cat"];

function onOfficialDomain(slug: string, url: string): boolean {
  const u = new URL(url);
  if (u.protocol !== "https:") return false;
  if (BULLETINS.some((b) => u.hostname === b || u.hostname.endsWith(`.${b}`))) return true;
  const own = COUNCIL_DOMAIN[slug];
  if (!own) return false;
  if (own.includes("/")) {
    const [host, ...path] = own.split("/");
    return (u.hostname === host || u.hostname === `www.${host}`) && u.pathname.startsWith(`/${path.join("/")}`);
  }
  return u.hostname === own || u.hostname.endsWith(`.${own}`);
}

/* -------------------------------------------------------------------------- */
/* The data                                                                   */
/* -------------------------------------------------------------------------- */

test("council data: every entry is a town with a page, two distinct valid 2027 days, an official https source and a read date", () => {
  const regional2027 = new Set(CATALONIA_HOLIDAYS.map((h) => h.date));
  assert.ok(councilSlugs().length >= 40, `${councilSlugs().length} towns`);
  for (const [slug, c] of Object.entries(COUNCIL_2027)) {
    town(slug);
    assert.equal(c.local.length, 2, slug);
    const [a, b] = c.local;
    for (const d of c.local) {
      assert.ok(valid(d) && d.startsWith(`${NEXT}-`), `${slug}: ${d}`);
      // The Generalitat's rule for proposals: never a Sunday, never one of the twelve.
      assert.notEqual(weekdayName(d, "en"), "Sunday", `${slug}: ${d} is a Sunday`);
      assert.ok(!regional2027.has(d), `${slug}: ${d} is a Catalonia-wide holiday`);
    }
    assert.ok(a < b, `${slug}: two distinct days in date order`);
    if (c.names) assert.equal(c.names.length, 2, slug);
    for (const n of c.nuclei ?? []) {
      assert.equal(n.dates.length, 2, `${slug} / ${n.name}`);
      assert.ok(n.dates[0]! < n.dates[1]!, `${slug} / ${n.name}`);
      for (const d of n.dates) {
        assert.ok(valid(d) && d.startsWith(`${NEXT}-`), `${slug} / ${n.name}: ${d}`);
        assert.notEqual(weekdayName(d, "en"), "Sunday", `${slug} / ${n.name}: ${d}`);
      }
    }
    assert.ok(onOfficialDomain(slug, c.source.url), `${slug}: ${c.source.url} is not on the council's own domain or a provincial bulletin`);
    assert.ok(c.source.name.length > 3 && c.source.ref.length > 3, slug);
    assert.ok(["ple", "decret", "junta", "web"].includes(c.act.kind), slug);
    assert.ok(valid(c.readOn) && c.readOn >= "2026-10-30" && c.readOn <= "2026-10-31", `${slug}: read on ${c.readOn}`);
    if (c.act.date) assert.ok(valid(c.act.date) && c.act.date.startsWith(`${YEAR}-`) && c.act.date < c.readOn, `${slug}: act of ${c.act.date}`);
  }
});

test("council data: known values, as the councils print them", () => {
  // "Fixar, com a festes locals a celebrar durant l'any 2027 en el terme municipal de Barcelona,
  // els dies: 17 de maig, dilluns de Pasqua Granada; 24 de setembre, Mare de Déu de la Mercè."
  assert.deepEqual(COUNCIL_2027.barcelona!.local, ["2027-05-17", "2027-09-24"]);
  assert.deepEqual(COUNCIL_2027.barcelona!.act, { kind: "decret", date: "2026-06-04" });
  // Barcelona: the same two days as the 2027 work-calendar guide (payload.ts), from the city's page.
  assert.deepEqual(COUNCIL_2027.barcelona!.local, BARCELONA_LOCAL.map((h) => h.date));
  assert.deepEqual(COUNCIL_2027.granollers!.local, ["2027-05-07", "2027-08-27"]);
  assert.deepEqual(COUNCIL_2027.girona!.local, ["2027-07-26", "2027-10-29"]);
  assert.deepEqual(COUNCIL_2027.lleida!.nuclei, [
    { name: "Raimat", dates: ["2027-04-27", "2027-07-23"] },
    { name: "Sucs", dates: ["2027-05-14", "2027-08-13"] },
  ]);
  assert.deepEqual(COUNCIL_2027.mataro!.local, ["2027-05-17", "2027-07-27"]);
  assert.deepEqual(COUNCIL_2027["vila-seca"]!.local, ["2027-01-18", "2027-08-03"]);
});

test("local-2027.json stays empty until the DOGC order: the council data is what the pages show", () => {
  assert.equal(NEXT_YEAR.order, null);
  assert.deepEqual(NEXT_YEAR.municipalities, {});
  assert.equal(nextYearPublished(), false);
  assert.equal(councilApprovedTowns().length, councilSlugs().length);
  for (const slug of councilSlugs()) assert.equal(councilApproved2027(slug), COUNCIL_2027[slug]);
  assert.equal(councilApproved2027("tarragona"), null);
});

/* -------------------------------------------------------------------------- */
/* The DOGC order wins                                                        */
/* -------------------------------------------------------------------------- */

test("the DOGC order supersedes the council's word everywhere", () => {
  // Once the order is parsed, no town has council data, listed or not.
  for (const slug of councilSlugs()) assert.equal(councilApproved2027(slug, true), null, slug);

  const bcn = town("barcelona");
  const dogc = { local: ["2027-05-17", "2027-09-24"] };
  const ca = municipalityCopy(bcn, "ca", dogc, "el Barcelonès", COUNCIL_2027.barcelona!);
  assert.equal(ca.nextCouncil, null);
  assert.equal(ca.nextLead, null);
  assert.equal(ca.councilSource, null);
  assert.match(ca.nextPublished ?? "", /^Els festius locals de Barcelona el 2027 són /);
  const faq = municipalityFaq(bcn, "es", dogc, "2026-10-31", COUNCIL_2027.barcelona!);
  assert.doesNotMatch(faq[2]!.answer, /pendientes/);
  assert.match(faq[2]!.answer, /^Los festivos locales de Barcelona en 2027 son /);
  const en = englishTownCopy(bcn, dogc, COUNCIL_2027.barcelona!);
  assert.equal(en.nextLead, null);
  assert.equal(en.councilSource, null);
  assert.doesNotMatch(en.next.join(" "), /pending/);
  assert.doesNotMatch(englishTownFaq(bcn, dogc, COUNCIL_2027.barcelona!)[3]!.answer, /pending/);
  // Titles and descriptions fall back to the plain forms when there is no council data.
  assert.equal(municipalityTitle(bcn, "es", councilApproved2027("barcelona", true)), municipalityTitle(bcn, "es", null));
  assert.equal(englishTownDescription(bcn, councilApproved2027("barcelona", true)), englishTownDescription(bcn, null));

  // What prepare2027 prints for a person to check: towns whose order days differ from the council's.
  const parsed = Object.fromEntries(councilSlugs().map((slug) => [slug, { local: [...COUNCIL_2027[slug]!.local] }]));
  assert.deepEqual(councilDisagreements(parsed), []);
  parsed.girona = { local: ["2027-07-25", "2027-10-29"] };
  delete parsed.barcelona;
  assert.deepEqual(
    councilDisagreements(parsed).map((d) => d.slug).sort(),
    ["barcelona", "girona"],
  );
});

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */

test("titles <= 60 and descriptions <= 155 in all three languages, with the 2027 dates in one of them", () => {
  for (const slug of councilSlugs()) {
    const m = town(slug);
    const c = COUNCIL_2027[slug]!;
    for (const locale of ["ca", "es"] as const) {
      const title = municipalityTitle(m, locale);
      const description = municipalityDescription(m, locale);
      assert.ok(title.length <= TITLE_MAX, `${title} (${title.length})`);
      assert.ok(description.length <= DESCRIPTION_MAX, `${description} (${description.length})`);
      const pair = dayPair(c.local[0], c.local[1], locale);
      assert.ok(description.includes(pair), `${slug} ${locale}: ${description}`);
      assert.ok(description.includes(String(NEXT)) && description.includes(String(YEAR)), description);
      // Dates in the title whenever the dated form fits.
      if (title.includes(":") && !/festiu\?|festivo\?/.test(title)) assert.ok(title.endsWith(pair), title);
    }
    if (hasEnglishPage(slug)) {
      const title = englishTownTitle(m);
      const description = englishTownDescription(m);
      assert.ok(title.length <= 60, `${title} (${title.length})`);
      assert.ok(description.length <= 155, `${description} (${description.length})`);
      assert.ok(description.includes(dayPair(c.local[0], c.local[1], "en")), description);
      for (const d of m.local) assert.ok(description.includes(dayMonth(d, "en")), description);
    }
  }
  assert.equal(municipalityTitle(town("granollers"), "es"), "Festivos Granollers 2026 y 2027: 7 de mayo y 27 de agosto");
  assert.equal(municipalityTitle(town("barcelona"), "ca"), "Festius Barcelona 2026 i 2027: 17 de maig i 24 de setembre");
  assert.equal(municipalityTitle(town("barcelona"), "es"), "Festivos Barcelona 2026-2027: 17 de mayo y 24 de septiembre");
  assert.equal(englishTownTitle(town("blanes")), "Blanes public holidays 2026 and 2027: 30 March and 26 July");
  // Too long for the dates: the title stays as it was, the description carries them.
  assert.equal(municipalityTitle(town("l-hospitalet-de-llobregat"), "es"), "Festivos locales L'Hospitalet de Llobregat 2026 y 2027");
  assert.match(municipalityDescription(town("l-hospitalet-de-llobregat"), "es"), /2027: 17 de mayo y 24 de septiembre/);
});

test("town page: the answer with its label first, then the 2027 calendar with the days marked pending", () => {
  const bcn = town("barcelona");
  const ca = municipalityCopy(bcn, "ca", null, "el Barcelonès");
  assert.equal(
    ca.nextLead,
    "Festius locals del 2027: 17 de maig i 24 de setembre, aprovats per l'Ajuntament (decret d'alcaldia del 4 de juny de 2026), pendents de l'ordre del DOGC.",
  );
  assert.match(ca.nextCouncil![0]!, /^Els festius locals de Barcelona el 2027 seran el dilluns 17 de maig \(Dilluns de Pasqua Granada\) i el divendres 24 de setembre \(Mare de Déu de la Mercè\)/);
  assert.equal(ca.councilSource?.url, COUNCIL_2027.barcelona!.source.url);
  const es = municipalityCopy(town("granollers"), "es", null, "Vallès Oriental");
  assert.match(es.nextLead ?? "", /aprobados por el Ayuntamiento \(pleno del 21 de julio de 2026\), pendientes de la orden del DOGC\.$/);
  const en = englishTownCopy(bcn, null);
  assert.match(en.nextLead ?? "", /approved by the council \(mayoral decree of 4 June 2026\), pending the DOGC order\.$/);
  assert.match(en.nextCaption, /pending the DOGC order/);

  // The labels for each kind of act.
  assert.match(councilLabel(COUNCIL_2027.badalona!, "ca"), /^aprovats per l'Ajuntament \(Junta de Govern Local del 17 de juliol de 2026\)/);
  assert.match(councilLabel(COUNCIL_2027.girona!, "es"), /^aprobados por el pleno del Ayuntamiento, pendientes/);
  assert.match(councilLabel(COUNCIL_2027.lleida!, "en"), /^set by the council, according to its website, pending the DOGC order$/);

  // The 2027 table: the twelve Catalonia-wide days plus the council's two, marked pending.
  const rows = yearRows(bcn, NEXT, "ca", { council: true });
  assert.equal(rows.length, 14);
  assert.deepEqual(
    rows.filter((r) => r.pending).map((r) => [r.date, r.name]),
    [
      ["2027-05-17", "Dilluns de Pasqua Granada"],
      ["2027-09-24", "Mare de Déu de la Mercè"],
    ],
  );
  assert.ok(yearRows(bcn, NEXT, "es", { council: true }).filter((r) => r.pending).every((r) => r.name === "Fiesta local"));
  // Without the option (and in the status box) next year has no local days until the order.
  assert.equal(yearRows(bcn, NEXT, "ca").filter((r) => r.kind === "local").length, 0);
  assert.ok(!statusDays(bcn, "ca").some((d) => d.d === "2027-05-17"));

  // FAQ and Dataset carry the same days.
  assert.match(municipalityFaq(bcn, "ca", null, "2026-10-31")[2]!.answer, /seran el dilluns 17 de maig i el divendres 24 de setembre, aprovats per l'Ajuntament/);
  const dataset = municipalityDataset(bcn, "es") as Record<string, unknown>;
  assert.equal(dataset.temporalCoverage, `${YEAR}/${NEXT}`);
  assert.ok((dataset.isBasedOn as string[]).includes(COUNCIL_2027.barcelona!.source.url));
  assert.match(String(dataset.description), /2027: 17 de mayo y 24 de septiembre/);
  const tgn = municipalityDataset(town("tarragona"), "es") as Record<string, unknown>;
  assert.equal(tgn.temporalCoverage, String(YEAR));
});

test("nuclei the council lists are named with their own days", () => {
  const lleida = municipalityCopy(town("lleida"), "ca", null, "el Segrià");
  assert.match(lleida.nextCouncil![0]!, /Alguns nuclis en tenen de propis: Raimat \(27 d'abril i 23 de juliol\) i Sucs \(14 de maig i 13 d'agost\)\./);
  const tortosa = municipalityCopy(town("tortosa"), "es", null, "Baix Ebre");
  assert.match(tortosa.nextCouncil![0]!, /Bítem \(17 de mayo y 17 de septiembre\)/);
});

test("hubs and comarca pages count and name the councils from the data", () => {
  const n = councilApprovedTowns().length;
  assert.match(hubCopy("ca").next, new RegExp(` ${n} ajuntaments ja han aprovat els seus, pendents de l'ordre`));
  assert.match(hubCopy("es").next, new RegExp(` ${n} ayuntamientos ya han aprobado los suyos, pendientes de la orden`));
  const valles = comarcaCopy(comarcaOf(town("granollers")), "ca").next;
  assert.match(valles, /Granollers \(7 de maig i 27 d'agost\)/);
  assert.match(valles, /pendents de l'ordre del DOGC/);
  const hub = englishHubCopy();
  assert.match(hub.next, /Barcelona \(17 May and 24 September\)/);
  assert.match(hub.next, /have already approved theirs, pending the order\.$/);
});

test("deterministic: no clock in the council data or the code that prints it", () => {
  for (const file of ["src/lib/programmatic/holidays/council-2027.ts", "src/lib/programmatic/holidays/structured.ts", "src/lib/programmatic/holidays/copy.ts"]) {
    const source = readFileSync(join(ROOT, file), "utf8");
    assert.doesNotMatch(source, /new Date\(\)|Date\.now\(/, file);
  }
  for (const slug of councilSlugs()) {
    const m = town(slug);
    assert.equal(municipalityTitle(m, "ca"), municipalityTitle(m, "ca"));
    assert.deepEqual(municipalityCopy(m, "es", null, m.comarca), municipalityCopy(m, "es", null, m.comarca));
  }
});
