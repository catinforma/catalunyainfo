import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { addDays } from "../src/lib/programmatic/holidays/format.ts";
import { YEAR, localThrough, municipalities, municipalityBySlug, regionalThrough, statusDays, yearRows } from "../src/lib/programmatic/holidays/data.ts";
import {
  TODAY_FIRST,
  firstScreenOrder,
  pastRowsLabel,
  splitRowsByDate,
  townAnswerText,
  townTodayAnswer,
} from "../src/lib/programmatic/holidays/first-screen.ts";
import { answerFor } from "../src/lib/programmatic/holidays/status.ts";

/*
 * Town holiday pages, first screen (docs/SEO_EXPERIMENTS.md, 19 Nov 2026 review, run 18 Nov):
 * the Spanish edition lost its "hoy / mañana" queries with the table first, the Catalan one held.
 */

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const BCN = municipalityBySlug("barcelona")!;

test("first screen order: es answers today/tomorrow, then the table, then the lead; ca keeps the table first", () => {
  assert.deepEqual(firstScreenOrder("es"), ["answer", "table", "lead"]);
  assert.deepEqual(firstScreenOrder("ca"), ["table", "lead"]);
  assert.equal(TODAY_FIRST.es, true);
  assert.equal(TODAY_FIRST.ca, false);
});

test("the town page renders its first screen from firstScreenOrder, before the next step and the live box", () => {
  const page = read("src/components/programmatic/holidays/MunicipalityPage.tsx");
  // One loop over the parts, in the order the module gives, then the next step, then #avui.
  assert.match(page, /\{firstScreenOrder\(locale\)\.map\(\(part\) =>[^]*?<NextStep step=\{townNextStep\([^]*?<h2 id="avui">/);
  const loop = page.slice(page.indexOf("{firstScreenOrder(locale).map("), page.indexOf("<NextStep step={townNextStep("));
  // Each part's markup: the answer paragraph, the table (past rows collapsed where split), the lead.
  assert.match(loop, /part === "answer"[^]*?className="ci-lead ci-town-answer"/);
  assert.match(loop, /part === "table"[^]*?<h2 id="festius-2026"[^]*?<details className="ci-past-holidays">/);
  assert.match(loop, /\{t\.lead\} \{t\.source\}/);
  // The answer is plain server HTML: no client box, no data-nosnippet.
  assert.doesNotMatch(loop, /data-nosnippet|HolidayStatus/);
  // The live box still follows (it answers with the reader's own clock).
  assert.ok(page.indexOf("<HolidayStatus") > page.indexOf("<NextStep step={townNextStep("));
});

test("English town pages keep the table first (too little data at the 19 Nov review)", () => {
  const page = read("src/components/programmatic/holidays/EnglishTownPage.tsx");
  assert.ok(page.indexOf('<h2 id="holidays-2026" className="mt-0">') < page.indexOf('<p className="ci-lead">'));
});

test("Barcelona on 18 Nov 2026: no holiday until the next one, named with its date", () => {
  const next = yearRows(BCN, YEAR, "es").find((r) => r.date >= "2026-11-18")!;
  const a = townTodayAnswer(BCN, "es", "2026-11-18")!;
  assert.equal(a.question, "¿Es festivo hoy o mañana en Barcelona?");
  assert.equal(a.before, "Hasta el ");
  assert.match(a.strong, /^(lunes|martes|miércoles|jueves|viernes|sábado|domingo) \d+ de diciembre de 2026$/);
  assert.ok(a.strong.includes(`${Number(next.date.slice(8))} de diciembre`), a.strong);
  assert.match(a.after, /^ no hay ningún festivo en Barcelona: es el próximo \(.+\)\.$/);
  // No relative words in the answer itself: it must read true on any day it is served.
  assert.doesNotMatch(`${a.before}${a.strong}${a.after}`, /\b(hoy|mañana)\b/);
  const ca = townTodayAnswer(BCN, "ca", "2026-11-18")!;
  assert.equal(ca.question, "És festiu avui o demà a Barcelona?");
  assert.match(townAnswerText(ca), /Fins al .+ de desembre de 2026 no hi ha cap festiu a Barcelona: és el pròxim/);
});

test("on a holiday the answer says so and names what follows", () => {
  const rows = yearRows(BCN, YEAR, "es");
  const day = rows.find((r) => r.date >= "2026-12-01")!;
  const a = townTodayAnswer(BCN, "es", day.date)!;
  assert.equal(a.before, "Sí: el ");
  assert.match(a.after, /^ es festivo en Barcelona \(/);
  const following = rows.find((r) => r.date > day.date);
  if (following) assert.match(a.after, following.date === addDays(day.date, 1) ? /también/ : /El siguiente: /);
});

/*
 * The page is cached from its render day D until the cron rebuilds it the day after its next
 * holiday N. On every day R in [D, N] the answer rendered on D must agree with the status box's
 * own logic (status.ts) for R: no holiday before N, a holiday on N.
 */
test("the answer rendered on any day stays true on every day the cached page is served", () => {
  const coverage = { regionalThrough: regionalThrough(), localThrough: localThrough() };
  const sample = municipalities().filter((m, i) => i % 40 === 0 || ["barcelona", "tarragona", "lleida", "girona"].includes(m.slug));
  for (const m of sample) {
    const days = statusDays(m, "es");
    for (let d = "2026-11-18"; d <= "2026-12-31"; d = addDays(d, 1)) {
      const a = townTodayAnswer(m, "es", d);
      if (!a || a.before !== "Hasta el ") continue;
      const n = days.map((x) => x.d).filter((x) => x >= d).sort()[0]!;
      for (let r = d; r < n; r = addDays(r, 1)) {
        assert.equal(answerFor(r, days, coverage).state, "working", `${m.slug} rendered ${d}, served ${r}`);
      }
      assert.equal(answerFor(n, days, coverage).state, "holiday", `${m.slug} rendered ${d}, served on ${n}`);
    }
  }
});

test("where the next year's local days are not out, only the Catalonia-wide day is named, with the caveat", () => {
  // 2 Jan 2027: the next regional day is 6 Jan; local 2027 days are known only once local-2027.json has the order.
  const a = townTodayAnswer(BCN, "es", "2027-01-02");
  assert.ok(a);
  if (localThrough() < "2027-01-05") {
    assert.equal(a.before, "El próximo festivo de toda Cataluña es el ");
    assert.match(a.after, /todavía no se han publicado/);
  } else {
    assert.equal(a.before, "Hasta el ");
  }
});

test("past rows collapse under the ones still ahead, nothing dropped", () => {
  const rows = yearRows(BCN, YEAR, "es");
  const { upcoming, past } = splitRowsByDate(rows, "2026-11-18");
  assert.equal(upcoming.length + past.length, rows.length);
  assert.ok(upcoming.length > 0 && past.length > 0);
  assert.ok(past.every((r) => r.date < "2026-11-18") && upcoming.every((r) => r.date >= "2026-11-18"));
  assert.equal(pastRowsLabel("es", past.length), `Festivos de ${YEAR} que ya han pasado (${past.length})`);
  // The page shows the full table when one half is empty (first and last days of the year).
  assert.match(read("src/components/programmatic/holidays/MunicipalityPage.tsx"), /halves\.upcoming\.length > 0 && halves\.past\.length > 0/);
});
