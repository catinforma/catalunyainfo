import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATORS, CALCULATORS_ROOT } from "../src/lib/programmatic/calculators/paths.ts";
import { calculatorAppSchema } from "../src/lib/seo/jsonld.ts";

/**
 * Structured data of the calculators family (19 Nov 2026 audit): every tool page
 * describes its tool as a free WebApplication next to its BreadcrumbList. Before,
 * 12 tools in 9 templates (SMI, Letras, working days, pensions 2027, dismissal, finiquito,
 * paro, rent update, ITV, mortgage, home-purchase taxes)
 * emitted only the breadcrumb. Data pages with no calculator are listed apart.
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const COMPONENTS = join(ROOT, "src", "components", "programmatic");

/** Reference pages without a tool of their own: a figure and its table (IPC, Euríbor) or a Dataset (average salary, the 21-territory comparison). */
const DATA_PAGES = new Set(["ipc", "euribor", "average-salary", "inheritance-tax-by-region"]);

/** The component folders a route imports (`@/components/programmatic/<folder>/…`). */
function componentFolders(routeFile: string): string[] {
  const src = readFileSync(routeFile, "utf8");
  return [...src.matchAll(/from "@\/components\/programmatic\/([a-z0-9-]+)\//g)].map((m) => m[1]!).filter((f) => f !== "spain-2027");
}

test("calculators: every tool page's component emits a WebApplication node (data pages excepted)", () => {
  for (const c of CALCULATORS) {
    const route = join(APP, CALCULATORS_ROOT.es, c.slugs.es, "page.tsx");
    assert.ok(existsSync(route), route);
    const folders = componentFolders(route);
    assert.ok(folders.length > 0, `${c.id}: no component import in ${route}`);
    const text = folders.flatMap((f) => readdirSync(join(COMPONENTS, f)).filter((n) => n.endsWith(".tsx")).map((n) => readFileSync(join(COMPONENTS, f, n), "utf8"))).join("\n");
    const hasApp = /"@type": "WebApplication"|calculatorAppSchema\(/.test(text);
    if (DATA_PAGES.has(c.id)) continue;
    assert.ok(hasApp, `${c.id}: no WebApplication in ${folders.join(", ")}`);
  }
});

test("calculators: the shared WebApplication node is free, published by the site and carries no rating", () => {
  const node = calculatorAppSchema({ name: "Calculadora de días hábiles y plazos", path: "/es/calculadoras/dias-habiles/", description: "x", locale: "es", category: "UtilitiesApplication" });
  assert.equal(node["@type"], "WebApplication");
  assert.ok(String(node.url).endsWith("/es/calculadoras/dias-habiles/"), String(node.url));
  assert.deepEqual(node.offers, { "@type": "Offer", price: "0", priceCurrency: "EUR" });
  assert.equal(node.isAccessibleForFree, true);
  assert.ok(!("aggregateRating" in node) && !("review" in node), "no rating or review: the site holds none");
});
