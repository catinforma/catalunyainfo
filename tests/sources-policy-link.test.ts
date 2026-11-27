import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { sourcesPolicyLink } from "@/lib/content/sources-policy-link";
import { legalPath } from "@/lib/i18n/routes";
import { LOCALES } from "@/lib/i18n/config";

// Batch 7C (27 Nov 2026): the line under source lists points at the
// "how we use sources" page in the reader's language, with its own label.

test("the sources policy link targets the sources page of each locale, trailing slash, no cross-language leak", () => {
  const labels = new Set<string>();
  for (const locale of LOCALES) {
    const { href, label } = sourcesPolicyLink(locale);
    assert.equal(href, legalPath("sources", locale));
    assert.ok(href.startsWith(`/${locale}/`), href);
    assert.ok(href.endsWith("/"), href);
    assert.ok(label.length > 10, label);
    labels.add(label);
  }
  assert.equal(labels.size, LOCALES.length, "one label per language");
  assert.ok(sourcesPolicyLink("ca").href.endsWith("/fonts/"));
  assert.ok(sourcesPolicyLink("es").href.endsWith("/fuentes/"));
  assert.ok(sourcesPolicyLink("en").href.endsWith("/sources/"));
});

test("the article and the main programmatic source lists render the sources policy link", () => {
  const files = [
    "src/components/pages/EntryArticle.tsx",
    "src/components/programmatic/holidays/parts.tsx",
    "src/components/programmatic/fuel/parts.tsx",
    "src/components/programmatic/weekly-markets/TownPage.tsx",
    "src/components/programmatic/christmas-fairs/parts.tsx",
    "src/components/programmatic/today/TodayPage.tsx",
    "src/components/programmatic/spain-2027/days.tsx",
  ];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    assert.match(src, /ci-sources/, file);
    assert.match(src, /<SourcesPolicyLink locale=\{locale\} \/>/, file);
  }
});

// Batch 8F (27 Nov 2026): the same line on every other template with a source
// list (elections, calculators, Rodalies, ZBE, zona azul, weekend agenda,
// fuel by province, Spain 2027 communities and cities, polls), so no page lists
// official sources without saying how they are chosen and checked.
test("every component with a sources heading or a .ci-sources list renders the sources policy link", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const p = join(dir, name);
      return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : [];
    });
  const missing: string[] = [];
  let checked = 0;
  for (const file of walk("src/components")) {
    if (file.endsWith("SourcesPolicyLink.tsx") || file.endsWith("AnalyticsClicks.tsx")) continue;
    const src = readFileSync(file, "utf8");
    if (!/<h2[^>]*id="(fuentes|sources)"|<(ol|ul)[^>]*ci-sources/.test(src)) continue;
    checked += 1;
    if (!/<SourcesPolicyLink locale=\{locale\} \/>/.test(src)) missing.push(file);
  }
  assert.ok(checked >= 45, String(checked));
  assert.deepEqual(missing, []);
});
