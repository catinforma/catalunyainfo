import assert from "node:assert/strict";
import { test } from "node:test";

import {
  bodyToPlainText,
  parseBody,
  readingMinutes,
  slugifyAnchor,
  tableOfContents,
  wordCount,
} from "../src/lib/content/blocks.ts";
import { safeHref, isExternalHref } from "../src/lib/content/links.ts";

test("parseBody drops blocks that do not match the schema", () => {
  const body = parseBody([
    { type: "paragraph", text: "Hello" },
    { type: "paragraph" },
    { type: "nonsense", text: "x" },
    { type: "heading", level: 2, text: "Section" },
    { type: "heading", level: 9, text: "Bad level" },
  ]);

  assert.equal(body.length, 2);
  assert.deepEqual(
    body.map((b) => b.type),
    ["paragraph", "heading"],
  );
});

test("parseBody is total: any input yields an array", () => {
  assert.deepEqual(parseBody(null), []);
  assert.deepEqual(parseBody("nope"), []);
  assert.deepEqual(parseBody({ type: "paragraph" }), []);
});

test("bodyToPlainText strips inline markup and reaches nested fields", () => {
  const text = bodyToPlainText(
    parseBody([
      { type: "paragraph", text: "A **bold** and [link](https://example.com) here" },
      { type: "faq", items: [{ question: "How?", answer: "With _care_" }] },
      { type: "table", headers: ["Line", "Time"], rows: [["R4", "07:12"]] },
    ]),
  );

  assert.match(text, /A bold and link here/);
  assert.match(text, /How\? With care/);
  assert.match(text, /Line Time R4 07:12/);
  assert.doesNotMatch(text, /example\.com/);
  assert.doesNotMatch(text, /\*\*/);
});

test("reading time never returns zero", () => {
  assert.equal(readingMinutes(""), 1);
  assert.equal(wordCount(""), 0);
  assert.equal(readingMinutes("word ".repeat(440).trim()), 2);
});

test("table of contents only lists h2 and h3", () => {
  const toc = tableOfContents(
    parseBody([
      { type: "heading", level: 2, text: "Com arribar-hi" },
      { type: "heading", level: 3, text: "Amb tren" },
      { type: "heading", level: 4, text: "Detall" },
    ]),
  );

  assert.deepEqual(
    toc.map((t) => t.text),
    ["Com arribar-hi", "Amb tren"],
  );
  assert.equal(toc[0]?.id, "com-arribar-hi");
});

test("anchor slugs strip accents and punctuation", () => {
  assert.equal(slugifyAnchor("Que cal saber? (2026)"), "que-cal-saber-2026");
});

test("safeHref rejects anything that is not http, https, mailto or a local path", () => {
  assert.equal(safeHref("https://example.org/a"), "https://example.org/a");
  assert.equal(safeHref("/ca/guies/"), "/ca/guies/");
  assert.equal(safeHref("mailto:a@b.com"), "mailto:a@b.com");
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("data:text/html,abc"), null);
  assert.equal(safeHref("vbscript:msgbox"), null);
  assert.equal(safeHref("  not a url  "), null);
});

test("external links are recognised for rel and target handling", () => {
  assert.equal(isExternalHref("https://gencat.cat"), true);
  assert.equal(isExternalHref("/ca/"), false);
});
