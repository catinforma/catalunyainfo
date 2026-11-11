import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * 11 Nov 2026 site audit: `**[El Pont de Vilomara](/es/festivos/...)**` printed
 * its raw markdown on the Easter 2027 pages (78 items), the local-holidays
 * guide and the education-strike guide, because bold text was not formatted in
 * turn. The formatter is a .tsx file the test runner cannot import, so this
 * reads it: the bold branch must run the inline formatter on its own content.
 */
test("bold text is formatted in turn, so a link inside it renders as a link", () => {
  const source = readFileSync(new URL("../src/lib/content/inline.tsx", import.meta.url), "utf8");
  assert.match(source, /case "bold":[\s\S]{0,400}?<strong key=\{i\}>\{renderInline\(token\.value\)\}<\/strong>/);
});
