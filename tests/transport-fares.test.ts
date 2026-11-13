import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { TRANSPORT } from "../src/lib/content/batch02/barcelona-practical.ts";
import {
  CURRENT_FARES,
  FARES_2026,
  FARES_2027,
  FARES_AS_OF,
  FARES_RECHECK,
  FARE_TABLES,
  TICKETS,
  ZONE_KEYS,
  fareTableFor,
  overdueFareRecheck,
  type FareTable,
} from "../src/lib/content/transport-cards/rates.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * Barcelona transport fares as a dated table (13 Nov 2026).
 *
 * The 2027 ATM fares are not out (ATM and TMB read 13 Nov 2026; last year
 * ATM approved them on 19 Dec and they took effect on 15 Jan). These tests
 * make the January swap a data edit: fill FARES_2027 from the operator's
 * page, point CURRENT_FARES at it, and the drift test names every figure in
 * the transport prose that still carries a 2026 fare.
 */

const madridToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

function checkTable(table: FareTable) {
  assert.match(table.validFrom, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(table.validFrom.slice(0, 4), String(table.year), "a table takes effect in its own year");
  assert.match(table.sourceUrl, /^https:\/\/(www\.)?(tmb\.cat|atm\.cat)\//, "operator's page only");
  assert.match(table.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(table.quote.length > 10, "the operator's own dating words");
  assert.ok(table.airportTicket > 0);
  for (const zone of ZONE_KEYS) {
    const z = table.zones[zone];
    for (const [key, value] of Object.entries(z)) assert.ok(value > 0, `${table.year} zone ${zone} ${key}`);
  }
  // Every fare rises (or stays) with the number of zones.
  for (let i = 1; i < ZONE_KEYS.length; i++) {
    const a = table.zones[ZONE_KEYS[i - 1]!];
    const b = table.zones[ZONE_KEYS[i]!];
    for (const key of Object.keys(a) as (keyof typeof a)[]) assert.ok(b[key] >= a[key], `${table.year} ${key} zone ${i + 1}`);
  }
}

test("2026 fare table: TMB's 'Prices in force from 15 January 2026', read 13 Nov 2026", () => {
  checkTable(FARES_2026);
  assert.equal(FARES_2026.validFrom, "2026-01-15");
  assert.deepEqual(FARES_2026.zones["1"], { single: 2.9, tCasual: 13, tDia: 12, tUsual: 22.8, tFamiliar: 11.5, tGrup: 91 });
  assert.deepEqual(FARES_2026.zones["3"], { single: 5.4, tCasual: 34.7, tDia: 22.95, tUsual: 42.7, tFamiliar: 30.8, tGrup: 242.9 });
  assert.equal(FARES_2026.zones["7"].tGrup, 403.2);
  assert.equal(FARES_2026.airportTicket, 5.9);
});

test("2027 is published only from the operator's page, and then takes effect in 2027", () => {
  if (FARES_2027 === null) {
    assert.equal(CURRENT_FARES, FARES_2026, "no 2027 table: the pages print 2026");
    assert.equal(FARE_TABLES.length, 1);
    assert.equal(fareTableFor("2027-06-01"), FARES_2026, "until 2027 is published, 2026 is the last known table");
    return;
  }
  checkTable(FARES_2027);
  assert.equal(FARES_2027.year, 2027);
  assert.ok(FARES_2027.validFrom > FARES_2026.validFrom);
  assert.equal(fareTableFor(FARES_2027.validFrom), FARES_2027);
  assert.equal(fareTableFor("2026-12-31"), FARES_2026);
});

test("the selector's zone-1 fares are the current table's", () => {
  const z1 = CURRENT_FARES.zones["1"];
  const fare = (key: string) => TICKETS.find((t) => t.key === key)?.fares[0]?.price;
  assert.equal(fare("senzill"), z1.single);
  assert.equal(fare("t-casual"), z1.tCasual);
  assert.equal(fare("t-dia"), z1.tDia);
  assert.equal(fare("t-usual"), z1.tUsual);
  assert.equal(fareTableFor("2026-01-14"), null, "nothing before the first verified table");
});

/** Every euro figure the transport page may print, from the current table and the Hola list. */
function allowedAmounts(): Set<number> {
  const cents = (v: number) => Math.round(v * 100);
  const out = new Set<number>();
  for (const zone of ZONE_KEYS) for (const v of Object.values(CURRENT_FARES.zones[zone])) out.add(cents(v));
  const z1 = CURRENT_FARES.zones["1"];
  out.add(cents(CURRENT_FARES.airportTicket));
  out.add(cents(z1.tCasual / 10)); // per journey
  out.add(cents(z1.tCasual + 2 * CURRENT_FARES.airportTicket)); // T-casual + airport there and back
  for (let n = 1; n <= 5; n++) out.add(cents(z1.tDia * n)); // one T-dia a day
  const hola = TICKETS.find((t) => t.key === "hola-barcelona")!;
  for (const f of hola.fares) {
    out.add(cents(f.price));
    out.add(cents(Math.round((f.price / (f.days ?? 1)) * 100) / 100)); // per day
    out.add(cents(Math.round(f.price * 0.9 * 100) / 100)); // TMB's 10 % online price, quoted once
  }
  out.add(100); // a cardboard T-mobilitat costs 1 € more (ATM)
  return out;
}

test("drift: every euro figure in the transport page is a current fare (fails after a fare swap until the prose follows)", () => {
  const allowed = allowedAmounts();
  for (const locale of LOCALES) {
    const e = TRANSPORT.editions[locale];
    const text = [e.seoTitle, e.seoDescription, e.title, bodyToPlainText(e.blocks)].join(" ");
    const pattern = locale === "en" ? /€(\d+(?:\.\d{2})?)/g : /(\d+(?:,\d{2})?)\s?€/g;
    const stray = new Set<string>();
    for (const m of text.matchAll(pattern)) {
      const value = Math.round(Number(m[1]!.replace(",", ".")) * 100);
      if (!allowed.has(value)) stray.add(m[0]);
    }
    assert.deepEqual([...stray], [], `${locale}: figures not in the ${CURRENT_FARES.year} fare table`);
  }
});

test("date guard: ATM's 2027 fares are re-checked in mid-December and again by 15 January", () => {
  // The guard logic itself.
  assert.equal(overdueFareRecheck("2026-12-15", "2026-11-13"), null);
  assert.equal(overdueFareRecheck("2026-12-16", "2026-11-13"), "2026-12-16");
  assert.equal(overdueFareRecheck("2026-12-20", "2026-12-17"), null);
  assert.equal(overdueFareRecheck("2027-01-15", "2026-12-17"), "2027-01-15");
  assert.deepEqual([...FARES_RECHECK], ["2026-12-16", "2027-01-15"]);

  const today = madridToday();
  assert.ok(FARES_AS_OF <= today, `FARES_AS_OF (${FARES_AS_OF}) is in the future`);
  const due = overdueFareRecheck(today);
  assert.equal(
    due,
    null,
    `On ${today} the Barcelona fares were last read on ${FARES_AS_OF}, before the ${due} re-check. Read ATM's press room (https://www.atm.cat/comunicacio/sala-de-premsa/notes-de-premsa) and TMB's fare table (${FARES_2026.sourceUrl}), plus the BOE/Ministry for a 2027 extension of RDL 17/2025. If the 2027 table is out: fill FARES_2027, point CURRENT_FARES at it, fix the prose the drift test lists, and publish the \`transport\` group. Then move FARES_AS_OF in src/lib/content/transport-cards/rates.ts.`,
  );
});
