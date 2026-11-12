import assert from "node:assert/strict";
import { test } from "node:test";

import { todayInCatalonia } from "../src/lib/content/holidays/calendar.ts";
import { MOST_READ, MOST_READ_MAX_AGE_DAYS, mostReadAge, mostReadFor } from "../src/lib/content/most-read.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

// "El més llegit / Lo más leído / Most read" (end of the answer-first
// articles) prints GA4 data with its date. This fails once the committed file
// is more than 14 days old: run `scripts/most-read.py`, commit, deploy.
test("most-read data is at most 14 days old (refresh: scripts/most-read.py)", () => {
  const age = mostReadAge(todayInCatalonia());
  assert.ok(age >= 0, `asOf ${MOST_READ.asOf} is in the future`);
  assert.ok(age <= MOST_READ_MAX_AGE_DAYS, `most-read.json asOf ${MOST_READ.asOf} is ${age} days old: run scripts/most-read.py`);
});

test("most-read lists are per edition, site paths, with titles", () => {
  assert.match(MOST_READ.asOf, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(MOST_READ.source, /554310792/);
  for (const locale of LOCALES) {
    const items = MOST_READ.items[locale];
    assert.ok(items.length > 0, locale);
    for (const item of items) {
      assert.ok(item.path.startsWith(`/${locale}/`) && item.path.endsWith("/"), item.path);
      assert.ok(item.title.trim().length > 0, item.path);
    }
  }
});

test("the block hides the page being read, and disappears when the data is stale", () => {
  const first = MOST_READ.items.es[0]!;
  assert.ok(!mostReadFor("es", first.path, MOST_READ.asOf).some((i) => i.path === first.path));
  const stale = new Date(Date.parse(`${MOST_READ.asOf}T12:00:00Z`) + (MOST_READ_MAX_AGE_DAYS + 1) * 86_400_000).toISOString().slice(0, 10);
  assert.deepEqual(mostReadFor("es", "/es/", stale), []);
});
