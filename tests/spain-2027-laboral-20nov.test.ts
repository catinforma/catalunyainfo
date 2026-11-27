import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CITIES, bulletinLocal2027, cityBySlug, cityReadOn, local2027 } from "../src/lib/programmatic/spain-2027/cities.ts";
import { CANTABRIA_READ_ON } from "../src/lib/programmatic/spain-2027/cities-data.ts";
import { TEN_K_CITY_ROWS, TEN_K_READ_ON } from "../src/lib/programmatic/spain-2027/cities-10k.ts";
import { COUNCIL_READ_ON } from "../src/lib/programmatic/spain-2027/cities-council.ts";
import { LIST_READ_ON, WAITING_RECHECK_BY, WAITING_TOWNS } from "../src/lib/programmatic/spain-2027/cities-more.ts";
import { cityAnswer, cityFaq, cityLayerLines } from "../src/lib/programmatic/spain-2027/city-copy.ts";
import { cityFaqIntl } from "../src/lib/programmatic/spain-2027/city-copy-intl.ts";
import { PENDING_CHECKS, PENDING_READ_ON, SOURCES } from "../src/lib/programmatic/spain-2027/sources.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";

/**
 * Calendario laboral 2027, 20 Nov 2026 (docs/SEO_EXPERIMENTS.md): Cantabria's
 * 2027 list came out that day (BOC núm. 224, CVE-2026-9104) and its five city
 * pages print it; the other five pending lists were read again through that
 * day's issue; pending pages answer "¿cuáles son los festivos locales de
 * <ciudad> en 2027?" in the FAQ and name the city in the local section.
 */

/** The 10,000+ wave (24 Nov 2026, cities-10k.ts) reads the same bulletins on its own day. */
const TEN_K = new Set(TEN_K_CITY_ROWS.map((r) => r.ine));

test("Cantabria: BOC núm. 224, de 20.11.2026, read the day it came out", () => {
  const local = SOURCES.CB.local;
  assert.equal(local.status, "published");
  assert.equal(local.checked, undefined);
  assert.equal(local.y2027?.ref, "BOC núm. 224, de 20.11.2026");
  assert.equal(local.y2027?.date, "2026-11-20");
  assert.equal(local.y2027?.url, "https://boc.cantabria.es/boces/verAnuncioAction.do?idAnuBlob=443286");
  assert.ok(!("CB" in PENDING_CHECKS));
  assert.equal(CANTABRIA_READ_ON, local.y2027?.date);
  assert.equal(LIST_READ_ON.CB, local.y2027?.date);
  assert.ok(!WAITING_TOWNS.some((t) => t.region === "CB"), "every Cantabrian town of 20,000+ has its page");
  const cb = CITIES.filter((c) => c.region === "CB" && !TEN_K.has(c.ine));
  assert.deepEqual(cb.map((c) => c.slug).sort(), ["camargo", "castro-urdiales", "pielagos", "santander", "torrelavega"]);
  for (const c of cb) {
    assert.equal(c.status2027, "published", c.slug);
    assert.equal(local2027(c)?.source.ref, "BOC núm. 224, de 20.11.2026", c.slug);
    assert.equal(cityReadOn(c), "2026-11-20", c.slug);
  }
});

test("Torrelavega: the answer, the layers and the FAQ give San Roque and San Cipriano from the BOC", () => {
  const t = cityBySlug("CB", "torrelavega")!;
  const a = cityAnswer(t);
  assert.equal(a.strong, "Fiestas locales de Torrelavega en 2027: el lunes 16 de agosto (San Roque) y el jueves 16 de septiembre (San Cipriano).");
  assert.match(a.rest, /^ Las publica el BOC núm\. 224, de 20\.11\.2026\. Con los 12 festivos de Cantabria, son 14 festivos en 2027\.$/);
  const local = cityLayerLines(t).find((l) => l.id === "local")!;
  assert.equal(local.source, "BOC núm. 224, de 20.11.2026");
  assert.equal(cityFaq(t)[0]!.question, "¿Cuáles son los festivos locales de Torrelavega en 2027?");
  assert.match(cityFaq(t)[0]!.answer, /San Roque.*San Cipriano.*BOC núm\. 224/);
});

test("Vigo and Marbella: their bulletin lines read again on 20 Nov 2026", () => {
  for (const [region, slug, days] of [
    ["GA", "vigo", ["2027-03-29", "2027-08-16"]],
    ["AN", "marbella", ["2027-06-11", "2027-10-19"]],
  ] as const) {
    const c = cityBySlug(region, slug)!;
    assert.equal(c.status2027, "published", slug);
    assert.deepEqual(local2027(c)!.days.map((d) => d.date), [...days], slug);
    assert.equal(cityReadOn(c), "2026-11-20", slug);
  }
});

