import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { LOCALES } from "../src/lib/i18n/config.ts";
import { parkingHubLine, zbeHubLine } from "../src/lib/nav/driving-hubs.ts";
import { hubMeta as zbeHubMeta } from "../src/lib/programmatic/zbe/copy.ts";
import { zbeFamilyPaths } from "../src/lib/programmatic/zbe/sitemap.ts";
import { hubView as zonaAzulHubView } from "../src/lib/programmatic/zona-azul/copy.ts";
import { zonaAzulPaths } from "../src/lib/programmatic/zona-azul/sitemap.ts";

/** The zona azul and ZBE hubs link each other (23 Nov 2026, lib/nav/driving-hubs.ts). */

const read = (rel: string) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");

test("each driving hub links the other hub, in its own language, with the target's own title", () => {
  const zbePaths = new Set(zbeFamilyPaths().map((p) => p.path));
  const zaPaths = new Set(zonaAzulPaths().map((p) => p.path));
  for (const locale of LOCALES) {
    const toZbe = zbeHubLine(locale);
    assert.ok(zbePaths.has(toZbe.href) && toZbe.href.startsWith(`/${locale}/`), `${locale}: ${toZbe.href}`);
    assert.equal(toZbe.label, zbeHubMeta(locale).title);
    const toParking = parkingHubLine(locale);
    assert.ok(zaPaths.has(toParking.href) && toParking.href.startsWith(`/${locale}/`), `${locale}: ${toParking.href}`);
    assert.equal(toParking.label, zonaAzulHubView(locale).title);
    for (const line of [toZbe, toParking]) assert.ok(line.text.endsWith(":") && line.text.length > 40, `${locale}: "${line.text}"`);
  }
  assert.match(read("src/components/programmatic/zona-azul/HubPage.tsx"), /zbeHubLine\(locale\)/);
  assert.match(read("src/components/programmatic/zbe/ZbePages.tsx"), /parkingHubLine\(locale\)/);
});
