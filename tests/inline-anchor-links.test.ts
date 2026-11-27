import assert from "node:assert/strict";
import { test } from "node:test";

import { headingId, parseBody, type Block } from "../src/lib/content/blocks.ts";
import { plainInline, tokenize } from "../src/lib/content/inline-text.ts";
import { safeHref } from "../src/lib/content/links.ts";
import { CLIMATE } from "../src/lib/content/batch02/climate.ts";
import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { resolveElectionPhased } from "../src/lib/content/election-phased.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * 27 Nov 2026 (ci-numero1, v3): `[label](#anchor)` printed its raw markdown on
 * the live pages (shops guide "búscalo en la tabla", Barcelona weather month
 * list) because the formatter's link pattern only started at `/`, `http(s)://`
 * or `mailto:`. Fixed once in content/inline-text.ts.
 */

test("a same-page jump is a link token; its label is the plain text", () => {
  assert.deepEqual(tokenize("Ir al mes: [enero](#el-tiempo-en-barcelona-en-enero)."), [
    { kind: "text", value: "Ir al mes: " },
    { kind: "link", label: "enero", href: "#el-tiempo-en-barcelona-en-enero" },
    { kind: "text", value: "." },
  ]);
  assert.equal(plainInline("**Ir al mes:** [enero](#enero) · [febrero](#febrero)"), "Ir al mes: enero · febrero");
  assert.equal(safeHref("#el-tiempo-en-barcelona-en-enero"), "#el-tiempo-en-barcelona-en-enero");
});

test("a jump the link check refuses is still a token, so the page shows its label and never the markdown", () => {
  const [token] = tokenize("[x](#Not_A_Valid_Id)");
  assert.equal(token!.kind, "link");
  assert.equal(safeHref((token as { href: string }).href), null, "renderInline then prints the label alone");
  assert.equal(plainInline("[x](#Not_A_Valid_Id)"), "x");
  // Unchanged: other link forms, and text that only looks like a link.
  assert.equal(tokenize("[a](/es/guias/x/)")[0]!.kind, "link");
  assert.equal(tokenize("[a](https://www.boe.es/)")[0]!.kind, "link");
  assert.equal(tokenize("[a](javascript:alert(1))")[0]!.kind, "text");
  assert.equal(tokenize("[a] (#b)")[0]!.kind, "text");
});

/** Every "](" left in a text token would print raw. */
function rawLinks(blocks: Block[]): string[] {
  const out: string[] = [];
  const visit = (value: unknown) => {
    if (typeof value === "string") {
      for (const t of tokenize(value)) if (t.kind === "text" && /\]\((#|\/|https?:)/.test(t.value)) out.push(t.value);
    } else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") Object.values(value).forEach(visit);
  };
  visit(blocks);
  return out;
}

test("the Barcelona weather month list and the shops guide: no raw link, every jump lands on a heading", () => {
  for (const locale of LOCALES) {
    for (const article of [CLIMATE, SHOPS]) {
      const blocks = resolveElectionPhased(parseBody(article.editions[locale].blocks), new Date("2026-11-30T09:00:00+01:00"));
      assert.deepEqual(rawLinks(blocks), [], `${article.key} ${locale}`);
      const ids = new Set(blocks.filter((b) => b.type === "heading").map((b) => headingId(b as Extract<Block, { type: "heading" }>)));
      const jumps = [...JSON.stringify(blocks).matchAll(/\]\((?:\/[a-z]{2}\/[^)#]*)?#([^)]+)\)/g)].map((m) => m[1]!);
      assert.ok(jumps.length > 0, `${article.key} ${locale}: has jumps`);
      for (const id of jumps) assert.ok(ids.has(id), `${article.key} ${locale}: #${id} has no heading`);
    }
  }
});
