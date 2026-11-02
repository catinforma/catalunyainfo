import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { BRIDGES_2027 } from "../src/lib/content/batch02/bridges-2027.ts";
import { EASTER_2027, EASTER_MONDAY_REGIONS, dayRows as easterDayRows } from "../src/lib/content/batch02/easter-2027.ts";
import { OPENING_2027 } from "../src/lib/content/batch02/shops.ts";
import { CATALONIA_HOLIDAYS } from "../src/lib/content/holidays/payload.ts";
import { SATURDAY_SOURCES, saturdayAnswer, saturdayNote, saturdayQuestion } from "../src/lib/content/holidays/saturday.ts";
import { COUNCIL_2027 } from "../src/lib/programmatic/holidays/council-2027.ts";
import { BOE_2027, BOE_2027_ROWS, REGIONS, REGION_NAME, boeDatesFor, boeRegionsOn, spainScope, type BoeCode, type Region } from "../src/lib/programmatic/holidays/boe-2027.ts";
import { NEXT_YEAR, SNAPSHOT, aranSwap, councilApproved2027, nextYearPlacesOn, regionalDays } from "../src/lib/programmatic/holidays/data.ts";
import { dateContent, dateTitle } from "../src/lib/programmatic/holidays/dates.ts";
import { CLOSING_2027, dateContent2027, dayKind2027, isTranche4 } from "../src/lib/programmatic/holidays/dates-2027.ts";
import { longDate, type DateLocale } from "../src/lib/programmatic/holidays/format.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import {
  ASKED_2027,
  DATE_LOCALES,
  DATE_PAGES,
  LOCAL_2027,
  TRANCHE_4,
  datePath,
  dateSlug,
  holidaySitemapEntries,
} from "../src/lib/programmatic/holidays/paths.ts";
import { dateQuestion } from "../src/lib/programmatic/holidays/question.ts";
import { dateStaticParams, resolveDatePage } from "../src/lib/programmatic/holidays/routing.ts";
import { dateDataset, dateFaq } from "../src/lib/programmatic/holidays/structured.ts";
import type { NextYearLocal } from "../src/lib/programmatic/holidays/types.ts";
import { liveTools } from "../src/lib/seo/llms.ts";

/**
 * Tranche 4 of the date pages (2 Nov 2026): 2027. Every Catalonia-wide day of
 * Ordre EMT/52/2026, the working days people ask about, and the local days
 * several of the largest towns share; answered from the shared calendar, the
 * BOE's 2027 list, the councils' acts (until the DOGC order) and the shop and
 * school orders.
 */

const ROOT = join(import.meta.dirname, "..");
const REGIONAL_2027 = regionalDays(2027).map((d) => d.date);

/** Weekday by Sakamoto's method, independent of `Date` and of the code under test: 0 = Sunday. */
function weekdayOf(y: number, m: number, d: number): number {
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const year = m < 3 ? y - 1 : y;
  return (year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) + t[m - 1]! + d) % 7;
}
const weekday = (iso: string) => weekdayOf(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), Number(iso.slice(8, 10)));

const WEEKDAYS: Record<DateLocale, string[]> = {
  ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  en: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
};
const MONTHS: Record<DateLocale, string[]> = {
  ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
};

