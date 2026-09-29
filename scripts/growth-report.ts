/**
 * The growth report.
 *
 * Site-wide CTR on this property is not a usable KPI: Search Console credits
 * us with impressions for strings like `d'acord`, `check again` and `si`, at
 * positions 2–6, which never get clicked. Those are AI fan-out sub-queries,
 * not searches, and they grew fast enough through September to move the
 * headline number on their own. Optimising against that number means
 * optimising against a robot's vocabulary.
 *
 * This report splits the rows into human search, generative noise, brand and
 * unclassified, and computes **qualified clicks** and **qualified CTR** over
 * the human rows only. It does not replace Search Console's own figures; it
 * is an analysis layer on top of them, and it prints the reason for every
 * call it makes so any single one can be disputed.
 *
 * ## Input
 *
 * Search Console is read through an MCP client, not from this process, so the
 * report takes the rows as JSON rather than fetching them:
 *
 *   npm run growth:report -- <rows.json> [previous-rows.json]
 *
 * The file is whatever the query-dimension call returns — either the raw
 * `{ rows: [...] }` object or a bare array of
 * `{ query, clicks, impressions, ctr, position }`.
 *
 * Passing a second file compares the two periods on the qualified metrics.
 */
import { readFile } from "node:fs/promises";

import {
  classifyQuery,
  opportunityScore,
  type ClusterKey,
  type QueryKind,
  type QueryRow,
} from "../src/lib/growth/classify.ts";

export {};

interface Bucket {
  clicks: number;
  impressions: number;
  rows: number;
}

const EMPTY = (): Bucket => ({ clicks: 0, impressions: 0, rows: 0 });

function add(bucket: Bucket, row: QueryRow) {
  bucket.clicks += row.clicks;
  bucket.impressions += row.impressions;
  bucket.rows += 1;
}

function ctr(bucket: Bucket): string {
  if (bucket.impressions === 0) return "—";
  return `${((bucket.clicks / bucket.impressions) * 100).toFixed(2)}%`;
}

async function load(path: string): Promise<QueryRow[]> {
  const raw = JSON.parse(await readFile(path, "utf8")) as unknown;

  // The MCP result is sometimes a JSON string inside a `result` field.
  const unwrapped =
    typeof (raw as { result?: unknown }).result === "string"
      ? (JSON.parse((raw as { result: string }).result) as unknown)
      : raw;

  const rows = Array.isArray(unwrapped)
    ? unwrapped
    : ((unwrapped as { rows?: unknown[] }).rows ?? []);

  return (rows as Record<string, unknown>[])
    .filter((row) => typeof row.query === "string")
    .map((row) => ({
      query: row.query as string,
      clicks: Number(row.clicks ?? 0),
      impressions: Number(row.impressions ?? 0),
      ctr: Number(row.ctr ?? 0),
      position: Number(row.position ?? 0),
    }));
}

