import assert from "node:assert/strict";
import { test } from "node:test";

import { TRANSPORT } from "../src/lib/content/batch02/barcelona-practical.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import { L2_CLOSURE_AS_OF } from "../src/lib/content/batch02/l2-closure.ts";
import { AID_AS_OF, AID_RECHECK, CURRENT_FARES, FARES_AS_OF } from "../src/lib/content/transport-cards/rates.ts";
import { LAST_VERIFIED, RATE_PERIODS } from "../src/lib/content/tourist-tax/rates.ts";
import { buildBody } from "../src/lib/content/tourist-tax/publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * 25 Nov 2026, English guides with traction (transport passes, tourist tax) and
 * two more at positions 5-12 (Christmas in Barcelona, L2 closure): prices and
 * dates re-read that day on TMB/ATM, the ATC tariff page and the City Council's
 * press room; the first screen answers the top query with a compact table.
 * Body only: titles, descriptions, H1 and leads are in measurement windows.
 */

type B = { type: string; text?: string; rows?: string[][]; headers?: string[]; caption?: string; level?: number };

const euro = (v: number, locale: string) => (locale === "en" ? `€${v.toFixed(2)}` : `${v.toFixed(2).replace(".", ",")} €`);


test("transport: a price table sits under the card-price H2, before the selector, with where to buy and valid until", () => {
  const z = CURRENT_FARES.zones["1"];
  for (const locale of LOCALES) {
    const blocks = TRANSPORT.editions[locale].blocks as B[];
    const selector = blocks.findIndex((b) => b.type === "transportPasses");
    const tableAt = blocks.findIndex((b) => b.type === "table" && /TMB/.test(b.caption ?? ""));
    assert.ok(tableAt > 0 && tableAt < selector, `${locale}: glance table before the selector`);
    const table = blocks[tableAt]!;
    const flat = JSON.stringify(table.rows);
    for (const v of [z.tCasual, z.tDia, z.tUsual, z.single, CURRENT_FARES.airportTicket, 12.5]) {
      assert.ok(flat.includes(euro(v, locale)), `${locale}: ${euro(v, locale)} in the glance table`);
    }
    assert.ok(flat.includes(euro(11.25, locale)), `${locale}: 10% online price of the 24 h Hola card`);
    const after = blocks
      .slice(tableAt + 1, selector)
      .map((b) => b.text ?? "")
      .join(" ");
    assert.match(after, /T-mobilitat/, `${locale}: where to buy`);
    // RDL 45/2026 (BOE 25 Nov 2026): State aid continues in 2027, second half conditional.
    assert.match(after, /45\/2026/, `${locale}: the decree-law`);
    assert.match(after, /31 (de )?(desembre|diciembre|December)( de)? 2027/, `${locale}: aid runs to 31 Dec 2027`);
    assert.match(after, /1 (de )?(juliol|julio|July)( de)? 2027/, `${locale}: the second half is conditional`);
    assert.doesNotMatch(after, /no extension|cap pròrroga|ninguna prórroga|todavía no hay prórroga/i, `${locale}: no stale "no extension"`);
    assert.ok(after.includes(FARES_AS_OF.slice(8).replace(/^0/, "")), `${locale}: read date ${FARES_AS_OF}`);
  }
  assert.equal(FARES_AS_OF, "2026-11-25");
});

test("the aid text keeps the decree-law's limits: the T-usual's 50% is ATM's, the 20% from 1 July 2027 is conditional", () => {
  const text = JSON.stringify(TRANSPORT.editions.en.blocks);
  assert.match(text, /The T-usual's 50% reduction does not come from the decree: ATM decides it every December/);
  assert.match(text, /from 1 July 2027 the Council of Ministers may cut the State.s share by up to 10 points/);
  assert.doesNotMatch(text, /State discount|50% discount of Royal Decree-Law 17\/2025/);
});

test("date guard: State aid for 2027 (RDL 45/2026) and ATM's T-usual reduction are re-read on 31 Dec 2026 and 15 May 2027", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  assert.ok(AID_AS_OF <= today, `AID_AS_OF (${AID_AS_OF}) is in the future`);
  const due = AID_RECHECK.filter((date) => date <= today && AID_AS_OF < date).at(-1) ?? null;
  assert.equal(
    due,
    null,
    `On ${today} the State aid and ATM's bonificacions were last read on ${AID_AS_OF}, before the ${due} re-check. Read BOE-A-2026-24703 (RDL 45/2026: ratification, any change, the Council of Ministers' decision on the 20% from 1 July 2027) and ATM's press notes (https://www.atm.cat/comunicacio/sala-de-premsa/notes-de-premsa) for the 2027 T-usual reduction, then rewrite AID_2027 in src/lib/content/batch02/barcelona-practical.ts and move AID_AS_OF in transport-cards/rates.ts.`,
  );
});

