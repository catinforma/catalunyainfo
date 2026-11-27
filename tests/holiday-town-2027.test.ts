import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { LOCAL_ORDER_CHECKED } from "../src/lib/content/holidays/publish.ts";
import { todayInCatalonia } from "../src/lib/content/holidays/calendar.ts";
import { councilLabel, municipalityCopy, municipalityFaq } from "../src/lib/programmatic/holidays/copy.ts";
import { COUNCIL_2027 } from "../src/lib/programmatic/holidays/council-2027.ts";
import { NEXT_YEAR, councilApproved2027, municipalities, municipalityBySlug } from "../src/lib/programmatic/holidays/data.ts";
import { englishTownCopy, englishTownFaq } from "../src/lib/programmatic/holidays/english-copy.ts";
import { englishTowns } from "../src/lib/programmatic/holidays/english.ts";
import { town2027Line } from "../src/lib/programmatic/holidays/first-screen.ts";
import { addDays, weekdayDayMonth } from "../src/lib/programmatic/holidays/format.ts";
import { datePath, isDatePage } from "../src/lib/programmatic/holidays/paths.ts";
import { town2027BridgeFaq, town2027Bridges, town2027DateLink, town2027Days, town2027Heading } from "../src/lib/programmatic/holidays/town-2027.ts";
import type { SnapshotMunicipality } from "../src/lib/programmatic/holidays/types.ts";

