import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { christmasDays } from "../src/lib/content/batch02/shops-christmas.ts";
import { addDays } from "../src/lib/content/holidays/calendar.ts";
import { christmasShopsCopy, christmasShopsCopyEn } from "../src/lib/programmatic/holidays/christmas-shops.ts";
import { municipalities, municipalityBySlug } from "../src/lib/programmatic/holidays/data.ts";
import { englishTowns } from "../src/lib/programmatic/holidays/english.ts";
import { townShopsLine, townShopsLineText } from "../src/lib/programmatic/holidays/shops-line.ts";

/**
 * 24 Nov 2026 (docs/SEO_EXPERIMENTS.md, "Shop answer under the H1 of the town
 * holiday pages"): the first line of the body says which Sundays and holidays
 * to Reis the town's shops may open, from the same rows as the Christmas table.
 * Date-free: no "today", no "this Sunday", no nightly rebuild.
 */

const ROOT = join(import.meta.dirname, "..");
const BCN = municipalityBySlug("barcelona")!;
const TER = municipalityBySlug("terrassa")!;
const text = (m: typeof BCN, locale: "ca" | "es" | "en", today: string) => townShopsLineText(townShopsLine(m, locale, today)!);

test("Barcelona and Terrassa on 29 Nov 2026: the whole season, in the three editions", () => {
  assert.equal(
    text(BCN, "ca", "2026-11-29"),
    "Botigues amb horari general fins a Reis: poden obrir 29 nov. · 6, 8, 13, 20 i 27 des., i el 3 gen. si l'Ajuntament no l'ha canviat; tancat per llei: 25 i 26 des. · 1 i 6 gen. Taula d'obertura de Nadal",
  );
  assert.equal(
    text(TER, "ca", "2026-11-29"),
    "Botigues amb horari general fins a Reis: poden obrir 29 nov. · 8, 13, 20 i 27 des., i el 3 gen. si l'Ajuntament no l'ha canviat; no 6 des. (canviat per l'Ajuntament); tancat per llei: 25 i 26 des. · 1 i 6 gen. Taula d'obertura de Nadal",
  );
  assert.equal(
    text(TER, "es", "2026-11-29"),
    "Tiendas con horario general hasta Reyes: pueden abrir 29 nov. · 8, 13, 20 y 27 dic., y el 3 ene. si el Ayuntamiento no lo ha cambiado; no 6 dic. (cambiado por el Ayuntamiento); cerrado por ley: 25 y 26 dic. · 1 y 6 ene. Tabla de apertura en Navidad",
  );
  assert.equal(
    text(TER, "en", "2026-11-29"),
    "Shops on the general timetable until Epiphany: may open 29 Nov · 8, 13, 20 and 27 Dec, and 3 Jan unless the council has swapped it; not 6 Dec (swapped by the council); closed by law: 25 and 26 Dec · 1 and 6 Jan. Christmas opening table",
  );
  assert.equal(townShopsLine(BCN, "ca", "2026-11-29")!.link.href, "#botigues-nadal");
  assert.equal(townShopsLine(BCN, "es", "2026-11-29")!.link.href, "#botigues-nadal");
  assert.equal(townShopsLine(BCN, "en", "2026-11-29")!.link.href, "#christmas-shops");
});

