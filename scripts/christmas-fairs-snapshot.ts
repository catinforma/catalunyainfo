/**
 * Builds the snapshot behind /ca/fires-de-nadal/, /es/mercados-navidad/ and
 * /en/christmas-markets/.
 *
 *   npm run christmasfairs:snapshot -- build [--allow-removals]
 *       Reads, from the Generalitat's open data:
 *         - the fairs calendar (`vm32-przc`, Departament d'Empresa i Treball):
 *           every fair of the season (1 Nov - 7 Jan) whose name says Christmas
 *           (`classify.ts`), with its place, organiser and website as registered;
 *         - the cultural agenda (`rhpv-yr4f`, Departament de Cultura): its
 *           Christmas fairs and markets for the season, placed in a
 *           municipality with the weekend family's register;
 *       and writes src/lib/programmatic/christmas-fairs/snapshot.json, dated
 *       today (the "last checked" date the pages print).
 *       Prints what it measured (per town, with dates), the towns that gain or
 *       lose a page against the committed snapshot, and refuses to write when
 *       a town page would disappear unless --allow-removals is given.
 *
 *   npm run christmasfairs:snapshot -- urls
 *       Prints every URL of the family (for IndexNow or Search Console).
 *
 * Cadence: organisers register and announce their fairs through November.
 * Re-run every Monday and Thursday until mid-December (and whenever Socrata's
 * `rowsUpdatedAt` for vm32-przc changes), check the organiser pages listed in
 * `organisers.ts` (PENDING_MARKETS first: Santa Llúcia, Girona…), commit and
 * deploy. The pages are static; a deploy is what publishes the new list.
 */

import { existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { SEASON, isChristmasAgendaMarket, isChristmasName } from "../src/lib/programmatic/christmas-fairs/classify.ts";
import { agendaFairs, fairFromRow } from "../src/lib/programmatic/christmas-fairs/rows.ts";
import type { ChristmasSnapshot, SnapshotChristmasFair } from "../src/lib/programmatic/christmas-fairs/types.ts";
import { buildLookup, municipalityNames } from "../src/lib/programmatic/weekend/compact.ts";
import { SNAPSHOT as WEEKEND } from "../src/lib/programmatic/weekend/data.ts";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "src/lib/programmatic/christmas-fairs/snapshot.json");
const SOCRATA = "https://analisi.transparenciacatalunya.cat";

function todayInMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { "user-agent": "CatalunyaInfo christmas fairs snapshot (+https://www.catalunyainfo.com)", accept: "application/json" },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return (await response.json()) as T;
}

/** Socrata's `rowsUpdatedAt`, as an ISO date in Madrid. */
async function updatedOn(id: string): Promise<string | null> {
  const meta = await fetchJson<{ rowsUpdatedAt?: number }>(`${SOCRATA}/api/views/${id}.json`);
  if (!meta.rowsUpdatedAt) return null;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date(meta.rowsUpdatedAt * 1000));
}

/** Websites that do not open from here: for a person to check (and add to WEB_REPLACEMENTS in rows.ts). */
async function brokenLinks(urls: readonly string[]): Promise<string[]> {
  const out: string[] = [];
  await Promise.all(
    [...new Set(urls)].map(async (url) => {
      try {
        const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; CatalunyaInfo link check)" }, signal: AbortSignal.timeout(30_000) });
        if (response.status >= 400) out.push(`${url} (HTTP ${response.status})`);
      } catch (error) {
        const code = (error as { cause?: { code?: string } }).cause?.code ?? (error instanceof Error ? error.name : "error");
        out.push(`${url} (${code})`);
      }
    }),
  );
  return out.sort();
}