test("tourist tax: the per-night table is on the first screen, before the calculator, and says no change is dated 1 January 2027", () => {
  const now = RATE_PERIODS.find((p) => p.scope === "barcelona" && p.from === "2026-04-01")!;
  const next = RATE_PERIODS.find((p) => p.scope === "barcelona" && p.from === "2027-04-01")!;
  for (const locale of LOCALES) {
    const blocks = buildBody(locale) as unknown as B[];
    const calc = blocks.findIndex((b) => b.type === "touristTax");
    const tableAt = blocks.findIndex((b) => b.type === "table");
    assert.ok(tableAt > -1 && tableAt < calc, `${locale}: first table before the calculator`);
    const table = blocks[tableAt] as B & { note?: string };
    assert.equal(table.rows?.length, 5, locale);
    const hotel4 = table.rows![2]!; // hostel, other, four-star
    const money = (v: number) => v.toLocaleString(locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
    assert.equal(hotel4[1], money(now.regional["hotel-4"] + (now.surcharge ?? 0)), `${locale}: four-star now`);
    assert.equal(hotel4[2], money(next.regional["hotel-4"] + (next.surcharge ?? 0)), `${locale}: four-star from 1 April 2027`);
    assert.match(table.headers!.join(" "), /2027/, `${locale}: dated headers`);
    assert.match(table.note ?? "", /1 (de )?(gener|enero|January)( de)? 2027/, `${locale}: 1 January 2027 statement`);
    assert.match(table.note ?? "", /25 (de )?(novembre|noviembre|November)/, `${locale}: read date`);
  }
  assert.equal(LAST_VERIFIED, "2026-11-25");
});

test("Christmas in Barcelona: the plan section reconciles 130 km (July plan) with the 9 November announcement (about 140 km)", () => {
  const blocks = CHRISTMAS_BARCELONA.editions.en.blocks as B[];
  const i = blocks.findIndex((b) => b.type === "heading" && b.text === "Barcelona Christmas lights 2026: which streets");
  assert.ok(i > -1);
  const text = blocks[i + 1]!.text ?? "";
  assert.match(text, /130 km/);
  assert.match(text, /9 November switch-on announcement already says about 140 km/);
  assert.match(String(CHRISTMAS_BARCELONA.editions.es.blocks.map((b) => (b as B).text).join(" ")), /cerca de 140 km/);
  assert.match(String(CHRISTMAS_BARCELONA.editions.ca.blocks.map((b) => (b as B).text).join(" ")), /prop de 140 km/);
});

test("L2 closure: TMB notice re-read on 25 Nov (until 3 December inclusive)", () => {
  assert.equal(L2_CLOSURE_AS_OF, "2026-11-25");
});

test("tourist tax: the 'from 1 April 2027' Barcelona regional rate is cited to Llei 2/2026 (open-ended), never assumed", () => {
  for (const locale of LOCALES) {
    const blocks = buildBody(locale) as unknown as (B & { note?: string })[];
    const table = blocks.find((b) => b.type === "table")!;
    const at = blocks.findIndex((b) => b.type === "table");
    assert.match(blocks[at + 1]!.text ?? "", /2\/2026.*34|2\/2026/, `${locale}: law cited right under the glance table`);
    assert.ok(table);
    const text = JSON.stringify(blocks);
    assert.match(text, /34\.1\.a/, `${locale}: article cited in the 2027 section`);
  }
});