/** Every string a 2027 page prints from its content. */
function texts(iso: string, locale: DateLocale): string[] {
  const c = dateContent(iso, locale);
  return [
    c.answer,
    ...c.answerNote,
    c.notice ? `${c.notice.before}${c.notice.label}${c.notice.after}` : "",
    c.description,
    c.local.text,
    c.local.note ?? "",
    ...c.sections.flatMap((s) => [s.title, ...s.paragraphs]),
  ].filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Which dates                                                                */
/* -------------------------------------------------------------------------- */

test("tranche 4: every Catalonia-wide 2027 day from the shared calendar, the asked working days and the shared local days", () => {
  // The twelve days of Ordre EMT/52/2026, read from the shared calendar, all have a page.
  assert.equal(REGIONAL_2027.length, 12);
  assert.deepEqual(REGIONAL_2027, CATALONIA_HOLIDAYS.map((h) => h.date).sort());
  for (const iso of REGIONAL_2027) assert.ok(DATE_PAGES.includes(iso), iso);
  // Weekend ones included: 1 May, 11 September and 25 December 2027 are Saturdays.
  assert.deepEqual(REGIONAL_2027.filter((iso) => weekday(iso) === 6), ["2027-05-01", "2027-09-11", "2027-12-25"]);
  // The asked days and the local days are none of the twelve.
  for (const iso of [...ASKED_2027, ...LOCAL_2027]) assert.ok(!REGIONAL_2027.includes(iso), `${iso} is a Catalonia-wide holiday`);
  // Sant Esteve is not a 2027 holiday (it was in 2026): its page answers "no".
  assert.ok(!REGIONAL_2027.includes("2027-12-26") && regionalDays(2026).some((d) => d.date === "2026-12-26"));
  assert.deepEqual(
    [...TRANCHE_4],
    [
      "2027-01-05", "2027-03-19", "2027-03-25", "2027-03-26", "2027-03-29", "2027-04-23", "2027-05-01", "2027-05-17",
      "2027-06-24", "2027-06-29", "2027-08-15", "2027-09-11", "2027-09-24", "2027-10-12", "2027-11-01", "2027-11-02",
      "2027-12-06", "2027-12-07", "2027-12-08", "2027-12-24", "2027-12-25", "2027-12-26", "2027-12-31",
    ],
  );
  assert.equal(DATE_PAGES.length, 34);
  assert.deepEqual([...DATE_PAGES], [...DATE_PAGES].sort(), "calendar order");
  assert.ok(!isTranche4("2027-01-01") && !isTranche4("2027-01-06"), "1 and 6 January keep their tranche 1 pages");
});

test("holiday or not: every 2027 page's answer is the shared calendar's, and the kind of day follows from it", () => {
  for (const iso of TRANCHE_4) {
    const regional = REGIONAL_2027.includes(iso);
    const wd = weekday(iso);
    const weekend = wd === 0 || wd === 6;
    const places = nextYearPlacesOn(iso).places;
    const expected = regional ? (weekend ? "weekend-holiday" : "holiday") : weekend ? "weekend" : (LOCAL_2027 as readonly string[]).includes(iso) ? "local" : "working";
    assert.equal(dayKind2027(iso, places), expected, iso);
    for (const locale of DATE_LOCALES) {
      const c = dateContent(iso, locale);
      assert.equal(c.holiday, regional, `${iso} ${locale}`);
      const first = c.answer.split(/[.:]/)[0]!;
      if (regional) assert.match(first, /^(Sí|Yes)/, `${iso} ${locale}: ${c.answer}`);
      else assert.match(first, /^(No|Not across)/, `${iso} ${locale}: ${c.answer}`);
      // The order is named in the answer.
      assert.match(c.answer, /EMT\/52\/2026/, `${iso} ${locale}`);
    }
  }
  // Saturdays: yes, but it falls on a Saturday, and the Monday is a working day.
  for (const iso of ["2027-05-01", "2027-09-11", "2027-12-25"]) {
    assert.match(dateContent(iso, "ca").answer, /^Sí, però cau en dissabte\. .* el dilluns \d+ de \w+ és feiner\.$/);
    assert.match(dateContent(iso, "es").answer, /^Sí, pero cae en sábado\. .* el lunes \d+ de \w+ es laborable\.$/);
    assert.match(dateContent(iso, "en").answer, /^Yes, but it falls on a Saturday\. .* Monday \d+ \w+ is a working day\.$/);
  }
  assert.match(dateContent("2027-12-26", "ca").answer, /^No\. El diumenge 26 de desembre de 2027, Sant Esteve, no és festiu a Catalunya: cau en diumenge/);
  assert.match(dateContent("2027-12-25", "es").answerNote.join(" "), /domingo 26 de diciembre, San Esteban, no es festivo en 2027/);
  assert.match(dateContent("2027-03-29", "ca").answer, /excepte a l'Aran, on el substitueix la Festa d'Aran del 17 de juny/);
  assert.equal(aranSwap(2027)?.replaces, "2027-03-29");
  // Local days: the box says so rather than a bare "No".
  for (const iso of LOCAL_2027) assert.equal(dateContent(iso, "ca").verdict, "Festa local");
  assert.equal(dateContent("2027-04-23", "ca").verdict, undefined);
});

test("weekdays: every weekday the 2027 pages print matches the date, computed without Date", () => {
  // The calculator itself, against dates everyone knows.
  assert.equal(weekdayOf(2026, 11, 2), 1, "2 November 2026 is a Monday");
  assert.equal(weekdayOf(2027, 3, 28), 0, "Easter Sunday 2027");
  let checked = 0;
  for (const iso of TRANCHE_4) {
    for (const locale of DATE_LOCALES) {
      // The box's long date.
      assert.equal(longDate(iso, locale).toLowerCase().split(/[ ,]/)[0], WEEKDAYS[locale][weekday(iso)], `${iso} ${locale}`);
      const plain = texts(iso, locale).join(" \n ").toLowerCase();
      // No comma: these pages write "dilluns 3 de maig"; a comma is a list ("Easter Sunday and Monday, 1 May").
      const pattern = new RegExp(`(?<!\\p{L})(${WEEKDAYS[locale].join("|")}) (\\d{1,2})(?!\\d)`, "gu");
      const monthPattern = new RegExp(`(?<!\\p{L})(${MONTHS[locale].join("|")})(?!\\p{L})`, "u");
      for (const match of plain.matchAll(pattern)) {
        const month = plain.slice(match.index!).match(monthPattern)?.[1];
        assert.ok(month, `${iso} ${locale}: no month after "${match[0]}"`);
        // Every weekday these pages print is a 2027 date.
        const day = `2027-${String(MONTHS[locale].indexOf(month!) + 1).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
        assert.equal(WEEKDAYS[locale][weekday(day)], match[1], `${iso} ${locale}: "${match[0]}" read as ${day}`);
        checked += 1;
      }
    }
  }
  // 288 on 2 Nov 2026: at least the answer's own weekday on each of the 69 pages, and every range and note.
  assert.ok(checked > 250, `only ${checked} weekday mentions checked`);
});

/* -------------------------------------------------------------------------- */
/* The rest of Spain: the BOE's 2027 list                                     */
/* -------------------------------------------------------------------------- */

/** The BOE table as read (tests/fixtures/holidays/boe-a-2026-21254.txt), row by row. */
function parseBoeFixture(): { date: string; name: string; marks: Partial<Record<Region, BoeCode>> }[] {
  const text = readFileSync(join(ROOT, "tests/fixtures/holidays/boe-a-2026-21254.txt"), "utf8");
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const rows: { date: string; name: string; marks: Partial<Record<Region, BoeCode>> }[] = [];
  let month = -1;
  for (const line of text.split("\n")) {
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length !== 20) continue;
    const head = cells[0]!;
    if (months.includes(head)) {
      month = months.indexOf(head);
      continue;
    }
    const m = /^(\d{1,2}) (.+)\.$/.exec(head);
    if (!m) continue;
    const marks: Partial<Record<Region, BoeCode>> = {};
    REGIONS.forEach((r, i) => {
      const code = cells[i + 1];
      if (code) marks[r] = code as BoeCode;
    });
    rows.push({ date: `2027-${String(month + 1).padStart(2, "0")}-${m[1]!.padStart(2, "0")}`, name: m[2]!, marks });
  }
  return rows;
}

test("BOE 2027: the module is the table as read, and its Catalonia column is Ordre EMT/52/2026", () => {
  const fixture = parseBoeFixture();
  assert.equal(fixture.length, 35);
  assert.deepEqual(BOE_2027_ROWS.map((r) => ({ date: r.date, name: r.name, marks: r.marks })), fixture);
  assert.deepEqual(boeDatesFor("CT"), REGIONAL_2027);
  // The BOE's note 2 repeats the Aran swap.
  assert.match(readFileSync(join(ROOT, "tests/fixtures/holidays/boe-a-2026-21254.txt"), "utf8"), /29 de marzo \(Pasqua Florida\) queda sustituida por la de 17 de junio/);
  // Every community and city has twelve days, as the BOE's resolution says ("las doce fiestas").
  for (const r of REGIONS.filter((x) => x !== "ML" && x !== "CE" && x !== "CN")) assert.equal(boeDatesFor(r).length, 12, r);
  // The Easter guide's list of where Easter Monday is a holiday is the same table's.
  const monday = spainScope("2027-03-29");
  assert.equal(monday.kind, "some");
  for (const locale of DATE_LOCALES) {
    assert.deepEqual(monday.kind === "some" ? monday.regions.map((r) => REGION_NAME[r][locale]) : [], EASTER_MONDAY_REGIONS[locale]);
  }
  assert.equal(BOE_2027.url, "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-21254");
});

test("Catalonia vs the rest of Spain: every 2027 page states it, from the BOE table", () => {
  const scopes = Object.fromEntries(TRANCHE_4.map((iso) => [iso, spainScope(iso)]));
  // What the table says about the days people ask about.
  assert.deepEqual(scopes["2027-03-19"], { kind: "some", regions: ["GA", "MD", "MC", "NC", "VC"] });
  assert.deepEqual(scopes["2027-03-25"], { kind: "allBut", except: ["VC"] });
  assert.deepEqual(scopes["2027-04-23"], { kind: "some", regions: ["AR", "CL"] });
  assert.deepEqual(scopes["2027-05-17"], { kind: "some", regions: ["GA", "CE", "ML"] });
  for (const iso of ["2027-01-05", "2027-11-02", "2027-12-07", "2027-12-24", "2027-12-26", "2027-12-31", "2027-08-15", "2027-06-29", "2027-09-24"]) {
    assert.equal(scopes[iso]!.kind, "none", iso);
  }
  assert.deepEqual(boeRegionsOn("2027-08-16"), ["AN", "AR", "AS", "CN", "CL", "MD"]);
  for (const iso of ["2027-06-24", "2027-09-11"]) assert.equal(scopes[iso]!.kind, "none", `${iso}: only Catalonia`);
  for (const iso of ["2027-03-26", "2027-05-01", "2027-10-12", "2027-11-01", "2027-12-06", "2027-12-08", "2027-12-25"]) assert.equal(scopes[iso]!.kind, "all", iso);

  for (const iso of TRANCHE_4) {
    for (const locale of DATE_LOCALES) {
      const notes = dateContent(iso, locale).answerNote.join(" ");
      assert.match(notes, /BOE/, `${iso} ${locale}: no word on the rest of Spain`);
      const scope = scopes[iso]!;
      const named = scope.kind === "some" ? scope.regions : scope.kind === "allBut" ? scope.except : [];
      for (const r of named) assert.ok(notes.includes(REGION_NAME[r][locale]), `${iso} ${locale}: ${REGION_NAME[r][locale]}`);
    }
  }
  assert.match(dateContent("2027-03-25", "es").answerNote[0]!, /todo el resto de España salvo en la Comunitat Valenciana/);
  assert.match(dateContent("2027-03-19", "es").answerNote[0]!, /Galicia, la Comunidad de Madrid, la Región de Murcia, Navarra y la Comunitat Valenciana/);
  assert.match(dateContent("2027-08-15", "en").answerNote.join(" "), /Andalusia, Aragon, Asturias, the Canary Islands, Castile and León and the Community of Madrid take Monday 16 August off/);
  assert.match(dateContent("2027-12-26", "ca").answerNote.join(" "), /no marca a cap comunitat ni el 26 de desembre ni el dilluns 27 de desembre/);
  assert.match(dateContent("2027-12-26", "ca").answerNote.join(" "), /Al calendari del 2026, en canvi, el 26 de desembre de 2026 sí que és festiu \(Ordre EMT\/66\/2025\), excepte a l'Aran/);
});

/* -------------------------------------------------------------------------- */
/* Local days: council-approved until the DOGC order, then the order          */
/* -------------------------------------------------------------------------- */

test("local days: the shared local dates are council-approved days of at least three of the forty largest towns", () => {
  assert.equal(NEXT_YEAR.order, null, "these assertions describe the pages before the DOGC order");
  const rank = new Map(SNAPSHOT.municipalities.map((m) => [m.slug, m.rank]));
  for (const iso of LOCAL_2027) {
    const on = nextYearPlacesOn(iso);
    assert.equal(on.status, "council");
    const big = on.places.filter((p) => !p.parent && (rank.get(p.slug ?? "") ?? 999) <= 40);
    assert.ok(big.length >= 3, `${iso}: ${big.map((p) => p.name).join(", ")}`);
    // Each listed place is in its council's own act.
    for (const p of on.places) {
      const c = COUNCIL_2027[p.slug!]!;
      assert.ok(p.parent ? c.nuclei?.some((n) => n.name === p.name && n.dates.includes(iso)) : c.local.includes(iso), `${iso} ${p.name}`);
    }
  }
  assert.deepEqual(nextYearPlacesOn("2027-09-24").places.map((p) => p.name), ["Barcelona", "l'Hospitalet de Llobregat", "Montcada i Reixac", "Sant Joan Despí"]);
  assert.deepEqual(nextYearPlacesOn("2027-06-29").places.map((p) => p.name), ["Reus", "Rubí", "Figueres", "Premià de Dalt"]);
  // Labelled pending, with "at least", and each council's act among the sources.
  const may = dateContent("2027-05-17", "ca");
  assert.match(may.answer, /almenys a 17 municipis i 5 nuclis, entre els quals Barcelona, l'Hospitalet de Llobregat i Badalona, segons els ajuntaments \(pendent de l'ordre del DOGC\)/);
  assert.match(may.local.note ?? "", /encara no són oficials/);
  assert.ok(may.extraSources?.some((s) => s.url === COUNCIL_2027.barcelona!.source.url));
  assert.match(dateContent("2027-03-19", "en").answer, /local holiday in at least 1 town: la Llagosta, as approved by its council \(pending the DOGC order\)/);
  // 15 August is a Sunday: the Monday's council-approved local days are named.
  assert.match(dateContent("2027-08-15", "ca").answerNote[0]!, /^El dilluns 16 d'agost és festa local a Banyoles, Capellades i Castellbell i el Vilar/);
});

test("local days: once local-2027.json holds the DOGC order, it replaces the councils' days on every date page", () => {
  const order = {
    name: "Ordre EMT/999/2026, de 10 de desembre, per la qual s'estableix el calendari de festes locals a Catalunya per a l'any 2027",
    ref: "DOGC (test)",
    url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=0",
  };
  const parsed: NextYearLocal = {
    order,
    readOn: "2026-12-18",
    municipalities: {
      barcelona: { local: ["2027-05-17", "2027-09-24"], nuclei: [] },
      mataro: { local: ["2027-05-17", "2027-07-27"], nuclei: [] },
      girona: { local: ["2027-07-26", "2027-10-29"], nuclei: [{ name: "Campdorà", dates: ["2027-05-17"] }] },
      reus: { local: ["2027-06-28", "2027-09-25"], nuclei: [] },
    },
  };
  // The town pages' own switch: council data is ignored once the order is out.
  assert.equal(councilApproved2027("l-hospitalet-de-llobregat", true), null);
  assert.ok(councilApproved2027("l-hospitalet-de-llobregat", false));

  const on = nextYearPlacesOn("2027-05-17", parsed);
  assert.equal(on.status, "dogc");
  assert.deepEqual(on.places, [
    { name: "Barcelona", parent: null, slug: "barcelona" },
    { name: "Mataró", parent: null, slug: "mataro" },
    { name: "Campdorà", parent: "Girona", slug: "girona" },
  ]);
  assert.deepEqual(on.councils, [], "no council act once the order is out");
  assert.ok(!on.places.some((p) => p.slug === "l-hospitalet-de-llobregat"), "the council said 17 May; the order is what counts");

  for (const locale of DATE_LOCALES) {
    const c = dateContent2027("2027-05-17", locale, parsed);
    assert.doesNotMatch(JSON.stringify(c), /pendent|pendiente|pending|almenys|al menos|at least/, locale);
    assert.match(c.local.text, /EMT\/999\/2026/, locale);
    assert.deepEqual(c.extraSources, [order]);
    assert.ok(c.basedOn?.includes(order.url) && !c.basedOn.includes(COUNCIL_2027.barcelona!.source.url));
    assert.equal(c.local.note, undefined);
  }
  // Reus's council said 29 June; the (test) order says 28 June: the 29 June page has no local holiday left
  // and answers as a plain working day.
  const june = dateContent2027("2027-06-29", "ca", parsed);
  assert.equal(june.local.places.length, 0);
  assert.match(june.answer, /^No\. El dimarts 29 de juny de 2027, Sant Pere, és un dia feiner a Catalunya/);
  assert.equal(june.verdict, undefined);
  // Before the order: the councils' days, labelled pending.
  assert.match(dateContent2027("2027-05-17", "ca").answer, /pendent de l'ordre del DOGC/);
});

/* -------------------------------------------------------------------------- */
/* Shops, schools, notices                                                    */
/* -------------------------------------------------------------------------- */

test("shops and schools: the retail law's closing days, the 2027 shop calendar and the school order", () => {
  // Llei 18/2017, art. 36.2.d, by date: 26 December 2027 is a closing day though not a holiday.
  assert.deepEqual([...CLOSING_2027].sort(), ["2027-01-01", "2027-01-06", "2027-03-28", "2027-03-29", "2027-05-01", "2027-06-24", "2027-09-11", "2027-12-25", "2027-12-26"]);
  for (const iso of ["2027-03-29", "2027-05-01", "2027-06-24", "2027-09-11", "2027-12-25", "2027-12-26"]) {
    assert.match(dateContent(iso, "ca").sections[0]!.paragraphs[0]!, /^Les botigues amb horari general han de tancar/, iso);
  }
  assert.match(dateContent("2027-12-26", "es").sections[0]!.paragraphs[0]!, /el 26 de diciembre está en la lista aunque en 2027 no sea festivo/);
  // The eight general days of Ordre EMT/89/2026 that have a page.
  for (const iso of OPENING_2027.general.filter((d) => isTranche4(d))) {
    assert.match(dateContent(iso, "ca").sections[0]!.paragraphs[0]!, /^Les botigues poden obrir: (l'|el )\d+ de \w+ és un dels vuit/, iso);
  }
  assert.deepEqual(OPENING_2027.general.filter((d) => isTranche4(d)), ["2027-11-01", "2027-12-06", "2027-12-08"]);
  // Good Friday and 12 October: holidays, not general opening days, not closing days.
  for (const iso of ["2027-03-26", "2027-10-12", "2027-08-15"]) assert.match(dateContent(iso, "es").sections[0]!.paragraphs[0]!, /no es ninguno de los ocho días de apertura/, iso);
  assert.match(dateContent("2027-04-23", "en").sections[0]!.paragraphs[0]!, /^It is a working day, so shops keep their usual hours/);

  // Schools (Ordre EDF/66/2026): Easter break 20-29 March, summer from 22 June, Christmas from 22 December 2027.
  assert.match(dateContent("2027-03-25", "ca").sections[1]!.paragraphs[0]!, /vacances escolars de Setmana Santa, del 20 al 29 de març de 2027/);
  assert.match(dateContent("2027-06-24", "es").sections[1]!.paragraphs[0]!, /^No hay clase: es verano\. El curso 2026-2027 acaba el 21 de junio de 2027/);
  assert.match(dateContent("2027-12-24", "en").sections[1]!.paragraphs[0]!, /Christmas school holidays, 22 December 2027 to 9 January 2028/);
  assert.match(dateContent("2027-04-23", "ca").sections[1]!.paragraphs[0]!, /^Hi ha classe a Catalunya, tret dels municipis on és festa local/);
  assert.match(dateContent("2027-03-19", "ca").sections[1]!.paragraphs[0]!, /L'endemà comencen les vacances escolars de Setmana Santa\.$/);
  assert.match(dateContent("2027-09-24", "ca").sections[1]!.paragraphs[0]!, /^No hi ha classe als municipis on és festa local, com Barcelona/);
  assert.match(dateContent("2027-10-12", "ca").sections[1]!.paragraphs[0]!, /^És festiu i, per tant, no hi ha classe/);
});

test("notices: one sentence, one link, to the Easter 2027 guide around Easter, the parade on 5 January, the long weekends otherwise", () => {
  for (const iso of TRANCHE_4) {
    for (const locale of DATE_LOCALES) {
      const notice = dateContent(iso, locale).notice;
      assert.ok(notice, `${iso} ${locale}`);
      const easter = iso >= "2027-03-19" && iso <= "2027-03-29";
      const key = iso === "2027-01-05" ? "reis" : easter ? "easter2027" : "bridges2027";
      assert.equal(notice.href, GUIDES[key][locale], `${iso} ${locale}`);
      const sentence = `${notice.before}${notice.label}${notice.after}`;
      assert.equal(sentence.split(/[.!?](\s|$)/).filter((s) => s && s.trim()).length, 1, sentence);
      assert.doesNotMatch(sentence, /\]\(|https?:|\*\*/, sentence);
      // Easter dates also list the Easter guide first among the guides.
      if (easter) assert.equal(dateContent(iso, locale).guides[0], "easter2027");
      assert.ok(dateContent(iso, locale).guides.includes("bridges2027"), `${iso} ${locale}`);
    }
  }
  // The long weekends, computed with the guide's rules.
  assert.match(dateContent("2027-12-07", "ca").notice!.before, /^Demanant el dimarts 7 de desembre de vacances surten 5 dies seguits de festa, del dissabte 4 al dimecres 8 de desembre/);
  assert.match(dateContent("2027-12-06", "es").notice!.before, /^Pidiendo el martes 7 de diciembre de vacaciones salen 5 días seguidos/);
  assert.match(dateContent("2027-03-25", "en").notice!.before, /^Taking Thursday 25 March off gives 5 days in a row, Thursday 25 to Monday 29 March/);
  assert.match(dateContent("2027-06-29", "ca").notice!.before, /^On és festa local, demanant el dilluns 28 de juny de vacances surten 4 dies seguits/);
  assert.match(dateContent("2027-05-01", "ca").notice!.before, /^Com que cau en dissabte, no afegeix cap dia de festa/);
});

test("nothing unfilled, and every section asks the question it answers", () => {
  for (const iso of TRANCHE_4) {
    for (const locale of DATE_LOCALES) {
      const c = dateContent(iso, locale);
      const text = JSON.stringify({ ...c, local: { ...c.local, places: [] } });
      assert.ok(!/\{\w+\}|undefined|NaN|null|\$\{/.test(text), `${iso} ${locale}`);
      // Catalan and Spanish articles: no "l'el", "de el", "a el", "l'dilluns".
      assert.ok(!/(?<!\p{L})(l'el|el l'|de el|a el|l'(dilluns|dimarts|dimecres|dijous|divendres|dissabte|diumenge)) /iu.test(text), `${iso} ${locale}: article`);
      assert.ok(c.local.title?.endsWith("?") && c.sections[0]!.title.endsWith("?") && c.sections[1]!.title.endsWith("?"), `${iso} ${locale}`);
      assert.ok(c.guides.length >= 4);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Metadata, structured data, routing, sitemap                                */
/* -------------------------------------------------------------------------- */

test("titles and descriptions: the question in the searchers' words, the day's name when it fits, <= 60 and <= 155", () => {
  for (const iso of TRANCHE_4) {
    for (const locale of DATE_LOCALES) {
      const title = dateTitle(iso, locale);
      const description = dateContent(iso, locale).description;
      assert.ok(title.length <= 60, `${title} (${title.length})`);
      assert.ok(title.startsWith(dateQuestion(iso, locale)), title);
      assert.ok(description.length <= 155 && description.length >= 90, `${description} (${description.length})`);
      assert.ok(description.includes("2027"), description);
      assert.match(description, regionalDays(2027).some((d) => d.date === iso) ? /^(Sí|Yes)/ : /^(No|Not)/, `${iso} ${locale}`);
    }
  }
  assert.equal(dateTitle("2027-04-23", "es"), "¿Es festivo el 23 de abril de 2027 en Cataluña? Sant Jordi");
  assert.equal(dateTitle("2027-03-25", "es"), "¿Es festivo el 25 de marzo de 2027 en Cataluña? Jueves Santo");
  assert.equal(dateTitle("2027-12-26", "ca"), "És festiu el 26 de desembre de 2027 a Catalunya? Sant Esteve");
  assert.equal(dateTitle("2027-03-29", "es"), "¿Es festivo el 29 de marzo de 2027 en Cataluña? Pascua");
  assert.equal(dateTitle("2027-10-12", "es"), "¿Es festivo el 12 de octubre de 2027 en Cataluña? Hispanidad");
  // The earlier pages keep their question as the title.
  assert.equal(dateTitle("2026-12-08", "es"), "¿Es festivo el 8 de diciembre de 2026 en Cataluña?");
  assert.match(dateContent("2027-03-25", "es").description, /pero sí en casi todo el resto de España/);
});

test("structured data: FAQPage and Dataset on the 2027 pages, from what the page prints; breadcrumbs only on the others", () => {
  for (const iso of TRANCHE_4) {
    for (const locale of DATE_LOCALES) {
      const c = dateContent(iso, locale);
      const faq = dateFaq(iso, locale) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
      assert.ok(faq, `${iso} ${locale}`);
      const visible = [dateQuestion(iso, locale), c.local.title, ...c.sections.map((s) => s.title)];
      for (const q of faq.mainEntity) assert.ok(visible.includes(q.name), `${iso} ${locale}: "${q.name}" is not a heading on the page`);
      assert.equal(faq.mainEntity[0]!.name, dateQuestion(iso, locale));
      assert.ok(faq.mainEntity[0]!.acceptedAnswer.text.startsWith(c.answer));
      const dataset = dateDataset(iso, locale) as Record<string, unknown>;
      assert.equal(dataset["@type"], "Dataset");
      assert.equal(dataset.name, dateQuestion(iso, locale));
      assert.equal(dataset.temporalCoverage, iso);
      const based = dataset.isBasedOn as string[];
      assert.ok(based.includes(BOE_2027.url) && based.includes(SNAPSHOT.sources.regional["2027"]!.url), `${iso} ${locale}`);
    }
  }
  for (const iso of DATE_PAGES.filter((d) => !isTranche4(d))) {
    assert.equal(dateFaq(iso, "ca"), null, iso);
    assert.equal(dateDataset(iso, "ca"), null, iso);
  }
  const routes = readFileSync(join(ROOT, "src/components/programmatic/holidays/routes.tsx"), "utf8");
  assert.match(routes, /breadcrumbSchema\(dateCrumbs\(iso, locale\)\), dateDataset\(iso, locale\), dateFaq\(iso, locale\)/);
  assert.match(routes, /title: dateTitle\(iso, locale\)/);
});

test("routing: every 2027 page resolves in its own locale; other dates and other locales' slugs are 404s", () => {
  for (const iso of TRANCHE_4) {
    for (const locale of DATE_LOCALES) {
      assert.equal(resolveDatePage(locale, locale, dateSlug(iso, locale)), iso, `${iso} ${locale}`);
      assert.ok(dateStaticParams(locale).some((p) => p.dia === dateSlug(iso, locale)), `${iso} ${locale}: built at deploy`);
    }
  }
  assert.equal(datePath("ca", "2027-03-19"), "/ca/festius/dia/19-marc-2027/");
  assert.equal(datePath("es", "2027-04-23"), "/es/festivos/dia/23-abril-2027/");
  assert.equal(datePath("en", "2027-12-26"), "/en/holidays/day/26-december-2027/");
  // Not pages: Easter Sunday, the Monday after the Assumption, 27 December, other years, accents, other locales.
  for (const slug of ["28-marc-2027", "16-agost-2027", "27-desembre-2027", "3-novembre-2027", "1-gener-2028", "26-desembre-2028", "19-març-2027", "2027-03-19", "17-maig-2026"]) {
    assert.equal(resolveDatePage("ca", "ca", slug), null, slug);
  }
  assert.equal(resolveDatePage("es", "es", "19-marc-2027"), null);
  assert.equal(resolveDatePage("en", "en", "23-abril-2027"), null);
  assert.equal(resolveDatePage("ca", "es", "23-abril-2027"), null);
  assert.equal(resolveDatePage("es", "en", "23-abril-2027"), null);
});

test("sitemap and llms.txt pick the 2027 pages up through the existing functions", () => {
  const entries = holidaySitemapEntries();
  const dates = entries.filter((e) => /\/(dia|day)\/\d/.test(e.url));
  assert.equal(dates.length, 34 * 3);
  for (const iso of TRANCHE_4) {
    for (const locale of DATE_LOCALES) {
      const entry = dates.find((e) => e.url.endsWith(datePath(locale, iso)));
      assert.ok(entry, `${iso} ${locale}`);
      const languages = entry.alternates?.languages as Record<string, string>;
      assert.deepEqual(Object.keys(languages).sort(), ["ca", "en", "es", "x-default"]);
      assert.ok(languages["x-default"]!.endsWith(datePath("en", iso)));
    }
  }
  const tool = liveTools().find((t) => t.name === "Is it a public holiday on…?")!;
  assert.match(tool.description, /34 dates from 2026-11-01 to 2027-12-31/);
});

test("Saturday holidays: only 1 May, 11 September and 25 December carry the compensation note, question and sources", () => {
  const cendoj = SATURDAY_SOURCES.map((s) => s.url);
  let saturdays = 0;
  for (const iso of TRANCHE_4) {
    // Computed without Date: a Catalonia-wide holiday on a Saturday.
    const saturdayHoliday = REGIONAL_2027.includes(iso) && weekday(iso) === 6;
    for (const locale of DATE_LOCALES) {
      const c = dateContent(iso, locale);
      const question = saturdayQuestion(locale);
      const section = c.sections.find((s) => s.title === question);
      const inFaq = (c.faq ?? []).find((f) => f.question === question);
      const based = (dateDataset(iso, locale) as { isBasedOn: string[] }).isBasedOn;
      const printed = texts(iso, locale).join(" ");
      if (saturdayHoliday) {
        // The plain sentence right after the answer, the question as a heading, the same words in FAQPage.
        assert.equal(c.answerNote[0], saturdayNote(locale, "one"), `${iso} ${locale}`);
        assert.deepEqual(section?.paragraphs, [saturdayAnswer(locale)], `${iso} ${locale}`);
        assert.equal(inFaq?.answer, saturdayAnswer(locale), `${iso} ${locale}`);
        // Shops and school keep their places; the question comes after them.
        assert.ok(c.sections.indexOf(section!) >= 2, `${iso} ${locale}`);
        // Listed and in the Dataset's isBasedOn: CENDOJ and the BOE commentary.
        for (const url of cendoj) {
          assert.ok(c.extraSources?.some((s) => s.url === url), `${iso} ${locale}: ${url} not listed`);
          assert.ok(based.includes(url), `${iso} ${locale}: ${url} not in isBasedOn`);
        }
        assert.match(printed, /Audiencia Nacional|National High Court/, `${iso} ${locale}`);
        if (locale === "ca") saturdays += 1;
      } else {
        assert.equal(section, undefined, `${iso} ${locale}`);
        assert.equal(inFaq, undefined, `${iso} ${locale}`);
        assert.ok(!c.answerNote.includes(saturdayNote(locale, "one")), `${iso} ${locale}`);
        for (const url of cendoj) {
          assert.ok(!c.extraSources?.some((s) => s.url === url), `${iso} ${locale}: ${url} listed`);
          assert.ok(!based.includes(url), `${iso} ${locale}: ${url} in isBasedOn`);
        }
        assert.doesNotMatch(printed, /Audiencia Nacional|National High Court|contact.cent/, `${iso} ${locale}`);
      }
    }
  }
  assert.equal(saturdays, 3);
  // Sundays that are not holidays (15 August, 26 December 2027) get nothing.
  for (const iso of ["2027-08-15", "2027-12-26"]) assert.equal(weekday(iso), 0, iso);
  // The 2026 pages and 1 and 6 January 2027 keep their content as it was.
  for (const iso of DATE_PAGES.filter((d) => !isTranche4(d))) {
    for (const locale of DATE_LOCALES) assert.doesNotMatch(JSON.stringify(dateContent(iso, locale)), /Audiencia Nacional|National High Court/, `${iso} ${locale}`);
  }
});

test("linking: the long weekends table and the Easter guide send each day to its page, one link per row or sentence", () => {
  for (const locale of DATE_LOCALES) {
    // Ponts 2027: the Barcelona list links 17 May and 24 September (the table is held in bridges-2027.test.ts).
    const bridges = JSON.stringify(BRIDGES_2027.editions[locale].blocks);
    for (const iso of LOCAL_2027.filter((d) => d !== "2027-06-29")) assert.ok(bridges.includes(`](${datePath(locale, iso)})`), `${locale} ${iso}`);
    // Easter 2027: Holy Thursday, Good Friday and Easter Monday in the day table; Pasqua Granada in its paragraph.
    const rows = easterDayRows(locale);
    for (const iso of ["2027-03-25", "2027-03-26", "2027-03-29"]) {
      assert.equal(rows.filter((r) => r[0]!.includes(`](${datePath(locale, iso)})`)).length, 1, `${locale} ${iso}`);
    }
    for (const row of rows) assert.ok((row.join(" ").match(/\]\(/g)?.length ?? 0) <= 1);
    const easter = JSON.stringify(EASTER_2027.editions[locale].blocks);
    assert.ok(easter.includes(`](${datePath(locale, "2027-05-17")})`), locale);
  }
});
