import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import {
  ARAN_REPLACEMENT,
  BARCELONA_LOCAL,
  BRIDGES,
  CATALONIA_HOLIDAYS,
  YEAR,
} from "../src/lib/content/holidays/payload.ts";
import { COPY } from "../src/lib/content/holidays/copy.ts";
import { buildBody, formatDay, runLength, weekdayOf } from "../src/lib/content/holidays/publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * A holiday calendar is the kind of page where being wrong has a cost a reader
 * can feel: someone books leave, or turns up to a closed office. The dates come
 * from Ordre EMT/52/2026, and these tests check the things that could go wrong
 * between the order and the page — a mistyped date, a bridge whose length does
 * not match its own dates, a suggested day of leave leaking into the calendar
 * file as though it were a public holiday.
 */

const DAY = 86_400_000;
const at = (iso: string) => new Date(`${iso}T12:00:00Z`);

test("there are exactly twelve Catalonia-wide holidays, all in the stated year", () => {
  assert.equal(CATALONIA_HOLIDAYS.length, 12);
  for (const holiday of CATALONIA_HOLIDAYS) {
    assert.match(holiday.date, /^\d{4}-\d{2}-\d{2}$/, holiday.date);
    assert.equal(at(holiday.date).getUTCFullYear(), YEAR, holiday.date);
    assert.equal(holiday.scope, "catalonia");
    for (const locale of LOCALES) {
      assert.ok(holiday.name[locale]?.length, `${holiday.date}: missing ${locale} name`);
    }
  }
});

test("the dates are in order and none is repeated", () => {
  const times = CATALONIA_HOLIDAYS.map((h) => at(h.date).getTime());
  assert.deepEqual([...times].sort((a, b) => a - b), times, "dates are out of order");
  assert.equal(new Set(times).size, times.length, "a date appears twice");
});

test("every weekday matches the date it is printed beside", () => {
  // The order states the weekday for each date. If a date were mistyped, the
  // weekday rendered from it would stop matching the official one.
  const official: Record<string, number> = {
    "2027-01-01": 5, // divendres
    "2027-01-06": 3, // dimecres
    "2027-03-26": 5,
    "2027-03-29": 1, // dilluns
    "2027-05-01": 6, // dissabte
    "2027-06-24": 4, // dijous
    "2027-09-11": 6,
    "2027-10-12": 2, // dimarts
    "2027-11-01": 1,
    "2027-12-06": 1,
    "2027-12-08": 3,
    "2027-12-25": 6,
  };
  for (const holiday of CATALONIA_HOLIDAYS) {
    assert.equal(
      at(holiday.date).getUTCDay(),
      official[holiday.date],
      `${holiday.date} does not fall on the weekday the order states`,
    );
  }
  // The Aran substitution and Barcelona's two, likewise.
  assert.equal(at(ARAN_REPLACEMENT.date).getUTCDay(), 4, "Festa d'Aran is a Thursday");
  assert.equal(at("2027-05-17").getUTCDay(), 1, "Pasqua Granada is a Monday");
  assert.equal(at("2027-09-24").getUTCDay(), 5, "La Mercè is a Friday");
});

test("exactly three holidays fall on a Saturday, and the article says so", () => {
  const saturdays = CATALONIA_HOLIDAYS.filter((h) => at(h.date).getUTCDay() === 6);
  assert.equal(saturdays.length, 3);
  assert.deepEqual(saturdays.map((h) => h.date), ["2027-05-01", "2027-09-11", "2027-12-25"]);
});

test("the Aran date is a substitution, not an extra holiday", () => {
  assert.equal(ARAN_REPLACEMENT.scope, "aran-replacement");
  // It must not be in the Catalonia-wide list, or Aran would appear to have 13.
  assert.ok(!CATALONIA_HOLIDAYS.some((h) => h.date === ARAN_REPLACEMENT.date));
  // And the date it replaces must still be in the list, because it applies
  // everywhere else.
  assert.ok(CATALONIA_HOLIDAYS.some((h) => h.date === "2027-03-29"));
});

