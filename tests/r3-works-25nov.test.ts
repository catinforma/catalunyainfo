import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { bodySchema, bodyToPlainText } from "../src/lib/content/blocks.ts";
import { CERDANYA, R3_FIGARO_WORKS } from "../src/lib/content/batch02/day-trips.ts";
import { NURIA } from "../src/lib/content/batch02/nuria.ts";
import { RIPOLLES, SETCASES } from "../src/lib/content/batch02/pyrenees.ts";
import { MONTSERRAT } from "../src/lib/content/features/montserrat.ts";
import { TRAINS } from "../src/lib/content/features/trains.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/*
 * 25 Nov 2026, R3 re-read (docs/SEO_EXPERIMENTS.md). Rodalies' notice
 * 02_02_PAT_R3 and the sheet PAT_399-26 "LA GARRIGA - FIGARÓ" (16/11/2026):
 * "De les 5.00 h del 16 de novembre fins les 7.00 h del 14 de desembre"; the
 * rail list reads "Sant Martí de Centelles - Puicerdà/La Tor de Querol:
 * línia R3", so the trains that serve La Molina and Puigcerdà start at Sant
 * Martí de Centelles, not La Garriga, until 7.00 on 14 Dec. The notice says
 * nothing about what follows: the pages must be re-read before.
 */

type B = { type: string; text?: string; rows?: string[][]; headers?: string[]; items?: { question: string; answer: string }[] };

const MODULES = {
  cerdanya: (l: Locale) => CERDANYA.editions[l].blocks,
  ripolles: (l: Locale) => RIPOLLES.editions[l].blocks,
  setcases: (l: Locale) => SETCASES.editions[l].blocks,
  nuria: (l: Locale) => NURIA.editions[l].blocks,
  trains: (l: Locale) => TRAINS.editions[l].blocks,
  montserrat: (l: Locale) => MONTSERRAT.editions[l].blocks,
} as const;

const ROOT = join(import.meta.dirname, "..");

test("R3 cut: re-read guard, the works end on 14 Dec and the pages must be re-read before", () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.equal(R3_FIGARO_WORKS.from, "2026-11-16");
  assert.equal(R3_FIGARO_WORKS.to, "2026-12-14");
  assert.ok(R3_FIGARO_WORKS.rereadBy < R3_FIGARO_WORKS.to);
  assert.ok(
    today <= R3_FIGARO_WORKS.rereadBy,
    "R3 La Garriga - Figaró works end on 14 Dec 2026 (7.00): re-read rodalies.gencat.cat 02_02_PAT_R3 and 11_11_R3_La-Garriga-Figaro, then fix day-trips.ts (Cerdanya: callout, tables, lead, FAQ), pyrenees.ts (Ripollès table, Setcases), nuria.ts (r3), features/trains.ts and montserrat.ts (Vic), the ski trainNote and snow-trips.ts, and move R3_FIGARO_WORKS.rereadBy.",
  );
});

test("R3 cut: every page says the trains start at Sant Martí de Centelles and dates the works, in ca, es and en", () => {
  const until = { ca: /14 de desembre/, es: /14 de diciembre/, en: /14 December/ } as const;
  for (const [name, blocks] of Object.entries(MODULES)) {
    for (const locale of LOCALES) {
      const text = JSON.stringify(blocks(locale));
      assert.match(text, /Sant Martí de Centelles/, `${name}/${locale}`);
      assert.match(text, until[locale], `${name}/${locale}: works end date`);
      // Setcases only mentions the R3 in passing; its own facts keep their 28 Oct read date.
      if (name !== "setcases") assert.match(text, /25 (de novembre|de noviembre|November)|25\/11\/2026/, `${name}/${locale}: read date`);
    }
  }
});

test("R3 cut: nothing still says the R3 trains run from La Garriga, or that the bus goes to La Garriga or Vic", () => {
  const stale = [
    /entre Barcelona i la Garriga: aquest tram es fa amb els autobusos directes/,
    /de la Garriga a Puigcerdà hi ha \*\*cinc/,
    /de La Garriga a Puigcerdà hay \*\*cinco/,
    /between La Garriga and Puigcerdà\*\*|\*\*five through trains a day each way\*\* run between La Garriga/,
    /Trens R3 de pujada: la Garriga|Trenes R3 de subida: La Garriga|R3 trains up: La Garriga/,
    /13 (trens al dia|trenes al día|trains a day)/,
    /9,70 €|€9\.70/,
    /vigent des del 6 de juliol|vigente desde el 6 de julio|in force since 6 July/,
    /de la Garriga a Ripoll|de La Garriga a Ripoll|from La Garriga to Ripoll/,
    /trens circulen només entre la Garriga|trenes solo circulan entre La Garriga|run only between La Garriga/,
    /fins a la Garriga o Vic|hasta La Garriga o Vic|to La Garriga or Vic/,
    /entre Barcelona i la Garriga no hi ha|entre Barcelona y La Garriga no hay|between Barcelona and La Garriga\b(?! no)/,
    /tallada entre Barcelona i la Garriga|cortada entre Barcelona y La Garriga|cut between Barcelona and La Garriga/,
  ];
  for (const [name, blocks] of Object.entries(MODULES)) {
    for (const locale of LOCALES) {
      const text = JSON.stringify(blocks(locale));
      for (const re of stale) assert.doesNotMatch(text, re, `${name}/${locale}: ${re}`);
    }
  }
});

