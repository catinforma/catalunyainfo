import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { test } from "node:test";

/**
 * Two drafting slips reached the live Ripollès page (found 24 Oct 2026): an
 * editor's note ("Amplia la secció «Ripoll».") and link helpers written inside
 * plain quotes, so readers saw `${b2link("setcases", …)}` instead of a link.
 * Every exported article object is serialised and searched for both.
 */

const DIRS = ["batch02", "features"];
const LEAKS = [/\$\{/, /\bb2link\(/, /Ampl[ií]a la secci/, /Expand the section/i, /\bTODO\b/];

test("no article carries an unrendered helper call or an editor's note", async () => {
  let checked = 0;
  for (const dir of DIRS) {
    const folder = new URL(`../src/lib/content/${dir}/`, import.meta.url);
    for (const file of readdirSync(folder).filter((name) => name.endsWith(".ts"))) {
      const mod = (await import(new URL(file, folder).href)) as Record<string, unknown>;
      for (const [name, value] of Object.entries(mod)) {
        if (!value || typeof value !== "object") continue;
        const text = JSON.stringify(value);
        if (!text.includes('"editions"') && !text.includes('"blocks"')) continue;
        checked += 1;
        for (const leak of LEAKS) {
          const at = text.search(leak);
          assert.equal(at, -1, `${dir}/${file} ${name}: ${text.slice(Math.max(0, at - 60), at + 60)}`);
        }
      }
    }
  }
  assert.ok(checked > 20, `only ${checked} articles found`);
});