/*
 * Town holiday pages, 2027 on the first screen (docs/SEO_EXPERIMENTS.md, 27 Nov 2026, batch 8C):
 * one line with the town's 2027 local days (DOGC order, else the council's act, else "pending"),
 * the 2027 section headed in the searchers' words, and a long-weekend FAQ from the town's own days.
 */

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const town = (slug: string): SnapshotMunicipality => {
  const m = municipalityBySlug(slug);
  assert.ok(m, slug);
  return m;
};
const LOCALES = ["ca", "es", "en"] as const;
const BAD = /undefined|NaN|null|\$\{|\{\w+\}/;

test("three states from the data: the council's act (Badalona), pending (Tarragona), the DOGC order once parsed", () => {
  assert.equal(NEXT_YEAR.order, null, "local-2027.json is still empty: these cases assume the council data is what the pages show");
  const bdn = town2027Days(town("badalona"));
  assert.equal(bdn.state, "council");
  assert.deepEqual(bdn.local, ["2027-05-11", "2027-05-17"]);
  assert.equal(town2027Days(town("tarragona")).state, "pending");
  assert.deepEqual(town2027Days(town("tarragona")).local, []);
  // The order wins over the council, whatever the council said.
  const dogc = town2027Days(town("badalona"), { local: ["2027-05-17", "2027-05-11"], nuclei: [] }, COUNCIL_2027.badalona!);
  assert.equal(dogc.state, "dogc");
  assert.equal(dogc.council, null);
  assert.deepEqual(dogc.local, ["2027-05-11", "2027-05-17"]);
});

test("first-screen line, council state: weekdays, the council's act, the total; ca/es/en", () => {
  const m = town("badalona");
  const ca = town2027Line(m, "ca");
  assert.equal(ca.strong, "Festius locals de Badalona el 2027:");
  assert.equal(
    ca.text,
    ` dimarts 11 de maig i dilluns 17 de maig, ${councilLabel(COUNCIL_2027.badalona!, "ca")}. Amb els 12 de tot Catalunya, 14 festius.`,
  );
  assert.equal(ca.link, "Calendari laboral 2027 de Badalona");
  const es = town2027Line(m, "es");
  assert.equal(es.strong, "Festivos locales de Badalona en 2027:");
  assert.match(es.text, /^ martes 11 de mayo y lunes 17 de mayo, aprobados por el Ayuntamiento \(Junta de Gobierno Local del 17 de julio de 2026\), pendientes de la orden del DOGC\. Con los 12 de toda Cataluña, 14 festivos\.$/);
  assert.equal(es.link, "Calendario laboral 2027 de Badalona");
  const en = town2027Line(m, "en");
  assert.equal(en.strong, "Badalona's local holidays in 2027:");
  assert.match(en.text, /^ Tuesday 11 May and Monday 17 May, approved by the council .*pending the DOGC order\. With Catalonia's 12, 14 public holidays\.$/);
  // Catalan elision and Spanish capitals in the names.
  assert.equal(town2027Line(town("l-hospitalet-de-llobregat"), "ca").strong, "Festius locals de l'Hospitalet de Llobregat el 2027:");
  assert.equal(town2027Line(town("l-hospitalet-de-llobregat"), "es").strong, "Festivos locales de L'Hospitalet de Llobregat en 2027:");
});

test("first-screen line, pending state: no day named, the reason and the 2026 order's date; ca/es/en", () => {
  const m = town("tarragona");
  for (const locale of LOCALES) {
    const line = town2027Line(m, locale);
    assert.equal(line.state, "pending");
    assert.doesNotMatch(line.text, /\d+ (de |d')?(gener|febrer|març|abril|maig|juny|juliol|agost|setembre|octubre|novembre|enero|febrero|marzo|mayo|junio|julio|agosto|septiembre|octubre|noviembre|January|February|March|April|May|June|July|August|September|October|November) /, locale);
    assert.match(line.text, /17 de desembre de 2025|17 de diciembre de 2025|17 December 2025/, locale);
  }
  assert.match(town2027Line(m, "es").text, /^ pendientes de publicación\. Los propone el Ayuntamiento y los fija una orden del DOGC, que aún no ha salido/);
  assert.match(town2027Line(m, "ca").text, /^ pendents de publicació\. Els proposa l'Ajuntament/);
  assert.match(town2027Line(m, "en").text, /^ not published yet\./);
});

test("first-screen line, DOGC state: the order's number and bulletin, never the council's label", () => {
  const m = town("badalona");
  const days = town2027Days(m, { local: ["2027-05-11", "2027-05-17"], nuclei: [] }, null);
  const order = { name: "Ordre EMT/999/2026, de 10 de desembre, per la qual s'estableix el calendari de festes locals a Catalunya per a l'any 2027", ref: "DOGC núm. 9999, de 17.12.2026" };
  assert.equal(town2027Line(m, "ca", days, order).text, " dimarts 11 de maig i dilluns 17 de maig (Ordre EMT/999/2026, DOGC núm. 9999, de 17.12.2026). Amb els 12 de tot Catalunya, 14 festius.");
  assert.equal(town2027Line(m, "es", days, order).text, " martes 11 de mayo y lunes 17 de mayo (Orden EMT/999/2026, DOGC núm. 9999, de 17.12.2026). Con los 12 de toda Cataluña, 14 festivos.");
  assert.doesNotMatch(town2027Line(m, "en", days, order).text, /council|pending/);
  // A town with days only for its nuclei says so instead of an empty list.
  const nuclei = town2027Days(m, { local: [], nuclei: [{ name: "X", dates: ["2027-05-11", "2027-07-05"] }] }, null);
  assert.match(town2027Line(m, "es", nuclei, order).text, /cada núcleo tiene los suyos/);
});

test("Aran: the general days are Aran's twelve, not 'all of Catalonia's'", () => {
  const vielha = municipalities().find((m) => m.comarca === "Aran");
  assert.ok(vielha);
  const days = town2027Days(vielha, { local: ["2027-07-05", "2027-10-08"], nuclei: [] }, null);
  assert.match(town2027Line(vielha, "ca", days, null).text, /Amb els 12 generals de l'Aran, 14 festius\./);
  assert.match(town2027Line(vielha, "es", days, null).text, /Con los 12 generales de Arán, 14 festivos\./);
});

test("every town, every edition: one clean line, the days equal the council's, never a 2026 date", () => {
  let council = 0;
  let pending = 0;
  for (const m of municipalities()) {
    const c = councilApproved2027(m.slug);
    for (const locale of ["ca", "es"] as const) {
      const line = town2027Line(m, locale);
      assert.doesNotMatch(line.strong + line.text + line.link, BAD, `${m.slug} ${locale}`);
      if (c) {
        for (const d of c.local) assert.ok(line.text.includes(weekdayDayMonth(d, locale)), `${m.slug} ${locale}: ${d}`);
      }
      // The 2026 days are never offered as 2027's.
      for (const d of m.local) assert.ok(!line.text.includes(weekdayDayMonth(d.replace("2026", "2027"), locale)) || c?.local.includes(d.replace("2026", "2027")), `${m.slug}: ${d}`);
    }
    if (c) council += 1;
    else pending += 1;
  }
  assert.ok(council > 400 && pending > 400, `${council} council, ${pending} pending`);
  for (const m of englishTowns()) assert.doesNotMatch(Object.values(town2027Line(m, "en")).join(" "), BAD, m.slug);
});

test("long weekends from the town's own 2027 days, with the Catalonia-wide days counted as off", () => {
  const bdn = town("badalona");
  // Tuesday 11 May: book Monday 10 for Saturday 8 - Tuesday 11; Monday 17 May: Saturday 15 - Monday 17, no leave.
  assert.deepEqual(town2027Bridges(bdn, ["2027-05-11", "2027-05-17"]), [
    { dates: ["2027-05-11"], from: "2027-05-08", to: "2027-05-11", days: 4, take: ["2027-05-10"] },
    { dates: ["2027-05-17"], from: "2027-05-15", to: "2027-05-17", days: 3, take: [] },
  ]);
  // A Tuesday after Easter Monday (29 Mar 2027, Catalonia-wide) needs no leave: Good Friday 26 to Tuesday 30, five days.
  assert.deepEqual(town2027Bridges(bdn, ["2027-03-30"]), [{ dates: ["2027-03-30"], from: "2027-03-26", to: "2027-03-30", days: 5, take: [] }]);
  // Two days in the same run are one answer; a Saturday adds nothing.
  assert.deepEqual(town2027Bridges(bdn, ["2027-07-05", "2027-07-06"]).map((b) => [b.dates, b.days, b.take]), [[["2027-07-05", "2027-07-06"], 4, []]]);
  assert.deepEqual(town2027Bridges(bdn, ["2027-07-03"]), [{ dates: ["2027-07-03"], from: null, to: null, days: 0, take: [] }]);
});

test("long-weekend FAQ: in the searchers' words, labelled pending the order, absent while the days are not known", () => {
  const bdn = town("badalona");
  const es = town2027BridgeFaq(bdn, "es")!;
  assert.equal(es.question, "¿Hay puente con las fiestas locales de 2027 en Badalona?");
  assert.equal(
    es.answer,
    "El martes 11 de mayo: puente de 4 días, del sábado 8 al martes 11 de mayo, si pides el lunes 10 de mayo. El lunes 17 de mayo: 3 días seguidos sin pedir ninguno, del sábado 15 al lunes 17 de mayo. Son los días aprobados por el Ayuntamiento, pendientes de la orden del DOGC. Para una semana de lunes a viernes; turnos y convenios aparte.",
  );
  assert.equal(town2027BridgeFaq(bdn, "ca")!.question, "Hi ha pont amb les festes locals del 2027 a Badalona?");
  assert.match(town2027BridgeFaq(bdn, "ca")!.answer, /^El dimarts 11 de maig: pont de 4 dies, del dissabte 8 al dimarts 11 de maig, si demanes el dilluns 10 de maig\./);
  assert.equal(town2027BridgeFaq(bdn, "en")!.question, "Do Badalona's 2027 local holidays make a long weekend?");
  // A council page that names no act "gives" the days (Lleida), it did not "approve" them.
  assert.equal(COUNCIL_2027.lleida!.act.kind, "web");
  assert.match(town2027BridgeFaq(town("lleida"), "es")!.answer, /Son los días que el Ayuntamiento da en su web, pendientes de la orden del DOGC\./);
  // A Saturday.
  const sat = town2027BridgeFaq(bdn, "es", town2027Days(bdn, { local: ["2027-07-03"], nuclei: [] }, null))!;
  assert.match(sat.answer, /^El sábado 3 de julio cae en fin de semana: no añade ningún día libre de lunes a viernes\. Para una semana/);
  // Pending: no question at all.
  for (const locale of LOCALES) assert.equal(town2027BridgeFaq(town("tarragona"), locale), null);
  // On the pages: after the 2027 work-calendar question, in the FAQ the JSON-LD is built from (routes.tsx).
  const faq = municipalityFaq(bdn, "es", null, "2026-11-27");
  assert.equal(faq[2]!.question, "¿Cuál es el calendario laboral 2027 de Badalona?");
  assert.equal(faq[3]!.question, es.question);
  assert.ok(!municipalityFaq(town("tarragona"), "es", null, "2026-11-27").some((f) => /puente/.test(f.question)));
  assert.ok(englishTownFaq(town("barcelona"), null).some((f) => f.question === "Do Barcelona's 2027 local holidays make a long weekend?"));
  assert.match(read("src/components/programmatic/holidays/routes.tsx"), /items: municipalityFaq\(m, locale, nextYearFor\(m\.slug\), todayInCatalonia\(\)\)/);
  for (const m of municipalities()) {
    for (const locale of LOCALES) {
      const f = town2027BridgeFaq(m, locale);
      if (f) assert.doesNotMatch(f.question + f.answer, BAD, `${m.slug} ${locale}`);
    }
  }
});

test("2027 section heading in the query's words, ca/es/en, on the pages", () => {
  const vic = town("vic");
  assert.equal(town2027Heading(vic, "ca"), "Festius i calendari laboral 2027 a Vic");
  assert.equal(town2027Heading(vic, "es"), "Festivos y calendario laboral 2027 en Vic");
  assert.equal(town2027Heading(town("barcelona"), "en"), "Barcelona public and bank holidays 2027");
  assert.equal(town2027Heading(town("el-vendrell"), "ca"), "Festius i calendari laboral 2027 al Vendrell");
  assert.equal(town2027Heading(town("el-vendrell"), "es"), "Festivos y calendario laboral 2027 en El Vendrell");
  assert.equal(municipalityCopy(vic, "ca", null, "Osona").nextTitle, town2027Heading(vic, "ca"));
  assert.equal(municipalityCopy(vic, "es", null, "Osona").nextTitle, town2027Heading(vic, "es"));
  assert.equal(englishTownCopy(town("barcelona"), null).nextTitle, town2027Heading(town("barcelona"), "en"));
});

test("one link from the 2027 section to a 2027 date page the town's day has, with who else is off", () => {
  const bdn = town("badalona");
  const es = town2027DateLink(bdn, "es")!;
  assert.equal(es.date, "2027-05-17");
  assert.ok(isDatePage(es.date));
  assert.match(es.lead, /^El lunes 17 de mayo de 2027 también es fiesta local en otros \d+ lugares, según los días que ya han aprobado los ayuntamientos:$/);
  assert.equal(datePath("es", es.date), "/es/festivos/dia/17-mayo-2027/");
  assert.match(town2027DateLink(bdn, "ca")!.lead, /^El dilluns 17 de maig de 2027 també és festa local a \d+ llocs més/);
  // Lleida's two days (11 May, 29 Sep) have no date page; Tarragona has no days yet.
  assert.equal(town2027DateLink(town("lleida"), "es"), null);
  assert.equal(town2027DateLink(town("tarragona"), "es"), null);
});

test("the pages: the 2027 line sits on the first screen above the 2026 table, the old callout under the live box is gone", () => {
  const page = read("src/components/programmatic/holidays/MunicipalityPage.tsx");
  const loop = page.slice(page.indexOf("{firstScreenOrder(locale).map("), page.indexOf("<NextStep step={townNextStep("));
  assert.ok(loop.indexOf('<Town2027FirstLine line={line2027} anchor="festius-2027" />') > -1);
  assert.ok(loop.indexOf("<Town2027FirstLine") < loop.indexOf('<h2 id="festius-2026"'));
  // The es answer still comes first (TODAY_FIRST), untouched.
  assert.ok(loop.indexOf('part === "answer"') < loop.indexOf("<Town2027FirstLine"));
  assert.doesNotMatch(page, /\{t\.nextLead\}/);
  assert.match(page, /<h2 id="festius-2027">\{t\.nextTitle\}<\/h2>/);
  assert.match(page, /dateLink2027 \? \([^]*?datePath\(locale, dateLink2027\.date\)/);
  const en = read("src/components/programmatic/holidays/EnglishTownPage.tsx");
  assert.ok(en.indexOf('<Town2027FirstLine line={town2027Line(m, "en", days2027)} anchor="holidays-2027" />') > -1);
  assert.ok(en.indexOf("<Town2027FirstLine") < en.indexOf('<h2 id="holidays-2026"'));
  assert.doesNotMatch(en, /\{t\.nextLead\}/);
  // Plain server HTML, a jump to the section.
  const parts = read("src/components/programmatic/holidays/parts.tsx");
  assert.match(parts, /export function Town2027FirstLine[^]*?<strong>\{line\.strong\}<\/strong>[^]*?href=\{`#\$\{anchor\}`\}/);
});

test("date guard: 'the DOGC order has not come out' is re-read with the local-order check", () => {
  // The pending line says the order is not out (DOGC read to núm. 9804, 27.11.2026, `holidays:snapshot -- find`).
  // It rides on LOCAL_ORDER_CHECKED (lib/content/holidays/publish.ts), which holiday-serp-push-13nov guards for 21 days.
  if (NEXT_YEAR.order === null) {
    assert.ok(todayInCatalonia() <= addDays(LOCAL_ORDER_CHECKED, 21), `re-read the DOGC for the 2027 local order (holidays:snapshot -- find), then move LOCAL_ORDER_CHECKED (${LOCAL_ORDER_CHECKED})`);
  }
});
