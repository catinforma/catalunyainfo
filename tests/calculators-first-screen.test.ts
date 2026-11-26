import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { firstWorkingDayOfDecember, LEY33_ART33, LEY33_URL, WHEN_READ_ON, whenBox, whenFaq } from "../src/lib/programmatic/extra-pay/when.ts";
import { EXTRA_PAY_YEAR, QUOTE as EP_QUOTE } from "../src/lib/programmatic/extra-pay/rules.ts";
import { exampleCopy } from "../src/lib/programmatic/pensions-2027/examples.ts";
import { revaluationStatus } from "../src/lib/programmatic/pensions-2027/engine.ts";
import { GENDER_GAP_2026, QUOTE as PENSION_QUOTE } from "../src/lib/programmatic/pensions-2027/rules.ts";
import { RENT_SNAPSHOT } from "../src/lib/programmatic/rent-update/data.ts";
import { smiFaq } from "../src/lib/programmatic/smi/faq.ts";
import { OFFICIAL_2027, SMI_2026 } from "../src/lib/programmatic/smi/rules.ts";
import { CALENDAR_2026_PDF, CALENDAR_2027 } from "../src/lib/programmatic/treasury-bills/calendar.ts";
import { LETRAS_SNAPSHOT } from "../src/lib/programmatic/treasury-bills/data.ts";
import { auctionLine, letrasFaq, nextAuctionLines } from "../src/lib/programmatic/treasury-bills/faq.ts";

/**
 * 26 Nov 2026 (ci-edicio, batch 6A): the money calculators' first-screen
 * answers and the FAQs in the searchers' words. SMI 2027 FAQ (smi/faq.ts),
 * the Letras "next auctions" box and FAQ (treasury-bills/faq.ts), the extra
 * pay "when is it paid" box (extra-pay/when.ts), two pension questions
 * (pensions-2027/examples.ts). Figures come from the official rows already
 * checked by each module's own tests; here: the wording, the fixtures of the
 * new quotes, and the pages' wiring.
 */

