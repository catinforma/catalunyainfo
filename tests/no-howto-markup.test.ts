import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

/**
 * 27 Nov 2026 live audit: HowTo JSON-LD on 37 guides (every entry with a
 * "steps" block). Google retired HowTo rich results in September 2023, so the
 * markup earned nothing; it is gone. The steps themselves stay on the page.
 */

const ROOT = join(import.meta.dirname, "..");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(name) ? [p] : [];
  });
}

test("no page emits HowTo or HowToStep markup", () => {
  const hits = files(join(ROOT, "src")).filter((f) => /["']@type["']\s*:\s*["']HowTo(Step)?["']|howToSchema/.test(readFileSync(f, "utf8")));
  assert.deepEqual(hits, []);
});

test("entry pages: the steps block is still printed as a list", () => {
  const blocks = readFileSync(join(ROOT, "src/lib/content/blocks.ts"), "utf8");
  assert.match(blocks, /"steps"/);
  const renderer = readFileSync(join(ROOT, "src/components/blocks/BlockRenderer.tsx"), "utf8");
  assert.match(renderer, /case "steps"|type === "steps"/);
  const page = readFileSync(join(ROOT, "src/app/(public)/[locale]/[...slug]/page.tsx"), "utf8");
  assert.match(page, /faqSchema\(entry\.body\),\n\s*\]\);/);
});
