import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { DECEMBER_BRIDGE } from "../src/lib/content/batch02/december-bridge.ts";
import { DECEMBER_BRIDGE_SPAIN } from "../src/lib/content/batch02/december-bridge-spain.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * 25 Nov 2026: "puente de la purisima 2026" / "puente de diciembre 2026" get
 * a short query-worded H2 with the answer in its first sentence, on the
 * Catalonia page and on the Spain-wide page, in ca/es/en.
 */

const headings = (blocks: Block[]) =>
  blocks.filter((b) => b.type === "heading").map((b) => (b as unknown as { text: string }).text);

const HEADING = {
  es: /puente de la Purísima de 2026/,
  ca: /pont de la Puríssima del 2026/,
  en: /puente de la Purísima/,
} as const;

for (const [name, article] of [["Catalonia", DECEMBER_BRIDGE], ["Spain", DECEMBER_BRIDGE_SPAIN]] as const) {
  test(`${name} bridge: query-worded Purísima H2 answers Saturday 5 to Tuesday 8`, () => {
    for (const locale of LOCALES) {
      const blocks = article.editions[locale].blocks;
      assert.ok(headings(blocks).some((h) => HEADING[locale].test(h)), `${name} ${locale}: H2`);
      const body = bodyToPlainText(blocks);
      const at = body.search(HEADING[locale]);
      assert.ok(at >= 0);
      // The answer sits right under the heading and names both days.
      const near = body.slice(at, at + 420);
      assert.match(near, /(sábado|dissabte|Saturday) 5/, `${name} ${locale}: Saturday 5`);
      assert.match(near, /(martes|dimarts|Tuesday) 8/, `${name} ${locale}: Tuesday 8`);
      assert.match(near, /(Constituci|Constitution)/, `${name} ${locale}: Constitution`);
      assert.match(near, /(Inmaculada|Immaculada|Immaculate)/, `${name} ${locale}: Inmaculada`);
    }
  });
}
