import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { pensionRevaluationLine, subsidyAmountsLine, subsidyIncomeLimitLine, subsidyOver52Line } from "../src/lib/programmatic/calculators/context-links.ts";
import { calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { REVALUATION_2026 } from "../src/lib/programmatic/pensions-2027/rules.ts";
import { INCOME_LIMIT, SEPE_AMOUNTS_2026, SEPE_INCOME_LIMIT_2026 } from "../src/lib/programmatic/unemployment-subsidy/rules.ts";

/**
 * 25 Nov 2026 link audit: the unemployment subsidy checker and the 2027
 * pension increase calculator had inlinks only from calculator widgets, the
 * pay-dates guide and the IPC page. Each now has a sentence with the fact the
 * calculator answers, in a page whose reader needs it. The sentences are built
 * from the calculators' own constants; the figures are also pinned to what SEPE
 * and the BOE print (read 25 Nov 2026), so a changed IPREM/SMI fails here until
 * the sentence is re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const LOCALES = ["ca", "es", "en"] as const;
const plain = (text: string) => text.replace(/\u00a0/g, " ");
const read = (file: string) => readFileSync(join(ROOT, file), "utf8");
const anchor = (line: string, path: string) => new RegExp(`\\[([^\\[\\]]+)\\]\\(${path.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\)`).exec(line)?.[1];

test("subsidy sentences link the checker in each language with the subsidy words and quote SEPE's figures", () => {
  const words = { es: /subsidio por desempleo/, ca: /subsidi d'atur/, en: /unemployment subsidy/ };
  for (const locale of LOCALES) {
    const path = calcPath("unemployment-subsidy", locale);
    for (const line of [subsidyIncomeLimitLine(locale), subsidyAmountsLine(locale), subsidyOver52Line(locale)]) {
      const a = anchor(line, path);
      assert.ok(a, `${locale}: no link to ${path} in "${line}"`);
      assert.match(a, words[locale]);
    }
  }
  const num = (x: number, l: (typeof LOCALES)[number]) => (l === "en" ? `€${x}` : `${x} €`);
  for (const locale of LOCALES) {
    const amounts = plain(subsidyAmountsLine(locale));
    for (const x of SEPE_AMOUNTS_2026) assert.ok(amounts.includes(num(x, locale)), `${locale}: ${x} in amounts line`);
    assert.ok(plain(subsidyOver52Line(locale)).includes(num(480, locale)), `${locale}: over-52 480`);
    const limit = SEPE_INCOME_LIMIT_2026.toFixed(2).replace(".", locale === "en" ? "." : ",");
    assert.ok(plain(subsidyIncomeLimitLine(locale)).includes(limit), `${locale}: income ceiling ${limit}`);
  }
  assert.equal(INCOME_LIMIT, SEPE_INCOME_LIMIT_2026);
});

test("pension sentences link the 2027 calculator, quote the 2026 percentage and never a 2027 one", () => {
  const words = { es: /subida de las pensiones/, ca: /pujada de les pensions/, en: /2027 pension increase/ };
  for (const locale of LOCALES) {
    for (const kind of ["widow", "non-contributory"] as const) {
      const line = plain(pensionRevaluationLine(locale, kind));
      const a = anchor(line, calcPath("pensions-2027", locale));
      assert.ok(a, `${locale} ${kind}: no link`);
      assert.match(a, words[locale]);
      assert.ok(line.includes(locale === "en" ? "2.7%" : "2,7 %"), `${locale} ${kind}: 2026 percentage`);
      assert.ok(line.includes("58.2"), "cites LGSS art. 58.2");
    }
  }
  assert.equal(REVALUATION_2026, 2.7);
});

test("the pages render those sentences (SMI, dismissal calculator, retirement age, widow's and non-contributory pension)", () => {
  const uses: [string, string[]][] = [
    ["src/components/programmatic/smi/SmiPage.tsx", ["subsidyIncomeLimitLine(locale)", "mdLinks("]],
    ["src/components/programmatic/employment/DismissalPage.tsx", ["subsidyAmountsLine(locale)", "mdLinks("]],
    ["src/components/programmatic/retirement-age/RetirementAgePage.tsx", ["subsidyOver52Line(locale)", "const md = mdLinks"]],
    ["src/components/programmatic/widow-pension/WidowPensionPage.tsx", ['pensionRevaluationLine(locale, "widow")', "const md = mdLinks"]],
    ["src/components/programmatic/non-contributory-pension/NcPensionPage.tsx", ['pensionRevaluationLine(locale, "non-contributory")', "const md = mdLinks"]],
  ];
  for (const [file, needles] of uses) {
    const src = read(file);
    for (const n of needles) assert.ok(src.includes(n), `${file} lacks ${n}`);
  }
  // The retirement page puts it in all three languages of the subsidy bullet.
  assert.equal(read("src/components/programmatic/retirement-age/RetirementAgePage.tsx").match(/\$\{subsidyOver52Line\(locale\)\}/g)?.length, 3);
  assert.equal(read("src/components/programmatic/employment/DismissalPage.tsx").match(/mdLinks\(subsidyAmountsLine\(locale\)\)/g)?.length, 3);
});