function pct(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

function analyse(rows: QueryRow[]) {
  const byKind: Record<QueryKind, Bucket> = {
    human: EMPTY(),
    noise: EMPTY(),
    brand: EMPTY(),
    unclassified: EMPTY(),
  };
  const byCluster = new Map<ClusterKey, Bucket>();
  const classified = rows.map((row) => ({ row, klass: classifyQuery(row.query) }));

  for (const { row, klass } of classified) {
    add(byKind[klass.kind], row);
    if (klass.cluster) {
      const bucket = byCluster.get(klass.cluster) ?? EMPTY();
      add(bucket, row);
      byCluster.set(klass.cluster, bucket);
    }
  }

  return { byKind, byCluster, classified };
}

function line(label: string, bucket: Bucket, totalImpressions: number) {
  return (
    `  ${label.padEnd(16)}` +
    `${String(bucket.clicks).padStart(6)} clicks  ` +
    `${String(bucket.impressions).padStart(7)} impr  ` +
    `${ctr(bucket).padStart(7)}  ` +
    `${pct(bucket.impressions, totalImpressions).padStart(6)} of impressions  ` +
    `${String(bucket.rows).padStart(4)} queries`
  );
}

async function main() {
  const [path, previousPath] = process.argv.slice(2);
  if (!path) {
    console.error("Usage: npm run growth:report -- <rows.json> [previous-rows.json]");
    process.exit(1);
  }

  const rows = await load(path);
  const { byKind, byCluster, classified } = analyse(rows);

  const total = EMPTY();
  for (const row of rows) add(total, row);

  console.log(`\nGROWTH REPORT — ${rows.length} query rows from ${path}\n`);
  console.log("Search Console's own totals, for reference:");
  console.log(line("ALL", total, total.impressions));

  console.log("\nSplit by what the query actually is:");
  console.log(line("HUMAN", byKind.human, total.impressions));
  console.log(line("AI / FRAGMENT", byKind.noise, total.impressions));
  console.log(line("BRAND", byKind.brand, total.impressions));
  console.log(line("UNCLASSIFIED", byKind.unclassified, total.impressions));

  console.log("\nQUALIFIED SEARCH — human queries only, brand and noise excluded:");
  console.log(`  Qualified clicks      ${byKind.human.clicks}`);
  console.log(`  Qualified impressions ${byKind.human.impressions}`);
  console.log(`  Qualified CTR         ${ctr(byKind.human)}`);
  console.log(
    `  (Search Console would report ${ctr(total)} over the same rows.` +
      ` The gap is the measurement artefact, not a performance change.)`,
  );

  /* ---- Clusters --------------------------------------------------------- */
  console.log("\nCLUSTERS (human queries):");
  const clusters = [...byCluster.entries()].sort((a, b) => b[1].clicks - a[1].clicks);
  for (const [key, bucket] of clusters) console.log(line(key, bucket, total.impressions));

  if (clusters.length > 0) {
    const top = clusters[0];
    if (top && byKind.human.clicks > 0) {
      console.log(
        `\n  Concentration: ${top[0]} is ${pct(top[1].clicks, byKind.human.clicks)} of all` +
          ` qualified clicks. That is the single biggest risk on the site.`,
      );
    }
  }

  /* ---- Winning ---------------------------------------------------------- */
  const human = classified.filter((item) => item.klass.kind === "human");

  console.log("\nWINNING (human, position <= 5, with clicks):");
  for (const { row } of human
    .filter((item) => item.row.position <= 5 && item.row.clicks > 0)
    .sort((a, b) => b.row.clicks - a.row.clicks)
    .slice(0, 12)) {
    console.log(
      `  ${String(row.clicks).padStart(4)} clicks  pos ${row.position.toFixed(1).padStart(5)}  ` +
        `${(row.ctr * 100).toFixed(1).padStart(5)}%  ${row.query}`,
    );
  }

  /* ---- Opportunities ---------------------------------------------------- */
  console.log("\nOPPORTUNITIES (human queries, highest score first):");
  const scored = human
    .map((item) => ({ ...item, opp: opportunityScore(item.row, item.klass) }))
    .sort((a, b) => b.opp.score - a.opp.score)
    .slice(0, 12);

  for (const { row, opp } of scored) {
    console.log(
      `\n  ${opp.score.toFixed(1).padStart(5)}  pos ${row.position.toFixed(1).padStart(5)}  ` +
        `${String(row.impressions).padStart(4)} impr  ${String(row.clicks).padStart(3)} clicks  ` +
        `${row.query}`,
    );
    for (const term of opp.terms) console.log(`         ${term}`);
  }

  /* ---- Audit trail ------------------------------------------------------ */
  console.log("\nCLASSIFIED AS AI / FRAGMENT — check these, the call may be wrong:");
  for (const { row, klass } of classified
    .filter((item) => item.klass.kind === "noise")
    .sort((a, b) => b.row.impressions - a.row.impressions)
    .slice(0, 20)) {
    console.log(
      `  ${String(row.impressions).padStart(4)} impr  pos ${row.position.toFixed(1).padStart(5)}  ` +
        `${row.query.padEnd(38)}  ${klass.reason}`,
    );
  }

  console.log("\nUNCLASSIFIED — no vocabulary matched; extend the vocabulary or ignore:");
  for (const { row } of classified
    .filter((item) => item.klass.kind === "unclassified")
    .sort((a, b) => b.row.impressions - a.row.impressions)
    .slice(0, 20)) {
    console.log(
      `  ${String(row.impressions).padStart(4)} impr  pos ${row.position.toFixed(1).padStart(5)}  ${row.query}`,
    );
  }

  /* ---- Comparison ------------------------------------------------------- */
  if (previousPath) {
    const previousRows = await load(previousPath);
    const previous = analyse(previousRows);
    const delta = (now: number, before: number) => {
      const diff = now - before;
      const sign = diff > 0 ? "+" : "";
      const share = before === 0 ? "" : ` (${sign}${((diff / before) * 100).toFixed(0)}%)`;
      return `${sign}${diff}${share}`;
    };

    console.log(`\nVS PREVIOUS PERIOD (${previousPath}):`);
    console.log(
      `  Qualified clicks      ${previous.byKind.human.clicks} -> ${byKind.human.clicks}   ` +
        delta(byKind.human.clicks, previous.byKind.human.clicks),
    );
    console.log(
      `  Qualified impressions ${previous.byKind.human.impressions} -> ${byKind.human.impressions}   ` +
        delta(byKind.human.impressions, previous.byKind.human.impressions),
    );
    console.log(
      `  Qualified CTR         ${ctr(previous.byKind.human)} -> ${ctr(byKind.human)}`,
    );
    console.log(
      `  AI / fragment impr    ${previous.byKind.noise.impressions} -> ${byKind.noise.impressions}   ` +
        delta(byKind.noise.impressions, previous.byKind.noise.impressions),
    );
  }

  console.log("");
}

await main();
