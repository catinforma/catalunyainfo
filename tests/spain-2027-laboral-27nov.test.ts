import assert from "node:assert/strict";
import { test } from "node:test";

import { CITIES, cityBySlug, cityReadOn, local2027 } from "../src/lib/programmatic/spain-2027/cities.ts";
import { ARAGON_READ_ON, CITIES_STATUS_READ_ON } from "../src/lib/programmatic/spain-2027/cities-data.ts";
import { TEN_K_LIST_READ_ON, TEN_K_PENDING_READ, TEN_K_WAITING } from "../src/lib/programmatic/spain-2027/cities-10k.ts";
import { LIST_READ_ON, WAITING_TOWNS } from "../src/lib/programmatic/spain-2027/cities-more.ts";
import { cityAnswer } from "../src/lib/programmatic/spain-2027/city-copy.ts";
import { cityAnswerIntl } from "../src/lib/programmatic/spain-2027/city-copy-intl.ts";
import { PENDING_CHECKS, PENDING_READ_ON, SOURCES } from "../src/lib/programmatic/spain-2027/sources.ts";

/**
 * Calendario laboral 2027, 27 Nov 2026 (docs/SEO_EXPERIMENTS.md): Aragón's
 * 2027 list came out that day (BOA núm. 230, Resolución de 13 de noviembre de
 * 2026 del Director General de Trabajo) and its 15 city pages print it; the
 * three lists still pending (DOCM, BOCM, BON) and the two "missing" capitals
 * of Castilla y León were read again that day.
 */

const BOA_REF = "BOA núm. 230, de 27.11.2026";

test("Aragón: BOA núm. 230, de 27.11.2026, read the day it came out", () => {
  const local = SOURCES.AR.local;
  assert.equal(local.status, "published");
  assert.equal(local.checked, undefined);
  assert.equal(local.y2027?.ref, BOA_REF);
  assert.equal(local.y2027?.date, "2026-11-27");
  assert.equal(local.y2027?.url, "https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1476882940808");
  assert.match(local.y2027!.title, /^Resolución de 13 de noviembre de 2026, del Director General de Trabajo, .* para el año 2027, en los municipios de las provincias de Huesca, Teruel y Zaragoza$/);
  assert.ok(!("AR" in PENDING_CHECKS));
  assert.ok(!("AR" in TEN_K_PENDING_READ));
  for (const read of [ARAGON_READ_ON, LIST_READ_ON.AR, TEN_K_LIST_READ_ON.AR]) assert.equal(read, local.y2027?.date);
  assert.ok(!WAITING_TOWNS.some((t) => t.region === "AR"), "every Aragonese town of 20,000+ has its page");
  assert.ok(!TEN_K_WAITING.some((t) => t.region === "AR"), "every Aragonese town of 10,000+ has its page");
  const ar = CITIES.filter((c) => c.region === "AR");
  assert.equal(ar.length, 15);
  for (const c of ar) {
    assert.equal(c.status2027, "published", c.slug);
    assert.equal(c.local2026, null, c.slug);
    assert.equal(local2027(c)?.source.ref, BOA_REF, c.slug);
    assert.equal(cityReadOn(c), "2026-11-27", c.slug);
  }
});

test("Aragón: each town's two days as the annex prints them", () => {
  const days = (slug: string) => local2027(cityBySlug("AR", slug)!)!.days.map((d) => [d.date, d.name]);
  // «Calatayud. 7 de septiembre y 8 de septiembre. Virgen de la Peña.»: one name for both days, given to neither.
  assert.deepEqual(days("calatayud"), [["2027-09-07", null], ["2027-09-08", null]]);
  assert.deepEqual(days("utebo"), [["2027-06-19", "San Lamberto"], ["2027-07-26", "Santa Ana"]]);
  assert.deepEqual(days("monzon"), [["2027-03-29", "Día de la Virgen de la Alegría"], ["2027-09-21", "San Mateo"]]);
  assert.deepEqual(days("barbastro"), [["2027-06-21", "San Ramón"], ["2027-09-08", "Natividad de Nuestra Señora"]]);
  assert.deepEqual(days("ejea-de-los-caballeros"), [["2027-01-14", null], ["2027-06-24", null]]);
  assert.deepEqual(days("alcaniz"), [["2027-09-09", null], ["2027-09-10", null]]);
  assert.deepEqual(days("fraga"), [["2027-10-11", null], ["2027-10-13", null]]);
  assert.deepEqual(days("cuarte-de-huerva"), [["2027-01-29", null], ["2027-07-26", null]]);
  assert.deepEqual(days("jaca"), [["2027-05-07", "Primer Viernes de Mayo"], ["2027-06-25", "Santa Orosia"]]);
  assert.deepEqual(days("tarazona"), [["2027-08-28", "San Agustín"], ["2027-10-05", "San Atilano"]]);
  assert.deepEqual(days("caspe"), [["2027-03-29", null], ["2027-06-25", null]]);
  assert.deepEqual(days("binefar"), [["2027-03-29", "Lunes de Pascua"], ["2027-09-14", "Santo Cristo de los Milagros"]]);
  // The names that state a day agree with the 2027 calendar: Jaca's first Friday of May, Binéfar's Easter Monday.
  assert.equal(new Date("2027-05-07T12:00:00Z").getUTCDay(), 5);
  assert.equal(new Date("2027-05-01T12:00:00Z").getUTCDay(), 6);
  assert.equal(new Date("2027-03-29T12:00:00Z").getUTCDay(), 1);
});

test("Zaragoza: the answer gives San Valero and Cincomarzada from the BOA (es, ca, en)", () => {
  const z = cityBySlug("AR", "zaragoza")!;
  assert.equal(cityAnswer(z).strong, "Fiestas locales de Zaragoza en 2027: el viernes 29 de enero (San Valero) y el viernes 5 de marzo (Cincomarzada).");
  assert.match(cityAnswer(z).rest, /^ Las publica el BOA núm\. 230, de 27\.11\.2026\. Con los 12 festivos de Aragón, son 14 festivos en 2027\.$/);
  assert.match(cityAnswerIntl(z, "ca").strong, /^Festes locals de Saragossa el 2027: el divendres 29 de gener \(San Valero\) i el divendres 5 de març \(Cincomarzada\)\.$/);
  assert.match(cityAnswerIntl(z, "en").strong, /^Zaragoza local holidays 2027: Friday 29 January \(San Valero\) and Friday 5 March \(Cincomarzada\)\.$/);
});

test("still waiting on 27 Nov 2026: the DOCM, BOCM and BON read again, Burgos and Valladolid on the Junta's page", () => {
  assert.equal(PENDING_READ_ON, "2026-11-27");
  assert.equal(CITIES_STATUS_READ_ON, PENDING_READ_ON);
  assert.deepEqual(Object.keys(PENDING_CHECKS).sort(), ["CM", "MD", "NC"]);
  for (const r of ["CM", "MD", "NC"] as const) assert.equal(SOURCES[r].local.status, "pending", r);
  for (const slug of ["burgos", "valladolid"]) {
    const c = cityBySlug("CL", slug)!;
    assert.equal(c.status2027, "missing", slug);
    assert.equal(cityReadOn(c), CITIES_STATUS_READ_ON, slug);
  }
});