test("Barcelona's local holidays are never counted as Catalonia-wide", () => {
  assert.equal(BARCELONA_LOCAL.length, 2);
  for (const holiday of BARCELONA_LOCAL) {
    assert.equal(holiday.scope, "local-barcelona");
    assert.ok(!CATALONIA_HOLIDAYS.some((h) => h.date === holiday.date), holiday.date);
  }
});

/* -------------------------------------------------------------------------- */
/* Bridges                                                                    */
/* -------------------------------------------------------------------------- */

test("every bridge's stated length matches its own dates", () => {
  for (const bridge of BRIDGES) {
    assert.equal(
      runLength(bridge.from, bridge.to),
      bridge.days,
      `${bridge.id}: says ${bridge.days} days, dates give ${runLength(bridge.from, bridge.to)}`,
    );
  }
});

test("every day a bridge asks you to book is a working day that is not already off", () => {
  const holidays = new Set(CATALONIA_HOLIDAYS.map((h) => h.date));
  for (const bridge of BRIDGES) {
    for (const iso of bridge.take) {
      const day = at(iso).getUTCDay();
      assert.ok(day >= 1 && day <= 5, `${bridge.id}: ${iso} is a weekend, nobody books that`);
      assert.ok(!holidays.has(iso), `${bridge.id}: ${iso} is already a public holiday`);
      // And it has to fall inside the run it is supposed to create.
      assert.ok(
        at(iso) >= at(bridge.from) && at(iso) <= at(bridge.to),
        `${bridge.id}: ${iso} is outside the break it claims to build`,
      );
    }
  }
});

test("a bridge's run contains no working day that is neither booked nor free", () => {
  // This is the real check. A run is only continuous if every day in it is a
  // weekend, a public holiday, or a day the reader was told to book. Miss one
  // and the article promises a break that has a working Wednesday in it.
  const holidays = new Set(CATALONIA_HOLIDAYS.map((h) => h.date));

  for (const bridge of BRIDGES) {
    const booked = new Set(bridge.take);
    for (let t = at(bridge.from).getTime(); t <= at(bridge.to).getTime(); t += DAY) {
      const date = new Date(t);
      const iso = date.toISOString().slice(0, 10);
      const weekday = date.getUTCDay();
      const free = weekday === 0 || weekday === 6 || holidays.has(iso) || booked.has(iso);
      assert.ok(free, `${bridge.id}: ${iso} is a working day nobody booked`);
    }
  }
});

test("the headline claim holds: one day in December buys five", () => {
  const december = BRIDGES.find((b) => b.id === "december-short");
  assert.ok(december);
  assert.equal(december.take.length, 1);
  assert.equal(december.take[0], "2027-12-07");
  assert.equal(december.days, 5);

  const january = BRIDGES.find((b) => b.id === "new-year-long");
  assert.ok(january);
  assert.equal(january.take.length, 4);
  assert.equal(january.days, 10);

  const easter = BRIDGES.find((b) => b.id === "easter");
  assert.ok(easter);
  assert.equal(easter.take.length, 0, "Easter needs no leave at all");
  assert.equal(easter.days, 4);
});

/* -------------------------------------------------------------------------- */
/* The article                                                                */
/* -------------------------------------------------------------------------- */