test("pending lists: the three still out read through the issues of 26-27.11.2026 (Aragón out on the 27th); the council acts read on 20 Nov", () => {
  assert.ok(PENDING_READ_ON >= "2026-11-27");
  assert.deepEqual(Object.keys(PENDING_CHECKS).sort(), ["CM", "MD", "NC"]);
  // The BOCM of 27 Nov was not online yet when the others were read (still 404 at 02:20).
  assert.deepEqual(
    Object.values(PENDING_CHECKS).map((p) => p.through),
    ["DOCM núm. 228, de 27.11.2026", "BOCM núm. 284, de 26.11.2026", "BON núm. 237, de 27.11.2026"],
  );
  assert.equal(COUNCIL_READ_ON, "2026-11-20");
  assert.ok(WAITING_RECHECK_BY > PENDING_READ_ON);
});

test("Comunitat Valenciana: the three provincial BOPs, every city of the family from its own province's list", () => {
  const local = SOURCES.VC.local;
  assert.equal(local.status, "published");
  assert.equal(local.checked, undefined);
  assert.equal(local.y2027, null);
  assert.deepEqual(local.parts!.map((p) => [p.place, p.text.ref, p.text.date]), [
    ["Alicante", "BOP de Alicante núm. 210, de 4.11.2026", "2026-11-04"],
    ["Castellón", "BOP de Castellón núm. 136, de 10.11.2026", "2026-11-10"],
    ["Valencia", "BOP de Valencia núm. 224, de 20.11.2026", "2026-11-20"],
  ]);
  for (const p of local.parts!) assert.match(p.text.url, /^https:\/\/habitatge\.gva\.es\/documents\/21189\/417703197\/BOP\+/, p.place);
  assert.equal(local.bulletinUrl, "https://habitatge.gva.es/es/web/dg-trabajo/calendario-laboral");
  const vc = CITIES.filter((c) => c.region === "VC");
  assert.ok(vc.length >= 68, `${vc.length} Valencian pages`);
  assert.ok(!WAITING_TOWNS.some((t) => t.region === "VC"));
  for (const c of vc) {
    assert.equal(c.status2027, "published", c.slug);
    const part = local.parts!.find((p) => p.place === c.province)!;
    assert.equal(local2027(c)!.source.ref, part.text.ref, `${c.slug}: not its province's BOP`);
    assert.equal(cityReadOn(c), TEN_K.has(c.ine) ? TEN_K_READ_ON : "2026-11-20", c.slug);
  }
  const days = (slug: string) => local2027(cityBySlug("VC", slug)!)!.days.map((d) => d.date);
  assert.deepEqual(days("benidorm"), ["2027-11-15", "2027-11-16"]);
  assert.deepEqual(days("paterna"), ["2027-04-05", "2027-08-30"]);
  assert.deepEqual(days("gandia"), ["2027-04-05", "2027-10-04"]);
  assert.deepEqual(days("san-vicente-del-raspeig"), ["2027-04-05", "2027-04-06"]);
  assert.deepEqual(days("elda"), ["2027-09-08", "2027-09-09"]);
  assert.deepEqual(days("alcoy"), ["2027-04-24", "2027-04-26"]);
  assert.deepEqual(days("orihuela"), ["2027-07-17", "2027-09-08"]);
  assert.equal(cityAnswer(cityBySlug("VC", "benidorm")!).strong, "Fiestas locales de Benidorm en 2027: el lunes 15 de noviembre y el martes 16 de noviembre.");
  assert.match(cityAnswer(cityBySlug("VC", "benidorm")!).rest, /^ Las publica el BOP de Alicante núm\. 210, de 4\.11\.2026\./);
});

