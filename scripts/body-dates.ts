/**
 * Writes src/lib/seo/body-dates.json: for every code-rendered sitemap family
 * (scripts/lib/body-families.ts), the fingerprint of the files that render its
 * pages and the moment that fingerprint last changed. The sitemap dates each
 * family's URLs no earlier than that (src/lib/seo/body-dates.ts).
 *
 *   npm run seo:body-dates                 refresh after a change; a family whose files
 *                                          changed is dated by its last real commit
 *                                          (comment-only commits skipped; now if uncommitted)
 *   npm run seo:body-dates -- --from-git   re-date every family from git history
 *   npm run seo:body-dates -- --check      list the families whose body changed; exit 1 if any
 *   npm run seo:body-dates -- --explain <key>   the files behind one family
 *   (prebuild) --build                     deploy: a family whose files differ from the
 *                                          release being replaced is dated now, the
 *                                          moment the change goes live; the others keep
 *                                          that release's date. Never fails the build.
 *
 * --build finds the release being replaced through BODY_DATES_PREVIOUS (set by
 * ops/vps/deploy.sh) or, failing that, the server layout
 * (releases/<name>/ beside current/). Without either it leaves the committed file alone.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

import {
  BODY_DATES_VERSION,
  CHROME_ROOTS,
  ROOT,
  bodyFiles,
  fingerprint,
  importClosure,
  nextRecord,
  normalizedSource,
  routeFiles,
  type BodyDatesFile,
  type BodyRecord,
} from "./lib/body-dates.ts";
import { BODY_FAMILIES, familyHome } from "./lib/body-families.ts";

const OUT = join(ROOT, "src/lib/seo/body-dates.json");
const args = process.argv.slice(2);
const mode = args.includes("--build") ? "build" : args.includes("--check") ? "check" : args.includes("--from-git") ? "from-git" : "local";

function readFile(path: string): BodyDatesFile | null {
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as BodyDatesFile;
    return parsed && typeof parsed.families === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/** Every family's route files and body files, from the code as it is on disk. */
function currentBodies(): Map<string, { files: string[]; fingerprint: string }> {
  const chrome = importClosure(CHROME_ROOTS);
  const out = new Map<string, { files: string[]; fingerprint: string }>();
  for (const [key, source] of Object.entries(BODY_FAMILIES)) {
    const routes = "roots" in source ? [...source.roots] : [...new Set(source.urls().flatMap((url) => routeFiles(url)))].sort();
    if (routes.length === 0) throw new Error(`${key}: no route file found for its URLs`);
    const files = bodyFiles(routes, chrome, ROOT, familyHome(key));
    out.set(key, { files, fingerprint: fingerprint(files) });
  }
  return out;
}

/* ---- git dating (local runs) --------------------------------------------- */

const git = (...gitArgs: string[]) => execFileSync("git", gitArgs, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
const hasGit = (() => {
  try {
    git("rev-parse", "--is-inside-work-tree");
    return true;
  } catch {
    return false;
  }
})();

const fileDates = new Map<string, string>();

/**
 * When a file last changed what it means: the oldest commit of the newest run
 * of commits whose normalised content equals the file on disk. Uncommitted
 * changes are dated now.
 */
function fileChangedAt(file: string, now: string): string {
  const cached = fileDates.get(file);
  if (cached) return cached;
  const raw = readFileSync(join(ROOT, file), "utf8");
  let current: string | null = null;
  const log = git("log", "--format=%H %cI", "-n", "12", "--", file).trim().split("\n").filter(Boolean);
  let date = now;
  for (const line of log) {
    const [sha = "", when = ""] = line.split(" ");
    let same = false;
    try {
      const then = git("show", `${sha}:${file}`);
      if (then === raw) same = true;
      else {
        current ??= normalizedSource(file, raw);
        same = normalizedSource(file, then) === current;
      }
    } catch {
      same = false;
    }
    if (!same) break;
    date = new Date(when).toISOString();
  }
  fileDates.set(file, date);
  return date;
}

function gitDate(files: readonly string[], now: string): string {
  return files.map((file) => fileChangedAt(file, now)).sort().at(-1) ?? now;
}

/* ---- the release being replaced (deploy) ---------------------------------- */

function previousRelease(): string | null {
  const fromEnv = process.env.BODY_DATES_PREVIOUS;
  if (fromEnv) return fromEnv;
  // ops/vps layout: <app>/releases/<name>/ is being built while <app>/current still serves.
  if (basename(dirname(ROOT)) === "releases") return resolve(ROOT, "..", "..", "current", "src/lib/seo/body-dates.json");
  return null;
}

/* ---- main ----------------------------------------------------------------- */

function write(families: Record<string, BodyRecord>): void {
  const file: BodyDatesFile = {
    version: BODY_DATES_VERSION,
    about: "Generated by scripts/body-dates.ts (npm run seo:body-dates; the deploy re-dates changed families). Read by src/lib/seo/body-dates.ts for sitemap lastmod.",
    families: Object.fromEntries(Object.entries(families).sort(([a], [b]) => a.localeCompare(b))),
  };
  writeFileSync(OUT, `${JSON.stringify(file, null, 1)}\n`);
}

function main(): void {
  const now = new Date().toISOString();
  const committed = readFile(OUT);

  if (args.includes("--explain")) {
    const key = args[args.indexOf("--explain") + 1] ?? "";
    const body = currentBodies().get(key);
    if (!body) throw new Error(`unknown family ${key}`);
    for (const file of body.files) console.log(hasGit ? `${fileChangedAt(file, now)}  ${file}` : file);
    console.log(`${body.files.length} files, ${body.fingerprint}`);
    return;
  }

  if (mode === "build") {
    const previousPath = previousRelease();
    if (!previousPath) {
      console.log("body-dates: no previous release known (BODY_DATES_PREVIOUS unset): keeping the committed dates");
      return;
    }
    const previous = readFile(previousPath) ?? committed;
    const bodies = currentBodies();
    const families: Record<string, BodyRecord> = {};
    let moved = 0;
    for (const [key, body] of bodies) {
      const record = nextRecord(previous?.families[key], { fingerprint: body.fingerprint, files: body.files.length }, () => now);
      if (record.date === now) moved += 1;
      families[key] = record;
    }
    write(families);
    console.log(`body-dates: ${bodies.size} families, ${moved} changed since the live release (dated ${now})`);
    return;
  }

  const bodies = currentBodies();
  if (mode === "check") {
    const stale = [...bodies].filter(([key, body]) => committed?.families[key]?.fingerprint !== body.fingerprint).map(([key]) => key);
    console.log(stale.length ? `body changed, run npm run seo:body-dates: ${stale.join(", ")}` : "body-dates.json is current");
    process.exitCode = stale.length ? 1 : 0;
    return;
  }

  if (!hasGit) throw new Error("not a git checkout: use --build on a release");
  const families: Record<string, BodyRecord> = {};
  for (const [key, body] of bodies) {
    const previous = mode === "from-git" ? undefined : committed?.families[key];
    families[key] = nextRecord(previous, { fingerprint: body.fingerprint, files: body.files.length }, () => gitDate(body.files, now));
    if (previous?.fingerprint !== body.fingerprint) console.log(`${key.padEnd(26)} ${families[key].date}  ${body.files.length} files`);
  }
  write(families);
}

try {
  main();
} catch (error) {
  if (mode === "build") {
    // The committed dates are a fine fallback; a sitemap detail must never stop a release.
    console.warn(`body-dates: skipped (${error instanceof Error ? error.message : String(error)}); keeping the committed dates`);
  } else {
    throw error;
  }
}