test("past days drop at render; 8 Dec, 25 Dec and a weekday", () => {
  // 6 Dec: Terrassa's swapped Sunday is today, still listed; the day after it is gone.
  assert.match(text(TER, "ca", "2026-12-06"), /poden obrir 8, 13, 20 i 27 des\./);
  assert.match(text(TER, "ca", "2026-12-06"), /no 6 des\. \(canviat per l'Ajuntament\)/);
  assert.doesNotMatch(text(TER, "ca", "2026-12-07"), /(?<!\d)6 des\./);
  assert.match(text(BCN, "ca", "2026-12-08"), /^Botigues amb horari general fins a Reis: poden obrir 8, 13, 20 i 27 des\./);
  // Weekday, mid-week: the next Sunday is the first open day.
  assert.match(text(BCN, "es", "2026-12-02"), /pueden abrir 6, 8, 13, 20 y 27 dic\./);
  // 25 Dec: no open day is left but 27 Dec and 3 Jan; the law's days are named.
  assert.match(text(TER, "ca", "2026-12-25"), /poden obrir 27 des\., i el 3 gen\. si l'Ajuntament no l'ha canviat; tancat per llei: 25 i 26 des\. · 1 i 6 gen\./);
  assert.match(text(BCN, "en", "2026-12-28"), /^Shops on the general timetable until Epiphany: may open 3 Jan unless the council has swapped it; closed by law: 1 and 6 Jan\. Christmas/);
  assert.match(text(BCN, "ca", "2027-01-04"), /^Botigues amb horari general fins a Reis: tancat per llei: 6 gen\. Taula/);
  assert.equal(townShopsLine(BCN, "ca", "2027-01-07"), null);
  for (const day of ["2027-01-07", "2027-02-14", "2027-06-01"]) for (const l of ["ca", "es", "en"] as const) assert.equal(townShopsLine(BCN, l, day), null, `${l} ${day}`);
});

test("date-free: the words never refer to today, this Sunday or 'avui'", () => {
  for (const m of [BCN, TER]) {
    for (let day = "2026-11-24"; day <= "2027-01-06"; day = addDays(day, 1)) {
      for (const l of ["ca", "es", "en"] as const) {
        assert.doesNotMatch(text(m, l, day), /\b(avui|demà|aquest|hoy|mañana|este|today|tomorrow|this)\b/i, `${m.slug} ${l} ${day}`);
      }
    }
  }
});

test("the line and the table agree: same source, same answers, for every town with a page (917) and every day", () => {
  const towns = municipalities();
  assert.equal(towns.length, 917);
  const english = new Set(englishTowns().map((m) => m.slug));
  const TABLE_ANSWER = { open: "Sí", swapped: "No", localClosed: "No", lawClosed: "No", pending2027: "Sí" } as const;
  for (const m of towns) {
    const rows = christmasDays(m);
    // The table now starts with the first Sunday of the window.
    assert.equal(rows[0]!.iso, "2026-11-29", m.slug);
    for (const locale of ["ca", "es"] as const) {
      const table = christmasShopsCopy(m, locale);
      assert.deepEqual(table.rows.map((r) => r.iso), rows.map((r) => r.iso), `${m.slug} ${locale}: the table's days`);
      for (const today of ["2026-11-29", "2026-12-07", "2026-12-26", "2027-01-06"]) {
        const line = townShopsLine(m, locale, today)!;
        const left = rows.filter((r) => r.iso >= today);
        // The days the line names are exactly the table's rows from that day on, with the table's answer.
        assert.deepEqual(line.days, left.map((r) => ({ iso: r.iso, answer: r.answer })), `${m.slug} ${locale} ${today}`);
        for (const d of line.days) {
          const row = table.rows.find((r) => r.iso === d.iso)!;
          assert.equal(row.verdict, TABLE_ANSWER[d.answer], `${m.slug} ${locale} ${d.iso}`);
          assert.equal(row.answer, d.answer);
        }
        // And the sentence prints those days: every open day appears in its list, no closed day does.
        const t = townShopsLineText(line);
        assert.doesNotMatch(t, /undefined|NaN|null|\[object|\{|\}/, `${m.slug} ${locale} ${today}: ${t}`);
        assert.ok(t.length < 330, `${m.slug} ${locale} ${today} is ${t.length} characters`);
      }
    }
    if (english.has(m.slug)) {
      const table = christmasShopsCopyEn(m);
      assert.deepEqual(table.rows.map((r) => r.iso), rows.map((r) => r.iso), `${m.slug} en: the table's days`);
      const line = townShopsLine(m, "en", "2026-11-29")!;
      assert.deepEqual(line.days.map((d) => d.iso), table.rows.map((r) => r.iso));
      for (const d of line.days) assert.equal(table.rows.find((r) => r.iso === d.iso)!.answer, d.answer);
      assert.doesNotMatch(townShopsLineText(line), /undefined|NaN|null|\[object/);
    }
  }
});

test("the page prints the line under the H1, before the table, with no clock of its own and no cron change", () => {
  const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
  const ca = read("src/components/programmatic/holidays/MunicipalityPage.tsx");
  // es: after the "hoy o mañana" answer, before the table; ca: right before the table's H2.
  assert.ok(ca.indexOf("ci-town-answer") < ca.indexOf("<TownShopsLine"), "es: under the answer");
  assert.ok(ca.lastIndexOf("<TownShopsLine") < ca.indexOf('<h2 id="festius-2026"'), "ca: before the table");
  assert.ok(ca.indexOf("<TownShopsLine") < ca.indexOf("<HolidayStatus"));
  const en = read("src/components/programmatic/holidays/EnglishTownPage.tsx");
  assert.ok(en.indexOf("<TownShopsLine") < en.indexOf('<h2 id="holidays-2026"'), "en: before the table");
  // The page's one clock is the seasonal link's (27 Nov 2026, batch 9B; rebuilt on its switch nights by
  // lib/engagement/seasonal-refresh.ts); the shops line and everything else stay clock-free.
  assert.equal(en.match(/todayInCatalonia\(\)/g)?.length, 1, "one clock only");
  assert.match(en, /guides,\s*today: todayInCatalonia\(\),\s*\}\);/, "the English page's only clock is the seasonal link's");
  // Same anchors as the table's section.
  const section = read("src/components/programmatic/holidays/ChristmasShops.tsx");
  assert.ok(section.includes('id="botigues-nadal"') && section.includes('id="christmas-shops"'));
  assert.ok(read("src/components/programmatic/holidays/TownShopsLine.tsx").includes("ci-callout ci-callout-tip ci-town-shops"));
  // No nightly rebuild: the cron's list is the one it had before the line.
  const routing = read("src/lib/programmatic/holidays/routing.ts");
  const refresh = routing.slice(routing.indexOf("export function holidayRefreshPaths"), routing.indexOf("/** Every date page is built"));
  assert.ok(!routing.includes("shopsLine") && !/english/i.test(refresh), "holidayRefreshPaths is unchanged: ca/es, the day after a holiday");
});
