/**
 * Election-night files on local disk (PROTOTYPE; docs/elections-live-results.md,
 * section 2.3). One directory per accepted update, a `current` symlink swapped
 * atomically, the last N versions kept:
 *
 *   <root>/v/<stamp>/snapshot.json      the whole LiveSnapshot
 *   <root>/v/<stamp>/towns/<ine>.json   one LiveTownFile per municipality
 *   <root>/v/<stamp>/meta.json          source, timestamps, counted share per province
 *   <root>/current -> v/<stamp>
 *
 * Readers (the page, Caddy) only ever follow `current`, so they see the old
 * set or the new one, never a half-written mix: the new directory is written
 * and fsynced first, then a temporary symlink is renamed over `current`
 * (rename(2) is atomic on one file system).
 */
import { mkdir, open, readdir, readFile, readlink, rename, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { serializeTownFile, townFile } from "../../src/lib/programmatic/elections/live/store.ts";
import type { LiveSnapshot } from "../../src/lib/programmatic/elections/live/types.ts";

export const KEEP_VERSIONS = 20;

/** Directory name for an update: the source's timestamp, sortable, file-system safe. */
export function versionName(s: LiveSnapshot): string {
  const stamp = new Date(s.sourceUpdatedAt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${new Date(s.fetchedAt).toISOString().replace(/[-:.]/g, "")}`;
}

async function writeSynced(path: string, text: string): Promise<number> {
  const handle = await open(path, "w");
  try {
    await handle.writeFile(text);
    await handle.sync();
  } finally {
    await handle.close();
  }
  return Buffer.byteLength(text);
}

/** The snapshot `current` points to, or null when there is none or it cannot be read. */
export async function readCurrent(root: string): Promise<LiveSnapshot | null> {
  try {
    return JSON.parse(await readFile(join(root, "current", "snapshot.json"), "utf8")) as LiveSnapshot;
  } catch {
    return null;
  }
}

export interface WriteResult {
  version: string;
  towns: number;
  bytes: number;
  pruned: string[];
}

/** Writes a checked snapshot as a new version and points `current` at it. */
export async function writeVersion(root: string, s: LiveSnapshot, keep = KEEP_VERSIONS): Promise<WriteResult> {
  const version = versionName(s);
  const dir = join(root, "v", version);
  await mkdir(join(dir, "towns"), { recursive: true });
  let bytes = 0;
  const codes = Object.keys(s.towns).sort();
  for (const code of codes) bytes += await writeSynced(join(dir, "towns", `${code}.json`), serializeTownFile(townFile(s, code)!));
  const meta = {
    version: 1,
    chamber: s.chamber,
    electionDate: s.electionDate,
    sourceUpdatedAt: s.sourceUpdatedAt,
    fetchedAt: s.fetchedAt,
    provisional: s.provisional,
    source: s.source,
    provinces: Object.fromEntries(Object.entries(s.provinces).map(([code, p]) => [code, { name: p.name, countedPct: p.countedPct }])),
    towns: codes.length,
  };
  bytes += await writeSynced(join(dir, "meta.json"), `${JSON.stringify(meta)}\n`);
  bytes += await writeSynced(join(dir, "snapshot.json"), `${JSON.stringify(s)}\n`);

  const temporary = join(root, `.current-${process.pid}-${Date.now()}`);
  await symlink(join("v", version), temporary);
  await rename(temporary, join(root, "current"));

  const versions = (await readdir(join(root, "v"))).sort();
  const pruned = versions.slice(0, Math.max(0, versions.length - keep)).filter((name) => name !== version);
  for (const name of pruned) await rm(join(root, "v", name), { recursive: true, force: true });
  return { version, towns: codes.length, bytes, pruned };
}

/** Where `current` points, relative to the root, or null. */
export async function currentVersion(root: string): Promise<string | null> {
  try {
    return (await readlink(join(root, "current"))).replace(/^v\//, "");
  } catch {
    return null;
  }
}

/** Records why a run was refused, beside the files it left untouched. */
export async function writeRefusal(root: string, at: string, problems: string[]): Promise<void> {
  await mkdir(root, { recursive: true });
  await writeFile(join(root, "last-error.json"), `${JSON.stringify({ at, problems: problems.slice(0, 200), total: problems.length })}\n`);
}