test("every edition is a valid body and substantial", () => {
  for (const locale of LOCALES) {
    const body = buildBody(locale);
    const parsed = bodySchema.safeParse(body);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.[0])}`);
    assert.ok(wordCount(bodyToPlainText(body)) > 500, `${locale} is thin`);
  }
});

test("the downloadable calendar holds the twelve holidays and nothing else", () => {
  // The single most dangerous failure on this page: a suggested day of leave
  // reaching someone's calendar labelled as a public holiday.
  const suggested = new Set(BRIDGES.flatMap((b) => b.take));

  for (const locale of LOCALES) {
    const calendar = buildBody(locale).find((block) => block.type === "calendar");
    assert.ok(calendar && calendar.type === "calendar", `${locale}: no calendar block`);

    assert.equal(calendar.events.length, 12, `${locale}: expected twelve events`);

    const dates = new Set(calendar.events.map((event) => event.date));
    for (const holiday of CATALONIA_HOLIDAYS) {
      assert.ok(dates.has(holiday.date), `${locale}: ${holiday.date} missing from the file`);
    }
    for (const iso of suggested) {
      assert.ok(!dates.has(iso), `${locale}: suggested leave ${iso} is in the calendar file`);
    }
    for (const local of BARCELONA_LOCAL) {
      assert.ok(!dates.has(local.date), `${locale}: Barcelona's ${local.date} is in the file`);
    }
    assert.ok(
      !dates.has(ARAN_REPLACEMENT.date),
      `${locale}: the Aran substitution is in the Catalonia-wide file`,
    );
  }
});

test("the article never claims a Saturday holiday earns another day off", () => {
  const forbidden = [
    /et donen un altre dia|tens dret a un altre dia/i,
    /te dan otro d[ií]a|tienes derecho a otro d[ií]a/i,
    /entitles? you to another day|you get another day off/i,
  ];
  for (const locale of LOCALES) {
    const text = bodyToPlainText(buildBody(locale));
    for (const pattern of forbidden) assert.doesNotMatch(text, pattern, locale);
  }
});

test("each edition states that bridges assume a Monday-to-Friday week", () => {
  const marker = {
    ca: /dilluns a divendres/i,
    es: /lunes a viernes/i,
    en: /Monday[- ]to[- ]Friday/i,
  };
  for (const locale of LOCALES) {
    assert.match(bodyToPlainText(buildBody(locale)), marker[locale], `${locale} lost the caveat`);
  }
});

test("URLs are evergreen and carry no year", () => {
  const expected = {
    ca: "guies/calendari-laboral-catalunya",
    es: "guias/calendario-laboral-cataluna",
    en: "guides/catalonia-public-holidays",
  };
  for (const locale of LOCALES) {
    assert.equal(COPY[locale].path, expected[locale]);
    assert.doesNotMatch(COPY[locale].path, /\d/, `${locale} path carries a number`);
  }
});

test("dates are formatted from the ISO value, not transcribed", () => {
  // A spot check in each language, including the Catalan elision before a
  // vowel that a hand-written list gets wrong.
  assert.equal(formatDay("2027-10-12", COPY.ca, "ca"), "12 d'octubre");
  assert.equal(formatDay("2027-12-06", COPY.ca, "ca"), "6 de desembre");
  assert.equal(formatDay("2027-01-06", COPY.es, "es"), "6 de enero");
  assert.equal(formatDay("2027-06-24", COPY.en, "en"), "24 June");
  assert.equal(weekdayOf("2027-12-07", COPY.ca), "dimarts");
});

/* -------------------------------------------------------------------------- */
/* Page-1 push, 28 Oct 2026: Easter, 2026, local days, links                  */
/* -------------------------------------------------------------------------- */

const tableAfter = (locale: (typeof LOCALES)[number], heading: string) => {
  const body = buildBody(locale);
  const index = body.findIndex((b) => b.type === "heading" && b.text === heading);
  assert.ok(index >= 0, `${locale}: no "${heading}" heading`);
  const table = body.slice(index).find((b) => b.type === "table");
  assert.ok(table && table.type === "table", `${locale}: no table under "${heading}"`);
  return table;
};

test("search titles and descriptions fit what Google shows", () => {
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription } = COPY[locale];
    assert.ok(seoTitle.length <= 60, `${locale}: title ${seoTitle.length}`);
    assert.ok(seoDescription.length <= 155, `${locale}: description ${seoDescription.length}`);
    assert.match(seoTitle, /2027/, locale);
  }
  assert.match(COPY.ca.seoTitle, /Pasqua/);
  assert.match(COPY.en.seoTitle, /Barcelona/);
});

