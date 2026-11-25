import assert from "node:assert/strict";
import { test } from "node:test";

import { buildRegionBody } from "../src/lib/content/school-spain/body.ts";
import { localizeRegion } from "../src/lib/content/school-spain/i18n.ts";
import { regionPanel } from "../src/lib/content/school-spain/panel.ts";
import { provinceCalendars, schoolDayIn } from "../src/lib/content/school-spain/logic.ts";
import { SPAIN_REGIONS, regionBySlug } from "../src/lib/content/school-spain/regions.ts";
import type { Locale } from "../src/lib/i18n/config.ts";

/*
 * 25 Nov 2026 (docs/SEO_EXPERIMENTS.md): the regional school pages answer the
 * searched questions ("cuando dan / empiezan las vacaciones de navidad 2026",
 * "dias no lectivos <provincia>") in the searcher's words. Andalucía's seven
 * Delegación Territorial resolutions were re-read on 25 Nov 2026 (quotes in
 * data.ts); the dates below are those of the resolutions, not of a formula.
 */

type Box = {
  type: string;
  level?: number;
  text?: string;
  rows?: string[][];
  headers?: string[];
  items?: { question: string; answer: string }[];
};

const LOCALES: Locale[] = ["es", "ca", "en"];

function body(slug: string, locale: Locale): Box[] {
  const region = regionBySlug(slug)!;
  return buildRegionBody(localizeRegion(region, locale)) as Box[];
}

test("Andalucía: a table of non-teaching days per province, in each language, sample provinces with the resolutions' dates", () => {
  const expected = {
    es: { h2: "Días no lectivos por provincia en Andalucía, curso 2026-2027", sev: ["8 de enero", "26 de febrero"], mal: ["Semana Blanca", "29 de marzo", "3 de mayo"], alm: ["9 de octubre", "30 de octubre", "30 de abril"] },
    ca: { h2: "Dies no lectius per província a Andalusia, curs 2026-2027", sev: ["8 de gener", "26 de febrer"], mal: ["Setmana Blanca", "29 de març", "3 de maig"], alm: ["9 d'octubre", "30 d'octubre", "30 d'abril"] },
    en: { h2: "Non-teaching days by province in Andalusia, 2026-2027", sev: ["8 January", "26 February"], mal: ["Semana Blanca", "29 March", "3 May"], alm: ["9 October", "30 October", "30 April"] },
  } as const;
  for (const locale of LOCALES) {
    const blocks = body("andalucia", locale);
    const at = blocks.findIndex((b) => b.type === "heading" && b.level === 2 && b.text === expected[locale].h2);
    assert.notEqual(at, -1, `${locale}: no H2`);
    // Right after the Spain-wide Christmas line, before Easter: near the top of the page.
    const hub = blocks.findIndex((b) => b.type === "paragraph" && /vacaciones de Navidad 2026|vacances de Nadal 2026|Christmas 2026/.test(b.text ?? ""));
    assert.equal(at, hub + 1, `${locale}: follows the Spain-wide Christmas line`);
    const table = blocks[at + 2]!;
    assert.equal(table.type, "table", locale);
    const rows = new Map(table.rows!.map((r) => [r[0]!, r[1]!]));
    assert.equal(rows.size, 8, `${locale}: seven provinces and Jaén pending`);
    for (const k of expected[locale].sev) assert.ok([...rows.entries()].find(([n]) => /^Sevilla|^Seville/.test(n))![1].includes(k), `${locale} Sevilla ${k}`);
    for (const k of expected[locale].mal) assert.ok([...rows.entries()].find(([n]) => /^M[aàá]laga$/.test(n))![1].includes(k), `${locale} Málaga ${k}`);
    for (const k of expected[locale].alm) assert.ok([...rows.entries()].find(([n]) => /^Almer/.test(n))![1].includes(k), `${locale} Almería ${k}`);
    const jaen = [...rows.entries()].find(([n]) => /^Ja[eé]n$/.test(n));
    assert.ok(jaen, `${locale}: Jaén listed`);
    assert.doesNotMatch(jaen![1], /\d/, `${locale}: Jaén has no date invented`);
  }
});