test("Parla and Fuenlabrada: the Pleno's own minutes, labelled pending the BOCM, left out of the counting tools", () => {
  for (const [slug, days, host] of [
    ["parla", ["2027-06-14", "2027-09-13"], "sede.ayuntamientoparla.es"],
    ["fuenlabrada", ["2027-03-09", "2027-09-14"], "plenos.ayto-fuenlabrada.es"],
  ] as const) {
    const c = cityBySlug("MD", slug)!;
    assert.equal(c.status2027, "council", slug);
    assert.equal(c.local2026, null, slug);
    assert.equal(cityReadOn(c), COUNCIL_READ_ON, slug);
    const list = local2027(c)!;
    assert.deepEqual(list.days.map((d) => d.date), [...days], slug);
    assert.equal(list.act?.kind, "pleno", slug);
    assert.equal(list.act?.date, list.source.date, slug);
    assert.equal(new URL(list.source.url).hostname, host, slug);
    assert.match(list.source.title, /^Acta de la sesión ordinaria del Pleno/, slug);
    assert.equal(bulletinLocal2027(c), null, `${slug}: counted as the bulletin's`);
    assert.match(cityAnswer(c).rest, /Las aprobó el Pleno del Ayuntamiento el \d{1,2} de octubre de 2026; falta que las publique el BOCM \(consultado hasta el BOCM núm\. 284, de 26\.11\.2026\)\./, slug);
    for (const d of list.days) assert.equal(["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date(`${d.date}T12:00:00Z`).getUTCDay()], d.printedWeekday, `${slug} ${d.date}`);
  }
  // Still pending in Madrid: no act that meets the rule.
  for (const slug of ["madrid", "alcobendas", "alcorcon", "pinto", "valdemoro", "san-sebastian-de-los-reyes"]) assert.equal(cityBySlug("MD", slug)!.status2027, "pending", slug);
});

test("pending FAQ: '¿Cuáles son los festivos locales de <ciudad> en 2027?' answered first, es/ca/en", () => {
  const alcobendas = cityBySlug("MD", "alcobendas")!;
  const [es] = cityFaq(alcobendas);
  assert.equal(es!.question, "¿Cuáles son los festivos locales de Alcobendas en 2027?");
  assert.equal(
    es!.answer,
    "Aún no son oficiales: el BOCM todavía no ha publicado la lista de 2027 (consultado hasta el BOCM núm. 284, de 26.11.2026). La de 2026 salió el 12 de diciembre de 2025 (BOCM núm. 296, de 12.12.2025). Cuando se publiquen, esta página dará las fechas con su fuente.",
  );
  const [ca] = cityFaqIntl(alcobendas, "ca");
  assert.equal(ca!.question, "Quins són els festius locals d'Alcobendas el 2027?");
  assert.match(ca!.answer, /^Encara no són oficials: .*\(consultat fins al BOCM núm\. 284, de 26\.11\.2026\)\. La del 2026 va sortir el 12 de desembre de 2025 \(BOCM núm\. 296/);
  const [en] = cityFaqIntl(alcobendas, "en");
  assert.equal(en!.question, "What are Alcobendas's local holidays in 2027?");
  assert.match(en!.answer, /^They are not official yet: .*\(read up to BOCM núm\. 284, de 26\.11\.2026\)\. The 2026 list came out on 12 December 2025 \(BOCM núm\. 296/);
  // Navarra: 3 December is already fixed for every municipality.
  assert.match(cityFaq(cityBySlug("NC", "pamplona")!)[0]!.answer, /^Una ya es oficial: el viernes 3 de diciembre .* La otra, la propia de Pamplona, aún no: el BON todavía no ha publicado la lista de 2027 \(consultado hasta el BON núm\. 237, de 27\.11\.2026\)\./);
  // Burgos: the provincial list is out and leaves the capital out.
  assert.match(cityFaq(cityBySlug("CL", "burgos")!)[0]!.answer, /^La lista oficial de 2027 no las da\./);
  // No pending answer gives a 2027 date.
  for (const c of CITIES.filter((x) => x.status2027 === "pending" || x.status2027 === "missing")) {
    for (const answer of [cityFaq(c)[0]!.answer, cityFaqIntl(c, "ca")[0]!.answer, cityFaqIntl(c, "en")[0]!.answer]) {
      if (c.region !== "NC") assert.doesNotMatch(answer, /2027-\d\d|\b\d{1,2} (de |d')?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|gener|febrer|març|maig|juny|juliol|agost|setembre|octubre|novembre|desembre|January|February|March|April|May|June|July|August|September|October|November|December) (de |del )?2027\b/, c.slug);
    }
  }
});

test("pending pages: the local section's heading names the city (es, ca, en)", () => {
  const es = readFileSync(join(import.meta.dirname, "../src/components/programmatic/spain-2027/city-page.tsx"), "utf8");
  const intl = readFileSync(join(import.meta.dirname, "../src/components/programmatic/spain-2027/city-page-intl.tsx"), "utf8");
  assert.match(es, /Fiestas locales de \{c\.name\} en \{YEAR\}: aún no publicadas/);
  assert.match(intl, /`Festes locals \$\{caOf\(name\)\} el \$\{YEAR\}: encara sense publicar`, `\$\{Name\}'s \$\{YEAR\} local holidays: not yet published`/);
});

test("low-demand: EN Santander, Benidorm, Castellón and Torrevieja indexable now that their 2027 days are out", () => {
  for (const p of [
    "/en/holidays/2027/cantabria/santander/",
    "/en/holidays/2027/valencian-community/benidorm/",
    "/en/holidays/2027/valencian-community/castellon-de-la-plana/",
    "/en/holidays/2027/valencian-community/torrevieja/",
  ]) {
    assert.equal(isLowDemandPath(p, "2026-11-20"), false, p);
  }
  assert.equal(isLowDemandPath("/en/holidays/2027/cantabria/torrelavega/", "2026-11-20"), true);
});