async function build(allowRemovals: boolean): Promise<void> {
  const readOn = todayInMadrid();
  const known = new Set(WEEKEND.municipalities.map((m) => m.ine));
  const nameOf = new Map(WEEKEND.municipalities.map((m) => [m.ine, m.name]));

  /* Fairs calendar ------------------------------------------------------------ */
  const fairRows = await fetchJson<Record<string, string>[]>(`${SOCRATA}/resource/vm32-przc.json?$limit=5000`);
  if (fairRows.length < 100) throw new Error(`Fairs: only ${fairRows.length} rows`);
  const fairChristmas = fairRows.filter((r) => isChristmasName(r.nom, r.nom_castellano));
  const fairs: SnapshotChristmasFair[] = [];
  for (const r of fairRows) {
    const fair = fairFromRow(r, known);
    if (fair) fairs.push(fair);
  }

  /* Agenda ------------------------------------------------------------------- */
  const where =
    `data_inici <= '${SEASON.to}T23:59:59' AND data_fi >= '${SEASON.from}T00:00:00'` +
    ` AND (permanent IS NULL OR permanent != 'Sí') AND (modalitat IS NULL OR modalitat != 'Virtual')`;
  const agendaRows = await fetchJson<Record<string, string>[]>(
    `${SOCRATA}/resource/rhpv-yr4f.json?$select=codi,denominaci,espai,comarca_i_municipi,municipi,comarca,data_inici,data_fi,tags_categor_es,url` +
      `&$where=${encodeURIComponent(where)}&$order=data_inici&$limit=50000`,
  );
  if (agendaRows.length < 200) throw new Error(`Agenda: only ${agendaRows.length} rows for the season`);
  const register = { municipalities: WEEKEND.municipalities, comarques: WEEKEND.comarques, agendaAliases: WEEKEND.agendaAliases };
  const lookup = buildLookup(register);
  const names = municipalityNames(register);
  const agendaChristmas = agendaRows.filter((r) => isChristmasAgendaMarket(r));
  fairs.push(...agendaFairs(agendaRows, lookup, names, fairs));
  fairs.sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.name.localeCompare(b.name, "ca"));

  const snapshot: ChristmasSnapshot = {
    readOn,
    season: { from: SEASON.from, to: SEASON.to },
    sources: {
      fairs: {
        name: "Calendari fires de Catalunya (fires i fires mercat)",
        publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya",
        url: `${SOCRATA}/d/vm32-przc`,
        api: `${SOCRATA}/resource/vm32-przc.json`,
        updated: await updatedOn("vm32-przc"),
      },
      agenda: {
        name: "Agenda cultural de Catalunya (per localitzacions)",
        publisher: "Departament de Cultura, Generalitat de Catalunya",
        url: `${SOCRATA}/d/rhpv-yr4f`,
        api: `${SOCRATA}/resource/rhpv-yr4f.json`,
        updated: await updatedOn("rhpv-yr4f"),
      },
    },
    measured: {
      fairRows: fairRows.length,
      fairChristmas: fairChristmas.length,
      agendaRows: agendaRows.length,
      agendaChristmas: agendaChristmas.length,
    },
    fairs,
  };

  // Which towns get a page, with the organisers' list merged in, before and after.
  const { mergeFairs, shippedTowns } = await import("../src/lib/programmatic/christmas-fairs/data.ts");
  const { ORGANISER_FAIRS } = await import("../src/lib/programmatic/christmas-fairs/organisers.ts");
  const townsOf = (s: ChristmasSnapshot) => new Set(shippedTowns(mergeFairs(s, ORGANISER_FAIRS)).map((t) => t.slug));
  const after = townsOf(snapshot);
  let before = new Set<string>();
  if (existsSync(OUT)) {
    const { SNAPSHOT } = await import("../src/lib/programmatic/christmas-fairs/data.ts");
    before = townsOf(SNAPSHOT);
  }
  const removed = [...before].filter((s) => !after.has(s));
  const added = [...after].filter((s) => !before.has(s));

  console.log(`Fairs calendar: ${fairRows.length} rows (updated ${snapshot.sources.fairs.updated}); ${fairChristmas.length} with a Christmas name, ${fairs.filter((f) => f.source === "fairs").length} in the season`);
  console.log(`Agenda: ${agendaRows.length} rows for ${SEASON.from}..${SEASON.to} (updated ${snapshot.sources.agenda.updated}); ${agendaChristmas.length} Christmas fairs or markets, ${fairs.filter((f) => f.source === "agenda").length} new after deduplication`);
  console.log(`Season fairs from open data, by date:`);
  for (const f of fairs) console.log(`  ${f.start}..${f.end}  ${nameOf.get(f.ine) ?? f.ine}  ${f.name}${f.toConfirm ? "  (dates to confirm)" : ""}  [${f.source}]`);
  const broken = await brokenLinks(fairs.map((f) => f.web).filter((u): u is string => Boolean(u)));
  if (broken.length) {
    console.log("Websites that did not open from here (Node does not fetch missing intermediate certificates, so open each in a browser;");
    console.log("if it fails there too, add the council's site to WEB_REPLACEMENTS in rows.ts and re-run):");
    for (const line of broken) console.log(`  ${line}`);
  }
  console.log(`Towns with a page (with organisers.ts): ${after.size}`);
  if (added.length) console.log(`  new: ${added.join(", ")}`);
  if (removed.length) {
    console.log(`  would disappear: ${removed.join(", ")}`);
    if (!allowRemovals) throw new Error("Re-run with --allow-removals if that is intended (a fair was cancelled or re-dated out of the season), and redirect those URLs to the hub.");
  }

  writeFileSync(OUT, `${JSON.stringify(snapshot, null, 1)}\n`);
  console.log(`Wrote ${OUT} (readOn ${readOn}).`);
}

async function urls(): Promise<void> {
  const { christmasFairsPaths } = await import("../src/lib/programmatic/christmas-fairs/sitemap.ts");
  for (const entry of christmasFairsPaths()) console.log(`https://www.catalunyainfo.com${entry.path}`);
}

const [command = "build", ...rest] = process.argv.slice(2);
if (command === "build") {
  await build(rest.includes("--allow-removals"));
} else if (command === "urls") {
  await urls();
} else {
  console.error(`Unknown command "${command}". Use build or urls.`);
  process.exit(1);
}
