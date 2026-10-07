import assert from "node:assert/strict";
import { test } from "node:test";

import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { COPY as LOCAL_COPY } from "../src/lib/content/holidays/local-publish.ts";
import { COPY as TODAY_COPY } from "../src/lib/content/holidays/today-publish.ts";
import { ORDER, PATHS, type ToolKey } from "../src/lib/content/home-tools.ts";
import { COPY as MUSHROOM_COPY } from "../src/lib/content/mushrooms/payload.ts";
import { COPY as RESERVOIR_COPY } from "../src/lib/content/reservoirs/publish.ts";
import { COPY as SCHOOL_COPY } from "../src/lib/content/school/publish.ts";
import { COPY as TAX_COPY } from "../src/lib/content/tourist-tax/copy.ts";
import { EVERGREEN } from "../src/lib/content/weekend/evergreen.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

// The homepage links are hand-written; the pages' own publishers own the slugs.
const OWNER: Record<ToolKey, (locale: (typeof LOCALES)[number]) => string> = {
  holiday: (l) => TODAY_COPY[l].path,
  weekend: (l) => EVERGREEN[l].path,
  localHolidays: (l) => LOCAL_COPY[l].path,
  transport: (l) => B2_PATHS.transport[l],
  tax: (l) => TAX_COPY[l].path,
  mushrooms: (l) => MUSHROOM_COPY[l].path,
  reservoirs: (l) => RESERVOIR_COPY[l].path,
  school: (l) => SCHOOL_COPY[l].path,
};

test("every homepage tool links to the path its publisher uses", () => {
  for (const key of Object.keys(PATHS) as ToolKey[]) {
    for (const locale of LOCALES) {
      assert.equal(PATHS[key][locale], OWNER[key](locale), `${key} (${locale})`);
    }
  }
});

test("every edition lists every tool exactly once", () => {
  const all = Object.keys(PATHS).sort();
  for (const locale of LOCALES) {
    assert.deepEqual([...ORDER[locale]].sort(), all, locale);
  }
});
