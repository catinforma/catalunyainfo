/**
 * Writes the committed fallback behind the server-rendered weekend lists.
 *
 *   npm run weekend:agenda-snapshot [-- YYYY-MM-DD]
 *       Reads this weekend's two official agendas (the weekend `weekendWindow`
 *       gives for the date, today in Madrid by default) with the very code the
 *       pages use (src/lib/programmatic/weekend/agenda-upstream.ts):
 *         - Generalitat, Agenda Cultural de Catalunya (`rhpv-yr4f`);
 *         - Ajuntament de Barcelona, Open Data BCN `agenda-diaria`;
 *       and writes src/lib/programmatic/weekend/agenda-snapshot.json.
 *
 * The pages show the committed reads only for the weekend they were read for,
 * and only when neither the live read nor the kept file on the server has
 * that weekend; on any other weekend the file is ignored. Re-run it on a
 * Thursday or Friday before a deploy if you want the fallback to cover that
 * weekend. Refuses to write when either source fails, so a half file never
 * replaces a whole one.
 */

import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { todayInCatalonia } from "../src/lib/content/holidays/calendar.ts";
import { weekendWindow } from "../src/lib/content/weekend/agenda.ts";
import { readBcn, readGencat } from "../src/lib/programmatic/weekend/agenda-upstream.ts";
import { SNAPSHOT } from "../src/lib/programmatic/weekend/data.ts";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "src/lib/programmatic/weekend/agenda-snapshot.json");

const date = process.argv[2] && /^\d{4}-\d{2}-\d{2}$/.test(process.argv[2]) ? process.argv[2] : todayInCatalonia();
const window = weekendWindow(date);
const now = Date.now();
const fetcher = (url: string, init?: RequestInit) => fetch(url, { ...init, signal: AbortSignal.timeout(60_000) });

const [gencat, bcn] = await Promise.all([readGencat(fetcher, window, SNAPSHOT, now), readBcn(fetcher, window, now)]);
if (!gencat || !bcn) {
  console.error(`Not written: ${!gencat ? "Generalitat agenda" : ""}${!gencat && !bcn ? " and " : ""}${!bcn ? "Open Data BCN" : ""} did not answer.`);
  process.exit(1);
}
writeFileSync(OUT, `${JSON.stringify({ readOn: date, reads: [gencat, bcn] })}\n`);
console.log(`Weekend ${window.from}..${window.to}: Generalitat ${gencat.items.length} activities (updated ${gencat.updated}), Ajuntament ${bcn.items.length} (latest change ${bcn.updated}).`);
console.log(`Wrote ${OUT}`);
