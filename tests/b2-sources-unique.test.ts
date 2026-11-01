import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

/**
 * A source listed twice on one article makes its publish fail: each source
 * becomes a row in `entry_sources`, whose key is (entry_id, source_id), so the
 * second copy breaks the insert (the parking guide on 1 Nov 2026: one SMOU
 * FAQ URL under two names, a 500 on `?only=parking`). Every exported article
 * in the batch02 modules is checked, including those only `route.ts` registers.
 */
test("no batch02 article lists the same source URL twice", async () => {
  const dir = join(import.meta.dirname, "..", "src", "lib", "content", "batch02");
  let articles = 0;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "publish.ts")) {
    const mod: Record<string, unknown> = await import(pathToFileURL(join(dir, file)).href);
    for (const [name, value] of Object.entries(mod)) {
      if (!value || typeof value !== "object" || !("entryKey" in value) || !("sources" in value)) continue;
      const sources = (value as { sources: { url: string }[] }).sources;
      if (!Array.isArray(sources)) continue;
      articles++;
      const seen = new Set<string>();
      for (const { url } of sources) {
        assert.ok(!seen.has(url), `${file} ${name}: ${url} listed twice`);
        seen.add(url);
      }
    }
  }
  assert.ok(articles > 40, `only ${articles} articles found`);
});
