import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/*
 * With Turbopack, a `fallback` list in a next/font/google call replaces the
 * automatic metric-matched fallback face (`adjustFontFallback`) instead of
 * following it. Production shipped no "Fraunces Fallback" face until 13 Nov
 * 2026, and the late Fraunces swap re-wrapped headings (CLS 0.062 on the
 * Spain 2027 city pages). The generic fallbacks live in globals.css instead.
 */
test("next/font calls keep the automatic fallback (no `fallback` list)", () => {
  const source = readFileSync(resolve(ROOT, "src/lib/fonts.ts"), "utf8");
  assert.doesNotMatch(source, /^\s*fallback\s*:/m);
  assert.doesNotMatch(source, /adjustFontFallback\s*:\s*false/);
});

test("the font tokens still end in generic families", () => {
  const css = readFileSync(resolve(ROOT, "src/app/globals.css"), "utf8");
  assert.match(css, /--font-display:\s*var\(--font-fraunces\),[^;]*\bserif\s*;/);
  assert.match(css, /--font-sans:\s*var\(--font-plex\),[^;]*\bsans-serif\s*;/);
});
