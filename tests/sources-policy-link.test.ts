import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