const ROOT = join(import.meta.dirname, "..");
const FIX = join(ROOT, "tests", "fixtures");
const fixture = (f: string) => readFileSync(join(FIX, f), "utf8");
const flat = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/[\s  ]+/g, " ");
const src = (p: string) => readFileSync(join(ROOT, "src", p), "utf8");
const LOCALES = ["es", "ca", "en"] as const;
const clean = (s: string) => assert.doesNotMatch(s, /undefined|NaN|null|\[object|\$\{/, s);

/* SMI ---------------------------------------------------------------------- */

test("SMI FAQ: the 2027 decree's figures, the art. 1 scope words in the BOE XML, three languages", () => {
  const xml = flat(fixture("boe-smi-2027-rd1013.xml"));
  assert.ok(xml.includes("El salario mínimo para cualesquiera actividades en la agricultura, en la industria y en los servicios"));
  assert.ok(OFFICIAL_2027);
  for (const l of LOCALES) {
    const faq = smiFaq(l, OFFICIAL_2027, 1100);
    assert.equal(faq.length, 6, l);
    for (const f of faq) clean(f.q + f.a);
    const all = faq.map((f) => f.a).join(" ");
    for (const n of ["1.286", "18.004", "1.500,33", "10,06", "42,87", "60,88", "1.221"]) {
      const want = l === "en" ? n.replace(/\./g, "#").replace(/,/g, ".").replace(/#/g, ",") : n;
      assert.ok(all.includes(want), `${l}: ${n}`);
    }
    assert.ok(all.includes("BOE-A-2026-24189"), l);
    assert.ok(all.includes("cualesquiera actividades"), l);
  }
  assert.match(smiFaq("es", OFFICIAL_2027, 1100)[0]!.a, /^Sí\. El Real Decreto 1013\/2026 lo fija en 1\.286 € al mes en 14 pagas \(18\.004 € al año\) y se publicó en el BOE el 19 de noviembre de 2026/);
  assert.match(smiFaq("ca", OFFICIAL_2027, 1100)[0]!.a, /Reial decret 1013\/2026.*des de l'1 de gener de 2027/);
  // With no 2027 decree only the net answer is left, on the 2026 figures.
  const none = smiFaq("es", null, 1100);
  assert.equal(none.length, 1);
  assert.ok(none[0]!.a.includes("17.094") && none[0]!.a.includes(String(SMI_2026.year)));
});

test("SMI page: FAQ section and FAQPage JSON-LD from smiFaq", () => {
  const page = src("components/programmatic/smi/SmiPage.tsx");
  assert.match(page, /smiFaq\(locale, official27, net14\.net\.perPayment\)/);
  assert.match(page, /<h2 id="preguntas">\{faqTitle\}<\/h2>/);
  assert.match(page, /"@type": "FAQPage", mainEntity: faq\.map/);
});

/* Letras ------------------------------------------------------------------- */

test("Letras: the first-screen box lists the next three calendar auctions with the Banco de España deadline", () => {
  const lines = nextAuctionLines("2026-11-26", "es", 3);
  assert.deepEqual(lines, [
    "Martes 1 de diciembre de 2026: 6 y 12 meses. Peticiones en el Banco de España hasta el viernes 27 de noviembre de 2026 a las 14:00.",
    "Miércoles 9 de diciembre de 2026: 3 y 9 meses. Peticiones en el Banco de España hasta el viernes 4 de diciembre de 2026 a las 14:00.",
    "Martes 12 de enero de 2027: 6 y 12 meses. Peticiones en el Banco de España hasta el viernes 8 de enero de 2027 a las 14:00.",
  ]);
  assert.match(nextAuctionLines("2026-11-26", "ca", 1)[0]!, /^Dimarts 1 de desembre de 2026: 6 i 12 mesos\. Peticions al Banc d'Espanya fins al divendres 27 de novembre de 2026 a les 14\.00\.$/);
  assert.match(nextAuctionLines("2026-11-26", "en", 1)[0]!, /^Tuesday 1 December 2026: 6- and 12-month bills\. Banco de España requests by Friday 27 November 2026, 14:00\.$/);
  // On the auction day it still shows (results come out that morning); the day after, it moves on.
  assert.match(nextAuctionLines("2026-12-01", "es", 1)[0]!, /^Martes 1 de diciembre/);
  assert.match(nextAuctionLines("2026-12-02", "es", 1)[0]!, /^Miércoles 9 de diciembre/);
});

test("Letras FAQ: next auction, next 12-month auction, 12-month yield from the latest result, the PDF, the 2027 calendar", () => {
  for (const l of LOCALES) {
    const faq = letrasFaq(l, { results: LETRAS_SNAPSHOT.results, today: "2026-11-26", calendar2027Pdf: null });
    assert.equal(faq.length, CALENDAR_2027 ? 4 : 5, l);
    for (const f of faq) clean(f.q + f.a);
    assert.ok(faq[0]!.a.startsWith(auctionLine({ terms: [6, 12], requestsBy: "2026-11-27", auction: "2026-12-01", payBy: "2026-12-03", issue: "2026-12-04" }, l)), l);
    assert.ok(faq.some((f) => f.a.includes(CALENDAR_2026_PDF)), l);
  }
  const es = letrasFaq("es", { results: LETRAS_SNAPSHOT.results, today: "2026-11-26", calendar2027Pdf: null });
  assert.match(es[1]!.a, /^El martes 1 de diciembre de 2026 .*hasta el viernes 27 de noviembre de 2026 a las 14:00; las letras se emiten el 4 de diciembre de 2026\./);
  assert.match(es[2]!.a, /tipo medio del 3,045 % en la subasta del 3 de noviembre de 2026/);
  assert.match(es[4]!.a, /12 de enero de 2027 \(6 y 12 meses\) y 19 de enero de 2027 \(3 y 9 meses\)/);
  const found = letrasFaq("es", { results: LETRAS_SNAPSHOT.results, today: "2026-12-10", calendar2027Pdf: "https://www.tesoro.es/x.pdf" });
  assert.ok(found.at(-1)!.a.startsWith("Ya está publicado"));
});

test("Letras page: box before the calculator, FAQ section and FAQPage JSON-LD", () => {
  const page = src("components/programmatic/treasury-bills/LetrasPage.tsx");
  const box = page.indexOf('aria-labelledby="letras-next-title"');
  const calc = page.indexOf("<LetrasCalculator ");
  assert.ok(box > 0 && box < calc);
  assert.match(page, /<h2 id="preguntas">\{box\.faq\}<\/h2>/);
  assert.match(page, /"@type": "FAQPage", mainEntity: faq\.map/);
});

/* Extra pay ---------------------------------------------------------------- */

test("extra pay: Ley 33/1987 art. 33 quoted from the BOE fixture; the first working day of December", () => {
  const text = flat(fixture("boe-ley33-1987-art33-20261126.txt"));
  assert.ok(text.includes(LEY33_ART33));
  assert.ok(text.includes("se reducirá proporcionalmente"));
  assert.ok(LEY33_URL.startsWith("https://www.boe.es/buscar/act.php?id=BOE-A-1987-28404"));
  assert.equal(WHEN_READ_ON, "2026-11-26");
  assert.equal(firstWorkingDayOfDecember(2026), "2026-12-01");
  assert.equal(firstWorkingDayOfDecember(2027), "2027-12-01");
  assert.equal(firstWorkingDayOfDecember(2029), "2029-12-03");
  assert.equal(firstWorkingDayOfDecember(2030), "2030-12-02");
  // The pensioners' line rests on LGSS art. 46, already quoted (and checked) in rules.ts.
  assert.match(EP_QUOTE.lgss46, /se devengarán en los meses de junio y noviembre/);
});

test("extra pay: the 'when' box and the civil servants' question in three languages", () => {
  for (const l of LOCALES) {
    const b = whenBox(l);
    assert.equal(b.items.length, 3, l);
    assert.ok(b.title.includes(String(EXTRA_PAY_YEAR)));
    for (const i of b.items) clean(i.who + i.text);
    const f = whenFaq(l);
    assert.equal(f.length, 1);
    clean(f[0]!.q + f[0]!.a);
    assert.ok(f[0]!.a.includes(LEY33_ART33), l);
  }
  assert.match(whenBox("es").items[1]!.text, /primer día hábil de diciembre: este año, el 1 de diciembre de 2026 \(Ley 33\/1987, art\. 33\)/);
  assert.match(whenBox("ca").items[1]!.text, /enguany, l'1 de desembre de 2026/);
  assert.match(whenBox("es").items[2]!.text, /se devenga en noviembre/);
  // Nothing is said about regional or Generalitat staff (no official text read).
  for (const l of LOCALES) assert.doesNotMatch(JSON.stringify([whenBox(l), whenFaq(l)]), /Generalitat|auton[oò]m|ayuntamiento|ajuntament|regional/i);
  const page = src("components/programmatic/extra-pay/ExtraPayPage.tsx");
  const box = page.indexOf('aria-labelledby="extra-when-title"');
  assert.ok(box > 0 && box < page.indexOf("<ExtraPayCalculator "));
  assert.match(page, /faq\.push\(\.\.\.whenFaq\(locale\)\)/);
});

/* Pensions ----------------------------------------------------------------- */

test("pensions FAQ: 'when do pensions go up' (LGSS art. 58.2 'al comienzo de cada año') and the gender-gap supplement", () => {
  const lgss = fixture("boe-lgss-art58-20261124.txt");
  assert.ok(lgss.includes("incluido el complemento de brecha de género, se revalorizarán al comienzo de cada año"));
  const status = revaluationStatus(RENT_SNAPSHOT.series.ipc, "2026-11-26", null, null)!;
  for (const l of LOCALES) {
    const faq = exampleCopy(l, status).faq;
    assert.equal(faq.length, 7, l);
    for (const f of faq) clean(f.q + f.a);
    const when = faq.find((f) => /Cuándo suben|Quan pujaran|When do pensions go up/.test(f.q))!;
    assert.ok(when.a.includes("al comienzo de cada año") && when.a.includes(PENSION_QUOTE.rdl3_2026), l);
    const gap = faq.find((f) => /brecha|bretxa|gender-gap/.test(f.q))!;
    assert.ok(gap.a.includes("incluido el complemento de brecha de género"), l);
  }
  const gap = exampleCopy("es", status).faq.find((f) => /brecha/.test(f.q))!.a;
  const expected = Math.round(GENDER_GAP_2026 * (1 + status.percent / 100) * 100) / 100;
  assert.ok(gap.includes(expected.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })), gap);
  assert.ok(gap.includes("36,90"));
  // No status (INE unreachable and no snapshot): the 2026 figure only.
  assert.doesNotMatch(exampleCopy("es", null).faq.find((f) => /brecha/.test(f.q))!.a, /serían/);
});