test("Cerdanya: through trains from the 16/11 sheet (same Ripoll-to-Puigcerdà times, start at Sant Martí de Centelles), five each way", () => {
  const expectedUp = [
    ["6:56", "8:10", "8:29", "9:00", "9:21", "—"],
    ["10:26", "11:40", "12:01", "12:32", "12:54", "13:00"],
    ["13:26", "14:40", "14:59", "15:32", "15:54", "16:00"],
    ["16:26", "17:40", "17:59", "18:32", "18:54", "19:00"],
    ["18:26", "19:40", "19:59", "20:30", "20:51", "—"],
  ];
  const expectedDown = [
    ["—", "5:53", "6:17", "6:51", "7:12", "8:25"],
    ["—", "7:51", "8:15", "8:49", "9:11", "10:25"],
    ["—", "10:22", "10:46", "11:20", "11:41", "12:55"],
    ["14:14", "14:21", "14:45", "15:19", "15:41", "16:55"],
    ["17:13", "17:20", "17:44", "18:19", "18:41", "19:55"],
  ];
  for (const locale of LOCALES) {
    const blocks = CERDANYA.editions[locale].blocks as B[];
    assert.ok(bodySchema.safeParse(blocks).success, `${locale}: blocks valid`);
    const tables = blocks.filter((b) => b.type === "table");
    assert.equal(tables.length, 2, `${locale}: two tables`);
    assert.deepEqual(tables[0]!.rows, expectedUp, `${locale}: up`);
    assert.deepEqual(tables[1]!.rows, expectedDown, `${locale}: down`);
    assert.equal(tables[0]!.headers?.[0], "Sant Martí de Centelles");
    assert.equal(tables[1]!.headers?.at(-1), "Sant Martí de Centelles");
    // Every time must be later than the previous one on the same row.
    for (const row of expectedUp) {
      const m = row.filter((t) => t !== "—").map((t) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]));
      assert.deepEqual([...m].sort((a, b) => a - b), m, `${locale}: ${row.join(" ")} not increasing`);
    }
    // Journey from Sant Martí to Puigcerdà: 2 h 25 min to 2 h 35 min (up and down).
    const minutes = (t: string) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);
    const durations = [
      ...expectedUp.map((r) => minutes(r[4]!) - minutes(r[0]!)),
      ...expectedDown.map((r) => minutes(r[5]!) - minutes(r[1]!)),
    ];
    assert.equal(Math.min(...durations), 145);
    assert.equal(Math.max(...durations), 155);
  }
});

test("Cerdanya: Ski Tren price and what it includes, as the La Molina page printed them on 25 Nov, with no season invented", () => {
  const price = { ca: /53 € adult o jove i 41,50 € infantil/, es: /53 € adulto o joven y 41,50 € infantil/, en: /€53 adult or youth and €41\.50 child/ } as const;
  const noSeason = { ca: /sense indicar temporada/, es: /sin indicar temporada/, en: /no season stated/ } as const;
  for (const locale of LOCALES) {
    const text = bodyToPlainText(CERDANYA.editions[locale].blocks);
    assert.match(text, price[locale], locale);
    assert.match(text, noSeason[locale], locale);
    assert.match(text, /Ski Tren/);
  }
});

test("Cerdanya: sources include the 16/11 notice and sheets, all on rodalies.gencat.cat or other official hosts", () => {
  const urls = CERDANYA.sources.map((s) => s.url);
  assert.ok(urls.includes("https://rodalies.gencat.cat/ca/detalls/article/11_11_R3_La-Garriga-Figaro"));
  assert.ok(urls.some((u) => u.endsWith("PAT_399-26-LA-GARRIGA-FIGARO.pdf")));
  assert.ok(!urls.some((u) => /_V7\.pdf$/.test(u)), "the 6 July sheet is superseded for this period");
  assert.equal(CERDANYA.verifiedAt, "2026-11-25");
  for (const u of urls) assert.match(new URL(u).hostname, /^(rodalies\.gencat\.cat|cerdanya\.org|www\.puigcerda\.cat|pirineu365\.cat)$/, u);
});

test("Ripollès: 15 trains a day each way between Sant Martí de Centelles and Ripoll, table, panel and FAQ agree", () => {
  for (const locale of LOCALES) {
    const blocks = RIPOLLES.editions[locale].blocks as B[];
    assert.ok(bodySchema.safeParse(blocks).success, `${locale}: blocks valid`);
    const text = JSON.stringify(blocks);
    assert.match(text, /15 (trens al dia|trenes al día|trains a day)/, locale);
    assert.match(text, /8[.:]10/, "first up train reaches Ripoll at 8:10");
    assert.match(text, /19[.:]55/, "last down train reaches Sant Martí at 19:55");
  }
});

test("Rodalies line pages keep the live notice as the source of the R3 situation: no hard-coded works text", () => {
  for (const file of ["copy.ts", "pages.ts", "live.ts", "alerts.ts", "official.ts", "timetable-copy.ts"]) {
    const text = readFileSync(join(ROOT, "src/lib/programmatic/rodalies", file), "utf8");
    assert.doesNotMatch(text, /Garriga|Figar[óo]|Sant Martí de Centelles/, `${file}: the R3 works belong to the live notice and the feed`);
  }
});
