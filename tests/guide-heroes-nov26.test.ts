import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { BECKHAM_GUIDE } from "../src/lib/content/batch02/beckham-law.ts";
import { DEATH_STEPS_GUIDE } from "../src/lib/content/batch02/death-steps.ts";
import { FARMERS_MARKETS } from "../src/lib/content/batch02/farmers-markets.ts";
import { INCOME_TAX_GUIDE } from "../src/lib/content/batch02/income-tax.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { discoverCrops, isOpenLicence } from "../src/lib/seo/discover-images.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * Lead photographs added on 25 Nov 2026 to four guides that had none
 * (income tax, Beckham law, what to do after a death, farmers' markets):
 * real Wikimedia Commons photographs under an open licence, with the author
 * and the Commons file page recorded in the manifest.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const GUIDES = [INCOME_TAX_GUIDE, BECKHAM_GUIDE, DEATH_STEPS_GUIDE, FARMERS_MARKETS];

for (const guide of GUIDES) {
  test(`${guide.entryKey}: hero in ca/es/en, file on disk, open licence, credit to the Commons file page`, () => {
    assert.ok(guide.heroKey, "heroKey");
    assert.equal(guide.noPhotoReason, undefined);
    for (const locale of LOCALES) {
      assert.ok(guide.heroAlt?.[locale] && guide.heroAlt[locale].length > 20, `heroAlt ${locale}`);
      assert.ok(guide.heroCaption?.[locale] && guide.heroCaption[locale].endsWith("."), `heroCaption ${locale}`);
    }
    const image = IMAGE_BY_KEY.get(guide.heroKey);
    assert.ok(image, "in the manifest");
    const file = join(ROOT, "public", image.url);
    assert.ok(existsSync(file), `${image.url} exists`);
    assert.ok(statSync(file).size < 400 * 1024, "hero under 400 KB");
    assert.ok(image.width >= 1200, "at least 1,200 px wide");
    assert.ok(isOpenLicence(image.license), `licence ${image.license}`);
    assert.ok(image.credit && image.credit.length > 2, "author");
    assert.match(image.creditUrl ?? "", /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    const crops = discoverCrops(image);
    const wide = crops.find((crop) => crop.ratio === "16x9");
    assert.ok(wide && wide.width >= 1200, "16:9 crop at least 1,200 px wide");
  });
}
