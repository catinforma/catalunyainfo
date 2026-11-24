/**
 * Sitemap lastmod = the moment a page's content really last changed (21 Nov 2026 audit,
 * docs/SEO_EXPERIMENTS.md). Pins the source of every family's lastmod:
 *
 *  - code-rendered families: max(data date of their own sitemap function, body date from
 *    src/lib/seo/body-dates.json), via dated("<key>", …) in src/app/sitemap.ts;
 *  - database articles: max(dateModified, last reader-visible publish, today for
 *    day-dependent blocks, body date of code-data blocks) (contentLastModified);
 *  - elections: also never older than the 29N phase the pages print.
 */
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

const bodyDates = await import("../src/lib/seo/body-dates.ts");
const lib = await import("../scripts/lib/body-dates.ts");
const families = await import("../scripts/lib/body-families.ts");
const electionDay = await import("../src/lib/programmatic/elections/election-day.ts");

const JSON_FILE = JSON.parse(read("src/lib/seo/body-dates.json")) as {
  version: number;
  families: Record<string, { date: string; fingerprint: string; files: number }>;
};
const SITEMAP = read("src/app/sitemap.ts");
const datedKeys = [...SITEMAP.matchAll(/\.\.\.dated\("([^"]+)"/g)].map((m) => m[1]!);

/* ---- one key per family, in all three places ------------------------------ */

test("every programmatic family in sitemap.ts is dated by its body date", () => {
  // Every spread of a family's sitemap function sits inside dated("<key>", [...]).
  const spreads = [...SITEMAP.matchAll(/^ {4}\.\.\.(\w+)\(/gm)].map((m) => m[1]);
  assert.deepEqual(spreads.filter((name) => name !== "dated"), [], "a family's entries are spread without dated()");
  assert.equal(new Set(datedKeys).size, datedKeys.length, "a key used twice");
  assert.ok(datedKeys.length >= 55, `only ${datedKeys.length} dated families`);
});

test("sitemap.ts, the generator's family list and body-dates.json name the same families", () => {
  const generator = Object.keys(families.BODY_FAMILIES).filter((key) => !key.startsWith("block:")).sort();
  assert.deepEqual([...datedKeys].sort(), generator);
  const blocks = Object.keys(bodyDates.DATA_BLOCK_COMPONENTS).map(bodyDates.blockBodyKey);
  for (const key of [...generator, ...blocks]) assert.ok(JSON_FILE.families[key], `${key} has no record in body-dates.json`);
});

test("body-dates.json: real instants, not one build time, never in the future", () => {
  const dates = Object.values(JSON_FILE.families).map((record) => record.date);
  for (const date of dates) {
    assert.ok(!Number.isNaN(Date.parse(date)), date);
    assert.ok(Date.parse(date) <= Date.now() + 60_000, `${date} is in the future`);
  }
  assert.ok(new Set(dates).size >= 15, `only ${new Set(dates).size} distinct dates: looks like one stamp for everything`);
  for (const record of Object.values(JSON_FILE.families)) {
    assert.match(record.fingerprint, new RegExp(`^v${JSON_FILE.version}:[0-9a-f]{32}$`));
    assert.ok(record.files > 0);
  }
});

/* ---- the rules ------------------------------------------------------------ */

const FILE = {
  version: 1,
  families: {
    fam: { date: "2026-11-20T16:00:00.000Z", fingerprint: "v1:x", files: 1 },
    "block:localHolidays": { date: "2026-11-19T13:00:00.000Z", fingerprint: "v1:y", files: 1 },
  },
};

test("dated(): the body date lifts an older data date; a newer data date stands; the floor applies", () => {
  const entries = [
    { url: "https://www.catalunyainfo.com/es/a/", lastModified: new Date("2026-10-30T00:00:00Z") },
    { url: "https://www.catalunyainfo.com/es/b/", lastModified: new Date("2026-11-21T00:00:00Z") },
  ];
  const out = bodyDates.dated("fam", entries, { file: FILE });
  assert.deepEqual(out.map((e) => (e.lastModified as Date).toISOString()), ["2026-11-20T16:00:00.000Z", "2026-11-21T00:00:00.000Z"]);
  const floored = bodyDates.dated("fam", entries, { file: FILE, floor: new Date("2026-11-28T00:00:00+01:00") });
  assert.ok(floored.every((e) => (e.lastModified as Date).toISOString() === "2026-11-27T23:00:00.000Z"));
  // Unknown key: the data date is left as it was.
  assert.deepEqual(bodyDates.dated("nope", entries, { file: FILE }), entries);
});

test("contentLastModified: a body-only change re-dates the article (the Easter 2027 case)", () => {
  const today = new Date("2026-11-20T23:00:00.000Z");
  // dateModified stuck at the 31 Oct verification while the body changed on 4, 11, 17, 18, 20 Nov.
  const easter = { updatedAt: new Date("2026-10-31T11:00:00Z"), contentChangedAt: new Date("2026-11-20T21:10:00Z"), dayDependent: false, dataBlocks: [] };
  assert.equal(bodyDates.contentLastModified(easter, today, FILE).toISOString(), "2026-11-20T21:10:00.000Z");
  // A re-send that changed nothing leaves contentChangedAt where it was: the old date stands.
  const untouched = { updatedAt: new Date("2026-11-05T11:00:00Z"), contentChangedAt: new Date("2026-11-05T11:00:00Z"), dayDependent: false, dataBlocks: [] };
  assert.equal(bodyDates.contentLastModified(untouched, today, FILE).toISOString(), "2026-11-05T11:00:00.000Z");
  // Day-dependent block: today. Code-data block: that block's body date.
  assert.equal(bodyDates.contentLastModified({ ...untouched, dayDependent: true }, today, FILE).toISOString(), today.toISOString());
  assert.equal(bodyDates.contentLastModified({ ...untouched, dataBlocks: ["localHolidays"] }, today, FILE).toISOString(), "2026-11-19T13:00:00.000Z");
  // No entry date (older rows): dateModified.
  assert.equal(bodyDates.contentLastModified({ ...untouched, contentChangedAt: null }, today, FILE).toISOString(), "2026-11-05T11:00:00.000Z");
});

test("sitemap.ts dates articles with contentLastModified and the hubs by the newest article lastmod", () => {
  assert.match(SITEMAP, /lastModified: contentLastModified\(row\.phased \? \{ \.\.\.row, phaseStart \} : row, today\)/);
  assert.match(SITEMAP, /latestDate\(\.\.\.entries\.map\(\(entry\) => entry\.lastModified\)\)/);
  assert.match(SITEMAP, /\.\.\.dated\("elections", \[\.\.\.electionsSitemap\(\)\], \{ floor: electionPhaseStart\(new Date\(\)\) \}\)/);
});

test("the article rows carry the entry's last reader-visible publish and their code-data blocks", () => {
  const repo = read("src/lib/content/repository.ts");
  assert.match(repo, /contentChangedAt: entries\.updatedAt,/);
  assert.match(repo, /\.\.\.DATA_BLOCK_COLUMNS,/);
  assert.match(repo, /dataBlocks: DATA_BLOCK_TYPES\.filter/);
  // The same proven SQL shape as dayDependent: body::text ~ pattern.
  assert.match(repo, /sql<boolean>`\$\{entryTranslations\.body\}::text ~ \$\{dataBlockPattern\(type\)\}`/);
  for (const type of bodyDates.DATA_BLOCK_TYPES) {
    assert.match(read("src/components/blocks/BlockRenderer.tsx"), new RegExp(`case "${type}":`), type);
    assert.ok(new RegExp(bodyDates.dataBlockPattern(type)).test(JSON.stringify([{ type }])), type);
  }
});

test("publishers move entries.updated_at only on a reader-visible change", () => {
  const article = read("src/lib/content/publish-article.ts");
  assert.doesNotMatch(article, /set\(\{ \.\.\.entryValues, updatedAt: now \}\)/);
  assert.match(article, /if \(!previous \|\| editionFingerprint\(previous\) !== editionFingerprint\(edition\)\) readerVisibleChange = true;/);
  assert.match(article, /if \(readerVisibleChange && entryRows\[0\]\) \{\s*await db\.update\(schema\.entries\)\.set\(\{ updatedAt: now \}\)/);
  assert.doesNotMatch(read("src/lib/content/pages/publish.ts"), /isDemo: false, updatedAt: now/);
});

/* ---- elections: the 29N layer --------------------------------------------- */

test("electionPhaseStart: null before 28 Nov, then the instant each printed phase began", () => {
  const { electionPhase, electionPhaseStart } = electionDay;
  assert.equal(electionPhaseStart(new Date("2026-11-21T12:00:00Z")), null);
  const starts = [
    ["eve", "2026-11-28T00:00:00+01:00"],
    ["polling", "2026-11-29T00:00:00+01:00"],
    ["count", "2026-11-29T20:00:00+01:00"],
    ["after", "2026-11-30T00:00:00+01:00"],
    ["over", "2026-12-08T00:00:00+01:00"],
  ] as const;
  let previous = "before";
  for (const [phase, iso] of starts) {
    const at = new Date(iso);
    assert.equal(electionPhase(at), phase, iso);
    assert.equal(electionPhase(new Date(at.getTime() - 1)), previous, `just before ${iso}`);
    assert.equal(electionPhaseStart(at)?.toISOString(), at.toISOString());
    assert.equal(electionPhaseStart(new Date(at.getTime() + 3_600_000))?.toISOString(), at.toISOString());
    previous = phase;
  }
});

/* ---- data dates the families bring (each family's own sitemap function) ---- */

test("live families are dated by what they print now", async () => {
  const { fuelSitemapEntries } = await import("../src/lib/programmatic/fuel/sitemap.ts");
  const { rodaliesSitemap } = await import("../src/lib/programmatic/rodalies/pages.ts");
  const { reservoirSitemapEntries } = await import("../src/lib/programmatic/reservoirs/pages.ts");
  const { pvpcSitemapEntries } = await import("../src/lib/programmatic/pvpc/pages.ts");
  const { warningsSitemapEntries } = await import("../src/lib/programmatic/warnings/page.ts");
  const midnight = "2026-11-20T23:00:00.000Z"; // 21 Nov 00:00 in Madrid
  for (const entries of [fuelSitemapEntries("2026-11-21"), rodaliesSitemap("2026-11-21"), pvpcSitemapEntries("2026-11-21")]) {
    assert.ok(entries.length > 0);
    for (const entry of entries) assert.equal((entry.lastModified as Date).toISOString(), midnight, entry.url);
  }
  for (const entry of reservoirSitemapEntries("2026-11-20")) assert.equal((entry.lastModified as Date).toISOString(), "2026-11-19T23:00:00.000Z");
  for (const entry of warningsSitemapEntries(Date.parse("2026-11-21T10:42:00Z"))) assert.equal((entry.lastModified as Date).toISOString(), "2026-11-21T10:00:00.000Z");
});

test("snapshot families are dated by their data's read day (the body date covers the rest)", async () => {
  const { electionsSitemap, latestDataDate } = await import("../src/lib/programmatic/elections/pages.ts");
  const { holidaySitemapEntries } = await import("../src/lib/programmatic/holidays/paths.ts");
  const { NEXT_YEAR, SNAPSHOT } = await import("../src/lib/programmatic/holidays/data.ts");
  const elections = electionsSitemap();
  assert.ok(elections.length > 800);
  assert.ok(elections.every((e) => (e.lastModified as Date).toISOString() === `${latestDataDate()}T00:00:00.000Z`));
  const town = holidaySitemapEntries().find((e) => e.url.endsWith("/ca/festius/barcelona/"));
  assert.equal((town?.lastModified as Date).toISOString(), `${NEXT_YEAR.readOn ?? SNAPSHOT.readOn}T00:00:00.000Z`);
});

/* ---- the generator --------------------------------------------------------- */

test("routeFiles: Next's precedence (static, then [param], then catch-all)", () => {
  assert.deepEqual(lib.routeFiles("/es/calculadoras/sueldo-neto/"), ["src/app/(public)/[locale]/calculadoras/sueldo-neto/page.tsx"]);
  assert.deepEqual(lib.routeFiles("/ca/festius/barcelona/"), ["src/app/(public)/[locale]/festius/[municipi]/page.tsx"]);
  assert.deepEqual(lib.routeFiles("/es/festivos/datos-festivos-locales/"), ["src/app/(public)/[locale]/festivos/datos-festivos-locales/page.tsx"]);
  assert.deepEqual(lib.routeFiles("/es/guias/semana-santa-2027-cataluna/"), ["src/app/(public)/[locale]/[...slug]/page.tsx"]);
});

test("importSpecifiers: value imports and re-exports, never type-only ones", () => {
  const source = `import type { A } from "./types";\nimport { b, type C } from "@/lib/x";\nimport data from "./snapshot.json" with { type: "json" };\nexport { d } from "./d";\nexport type { E } from "./e";\nimport "./side";\nconst m = await import("./lazy");`;
  assert.deepEqual(lib.importSpecifiers(source).sort(), ["./d", "./lazy", "./side", "./snapshot.json", "@/lib/x"]);
});

test("normalizedSource: comments and layout do not change a body; a string or a number does", () => {
  const a = `// note\nexport const T = "Festius 2027"; /* why */\nexport const N = 42;\n`;
  const b = `export const T = "Festius 2027";\n\n\nexport const N =   42; // changed comment\n`;
  assert.equal(lib.normalizedSource("x.ts", a), lib.normalizedSource("x.ts", b));
  assert.notEqual(lib.normalizedSource("x.ts", a), lib.normalizedSource("x.ts", a.replace("2027", "2028")));
  assert.notEqual(lib.normalizedSource("x.ts", a), lib.normalizedSource("x.ts", a.replace("42", "43")));
  assert.equal(lib.normalizedSource("x.json", '{"a": 1,\n "b": [2]}'), lib.normalizedSource("x.json", '{"a":1,"b":[2]}'));
});

test("normalizedSource: an ad box (<AdSlot />), its import and the path helper only it used do not change a body", () => {
  const before = `import { A } from "@/a";\nimport { crumbPath } from "@/x";\nexport function P({ crumbs }: { crumbs: string[] }) {\n  return (\n    <div>\n      <p>Festius 2027</p>\n      <h2>Taula</h2>\n    </div>\n  );\n}\n`;
  const after = `import { AdSlot } from "@/components/AdSlot";\nimport { A } from "@/a";\nimport { crumbPath } from "@/x";\nexport function P({ crumbs }: { crumbs: string[] }) {\n  return (\n    <div>\n      <p>Festius 2027</p>\n      <AdSlot kind="top" locale="es" path={crumbPath(crumbs)} />\n      {i === 1 ? <AdSlot kind="home-feed" locale="es" path="/es/" /> : null}\n      <h2>Taula</h2>\n    </div>\n  );\n}\n`;
  // `crumbPath` was only imported for the box: the same body without both.
  const bare = before.replace('import { crumbPath } from "@/x";\n', "");
  assert.equal(lib.normalizedSource("x.tsx", after), lib.normalizedSource("x.tsx", bare));
  // A word changed next to the box is still a change.
  assert.notEqual(lib.normalizedSource("x.tsx", after), lib.normalizedSource("x.tsx", bare.replace("2027", "2028")));
  // crumbPath used elsewhere (a ShareBar) stays in the body.
  const shared = after.replace("<h2>Taula</h2>", "<h2>{crumbPath(crumbs)}</h2>");
  assert.ok(lib.normalizedSource("x.tsx", shared).includes("crumbPath"));
  assert.equal(lib.normalizedSource("x.tsx", "export const a = 1;"), lib.normalizedSource("x.tsx", "export const a = 1; // AdSlot"));
});

test("nextRecord: same body keeps its date; a changed body takes the new one", () => {
  const previous = { date: "2026-11-01T00:00:00.000Z", fingerprint: "v1:a", files: 3 };
  assert.equal(lib.nextRecord(previous, { fingerprint: "v1:a", files: 4 }, () => "NOW").date, previous.date);
  assert.equal(lib.nextRecord(previous, { fingerprint: "v1:b", files: 3 }, () => "NOW").date, "NOW");
  assert.equal(lib.nextRecord(undefined, { fingerprint: "v1:a", files: 3 }, () => "NOW").date, "NOW");
});

test("the election body: its own data and components, not the strikes or fairs it links to", () => {
  const chrome = lib.importClosure(lib.CHROME_ROOTS);
  const routes = [...new Set(families.familyUrls("elections").flatMap((url) => lib.routeFiles(url)))];
  const files = lib.bodyFiles(routes, chrome, lib.ROOT, families.familyHome("elections"));
  for (const wanted of [
    "src/lib/programmatic/elections/polling-places.json",
    "src/lib/programmatic/elections/election-day.ts",
    "src/lib/programmatic/elections/paths.ts", // also in the header's chrome: still the elections' own
    "src/components/programmatic/ElectionResultsPage.tsx",
    "src/app/(public)/[locale]/eleccions/[municipi]/page.tsx",
  ]) {
    assert.ok(files.includes(wanted), `${wanted} missing`);
  }
  for (const file of files) {
    assert.ok(!/content\/batch02|christmas-fairs|programmatic\/fuel|programmatic\/gordo/.test(file), `${file} is a cross-link, not the body`);
    assert.ok(!lib.INFRA_FILES.has(file), `${file} is plumbing`);
  }
});

test("build mode: a family changed since the live release is dated now, the others keep its dates", () => {
  // The decision the deploy makes for every family (scripts/body-dates.ts --build).
  const live = { a: { date: "2026-11-02T00:00:00.000Z", fingerprint: "v1:a", files: 2 }, b: { date: "2026-11-03T00:00:00.000Z", fingerprint: "v1:b", files: 2 } };
  const now = "2026-11-21T09:00:00.000Z";
  const out = Object.fromEntries(
    Object.entries({ a: "v1:a", b: "v1:B" }).map(([key, fp]) => [key, lib.nextRecord(live[key as "a" | "b"], { fingerprint: fp, files: 2 }, () => now).date]),
  );
  assert.deepEqual(out, { a: "2026-11-02T00:00:00.000Z", b: now });
});

test("the deploy runs the generator before next build and it can never fail the build", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  assert.match(pkg.scripts.prebuild!, /npm run build:redirects && \(npm run seo:body-dates -- --build \|\| echo /);
  assert.match(pkg.scripts["seo:body-dates"]!, /scripts\/body-dates\.ts$/);
  const deploy = read("ops/vps/deploy.sh");
  assert.match(deploy, /export BODY_DATES_PREVIOUS="\$PREVIOUS\/src\/lib\/seo\/body-dates\.json"/);
  assert.ok(deploy.indexOf("BODY_DATES_PREVIOUS") < deploy.indexOf("npm run build || fail_build"));
});

test("routeFiles on a scratch tree: layouts on the way are part of the route", () => {
  const root = mkdtempSync(join(tmpdir(), "routes-"));
  const base = join(root, "src/app/(public)/[locale]/fams");
  mkdirSync(join(base, "[slug]"), { recursive: true });
  writeFileSync(join(base, "layout.tsx"), "export default function L() { return null; }\n");
  writeFileSync(join(base, "[slug]", "page.tsx"), "export default function P() { return null; }\n");
  assert.deepEqual(lib.routeFiles("/ca/fams/x/", root), ["src/app/(public)/[locale]/fams/layout.tsx", "src/app/(public)/[locale]/fams/[slug]/page.tsx"]);
  assert.deepEqual(lib.routeFiles("/ca/missing/", root), []);
});
