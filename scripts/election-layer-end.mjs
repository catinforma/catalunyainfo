/**
 * Ends the 29N election-day layer's one-minute regeneration (run on 8 Dec 2026).
 *
 *   node scripts/election-layer-end.mjs
 *
 * Next.js reads `export const revalidate` statically (route segment config, "The
 * revalidate value needs to be statically analyzable"; no clock, no import),
 * so it cannot switch itself off on 8 Dec. The pages stop printing the layer
 * by themselves (electionPhase is "over" from 8 Dec 00:00 Madrid); this only
 * returns the eight routes from `revalidate = 60` to `false` (static until
 * published). tests/election-day.test.ts fails from 8 Dec until it is done.
 * Idempotent; prints each route it changed. Review the diff, run the test,
 * commit, deploy.
 */
import { readFileSync, writeFileSync } from "node:fs";

const ROUTES = [
  "src/app/(public)/[locale]/eleccions/page.tsx",
  "src/app/(public)/[locale]/elecciones/page.tsx",
  "src/app/(public)/[locale]/elections/page.tsx",
  "src/app/(public)/[locale]/eleccions/[municipi]/page.tsx",
  "src/app/(public)/[locale]/elecciones/[municipi]/page.tsx",
  "src/app/(public)/[locale]/elections/[municipi]/page.tsx",
  "src/app/(public)/[locale]/eleccions/comarca/[comarca]/page.tsx",
  "src/app/(public)/[locale]/elecciones/comarca/[comarca]/page.tsx",
];

for (const route of ROUTES) {
  const url = new URL(`../${route}`, import.meta.url);
  const source = readFileSync(url, "utf8");
  if (!/export const revalidate = 60;/.test(source)) {
    console.log(`unchanged  ${route}`);
    continue;
  }
  writeFileSync(url, source.replace("export const revalidate = 60;", "export const revalidate = false;"));
  console.log(`revalidate = false  ${route}`);
}