test("Andalucía: the last day of class per province is in the Christmas paragraph and the FAQ ('cuándo dan las vacaciones')", () => {
  const es = body("andalucia", "es");
  const para = es.find((b) => b.type === "paragraph" && /Cada provincia fija su Navidad/.test(b.text ?? ""))!;
  assert.match(para.text!, /el martes 22 de diciembre en Almería, Cádiz, Córdoba, Granada, Huelva y Málaga; el miércoles 23 de diciembre en Sevilla/);
  const faq = es.find((b) => b.type === "faq")!;
  assert.match(faq.items![0]!.answer, /El último día de clase es el martes 22 de diciembre en Almería, Cádiz, Córdoba, Granada, Huelva y Málaga; el miércoles 23 de diciembre en Sevilla/);
  const ca = body("andalucia", "ca").find((b) => b.type === "faq")!;
  assert.match(ca.items![0]!.answer, /L'últim dia de classe és dimarts 22 de desembre|L'últim dia de classe és el dimarts 22 de desembre/);
  const en = body("andalucia", "en").find((b) => b.type === "faq")!;
  assert.match(en.items![0]!.answer, /The last day of class is on Tuesday 22 December in Almería, Cádiz, Córdoba, Granada, Huelva and Málaga; on Wednesday 23 December in (Sevilla|Seville)/);
});

test("the Christmas FAQ answer of a one-calendar community leads with the last day of class, then the first day without (ca/es/en)", () => {
  const expected = {
    es: /^El último día de clase es el martes 22 de diciembre y las vacaciones empiezan el miércoles 23 de diciembre: es el primer día sin clase y el viernes 8 de enero el último/,
    ca: /^L'últim dia de classe és el dimarts 22 de desembre i les vacances comencen el dimecres 23 de desembre/,
    en: /^The last day of class is Tuesday 22 December and the holidays start on Wednesday 23 December/,
  } as const;
  for (const locale of LOCALES) {
    const faq = body("madrid", locale).find((b) => b.type === "faq")!;
    assert.match(faq.items![0]!.answer, expected[locale], locale);
  }
});

test("Andalucía's live panel says the Christmas the lead says (23 Dec, 24 in Sevilla), counted to the earliest province", () => {
  const panel = (locale: Locale, today: string) => regionPanel(localizeRegion(regionBySlug("andalucia")!, locale), today);
  assert.match(panel("es", "2026-11-25").nextLine!, /^Próximas vacaciones: Navidad, del 23 de diciembre \(24 en Sevilla\) al 6, 7 u 8 de enero, según la provincia \(dentro de 28 días\)\.$/);
  assert.match(panel("en", "2026-11-25").nextLine!, /^Next holidays: Christmas, from 23 December \(24 in Seville\) to 6, 7 or 8 January, depending on the province /);
  // A community with one calendar keeps its own dates.
  assert.match(regionPanel(regionBySlug("madrid")!, "2026-11-25").nextLine!, /^Próximas vacaciones: Navidad, del miércoles 23 de diciembre de 2026 al viernes 8 de enero de 2027 /);
});

test("Málaga's two conditional days do not turn 29 March or 3 May into a day without class for every school", () => {
  const malaga = provinceCalendars(regionBySlug("andalucia")!).find((p) => p.name === "Málaga")!.calendar;
  assert.equal(schoolDayIn(malaga, "2027-03-29").kind, "school");
  assert.equal(schoolDayIn(malaga, "2027-05-03").kind, "school");
});

test("every community page in every language builds without 'undefined' or 'NaN'", () => {
  for (const r of SPAIN_REGIONS) {
    for (const locale of LOCALES) {
      const json = JSON.stringify(buildRegionBody(localizeRegion(r, locale)));
      assert.doesNotMatch(json, /undefined|NaN|\[object/, `${r.slug} ${locale}`);
    }
  }
  // Only the provinces' community gets the new section.
  for (const r of SPAIN_REGIONS) {
    const has = body(r.slug, "es").some((b) => b.type === "heading" && /^Días no lectivos por provincia/.test(b.text ?? ""));
    assert.equal(has, r.slug === "andalucia", r.slug);
  }
});