test("Easter 2027: the table marks only Good Friday and Easter Monday as Catalonia-wide", () => {
  const goodFriday = { ca: "26 de març", es: "26 de marzo", en: "26 March" };
  const maundy = { ca: "25 de març", es: "25 de marzo", en: "25 March" };
  for (const locale of LOCALES) {
    const copy = COPY[locale];
    const table = tableAfter(locale, copy.easterTitle);
    const rows = new Map(table.rows.map((row) => [row[0], row]));
    assert.equal(rows.get(maundy[locale])?.[3], copy.easterStatus.maundy, `${locale}: Maundy Thursday`);
    assert.equal(rows.get(goodFriday[locale])?.[3], copy.easterStatus.holiday, `${locale}: Good Friday`);
    assert.equal(table.rows.filter((row) => row[3] === copy.easterStatus.holiday || row[3] === copy.easterStatus.exceptAran).length, 2);
    // The school Easter break comes from Ordre EDF/66/2026: 20 to 29 March 2027.
    const text = bodyToPlainText(buildBody(locale));
    assert.match(text, locale === "en" ? /20 March to 29 March/ : /20 de mar[çz]o? al 29 de mar[çz]/, locale);
  }
});

test("the 2026 calendar is Ordre EMT/66/2025's twelve days, with the December date pages linked", () => {
  const titles = { ca: COPY.ca.year2026Title, es: COPY.es.year2026Title, en: COPY.en.year2026Title };
  const dayPath = { ca: "/ca/festius/dia/8-desembre-2026/", es: "/es/festivos/dia/8-diciembre-2026/", en: "/en/holidays/day/8-december-2026/" };
  for (const locale of LOCALES) {
    const table = tableAfter(locale, titles[locale]);
    assert.equal(table.rows.length, 12, locale);
    assert.ok(table.rows.some((row) => row[0]?.includes(dayPath[locale])), `${locale}: 8 Dec not linked`);
    // Sant Esteve 2026 is a Saturday and Aran swaps it for 17 June.
    assert.match(table.note ?? "", /17/, locale);
  }
});

test("local days: 2027 not published yet, 2026 sent to the town pages", () => {
  for (const locale of LOCALES) {
    const json = JSON.stringify(buildBody(locale));
    if (locale === "en") {
      assert.match(json, /\/en\/guides\/local-holidays-catalonia\//);
    } else {
      const root = locale === "ca" ? "festius" : "festivos";
      for (const town of ["barcelona", "lleida", "tarragona", "girona"]) {
        assert.ok(json.includes(`/${locale}/${root}/${town}/`), `${locale}: no link to ${town}`);
      }
      assert.ok(json.includes(`(/${locale}/${root}/)`), `${locale}: no link to the hub`);
    }
    assert.match(bodyToPlainText(buildBody(locale)), /17 (de desembre|de diciembre|December) (de )?2025/, locale);
  }
});

test("the planner sends parents to the school calendar", () => {
  const school = { ca: "/ca/guies/calendari-escolar-catalunya/", es: "/es/guias/calendario-escolar-cataluna/", en: "/en/guides/catalonia-school-calendar/" };
  for (const locale of LOCALES) assert.ok(JSON.stringify(buildBody(locale)).includes(school[locale]), locale);
});

test("the opening sentence names every 2027 holiday, so it cannot drift from the table", () => {
  const months: Record<string, string[]> = {
    ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  };
  for (const locale of LOCALES) {
    const lead = COPY[locale].lead[0] ?? "";
    for (const holiday of CATALONIA_HOLIDAYS) {
      const day = String(Number(holiday.date.slice(8, 10)));
      const month = (months[locale] ?? [])[Number(holiday.date.slice(5, 7)) - 1] ?? "";
      assert.match(lead, new RegExp(String.raw`(?<!\d)${day}(?!\d)[^.]*?${month}`), `${locale}: ${holiday.date}`);
    }
    assert.match(lead, /BOE/, locale);
  }
});
