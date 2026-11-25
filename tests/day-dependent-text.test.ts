import assert from "node:assert/strict";
import test from "node:test";

import { bodyToPlainText, parseBody } from "../src/lib/content/blocks.ts";
import { DAY_DEPENDENT_BLOCKS } from "../src/lib/content/day-dependent.ts";

const LOCALES = ["ca", "es", "en"] as const;
const block = (type: string) =>
  type === "shopsSundays" ? { type, scope: "catalonia" } : type === "spainSchoolCalendar" ? { type, region: "espana" } : { type };

test("every day-dependent block adds stable non-empty text in each locale", () => {
  for (const type of DAY_DEPENDENT_BLOCKS) {
    for (const locale of LOCALES) {
      const body = parseBody([block(type)]);
      const text = bodyToPlainText(body, locale);
      assert.ok(text.length > 20, `${type}/${locale} has no text`);
      const real = Date.now;
      try {
        Date.now = () => real() + 40 * 86_400_000;
        assert.equal(bodyToPlainText(body, locale), text, `${type}/${locale} changes with the day`);
      } finally {
        Date.now = real;
      }
    }
  }
});

test("shopsSundays scopes differ", () => {
  const t = (scope: string) => bodyToPlainText(parseBody([{ type: "shopsSundays", scope }]), "es");
  assert.notEqual(t("catalonia"), t("spain"));
  assert.notEqual(t("catalonia"), t("spainRest"));
});
