import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { SPAIN_STRIKES, SPAIN_STRIKES_DRAFTS } from "../src/lib/content/batch02/strikes-spain-data.ts";
import { buildStrikesSpainBody, listedSpainStrikes, spainDayAnswers, strikesOn, strikesSpainDescription } from "../src/lib/content/batch02/strikes-spain.ts";

const ID = "huelga-transporte-carretera-2026-12-23";
const LANGS = ["ca", "es", "en"] as const;

test("the 23-24 Dec road-transport strike is a draft: in the drafts list, not in SPAIN_STRIKES", () => {
  const draft = SPAIN_STRIKES_DRAFTS.find((s) => s.id === ID);
  assert.ok(draft, "draft present");
  assert.equal(draft.draft, true);
  assert.deepEqual(draft.dates, ["2026-12-23", "2026-12-24"]);
  assert.equal(draft.status, "called", "never 'official' without a registered call or order we can link");
  assert.equal(draft.minimumServices.status, "pending");
  assert.ok(draft.sources.length >= 2);
  assert.ok(!SPAIN_STRIKES.some((s) => s.id === ID));
  assert.ok(SPAIN_STRIKES.every((s) => !s.draft));
});

test("a draft never reaches a listing, a day lookup, the answers, the description or the body, in any language", () => {
  const draft = SPAIN_STRIKES_DRAFTS.find((s) => s.id === ID)!;
  assert.deepEqual(strikesOn("2026-12-23").filter((s) => s.id === ID), []);
  for (const asOf of ["2026-11-25", "2026-12-20", "2026-12-23"]) {
    assert.ok(!listedSpainStrikes(asOf).some((s) => s.id === ID));
    for (const locale of LANGS) {
      const body = bodyToPlainText(buildStrikesSpainBody(locale, asOf));
      const answers = JSON.stringify(spainDayAnswers(locale, asOf));
      const desc = strikesSpainDescription(locale, asOf);
      for (const text of [body, answers, desc]) {
        assert.ok(!text.includes(ID));
        assert.ok(!text.includes(draft.label[locale]), `${locale} ${asOf}: "${draft.label[locale]}" must not appear`);
        assert.ok(!text.includes("carreteraylogistica.fsc.ccoo.es"), `${locale} ${asOf}: draft source must not appear`);
      }
    }
  }
});

test("draft date guard: the call is re-read before 19 Dec 2026", () => {
  const draft = SPAIN_STRIKES_DRAFTS.find((s) => s.id === ID)!;
  assert.equal(draft.rereadBy, "2026-12-19");
  const today = new Date().toISOString().slice(0, 10);
  if (today >= draft.rereadBy! && today <= "2026-12-24") {
    assert.fail(`${ID}: re-read the CCOO notice, SIMA and the Ministry list, then publish (remove draft) or delete the entry`);
  }
});
